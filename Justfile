_default:
    just --list

run:
    #!/usr/bin/env -S parallel --shebang --ungroup --jobs {{ num_cpus() }}
    cargo watch -w src -w "Cargo.toml" -w "Cargo.lock" -s "wasm-pack build --out-dir target/pkg --target web"
    npm run dev

watch-wasm:
    cargo watch -w src -w "Cargo.toml" -w "Cargo.lock" -s "wasm-pack build --out-dir target/pkg --target web"

build: build-wasm build-frontend

build-frontend:
    npm install
    npm run build

build-wasm:
    wasm-pack build --out-dir target/pkg --target web

copy-pdfium:
    cp -r $PDFIUM_PATH/node ./target/pdfium
