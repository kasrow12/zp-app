const MIN_CZESCI = 2;
const MAX_CZESCI = 16;
const DEFAULT_WARTOSC = "0,00";
const MAX_ZRODLA_FINANSOWANIA = 8;
const DEFAULT_ZRODLO_INNE = "Dziekan";
const DEFAULT_NR_WNIOSKU = `/${new Date().getFullYear()}`;
const DEFAULT_KWOTA = `${DEFAULT_WARTOSC} zł`;
const EURO_RATE = 4.6371;

let czesciCount = 0;

const downloadButton = document.getElementById("downloadPdf");
const dodatkoweCheckbox = document.getElementById("dodatkoweCheckbox");

const mainForm = document.getElementById("mainForm");
const nazwaJednostki = document.getElementById("nazwa_jednostki");
const nazwaZamowienia = document.getElementById("nazwa_zamowienia_text");
const uslugiCheckbox = document.getElementById("rodzaj_uslugi");
const kategorieUslug = document.getElementById("kategoria_uslug");
const glownyCpv = document.getElementById("glowny_cpv");

const planZamowienTak = document.getElementById("plan_zamowien_tak");
const planZamowienRok = document.getElementById("plan_zamowien_rok");
const planZamowienOznaczenia = document.getElementById("plan_zamowien_oznaczenia_text");
const planZamowienWartosci = document.getElementById("plan_zamowien_wartosci_text");
const planZamowienOznaczeniaInput = document.getElementById("plan_zamowien_oznaczenia");
const planZamowienWartosciInput = document.getElementById("plan_zamowien_wartosci");

const zamowieniePzpTak = document.getElementById("zamowienie_pzp_tak");
const zamowieniePzpNie = document.getElementById("zamowienie_pzp_nie");
const zamowieniePzpKwota = document.getElementById("zamowienie_pzp_kwota_text");

const wartosciBarrier = document.getElementById("czesci-7-after");
const kwotyBrutto = document.getElementById("czesci-brutto");
const zrodlaBezCzesci = document.getElementById("zrodla-finansowania-bez-czesci");
const czesciKwoty = document.getElementById("czesci-11");

// Trochę zapobiega przed nowymi liniami w "jednolinijkowych" polach (np. kwota)
const dontAllowLinebreaks = (evt) => {
    if (evt.keyCode === 13) {
        // Enter key
        evt.preventDefault();
    }
};

// Ustawia contentEditable na elemencie, zapobiega wklejaniu formatowania
const setContentEditable = (elem, enable = true) => {
    if (!enable) {
        elem.contentEditable = false;
        return;
    }

    try {
        elem.contentEditable = "plaintext-only";
    } catch {
        elem.contentEditable = true;
    }
};

// Bezpieczeństwo
const escapeHtml = (unsafe) => {
    return unsafe
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};

// Przełącza widoczność elementu, z opcją jego ukrycia
const toggleVisibility = (element, visible, withHidden) => {
    element.classList.toggle("input", visible);
    element.disabled = !visible;
    withHidden && element.classList.toggle("hidden", !visible);
};

// Wywoływane po kliknięciu przycisku "Części"
function setCzesci() {
    if (czesciCount > 0) return;

    const count = prompt(`Podaj liczbę części (${MIN_CZESCI}-${MAX_CZESCI}):`);

    if (!count) return;

    const parsedCount = parseInt(count);
    if (isNaN(parsedCount) || parsedCount < MIN_CZESCI || parsedCount > MAX_CZESCI) {
        alert(`Podano nieprawidłową liczbę części (${MIN_CZESCI}-${MAX_CZESCI})`);
        return;
    }

    czesciCount = parsedCount;
    naCzesci(parsedCount);

    // jednorazowo zmień, todo: ładniejszy przycisk?
    document.getElementById("czesciButton").disabled = true;
}

