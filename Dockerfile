FROM python:3.12-slim

WORKDIR /

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_BREAK_SYSTEM_PACKAGES=1 \
    MKL_THREADING_LAYER=GNU \
    OMP_NUM_THREADS=1 \
    TF_CPP_MIN_LOG_LEVEL=3

  RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && rm -rf /var/lib/apt/list/*

  COPY requirements.txt .

  RUN pip install --no-cache-dir -r requirements.txt
  RUN mkdir -p /usr/assets

  COPY . .

  EXPOSE 8088

  CMD ["uvicorn", "app:main", "--host", "0.0.0.0", "--port", "8088"]