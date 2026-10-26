# Berserk API

Single API and downloadable local engine files for the Berserk Rust chess engine.

## Canonical API URL

    https://berserk/api/v1

All remote integrations should use this base URL. This repository owns the API service; the Berserk website is only a client.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1 | API metadata |
| GET | /api/v1/health | Health check |
| POST | /api/v1/analyze | Analyze a position and return best move plus MultiPV |

Example JSON body for POST /api/v1/analyze:

    {
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "think_time_ms": 1000,
      "multi_pv": 3,
      "threads": 1
    }

Limits: think_time_ms 100–10,000; multi_pv 1–8; threads 1–2.

## Download Berserk for local use

The wasm/ folder is built by GitHub Actions from the upstream engine source. When the build succeeds, it contains:

- berserk.js — JavaScript WebAssembly loader and exports
- berserk_bg.wasm — compiled engine
- README.md — local integration example

Use the JS and WASM files together in the same folder and serve them over HTTP(S). Import berserk.js as an ES module, call init(), then create an Engine. Search is synchronous in the current WASM wrapper, so run it inside a Web Worker to avoid blocking the page UI. The WASM build disables Syzygy support.

## Run the API locally

Build and run from this repository root:

    docker build -t berserk-api .
    docker run --rm -p 10000:10000 -e PORT=10000 berserk-api

Health: http://localhost:10000/api/v1/health
Docs: http://localhost:10000/docs
Analyze: POST http://localhost:10000/api/v1/analyze

## Deploy

Deploy this repository as a Docker web service using the root Dockerfile. Set the health check to /api/v1/health.

For https://berserk/api/v1 to work publicly, the hostname berserk must be a real domain/host you control, with HTTPS and routing to this API service. The website's Vercel domain is separate from the engine API domain.

Set ALLOWED_ORIGINS to the allowed website origins and configure host-level rate limiting before public production use.

## Source and license

Engine source: https://github.com/official-knightly/Berserk. This repository builds and distributes the API and browser artifacts separately; engine source changes are not required.