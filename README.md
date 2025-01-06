# pdf-concat

A simple locally-running web tool to concatenate PDF files.

The aim of this project is to provide an alternative to all various similar tools that use a server to concatenate the files. With this tool, your files stay securely on your computer.

## Development

The development environment is managed with Nix flakes. If using VS Code as an editor, the project should be opened with `code .` when the shell environment of the flake is evaluated.

You can develop your SPA app just like you would a normal Remix app, via:

```shellscript
npm run dev
```

## Production

When you are ready to build a production version of your app, `npm run build` will generate your assets and an `index.html` for the SPA.

```shellscript
npm run build
```
