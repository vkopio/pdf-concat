import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "PDF Concatenator | Privacy Policy" },
    {
      property: "og:title",
      content: "PDF Concatenator",
    },
    {
      name: "description",
      content: "A privacy policy for PDF Concatenator that describes how your data is being processed.",
    },
  ];
};

export default function Index() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-gray-700 mt-6">Effective Date: 2025-01-26</p>

      <section className="mt-6">
        <p>PDF Concatenator respects your privacy. This policy outlines how we handle your data.</p>
        <p className="mt-2">When you are using this tool to concatenate PDF files, your existing files and the end product stay on your device during the whole process. At no point are they uploaded to any server to be processed.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Data Collection and Usage</h2>
        <p className="mt-2">We collect anonymous analytics solely to determine if anyone uses the site. We do not collect personal information such as names, emails, or IP addresses. The data is anonymized and cannot be used to identify individuals. Anonymous analytics are processed using <a href="https://vercel.com/docs/analytics/privacy-policy" className="text-blue-600 underline">Vercel Web Analytics</a>. The following information is collected from the usage of this site:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Event timestamps</li>
          <li>Visited URLs</li>
          <li>Geolocation (country, state, city)</li>
          <li>Device OS, version, and type (e.g., mobile, desktop)</li>
          <li>Browser version</li>
          <li>Web analytics script version</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Changes to this Policy</h2>
        <p className="mt-2">We may update this policy. Changes will be posted here with the updated &quot;Effective Date&quot;.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Contact</h2>
        <p className="mt-2">For questions, contact us at <a href="mailto:ville.kopio@gmail.com" className="text-blue-600 underline">ville.kopio@gmail.com</a>.</p>
      </section>
    </div>
  );
}
