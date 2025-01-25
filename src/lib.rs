#[cfg(target_arch = "wasm32")]
use pdfium_render::prelude::*;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use web_sys::Blob;

// See https://github.com/ajrcarey/pdfium-render/tree/master/examples for information
// on how to build and package this example alongside a WASM build of Pdfium, suitable
// for running in a browser.

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
pub async fn concat(
    files: Vec<Blob>,
    names: Vec<String>,
    pages: Vec<String>,
) -> Result<Blob, JsError> {
    let pdfium = Pdfium::default();
    let mut document = pdfium.create_new_pdf()?;

    for (file, (name, page_selection)) in files.into_iter().zip(names.into_iter().zip(pages)) {
        if page_selection.is_empty() {
            document
                .pages_mut()
                .append(&pdfium.load_pdf_from_blob(file, None).await?)?;
        } else {
            let destination_page_index = document.pages().len();
            let file_to_concatenate = &pdfium.load_pdf_from_blob(file, None).await?;

            document
                .pages_mut()
                .copy_pages_from_document(
                    file_to_concatenate,
                    &page_selection,
                    destination_page_index,
                )
                .map_err(|_e| {
                    JsError::new(&format!(
                        "Cannot concatenate the file: {}. Is the page selection '{}' correct?",
                        name, page_selection
                    ))
                })?;
        }
    }

    Ok(document.save_to_blob()?)
}