// Edycja dodatkowych pól
function dodatkoweHandler() {
    const dodatkowe = dodatkoweCheckbox.checked;

    // 1. Nazwa jednostki
    toggleVisibility(nazwaJednostki, dodatkowe);

    // 7.
    // Checkbox jest ukryty, styl parenta
    zamowieniePzpTak.parentElement.classList.toggle("input", dodatkowe);
    zamowieniePzpTak.disabled = !dodatkowe;

    zamowieniePzpNie.parentElement.classList.toggle("input", dodatkowe);
    zamowieniePzpNie.disabled = !dodatkowe;

    // Wyłączanie wartości PZP, jeśli dodatkowe pola są wyłączone,
    // mimo zaznaczonego 'tak'
    if (dodatkowe) {
        zamowieniePzpHandler();
    } else {
        toggleVisibility(zamowieniePzpKwota, false);
        setContentEditable(zamowieniePzpKwota, false);
    }
}

// 5. Handler - przełączanie pola Kateogria usług
function rodzajeHandler() {
    const visible = uslugiCheckbox.checked;

    toggleVisibility(kategorieUslug, visible, true);
    kategorieUslug.required = visible;
}

// 6.2. Handler - przełączanie pól rok, oznaczenie planu, wartość w planie
function planZamowienHandler() {
    const visible = planZamowienTak.checked;

    toggleVisibility(planZamowienRok, visible, true);
    toggleVisibility(planZamowienOznaczenia, visible, true);
    toggleVisibility(planZamowienWartosci, visible, true);

    setContentEditable(planZamowienOznaczenia, visible);
    setContentEditable(planZamowienWartosci, visible);

    planZamowienRok.required = visible;
    planZamowienOznaczeniaInput.required = visible;
    planZamowienWartosciInput.required = visible;
}

// 7. Handler (dodatkowe) - przełączanie pola wartość PZP
function zamowieniePzpHandler() {
    const czyPzp = zamowieniePzpTak.checked;
    toggleVisibility(zamowieniePzpKwota, czyPzp);

    setContentEditable(zamowieniePzpKwota, czyPzp);
}

// Ustawienie pól jako edytowalne
function setFormEditable() {
    const textNoLinebreakSelectors = `
        #dodatkowe_cpv_text,
        .wartosc-zamowienia,
        .kwota-brutto,
        .kwota-przeznaczona,
        .zrodlo-finansowania-kwota,
        .zrodlo-nr-wniosku,
        #termin_wykonania_text
    `; // brak przecinka na końcu jest ważny

    document.querySelectorAll(textNoLinebreakSelectors).forEach((e) => {
        setContentEditable(e);
        e.addEventListener("keydown", dontAllowLinebreaks);
    });

    const textBlockSelectors = `
        #nazwa_zamowienia_text,
        #podstawa_ust_wartosci_text,
        .wartosc-nazwa,
        #informacje_dodatkowe_text,
        #zalaczniki_text
    `;

    document.querySelectorAll(textBlockSelectors).forEach((e) => {
        setContentEditable(e);
    });
}

// Pobieranie PDFa
async function downloadPdf() {
    downloadButton.classList.add("loading");
    const originalText = downloadButton.textContent;
    // downloadButton.textContent = "Generowanie...";

    // Setup the form data, get values form the visible fields with content-editable
    document.querySelectorAll("[type=hidden]").forEach((e) => {
        const visible = document.getElementById(e.id + "_text");
        if (visible) {
            e.value = visible.innerText;
        }
    });

    if (validateForm(mainForm) === false) {
        alert("Sprawdź czy wszystkie wymagane pola są wypełnione.");
        downloadButton.classList.remove("loading");
        // downloadButton.textContent = originalText;
        return;
    }

    const formData = new FormData(mainForm);

    // Add disabled inputs to the form data, not included in the form by default
    const disabledInputs = document.querySelectorAll(".input-box:disabled, .checkbox-input:disabled:checked");
    disabledInputs.forEach((e) => {
        formData.append(e.name, e.value);
    });

    // Add czesci & źródła JSON to the form data
    let data;
    if (czesciCount > 0) {
        data = czesciJson();
        formData.append("czesci", JSON.stringify(data));
    } else {
        const rows = document.querySelectorAll("#zrodla-finansowania-bez-czesci > .zrodlo-finansowania-row");
        data = getZrodlaFinansowania(rows);
        formData.append("zrodla", JSON.stringify(data));
    }

    const formBody = new URLSearchParams(formData).toString();

    try {
        const response = await fetch("/generate-pdf", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formBody,
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(text);
            alert(`Błąd podczas generowania wniosku: ${text}`);
            return;
        }

        const nazwa = nazwaZamowienia.innerText
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, "") // Remove non-alphanumeric characters except spaces
            .replace(/\s+/g, "_") // Replace spaces with underscores
            .substring(0, 15); // Limit to 15 characters

        const downloadName = `ZP_${nazwa}.pdf`;

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = downloadName;
        link.click();
    } catch (error) {
        console.error(error);
        alert("Wystąpił błąd podczas generowania wniosku");
    } finally {
        downloadButton.classList.remove("loading");
        downloadButton.textContent = originalText;
    }
}

