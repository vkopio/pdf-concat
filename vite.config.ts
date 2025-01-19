import { fileURLToPath, URL } from 'node:url'
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteStaticCopy } from 'vite-plugin-static-copy'

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      ssr: false,
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: 'target/pkg/pdf_concat_bg.wasm',
          dest: 'assets'
        },
        {
          src: `${process.env.PDFIUM_PATH}/node/pdfium.wasm`,
          dest: 'assets'
        },
        {
          src: `${process.env.PDFIUM_PATH}/node/pdfium.js`,
          dest: 'assets'
        },
      ]
    })
  ],
  resolve: {
    alias: {
      '@pdfium-bindings': fileURLToPath(new URL('target/pkg/', import.meta.url)),
    }
  },
});
