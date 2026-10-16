FROM node:22-bookworm-slim AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    MATCHVISION_FRONTEND_DIST=/app/frontend/dist \
    MATCHVISION_UPLOAD_ROOT=/app/storage/uploads \
    MATCHVISION_OUTPUT_ROOT=/app/storage/outputs \
    YOLO_CONFIG_DIR=/tmp/ultralytics \
    MPLCONFIGDIR=/tmp/matplotlib \
    OMP_NUM_THREADS=2 \
    MKL_NUM_THREADS=2
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./
# Install CPU wheels first to avoid pulling CUDA libraries onto Render.
RUN pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install -r requirements.txt \
    && pip check
COPY . .
COPY --from=frontend /frontend/dist ./frontend/dist
# Fail at build time if the checkout contains only a Git LFS pointer.
RUN python -c "from pathlib import Path; p=Path('model/best.pt'); assert p.is_file() and p.stat().st_size > 1000000, 'Missing model weights: fetch model/best.pt with Git LFS before building'"
EXPOSE 10000
CMD ["sh", "-c", "exec python -m uvicorn matchvision.api.app:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1"]
