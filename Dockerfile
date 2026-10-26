# Build upstream Berserk, then package the HTTP API.
FROM rust:slim-bookworm AS engine-build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential ca-certificates clang curl libclang-dev pkg-config git && rm -rf /var/lib/apt/lists/*
WORKDIR /engine
RUN git clone --depth 1 https://github.com/official-knightly/Berserk.git . \
 && sed -i 's/^edition = "2026"$/edition = "2024"/' Cargo.toml \
 && cargo build --release --no-default-features

FROM python:3.12-slim-bookworm AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=10000 BERSERK_ENGINE_PATH=/usr/local/bin/berserk
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py ./main.py
COPY client.js ./client.js
COPY --from=engine-build /engine/target/release/berserk /usr/local/bin/berserk
COPY --from=engine-build /engine/networks/v60-7f587dfb.nnue /engine/networks/v60-7f587dfb.nnue
RUN chmod 755 /usr/local/bin/berserk
EXPOSE 10000
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port \"$PORT\""]