import { useState } from "react";
import "./Download.css";

interface FormatInfo {
  format_id: string;
  ext: string;
  resolution: string | null;
  filesize: number | null;
}

interface VideoInfo {
  title: string;
  duration: number | null;
  thumbnail: string | null;
  uploader: string | null;
  formats: FormatInfo[];
  qualities: { value: string; label: string; available: boolean }[];
  url: string;
}

interface JobStatus {
  job_id: string;
  status: string;
  progress: number;
  filename: string | null;
  error: string | null;
  file_size: number | null;
}

const API_BASE = "/download-api";

const QUALITY_OPTIONS = [
  { value: "360p", label: "360p" },
  { value: "480p", label: "480p" },
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
];
const FORMAT_OPTIONS = [
  { value: "mp4", label: "MP4 (совместимый)" },
  { value: "webm", label: "WebM" },
  { value: "mp3", label: "MP3 (аудио)" },
];

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${(bytes / 1024).toFixed(0)} КБ`;
}

export default function Download() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [quality, setQuality] = useState("720p");
  const [fileFormat, setFileFormat] = useState("mp4");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Введите ссылку");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    setJobId(null);
    setJobStatus(null);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Ошибка анализа");
      }
      setInfo(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить информацию");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!info) return;
    setDownloading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: info.url, quality, file_format: fileFormat }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Ошибка запуска загрузки");
      }
      setJobId(data.job_id);
      pollStatus(data.job_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось начать загрузку");
      setDownloading(false);
    }
  };

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${id}`);
        const data: JobStatus = await res.json();
        if (!res.ok) {
          clearInterval(interval);
          setError("Задача не найдена");
          setDownloading(false);
          return;
        }
        setJobStatus(data);
        if (data.status === "done") {
          clearInterval(interval);
          setDownloading(false);
        } else if (data.status === "error") {
          clearInterval(interval);
          setError(data.error || "Ошибка загрузки");
          setDownloading(false);
        }
      } catch {
        clearInterval(interval);
        setError("Ошибка проверки статуса");
        setDownloading(false);
      }
    }, 1000);
  };

  const handleReset = () => {
    setUrl("");
    setInfo(null);
    setJobId(null);
    setJobStatus(null);
    setError(null);
    setDownloading(false);
  };

  return (
    <section className="download">
      <div className="download__inner">
        <a href="/" className="download__back">&larr; На главную</a>
        <h1 className="download__title">Скачать видео</h1>
        <p className="download__subtitle">
          Вставьте ссылку на YouTube, Rutube, VK, Instagram или TikTok
        </p>

        <div className="download__form">
          <div className="download__input-row">
            <input
              type="url"
              className="download__input"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              disabled={loading || downloading}
            />
            <button
              className="download__btn download__btn--primary"
              onClick={handleAnalyze}
              disabled={loading || downloading || !url.trim()}
            >
              {loading ? "Загрузка..." : "Анализ"}
            </button>
          </div>

          {error && <div className="download__error">{error}</div>}

          {info && (
            <div className="download__result">
              <div className="download__preview">
                {info.thumbnail && (
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="download__thumbnail"
                  />
                )}
                <div className="download__meta">
                  <h3 className="download__name">{info.title}</h3>
                  <p className="download__details">
                    {info.uploader && <span>{info.uploader}</span>}
                    {info.duration && <span> · {formatDuration(info.duration)}</span>}
                  </p>
                </div>
              </div>

              {!jobId && (
                <div className="download__controls">
                  <div className="download__selects">
                    <select className="download__select" value={quality} onChange={(e) => setQuality(e.target.value)} disabled={downloading}>
                      {QUALITY_OPTIONS.filter((q) => info.qualities?.some((a) => a.value === q.value)).map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                    <select className="download__select" value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} disabled={downloading}>
                      {FORMAT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <button
                    className="download__btn download__btn--primary"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? "Скачивание..." : "Скачать"}
                  </button>
                </div>
              )}

              {jobId && jobStatus && (
                <div className="download__progress">
                  <div className="download__progress-bar">
                    <div
                      className="download__progress-fill"
                      style={{ width: `${jobStatus.progress}%` }}
                    />
                  </div>
                  <p className="download__progress-text">
                    {jobStatus.status === "downloading" && "Скачивание..."}
                    {jobStatus.status === "done" && "Готово!"}
                    {jobStatus.status === "error" && `Ошибка: ${jobStatus.error}`}
                  </p>

                  {jobStatus.status === "done" && jobStatus.filename && (
                    <div className="download__done">
                      <p className="download__file-info">
                        {jobStatus.filename} ({formatSize(jobStatus.file_size)})
                      </p>
                      <a
                        href={`https://dl.nxksxd.xyz:9443/file/${jobId}`}
                        className="download__btn download__btn--success"
                        download
                      >
                        Сохранить файл
                      </a>
                      <button
                        className="download__btn download__btn--secondary"
                        onClick={handleReset}
                      >
                        Скачать ещё
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="download__info">
            <p>Файлы хранятся на сервере 5 минут, затем автоматически удаляются.</p>
            <p>Поддерживаемые платформы: YouTube, Rutube, VK, Instagram, TikTok.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
