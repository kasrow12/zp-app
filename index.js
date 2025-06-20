const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const validator = require("validator");
const { PDFDocument } = require("pdf-lib");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate-pdf", async (req, res) => {
    console.log(new Date(), "POST /generate-pdf");
    console.log(req.body);

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        const filePath = `file:${path.join(__dirname, "public", "index.html")}`;
        await page.goto(filePath);

        // Fill form data
        await page.evaluate((body) => {
            document.getElementById("nazwa_jednostki").value = body.nazwa_jednostki.trim();
            document.getElementById("nazwa_zamowienia_text").textContent = body.nazwa_zamowienia.trim();
            document.getElementById(body.rodzaj_zamowienia).checked = true;
            rodzajeHandler();

            document.getElementById("glowny_cpv").value = body.glowny_cpv.trim();
            document.getElementById("dodatkowe_cpv_text").textContent = body.dodatkowe_cpv.trim();
            document.getElementById("kategoria_uslug").value = body.kategoria_uslug.trim();

            document.getElementById(body.plan_zamowien).checked = true;
            planZamowienHandler();

            document.getElementById("plan_zamowien_rok").value = body.plan_zamowien_rok.trim();
            document.getElementById("plan_zamowien_oznaczenia_text").textContent = body.plan_zamowien_oznaczenia.trim();
            document.getElementById("plan_zamowien_wartosci_text").textContent = body.plan_zamowien_wartosci.trim();

            document.getElementById("wartosc_zamowienia").value = body.wartosc_zamowienia.trim();
            document.getElementById("wartosc_zamowienia_text").innerText = body.wartosc_zamowienia.trim();
            updateEuro();

            document.getElementById(body.zamowienie_pzp).checked = true;
            zamowieniePzpHandler();

            document.getElementById("zamowienie_pzp_kwota_text").textContent = body.zamowienie_pzp_kwota.trim();

            document.getElementById("dzien_zamowienia").value = body.dzien_zamowienia.trim();
            document.getElementById("podstawa_ust_wartosci_text").textContent = body.podstawa_ust_wartosci.trim();
            document.getElementById("wartosc_brutto_text").textContent = body.wartosc_brutto.trim();
            document.getElementById("kwota_przeznaczona_calosc_text").textContent =
                body.kwota_przeznaczona_calosc.trim();

            document.getElementById("termin_wykonania_text").textContent = body.termin_wykonania.trim();
            document.getElementById("informacje_dodatkowe_text").textContent = body.informacje_dodatkowe.trim();
            document.getElementById("zalaczniki_text").textContent = body.zalaczniki.trim();

            document.getElementById("checkbox_16_1").checked = body.checkbox_16_1 === "on";
            document.getElementById("uzasadnienie_prawne_1_text").textContent = body.uzasadnienie_prawne_1.trim();
            document.getElementById("uzasadnienie_faktyczne_1_text").textContent = body.uzasadnienie_faktyczne_1.trim();

            if (body.wylaczenie_stosowanie !== "0") {
                document.getElementById("16_1_wylaczenie").classList.toggle("strike");
                document.getElementById("16_1_stosowanie").classList.toggle("strike");
            }

            document.getElementById("checkbox_16_2").checked = body.checkbox_16_2 === "on";
            document.getElementById("tryb_udzielenia_text").textContent = body.tryb_udzielenia.trim();
            document.getElementById("uzasadnienie_prawne_2_text").textContent = body.uzasadnienie_prawne_2.trim();
            document.getElementById("uzasadnienie_faktyczne_2_text").textContent = body.uzasadnienie_faktyczne_2.trim();

            document.getElementById("osoba_wnioskujaca_text").textContent = body.osoba_wnioskujaca.trim();
        }, req.body);

        if (req.body.czesci != null) {
            const czesci = JSON.parse(req.body.czesci);
            await page.evaluate((czesci) => {
                czesciFromJson(czesci);
            }, czesci);
        } else if (req.body.zrodla != null) {
            const zrodla = JSON.parse(req.body.zrodla);
            await page.evaluate((zrodla) => {
                zrodlaFinansowaniaFromJson(zrodla);
            }, zrodla);
        } else {
            throw new Error("Brak części lub źródeł finansowania");
        }

        // Generate first page without footer
        const firstPageBuffer = await page.pdf({
            scale: 0.49,
            printBackground: true,
            format: "A4",
            margin: {
                top: "10mm",
                right: "10mm",
                bottom: "20mm",
                left: "10mm",
            },
            pageRanges: "1",
            displayHeaderFooter: true,
            headerTemplate: `<div></div>`,
            footerTemplate: `
            <div style="font-size: 9px; width: 80%; margin: 0 auto; padding-bottom: 1em;">
                <div style="text-align: center;"><span class="pageNumber"></span> z <span class="totalPages"></span></div>
            </div>`,
        });

        // Generate remaining pages with footer
        const restPagesBuffer = await page.pdf({
            scale: 0.49,
            printBackground: true,
            format: "A4",
            margin: {
                top: "10mm",
                right: "10mm",
                bottom: "20mm",
                left: "10mm",
            },
            pageRanges: "2-",
            displayHeaderFooter: true,
            headerTemplate: `<div></div>`,
            footerTemplate: `
            <div style="font-size: 9px; width: 80%; margin: 0 auto; padding-bottom: 1em;">
                <div style="text-align: center;"><span class="pageNumber"></span> z <span class="totalPages"></span></div>
                <div>Nazwa zamówienia publicznego (z lp. 2 wniosku): ${validator.escape(
                    req.body.nazwa_zamowienia
                )}</div>
            </div>`,
        });

        await browser.close();

        // Merge PDFs
        const mergedPdf = await PDFDocument.create();

        // Add first page
        const firstPdf = await PDFDocument.load(firstPageBuffer);
        const firstPages = await mergedPdf.copyPages(firstPdf, firstPdf.getPageIndices());
        firstPages.forEach((page) => mergedPdf.addPage(page));

        // Add remaining pages if they exist
        if (restPagesBuffer.length > 0) {
            const restPdf = await PDFDocument.load(restPagesBuffer);
            const restPages = await mergedPdf.copyPages(restPdf, restPdf.getPageIndices());
            restPages.forEach((page) => mergedPdf.addPage(page));
        }

        const finalPdfBuffer = await mergedPdf.save();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=ZP.pdf",
            "Content-Length": finalPdfBuffer.length,
        });

        res.end(Buffer.from(finalPdfBuffer));
    } catch (error) {
        console.error(new Date(), error);
        res.status(500).send("An error occurred while generating the PDF");
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`[ZP-APP] Working on localhost:${port}`);
});
