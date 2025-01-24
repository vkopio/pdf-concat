import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="flex min-h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col flex-grow">
        <header className="flex flex-row w-full p-6">
          <Link to="/" className="flex-1 font-bold text-lg hover:underline">
            <img alt="logo" src="/logo.svg" className="w-12 inline-block mr-4" />PDF Concatenator</Link>
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        </header>
        <div className="flex flex-1 justify-center px-6">
          <div className="flex flex-col items-center gap-10 max-w-screen-md w-full pt-10">
            {children}
          </div >
        </div >
        <ScrollRestoration />
        <Scripts />
        <script src="assets/pdfium.js"></script>
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
