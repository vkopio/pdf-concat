import bindModuleInit, {
  initialize_pdfium_render,
  log_page_metrics_to_console,
} from "pdfium-bindings/pdf_concat";

const initPdfium = window.PDFiumModule().then(async (pdfiumModule) => {
  console.log(pdfiumModule);

  const bindModule = await bindModuleInit(`${window.location.origin}/assets/pdf_concat_bg.wasm`);
  initialize_pdfium_render(pdfiumModule, bindModule, false);
});

export async function logPageMetrics(blob: Blob) {
  await initPdfium;
  await log_page_metrics_to_console(blob);
}