// 7. Zwraca wiersz wartości części
function getWartoscCzesci(i, nazwa = "", wartosc = DEFAULT_WARTOSC) {
    const euroValue = calculateEuro(wartosc);

    return `
        <section class="grid-row czesci-row">
            <div class="listing left input-padding">
                <div>Część&nbsp;${i}:</div>
                <div class="input wartosc-nazwa">${escapeHtml(nazwa.trim())}</div>
            </div>
            <div class="money input wartosc-zamowienia">${escapeHtml(wartosc.trim())}</div>
            <div class="color">zł, co stanowi równowartość</div>
            <div class="money wartosc-zamowienia-euro">${euroValue}</div>
            <div class="color">euro</div>
        </section>`.trim();
}

// 10. Zwraca wiersz kwoty brutto
function getKwotaBrutto(i, kwota = DEFAULT_KWOTA) {
    return `
        <section class="grid-row czesci-row">
            <div>Część&nbsp;${i}:</div>
            <div class="input money kwota-brutto">${escapeHtml(kwota.trim())}</div>
            <div class="filler"></div>
        </section>`.trim();
}

// 11. Zwraca wiersz kwoty przeznaczonej
function getKwotaPrzeznaczona(i, kwota = DEFAULT_KWOTA, zrodla) {
    let zrodlaText = "";
    if (zrodla) {
        zrodlaText = zrodla
            .map((zrodlo) => getZrodloFinansowania(zrodlo.selected, zrodlo.nrWniosku, zrodlo.inne, zrodlo.kwota))
            .join("");
    } else {
        zrodlaText = getZrodloFinansowania();
    }

    return `
        <section class="grid-row czesci-row">
            <div class="mult-flex-row3 input-padding">
                <div>Część&nbsp;${i}:</div>
                <div class="input kwota-przeznaczona">${escapeHtml(kwota.trim())}</div>
            </div>
            <section class="grid-11-row">
                ${zrodlaText}
            </section>
        </section>`.trim();
}

