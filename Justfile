_default:
    just --list

run:
    #!/usr/bin/env -S parallel --shebang --ungroup --jobs {{ num_cpus() }}
    cargo watch -w src -w "Cargo.toml" -w "Cargo.lock" -s "wasm-pack build --out-dir target/pkg --target web"
    npm run dev

test-ci: copy-pdfium install build-wasm
    cargo clippy -- -Dwarnings
    npm run typecheck
    npm run lint

build-ci: copy-pdfium install build-wasm build-frontend

build: install build-wasm build-frontend

build-frontend:
    npm run build

build-wasm:
    wasm-pack build --out-dir target/pkg --target web

install:
    npm install

copy-pdfium:
    mkdir -p ./target/pdfium
    cp -r $PDFIUM_PATH/node/* ./target/pdfium
