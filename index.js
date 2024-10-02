const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' })); //?

app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-pdf', async (req, res) => {
    const { content } = req.body;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = `file:${path.join(__dirname, 'public', 'index.html')}`;
    await page.goto(filePath);

    // const htmlContent = `
    //     <!DOCTYPE html>
    //     <html lang="pl">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>Wniosek o udzielenie zamówienia publicznego</title>
    //     </head>
    //     ${content}
    //     </html>
    // `;

    // await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // const cssFilePath = path.join(__dirname, 'public', 'style.css');
    // const css = await fs.promises.readFile(cssFilePath, 'utf8');
    // await page.addStyleTag({ content: css });

    // console.log(htmlContent);

    const pdfBuffer =  await page.pdf({
        path: 'zp.pdf',
        scale: 0.5,
        printBackground: true,
        format: 'A4',
        margin: {
            top: '10mm',
            right: '10mm',
            bottom: '20mm',
            left: '10mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `<div></div>`,
        footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; padding-top: 5px;">
            <span style="font-size: 10px;"><span class="pageNumber"></span> z <span class="totalPages"></span></span>
        </div>`
    });

    await browser.close();

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=ZP-${Math.random().toString(36).substring(7)}.pdf`,
        'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
});

// Start serwera
app.listen(port, () => {
    console.log(`Aplikacja działa na http://localhost:${port}`);
});