// 11+. Zwraca wiersz źródła finansowania (może być kilka dla części)
function getZrodloFinansowania(
    selected = 0,
    nrWniosku = DEFAULT_NR_WNIOSKU,
    inne = DEFAULT_ZRODLO_INNE,
    kwota = DEFAULT_KWOTA
) {
    return `
        <section class="grid-row zrodlo-finansowania-row">
            <section class="listing with-row-button left">
                <select class="input zrodlo-finansowania" onchange="zrodloFinansowaniaHandler(this)" data-selected="${Number(
                    selected
                )}">
                    <option selected disabled hidden>Wybierz źródło finansowania</option>
                    <option>ŚnDS Akademikalia</option>
                    <option>ŚnDS Bale</option>
                    <option>ŚnDS Delegacje i wyjazdy na konferencje</option>
                    <option>ŚnDS Inicjatywy kulturalne</option>
                    <option>ŚnDS Inicjatywy sportowe</option>
                    <option>ŚnDS Budżet Kreatywny</option>
                    <option>ŚnDS Integracje akademikowe</option>
                    <option>ŚnDS Majówki</option>
                    <option>ŚnDS Organizacja konferencji</option>
                    <option>ŚnDS Organizacja targów</option>
                    <option>ŚnDS Otrzęsiny</option>
                    <option>ŚnDS Pikniki</option>
                    <option>ŚnDS Projekty centralne</option>
                    <option>ŚnDS Juwenalia</option>
                    <option>ŚnDS Promocja</option>
                    <option>ŚnDS Szkolenia</option>
                    <option>ŚnDS Środki trwałe, wyposażenie, amortyzacja</option>
                    <option>ŚnDS Wyjazdy wakacyjne</option>
                    <option>ŚnDS Wyjazdy zimowe</option>
                    <option>ŚnDS Bilety do instytucji kultury</option>
                    <option>ŚnDS Wymiany zagraniczne</option>
                    <option>ŚnDS Zerówki i integrale</option>
                    <option>ŚnDS Infrastruktura SSPW</option>
                    <option>ŚnDS Rezerwa Prorektora</option>
                    <option>ŚnDS Rezerwa KFG</option>
                    <option>ŚnDS Eksperymenty Naukowe</option>
                    <option>ŚnDS Sporty Akademickie</option>
                    <option>ŚnDS Młodzi naukowcy</option>
                    <option>ŚnDS Filia w Płocku</option>
                    <option>Inne</option>
                </select>
                <div class="zrodlo-finansowania-text"></div>
                <div class="small input-padding zrodlo-nr-wniosku-container">
                    Wniosek nr <span class="input zrodlo-nr-wniosku">${escapeHtml(nrWniosku.trim())}</span>
                </div>
                <div class="input hidden zrodlo-finansowania-inne">${escapeHtml(inne.trim())}</div>
                <span class="add-row-button row-button" onclick="dodajZrodlo(this)" title="Dodaj kolejne źródło">+</span>
                <span class="remove-row-button row-button" onclick="usunZrodlo(this)" title="Usuń źródło">&times;</span>
            </section>
            <div class="money input-padding">
                <div class="input zrodlo-finansowania-kwota">${escapeHtml(kwota.trim())}</div>
            </div>
        </section>`.trim();
}

// Handler dla zmiany źródła finansowania,
// albo źródło z selecta + wniosek nr,
// albo "Inne" + do wpisania
function zrodloFinansowaniaHandler(select) {
    const selected = select.options[select.selectedIndex].text;
    const row = select.parentElement;
    const zrodloText = row.querySelector(".zrodlo-finansowania-text");
    const zrodloInne = row.querySelector(".zrodlo-finansowania-inne");
    const wniosekNrContainer = row.querySelector(".zrodlo-nr-wniosku-container");
    const wniosekNr = row.querySelector(".zrodlo-nr-wniosku");

    zrodloText.innerText = selected;
    select.classList.remove("invalid");

    if (selected === "Inne") {
        zrodloInne.classList.remove("hidden");
        wniosekNrContainer.classList.add("hidden");
        zrodloText.classList.add("hidden");
        setContentEditable(zrodloInne);
        setContentEditable(wniosekNr, false);
    } else {
        zrodloInne.classList.add("hidden");
        wniosekNrContainer.classList.remove("hidden");
        zrodloText.classList.remove("hidden");
        setContentEditable(wniosekNr);
        setContentEditable(zrodloInne, false);
    }
}

// Formularz części z JSONa
function czesciFromJson(czesci) {
    mainForm.classList.toggle("bez-czesci");
    mainForm.classList.toggle("czesci");

    try {
        if (!czesci || typeof czesci !== "object") {
            throw new Error("Brak części");
        }

        const count = Object.keys(czesci).length;

        if (count < MIN_CZESCI || count > MAX_CZESCI) {
            throw new Error(`Nieprawidłowa liczba części (${MIN_CZESCI}-${MAX_CZESCI})`);
        }

        for (let i = 1; i <= count; i++) {
            const czesc = czesci[i];

            if (!czesc || typeof czesc !== "object") {
                throw new Error(`Nieprawidłowa część ${i}`);
            }

            const nazwa = czesc.nazwa || "";
            const wartosc = czesc.wartosc || DEFAULT_WARTOSC;
            const brutto = czesc.brutto || DEFAULT_KWOTA;
            const kwotaPrzeznaczona = czesc.kwotaPrzeznaczona || DEFAULT_KWOTA;
            const zrodla = czesc.zrodla || [];

            const wartosciText = getWartoscCzesci(i, nazwa, wartosc);
            wartosciBarrier.insertAdjacentHTML("beforebegin", wartosciText);

            const bruttoText = getKwotaBrutto(i, brutto);
            kwotyBrutto.insertAdjacentHTML("beforeend", bruttoText);

            const kwotyText = getKwotaPrzeznaczona(i, kwotaPrzeznaczona, zrodla);
            czesciKwoty.insertAdjacentHTML("beforeend", kwotyText);
        }

        setFormEditable();

        // Ustaw źródła finansowania
        const zrodlaSelects = document.querySelectorAll(".zrodlo-finansowania");
        zrodlaSelects.forEach((select) => {
            select.selectedIndex = select.dataset.selected;
            zrodloFinansowaniaHandler(select);
        });
    } catch (error) {
        console.error(error);
    }
}

