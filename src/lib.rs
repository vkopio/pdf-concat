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
pub async fn log_page_metrics_to_console(blob: Blob) {
    let pdfium = Pdfium::default();

    let document = pdfium.load_pdf_from_blob(blob, None).await.unwrap();

    // Output metadata and form information for the PDF file to the console.
    log::info!("PDF file version: {:#?}", document.version());
    log::info!("PDF metadata tags:");

    document
        .metadata()
        .iter()
        .enumerate()
        .for_each(|(index, tag)| log::info!("{}: {:#?} = {}", index, tag.tag_type(), tag.value()));

    let pages = document.pages();

    match document.form() {
        Some(form) => {
            log::info!(
                "PDF contains an embedded form of type {:#?}",
                form.form_type()
            );

            for (key, value) in form.field_values(&pages).iter() {
                log::info!("{:?} => {:?}", key, value);
            }
        }
        None => log::info!("PDF does not contain an embedded form"),
    };

    // Report labels, boundaries, and metrics for each page to the console.

    pages.iter().enumerate().for_each(|(page_index, page)| {
        if let Some(label) = page.label() {
            log::info!("Page {} has a label: {}", page_index, label);
        }

        log::info!(
            "Page {} width: {}, height: {}",
            page_index,
            page.width().value,
            page.height().value
        );

        for boundary in page.boundaries().iter() {
            log::info!(
                "Page {} has defined {:#?} box ({}, {}) - ({}, {})",
                page_index,
                boundary.box_type,
                boundary.bounds.left.value,
                boundary.bounds.top.value,
                boundary.bounds.right.value,
                boundary.bounds.bottom.value,
            );
        }

        log::info!(
            "Page {} has paper size {:#?}",
            page_index,
            page.paper_size()
        );

        for (link_index, link) in page.links().iter().enumerate() {
            log::info!(
                "Page {} link {} has action of type {:?}",
                page_index,
                link_index,
                link.action().map(|action| action.action_type())
            );

            // For links that have URI actions, output the destination URI.

            if let Some(action) = link.action() {
                if let Some(uri_action) = action.as_uri_action() {
                    log::info!("Link URI destination: {:#?}", uri_action.uri())
                }
            }
        }

        let text = page.text().unwrap();

        for (annotation_index, annotation) in page.annotations().iter().enumerate() {
            log::info!(
                "Page {} annotation {} has text: {:?}, bounds: {:?}",
                page_index,
                annotation_index,
                text.for_annotation(&annotation),
                annotation.bounds()
            );
        }
    });
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
