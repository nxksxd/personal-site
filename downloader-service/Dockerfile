FROM python:3.12-slim

WORKDIR /app

# Install ffmpeg for audio extraction and general media processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
COPY app ./app

RUN pip install --no-cache-dir .

ENV DOWNLOAD_DIR=/tmp/web-downloads

EXPOSE 8090

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8090"]
