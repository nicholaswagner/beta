FROM oven/bun:latest

WORKDIR /workspace

# Optional but useful tooling
RUN apt-get update && apt-get install -y \
  git \
  curl \
  bash \
  && rm -rf /var/lib/apt/lists/*

# Install watchexec via .deb package
RUN curl -L -o /tmp/watchexec.deb https://github.com/watchexec/watchexec/releases/download/v2.5.1/watchexec-2.5.1-aarch64-unknown-linux-gnu.deb && \
    dpkg -i /tmp/watchexec.deb && \
    rm /tmp/watchexec.deb

# Keep container warm for node_modules cache
ENV BUN_INSTALL_CACHE_DIR=/bun-cache

# Avoid weird file watching issues in Docker
ENV CHOKIDAR_USEPOLLING=true