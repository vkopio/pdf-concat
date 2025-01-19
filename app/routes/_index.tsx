import type { MetaFunction } from "@remix-run/node";
import PDFConcatenator from "../components/pdf-concatenator.client"

export const meta: MetaFunction = () => {
  return [
    { title: "PDF Concatenator" },
    {
      name: "PDF Concatenator - Merge PDF files securely on your own computer.",
      content: "This tool allows you to merge your PDF files without needing to send them to some shady server where they are totally not used to tran an AI model.",
    },
  ];
};

export default function Index() {
  return (
    <PDFConcatenator />
  );
}
