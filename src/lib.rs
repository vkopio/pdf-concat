#[cfg(target_arch = "wasm32")]
use pdfium_render::prelude::*;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use web_sys::Blob;

// See https://github.com/ajrcarey/pdfium-render/tree/master/examples for information
// on how to build and package this example alongside a WASM build of Pdfium, suitable
// for running in a browser.

/// Downloads the given URL, opens it as a PDF document, then logs the width and height of
/// each page in the document, along with other document metrics, to the Javascript console.
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub async fn get_page_count(blob: Blob) -> Result<u16, JsError> {
    let pdfium = Pdfium::default();
    let document = pdfium.load_pdf_from_blob(blob, None).await?;

    log::info!("PDF file version: {:#?}", document.version());

    Ok(document.pages().len())
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub async fn concat(blobs: Vec<Blob>) -> Result<Blob, JsError> {
    let pdfium = Pdfium::default();

    let mut document = pdfium.create_new_pdf()?;

    for blob in blobs {
        document
            .pages_mut()
            .append(&pdfium.load_pdf_from_blob(blob, None).await?)?;
    }

    // ... import some more pages from another test file, this time
    // using PdfPages::import_pages_from_document() ...

    // let destination_page_index = document.pages().len();

    // document.pages_mut().copy_pages_from_document(
    //     &pdfium.load_pdf_from_blob(blob, None).await?,
    //     "3-6", // Note: 1-indexed, not 0-indexed
    //     destination_page_index,
    // )?;

    Ok(document.save_to_blob()?)
}
