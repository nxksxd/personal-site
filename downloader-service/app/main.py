from __future__ import annotations

import asyncio
import ipaddress
import logging
import os
import re
import shutil
import socket
import subprocess
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import yt_dlp
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("downloader")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DOWNLOAD_DIR = Path(os.getenv("DOWNLOAD_DIR", "/tmp/web-downloads"))
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

FILE_TTL_SECONDS = 30 * 60  # 30 min
EXTRACT_TIMEOUT = 60
DOWNLOAD_TIMEOUT = 600  # 10 min per job
MAX_FILE_SIZE_MB = 2000
ALLOWED_QUALITIES = {"360p", "480p", "720p", "1080p"}
ALLOWED_FORMATS = {"mp4", "webm", "mp3"}

QUALITY_HEIGHTS = {"360p": 360, "480p": 480, "720p": 720, "1080p": 1080}

# Audio-only remains a format choice rather than a video quality.
DEFAULT_QUALITY = "720p"
DEFAULT_FORMAT = "mp4"

ALLOWED_DOMAINS = {
    "youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be",
    "music.youtube.com",
    "rutube.ru", "www.rutube.ru",
    "vk.com", "www.vk.com", "vkvideo.ru", "www.vkvideo.ru", "m.vk.com",
    "instagram.com", "www.instagram.com",
    "tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com",
}

USER_AGENTS = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
)

# ---------------------------------------------------------------------------
# SSRF protection
# ---------------------------------------------------------------------------
PRIVATE_NETWORKS = [
    ipaddress.ip_network(n) for n in (
        "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",
        "127.0.0.0/8", "169.254.0.0/16", "::1/128", "fc00::/7",
        "0.0.0.0/8", "100.64.0.0/10", "224.0.0.0/4",
    )
]


def _is_private_ip(ip_str: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip_str)
        return any(addr in net for net in PRIVATE_NETWORKS)
    except ValueError:
        return True


def validate_url(url: str) -> str:
    """Validate URL against allowlist and check for SSRF. Returns cleaned URL."""
    url = url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is empty")

    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url

    parsed = urlparse(url)
    host = parsed.hostname or ""

    # Domain allowlist
    if host.lower() not in ALLOWED_DOMAINS:
        raise HTTPException(status_code=400, detail=f"Domain not supported: {host}")

    # DNS resolution check — block private IPs
    try:
        infos = socket.getaddrinfo(host, None)
        for info in infos:
            ip_str = info[4][0]
            if _is_private_ip(ip_str):
                raise HTTPException(status_code=400, detail="URL resolves to private IP")
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Cannot resolve domain")

    return url


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    quality: str = DEFAULT_QUALITY
    file_format: str = DEFAULT_FORMAT


class AvailableQuality(BaseModel):
    value: str
    label: str
    available: bool = True


class AnalyzeResponse(BaseModel):
    title: str
    duration: int | None = None
    thumbnail: str | None = None
    uploader: str | None = None
    formats: list[FormatInfo] = []
    qualities: list[AvailableQuality] = []
    url: str


class FormatInfo(BaseModel):
    format_id: str
    ext: str
    resolution: str | None = None
    filesize: int | None = None
    vcodec: str | None = None
    acodec: str | None = None


class DownloadResponse(BaseModel):
    job_id: str
    status: str


class JobStatus(BaseModel):
    job_id: str
    status: str  # queued | downloading | done | error
    progress: float = 0.0
    filename: str | None = None
    error: str | None = None
    file_size: int | None = None


# ---------------------------------------------------------------------------
# Job storage (in-memory + filesystem)
# ---------------------------------------------------------------------------
@dataclass
class Job:
    job_id: str
    url: str
    quality: str
    file_format: str = DEFAULT_FORMAT
    status: str = "queued"
    progress: float = 0.0
    filename: str | None = None
    error: str | None = None
    file_path: Path | None = None
    file_size: int | None = None
    created_at: float = field(default_factory=time.time)


