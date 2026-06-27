# syntax=docker/dockerfile:1.7
# ─── Stage 1: builder — install deps into a venv ──────────────────────────
# All deps in requirements.txt have prebuilt manylinux wheels, so we don't
# need build-essential / gcc — keeps the build fast even on slow mirrors.
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ONLY_BINARY=":all:"

WORKDIR /app

COPY requirements.txt .
RUN python -m venv /opt/venv \
 && /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install -r requirements.txt

# ─── Stage 2: runtime — slim image, non-root user ─────────────────────────
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8000

# wget instead of curl — smaller, already in many base layers; used only by HEALTHCHECK
RUN groupadd --system app \
 && useradd --system --gid app --home /app --shell /usr/sbin/nologin app

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY --chown=app:app . .

# Drop bytecode/test artefacts and any local .env that may have been COPY'd
RUN find . -type d \( -name "__pycache__" -o -name ".pytest_cache" \) -exec rm -rf {} + \
 && rm -f .env

USER app

EXPOSE 8000

# Use Python stdlib for the healthcheck — no extra apt packages needed
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request,sys,os; \
        sys.exit(0 if urllib.request.urlopen(f'http://localhost:{os.getenv(\"PORT\",\"8000\")}/v1/health',timeout=3).status==200 else 1)" \
        || exit 1

# Single worker is intentional — event_broadcaster keeps SSE state in-process.
# Scale horizontally only after moving subscriber state to Redis pub/sub.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
