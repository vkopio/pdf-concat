# pdf-concatenator

A simple locally-running web tool to concatenate PDF files.

The aim of this project is to provide an alternative to all various similar tools that use a server to concatenate the files. With this tool, your files stay securely on your computer.

<p align="center">
  <img src="public/logo.png" alt="Logo" width="400" align="center"/>
</p>

## Development

The development environment is managed with Nix flakes. If using VS Code as an editor, the project should be opened with `code .` when the shell environment of the flake is evaluated.

The development environment can be run with:

```shellscript
just run
```

Which runs a watcher for the Rust-based WASM module as well as a development server for the Remix frontend.

## Production

When you are ready to build a production version of your app, `npm run build` will generate your assets and an `index.html` for the SPA.

```shellscript
npm run build
```
