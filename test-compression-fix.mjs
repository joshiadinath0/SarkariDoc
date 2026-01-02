import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import canvasModule from 'canvas';
import fs from 'fs';
import path from 'path';

async function createDummyPdf() {
    const doc = await PDFDocument.create();
    const page = doc.addPage([500, 500]);
    page.drawText('Hello World', { x: 50, y: 450 });
    const pdfBytes = await doc.save();
    return pdfBytes;
}

async function testRender() {
    console.log('Creating dummy PDF...');
    const pdfBytes = await createDummyPdf();
    const pdfUint8Array = new Uint8Array(pdfBytes);

    try {
        const { createCanvas } = canvasModule;
        console.log('Canvas loaded successfully');

        console.log('Loading PDF with pdfjs...');
        // Correct configuration: No workerSrc, Yes standardFontDataUrl
        const loadingTask = pdfjsLib.getDocument({
            data: pdfUint8Array,
            standardFontDataUrl: `node_modules/pdfjs-dist/standard_fonts/`
        });
        const pdfDocument = await loadingTask.promise;
        console.log('PDF loaded. Pages:', pdfDocument.numPages);

        const pdfPage = await pdfDocument.getPage(1);
        const viewport = pdfPage.getViewport({ scale: 1.0 });

        console.log('Creating canvas...');
        const canvas = createCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext('2d');

        console.log('Rendering page...');
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };

        await pdfPage.render(renderContext).promise;
        console.log('Render success!');

        const buffer = canvas.toBuffer('image/jpeg');
        console.log('Buffer created, size:', buffer.length);

    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(e);
    }
}

testRender();