_jobs: dict[str, Job] = {}
_lock = asyncio.Lock()


def _job_dir(job_id: str) -> Path:
    return DOWNLOAD_DIR / job_id


def _cleanup_expired():
    """Remove expired job files."""
    now = time.time()
    for job_id, job in list(_jobs.items()):
        if now - job.created_at > FILE_TTL_SECONDS:
            job_dir = _job_dir(job_id)
            if job_dir.exists():
                shutil.rmtree(job_dir, ignore_errors=True)
                logger.info("Cleaned up expired job %s", job_id)
            del _jobs[job_id]

    # Also clean orphaned directories
    for d in DOWNLOAD_DIR.iterdir():
        if d.is_dir() and d.name not in _jobs:
            try:
                # Check age of directory
                mtime = d.stat().st_mtime
                if now - mtime > FILE_TTL_SECONDS:
                    shutil.rmtree(d, ignore_errors=True)
                    logger.info("Cleaned up orphaned dir %s", d.name)
            except Exception:
                pass


# ---------------------------------------------------------------------------
# yt-dlp helpers
# ---------------------------------------------------------------------------
def _get_ydl_opts(url: str, download: bool = False, outtmpl: str | None = None, fmt: str | None = None) -> dict:
    import random
    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 30,
        "retries": 5,
        "extractor_retries": 3,
        "http_headers": {
            "User-Agent": random.choice(USER_AGENTS),
            "Referer": url,
        },
    }
    if download:
        opts.update({
            "outtmpl": outtmpl or str(DOWNLOAD_DIR / "%(id)s.%(ext)s"),
            "format": fmt or "best",
            "max_filesize": MAX_FILE_SIZE_MB * 1024 * 1024,
            "noplaylist": True,
        })
    return opts


def _extract_info(url: str) -> dict:
    with yt_dlp.YoutubeDL(_get_ydl_opts(url)) as ydl:
        return ydl.extract_info(url, download=False)


def _download_video(url: str, job_id: str, quality: str, file_format: str) -> Path:
    job_dir = _job_dir(job_id)
    job_dir.mkdir(parents=True, exist_ok=True)

    height = QUALITY_HEIGHTS.get(quality, QUALITY_HEIGHTS[DEFAULT_QUALITY])
    if file_format == "mp3":
        fmt = "bestaudio/best"
    elif file_format == "mp4":
        # Prefer H.264/AAC for widest device compatibility, with a fallback.
        fmt = f"bestvideo[height<={height}][vcodec^=avc1]+bestaudio[acodec^=mp4a]/best[height<={height}]"
    else:
        fmt = f"bestvideo[height<={height}]+bestaudio/best[height<={height}]"

    outtmpl = str(job_dir / "%(title)s.%(ext)s")
    opts = _get_ydl_opts(url, download=True, outtmpl=outtmpl, fmt=fmt)
    opts["merge_output_format"] = "mp4" if file_format == "mp4" else "webm"

    if file_format == "mp3":
        opts["postprocessors"] = [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }]

    # Keep the requested extension after post-processing/merging.
    opts["outtmpl"] = str(job_dir / f"%(title)s.%(ext)s")

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        # Find the downloaded file
        if "requested_downloads" in info:
            for rd in info["requested_downloads"]:
                fp = Path(rd.get("filepath", ""))
                if fp.exists():
                    return fp

        # Fallback: find any file in job dir
        for f in job_dir.iterdir():
            if f.is_file():
                return f

    raise RuntimeError("Download completed but no file found")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="Downloader Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Start cleanup task
    asyncio.create_task(_periodic_cleanup())


