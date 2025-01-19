import type { MetaFunction } from "@remix-run/node";

import { logPageMetrics, concatPdfs } from "../pdf-util.client";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.files);
  const files = e.target.files ?? new FileList();

  for (const file of files) {
    await logPageMetrics(file);
  }

  if (files.length > 0) {
    concatPdfs(files);
  }
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome!
          </h1>
        </header>
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <input id="filePicker" type="file" accept="application/pdf" multiple
            onChange={handleChange} />
        </nav>
      </div>
    </div>
  );
}
