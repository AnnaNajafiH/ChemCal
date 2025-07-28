FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port Render will use
EXPOSE 10000

# Set startup script with health check and connection retries
CMD gunicorn main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT:-10000} --timeout 120 --access-logfile - --error-logfile -
