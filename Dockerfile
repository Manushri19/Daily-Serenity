# Stage 1: Build the frontend React app
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Copy package files and install frontend dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Final Image (Pure Python/FastAPI)
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy backend requirements and install
COPY cbt-rag-service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the python backend code
COPY cbt-rag-service/ ./

# Copy built frontend from Stage 1 into a 'dist' folder where FastAPI expects it
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 8080

# Run the unified FastAPI server
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]