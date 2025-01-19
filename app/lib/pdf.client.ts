import bindModuleInit, {
  initialize_pdfium_render,
  get_page_count,
  concat,
} from "@pdfium-bindings/pdf_concat";
import { generateNewFileName } from "./utils";

// @ts-expect-error The PDFiumModule is initialized dynamically in root.tsx.
const initPdfium = window.PDFiumModule().then(async (pdfiumModule) => {
  console.log(pdfiumModule);

  const bindModule = await bindModuleInit(`${window.location.origin}/assets/pdf_concat_bg.wasm`);
  initialize_pdfium_render(pdfiumModule, bindModule, false);
});

export async function getPageCount(blob: Blob): Promise<number> {
  await initPdfium;
  return await get_page_count(blob);
}

export async function concatPdfs(requestedFileName: string, files: File[]) {
  await initPdfium;

  const result = await concat(files);

  const fileName = requestedFileName !== ""
    ? requestedFileName
    : generateNewFileName(files[0].name);

  const file = new File([result], `${fileName}.pdf`, { type: 'application/pdf' });
  const tempLink = document.createElement("a");

  tempLink.setAttribute('href', URL.createObjectURL(file));
  tempLink.setAttribute('download', file.name);
  tempLink.click();
  URL.revokeObjectURL(tempLink.href);
}
