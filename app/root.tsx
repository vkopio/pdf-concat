import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import * as PDFiumModule from "pdfium/pdfium";
import wasm_bindgen, {
  initialize_pdfium_render,
  log_page_metrics_to_console,
} from "pdfium-bindings/pdf_concat";
import { useEffect } from "react";
import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

const wasm = () => wasm_bindgen(`${window.location.origin}/assets/pdf_concat_bg.wasm`).then(async rustModule => {
  console.assert(
    initialize_pdfium_render(
      PDFiumModule,
      rustModule,
      false,
    ),
    "Initialization of pdfium-render failed!"
  );

  const targetDocument = "./test.pdf";

  await log_page_metrics_to_console(targetDocument);
});

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log(window.location.origin);
    wasm()
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
