import type { MetaFunction } from "@remix-run/node";
import PDFConcatenator from "../components/pdf-concatenator.client"

export const meta: MetaFunction = () => {
  return [
    { title: "PDF Concatenator | Merge PDF files privately" },
    {
      property: "og:title",
      content: "PDF Concatenator",
    },
    {
      name: "description",
      content: "This tool allows you to combine your PDF files securely without the need to upload them anywhere. All free of charge.",
    },
    {
      name: "google-site-verification",
      content: "BaKNMKnxYL-IEGnryfTkPKeDsfB1Sy8ayWbKtG1wrss",
    },
  ];
};

export default function Index() {
  return (
    <PDFConcatenator />
  );
}
