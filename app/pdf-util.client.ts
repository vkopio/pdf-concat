import bindModuleInit, {
  initialize_pdfium_render,
  log_page_metrics_to_console,
  concat,
} from "@pdfium-bindings/pdf_concat";

// @ts-expect-error The PDFiumModule is initialized dynamically in root.tsx.
const initPdfium = window.PDFiumModule().then(async (pdfiumModule) => {
  console.log(pdfiumModule);

  const bindModule = await bindModuleInit(`${window.location.origin}/assets/pdf_concat_bg.wasm`);
  initialize_pdfium_render(pdfiumModule, bindModule, false);
});

export async function logPageMetrics(blob: Blob) {
  await initPdfium;
  await log_page_metrics_to_console(blob);
}

export async function concatPdfs(blobs: Blob[]) {
  await initPdfium;
  const result = await concat(blobs);

  console.log(result);

  const file = new File([result], 'concatenated.pdf', { type: 'application/pdf' });
  const tempLink = document.createElement("a");

  tempLink.setAttribute('href', URL.createObjectURL(file));
  tempLink.setAttribute('download', file.name);
  tempLink.click();
  URL.revokeObjectURL(tempLink.href);
}