// Formualrz części z domyślnymi wartościami i zadaną liczbą części
function naCzesci(count) {
    mainForm.classList.toggle("bez-czesci");
    mainForm.classList.toggle("czesci");

    for (let i = 1; i <= count; i++) {
        wartosciBarrier.insertAdjacentHTML("beforebegin", getWartoscCzesci(i));
        kwotyBrutto.insertAdjacentHTML("beforeend", getKwotaBrutto(i));
        czesciKwoty.insertAdjacentHTML("beforeend", getKwotaPrzeznaczona(i));
    }

    setFormEditable();
}

// Zwraca JSONa części
function czesciJson() {
    const czesciJson = {};
    for (let i = 1; i <= czesciCount; i++) {
        czesciJson[i] = {};
    }

    // 7.
    const wartosci = document.querySelectorAll("#czesci-7 > .czesci-row");
    wartosci.forEach((czesc, i) => {
        czesciJson[i + 1].nazwa = czesc.querySelector(".wartosc-nazwa").innerText;
        czesciJson[i + 1].wartosc = czesc.querySelector(".wartosc-zamowienia").innerText;
        czesciJson[i + 1].wartoscEuro = czesc.querySelector(".wartosc-zamowienia-euro").innerText;
    });

    // 10.
    const brutta = document.querySelectorAll("#czesci-brutto > .czesci-row");
    brutta.forEach((brutto, i) => {
        czesciJson[i + 1].brutto = brutto.querySelector(".kwota-brutto").innerText;
    });

    // 11.
    const czesciKwoty = document.querySelectorAll("#czesci-11 > .czesci-row");
    czesciKwoty.forEach((czesc, i) => {
        const zrodla = czesc.querySelectorAll(".zrodlo-finansowania-row");
        czesciJson[i + 1].zrodla = getZrodlaFinansowania(zrodla);
        czesciJson[i + 1].kwotaPrzeznaczona = czesc.querySelector(".kwota-przeznaczona").innerText;
    });

    return czesciJson;
}

// Zwraca JSONa źródeł finansowania
function getZrodlaFinansowania(rows) {
    const zrodla = [];

    rows.forEach((zrodlo) => {
        zrodla.push({
            selected: zrodlo.querySelector(".zrodlo-finansowania").selectedIndex,
            nrWniosku: zrodlo.querySelector(".zrodlo-nr-wniosku").innerText,
            inne: zrodlo.querySelector(".zrodlo-finansowania-inne").innerText,
            kwota: zrodlo.querySelector(".zrodlo-finansowania-kwota").innerText,
        });
    });

    return zrodla;
}

// Ustaw źródła finansowania z JSONa
function zrodlaFinansowaniaFromJson(zrodla) {
    // Usuń bieżące
    zrodlaBezCzesci.innerHTML = "";
    if (!zrodla || !Array.isArray(zrodla)) {
        console.error("Brak źródeł finansowania");
        return;
    }

    zrodla.forEach((zrodlo) => {
        const zrodloText = getZrodloFinansowania(zrodlo.selected, zrodlo.nrWniosku, zrodlo.inne, zrodlo.kwota);
        zrodlaBezCzesci.insertAdjacentHTML("beforeend", zrodloText);
    });

    const zrodlaSelects = document.querySelectorAll(".zrodlo-finansowania");
    zrodlaSelects.forEach((select) => {
        select.selectedIndex = select.dataset.selected;
        zrodloFinansowaniaHandler(select);
    });

    setFormEditable();
}

