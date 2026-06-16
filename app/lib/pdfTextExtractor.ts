let pdfjsLib: any = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;

    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    const lib = await import("pdfjs-dist/build/pdf.mjs");
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    return lib;
}

export async function extractPdfText(file: File): Promise<string> {
    try {
        const lib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
            fullText += pageText + "\n";
        }

        return fullText.trim();
    } catch (error) {
        console.error("PDF text extraction failed:", error);
        return "";
    }
}