async def _periodic_cleanup():
    while True:
        await asyncio.sleep(60)  # every minute
        _cleanup_expired()


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    url = validate_url(req.url)
    loop = asyncio.get_running_loop()

    try:
        info = await asyncio.wait_for(
            loop.run_in_executor(None, lambda: _extract_info(url)),
            timeout=EXTRACT_TIMEOUT,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Extraction timed out")
    except Exception as e:
        logger.exception("Extraction failed for %s", url)
        raise HTTPException(status_code=400, detail=f"Cannot extract info: {str(e)[:200]}")

    formats = []
    for f in info.get("formats", []):
        if f.get("vcodec") == "none" and f.get("acodec") == "none":
            continue
        formats.append(FormatInfo(
            format_id=f.get("format_id", ""),
            ext=f.get("ext", ""),
            resolution=f.get("resolution"),
            filesize=f.get("filesize"),
            vcodec=f.get("vcodec"),
            acodec=f.get("acodec"),
        ))

    return AnalyzeResponse(
        title=info.get("title", "Unknown"),
        duration=info.get("duration"),
        thumbnail=info.get("thumbnail"),
        uploader=info.get("uploader"),
        formats=formats[:50],
        qualities=[AvailableQuality(value=f"{h}p", label=f"{h}p") for h in sorted({int(f["height"]) for f in info.get("formats", []) if f.get("height") and f.get("vcodec") != "none"}) if f"{h}p" in ALLOWED_QUALITIES],
        url=url,
    )


@app.post("/download", response_model=DownloadResponse)
async def start_download(req: DownloadRequest):
    url = validate_url(req.url)
    quality = req.quality.lower()
    file_format = req.file_format.lower()
    if quality == "audio":
        quality, file_format = DEFAULT_QUALITY, "mp3"
    if quality not in ALLOWED_QUALITIES:
        raise HTTPException(status_code=400, detail=f"Invalid quality. Allowed: {ALLOWED_QUALITIES}")
    if file_format not in ALLOWED_FORMATS:
        raise HTTPException(status_code=400, detail=f"Invalid format. Allowed: {ALLOWED_FORMATS}")

    job_id = uuid.uuid4().hex[:16]
    job = Job(job_id=job_id, url=url, quality=quality, file_format=file_format)
    _jobs[job_id] = job

    asyncio.create_task(_run_download(job))

    return DownloadResponse(job_id=job_id, status="queued")


async def _run_download(job: Job):
    loop = asyncio.get_running_loop()
    job.status = "downloading"

    try:
        file_path = await asyncio.wait_for(
            loop.run_in_executor(None, lambda: _download_video(job.url, job.job_id, job.quality, job.file_format)),
            timeout=DOWNLOAD_TIMEOUT,
        )
        job.status = "done"
        job.filename = file_path.name
        job.file_path = file_path
        job.file_size = file_path.stat().st_size
        job.progress = 100.0
        logger.info("Download %s completed: %s (%d bytes)", job.job_id, job.filename, job.file_size)
    except asyncio.TimeoutError:
        job.status = "error"
        job.error = "Download timed out"
        logger.error("Download %s timed out", job.job_id)
    except Exception as e:
        job.status = "error"
        job.error = str(e)[:200]
        logger.exception("Download %s failed", job.job_id)


@app.get("/status/{job_id}", response_model=JobStatus)
async def get_status(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatus(
        job_id=job.job_id,
        status=job.status,
        progress=job.progress,
        filename=job.filename,
        error=job.error,
        file_size=job.file_size,
    )


@app.get("/file/{job_id}")
async def get_file(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "done" or not job.file_path or not job.file_path.exists():
        raise HTTPException(status_code=404, detail="File not ready")

    # Determine content type
    ext = job.file_path.suffix.lower()
    media_types = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mkv": "video/x-matroska",
        ".mp3": "audio/mpeg",
        ".m4a": "audio/mp4",
        ".ogg": "audio/ogg",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=job.file_path,
        filename=job.filename,
        media_type=media_type,
    )


@app.get("/health")
async def health():
    return {"status": "ok", "jobs": len(_jobs), "download_dir": str(DOWNLOAD_DIR)}


@app.delete("/cleanup")
async def force_cleanup():
    """Manual cleanup trigger."""
    _cleanup_expired()
    return {"status": "cleaned", "jobs_remaining": len(_jobs)}
