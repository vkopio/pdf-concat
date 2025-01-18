import bindModuleInit, {
  initialize_pdfium_render,
  log_page_metrics_to_console,
} from "pdfium-bindings/pdf_concat";

export default window.PDFiumModule().then((pdfiumModule) => {
  console.log(pdfiumModule)

  bindModuleInit(`${window.location.origin}/assets/pdf_concat_bg.wasm`).then(async bindModule => {
    console.assert(
      initialize_pdfium_render(
        pdfiumModule,
        bindModule,
        false,
      ),
      "Initialization of pdfium-render failed!"
    );

    const targetDocument = "./test.pdf";

    await log_page_metrics_to_console(targetDocument);
  });
});
