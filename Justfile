_default:
    just --list

build: build-wasm build-frontend

build-frontend:
    npm install
    npm run build

build-wasm:
    wasm-pack build --out-dir target/pkg-web --target web
