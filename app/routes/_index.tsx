import type { MetaFunction } from "@remix-run/node";
import PDFConcatenator from "../components/pdf-concatenator.client"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <PDFConcatenator />
  );
}