// Dodawanie źródła finansowania (zarówno bez części i części)
function dodajZrodlo(el) {
    const zrodlo = el.parentElement.parentElement;
    if (zrodlo.parentElement.childElementCount >= MAX_ZRODLA_FINANSOWANIA) {
        alert(`Błąd: Nie można dodać więcej niż ${MAX_ZRODLA_FINANSOWANIA} źródeł finansowania`);
        return;
    }

    zrodlo.insertAdjacentHTML("afterend", getZrodloFinansowania());
    setFormEditable();
}

// Usuwanie źródła finansowania (zarówno bez części i części)
function usunZrodlo(el) {
    const zrodlo = el.parentElement.parentElement;
    if (zrodlo.parentElement.childElementCount === 1) {
        alert("Błąd: Nie można usunąć ostatniego źródła finansowania");
        return;
    }

    confirm("Czy na pewno chcesz usunąć to źródło finansowania?") && zrodlo.remove();
}

// Walidacja formularza
function validateForm(form) {
    // const required = form.querySelectorAll("[required]");
    let valid = true;

    // required.forEach((el) => {
    //     if (!el.value.trim()) {
    //         el.classList.add("invalid");
    //         valid = false;
    //     } else {
    //         el.classList.remove("invalid");
    //     }
    // });

    // const czesci = czesciCount > 0 ? "czesci-row" : "bez-czesci-row";
    // const zrodla = form.querySelectorAll(`${czesci} .zrodlo-finansowania`);
    // zrodla.forEach((select) => {
    //     if (select.selectedIndex === 0) {
    //         select.classList.add("invalid");
    //         valid = false;
    //     } else {
    //         select.classList.remove("invalid");
    //     }
    // });

    return valid;
}

// Walidacja CPV regex 00000000-0
function validateCpvInput() {
    const cpvPattern = /^\d{8}-\d$/;

    if (!cpvPattern.test(glownyCpv.value)) {
        glownyCpv.classList.add("invalid");
    } else {
        glownyCpv.classList.remove("invalid");
    }
}

// Przelicza string PLN na EUR
function calculateEuro(plnValue) {
    const numericString = String(plnValue).replace(/\s/g, "").replace(",", ".");
    const pln = parseFloat(numericString);

    if (isNaN(pln) || pln < 0) {
        return DEFAULT_WARTOSC;
    }

    const euro = pln / EURO_RATE;
    return euro.toFixed(2).replace(".", ",");
}

// main

// pierwsze źródło finansowania
zrodlaBezCzesci.insertAdjacentHTML("beforeend", getZrodloFinansowania());

// domyślne wartości
planZamowienRok.value = new Date().getFullYear();
const dzienZamowienia = document.getElementById("dzien_zamowienia");
dzienZamowienia.value = new Date().toLocaleDateString("pl-PL") + " r."; // "dd.mm.yyyy r."

zamowieniePzpKwota.addEventListener("keydown", dontAllowLinebreaks);
downloadButton.addEventListener("click", downloadPdf);
glownyCpv.addEventListener("input", validateCpvInput);

setFormEditable();

const wartoscZamowieniaInput = document.getElementById("wartosc_zamowienia");
const wartoscZamowieniaEuro = document.getElementById("wartosc_zamowienia_euro");

const updateEuro = () => {
    const plnValue = wartoscZamowieniaInput.value;
    wartoscZamowieniaEuro.innerText = calculateEuro(plnValue);
};

wartoscZamowieniaInput.addEventListener("input", updateEuro);
updateEuro();

const czesci7Section = document.getElementById("czesci-7");
czesci7Section.addEventListener("input", (event) => {
    if (event.target.matches(".czesci-row .wartosc-zamowienia")) {
        const plnDiv = event.target;
        const czesciRow = plnDiv.closest(".czesci-row");

        if (czesciRow) {
            const euroDiv = czesciRow.querySelector(".wartosc-zamowienia-euro");
            if (euroDiv) {
                const plnValue = plnDiv.innerText;
                euroDiv.innerText = calculateEuro(plnValue);
            }
        }
    }
});
