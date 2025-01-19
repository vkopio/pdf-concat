import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "PDF Concatenator | Privacy Policy" },
    { name: "Privacy Policy", content: "A description on how your data is being processed." },
  ];
};

export default function Index() {
  return (
    <section>
      <h1 className="font-bold py-2">Privacy Policy</h1>
      <p>This tool does not collect your data in any way. All of your PDF files stay on your local machine.</p>
    </section>
  );
}
