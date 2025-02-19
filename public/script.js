const MIN_CZESCI = 2;
const MAX_CZESCI = 16;
const DEFAULT_WARTOSC = "0,00";
const DEFAULT_ZRODLO = "ŚNDS <br>Wniosek nr ";
const MAX_ZRODLA_FINANSOWANIA = 8;
const DEFAULT_KWOTA = `${DEFAULT_WARTOSC} zł`;

let czesciCount = 0;

const downloadButton = document.getElementById("downloadPdf");
const dodatkoweCheckbox = document.getElementById("dodatkoweCheckbox");

const mainForm = document.getElementById("mainForm");
const nazwaJednostki = document.getElementById("nazwa_jednostki");
const uslugiCheckbox = document.getElementById("rodzaj_uslugi");
const kategorieUslug = document.getElementById("kategoria_uslug");

const planZamowienTak = document.getElementById("plan_zamowien_tak");
const planZamowienRok = document.getElementById("plan_zamowien_rok");
const planZamowienOznaczenia = document.getElementById("plan_zamowien_oznaczenia_text");
const planZamowienWartosci = document.getElementById("plan_zamowien_wartosci_text");

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
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

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
        alert("Podano nieprawidłową liczbę części (${MIN_CZESCI}-${MAX_CZESCI})");
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
}

// 6.2. Handler - przełączanie pól rok, oznaczenie planu, wartość w planie
function planZamowienHandler() {
    const visible = planZamowienTak.checked;

    toggleVisibility(planZamowienRok, visible, true);
    toggleVisibility(planZamowienOznaczenia, visible, true);
    toggleVisibility(planZamowienWartosci, visible, true);

    setContentEditable(planZamowienOznaczenia, visible);
    setContentEditable(planZamowienWartosci, visible);
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
        .wartosc-zamowienia-euro,
        .kwota-brutto,
        .kwota-przeznaczona,
        .zrodlo-finansowania-kwota,
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
        .zrodlo-finansowania,
        #informacje_dodatkowe_text,
        #zalaczniki_text
    `;

    document.querySelectorAll(textBlockSelectors).forEach((e) => {
        setContentEditable(e);
    });
}

downloadButton.addEventListener("click", async () => {
    // Setup the form data, get values form the visible fields with content-editable
    document.querySelectorAll("[type=hidden]").forEach((e) => {
        const visible = document.getElementById(e.id + "_text");
        if (visible) {
            e.value = visible.innerText;
        }
    });

    const formData = new FormData(mainForm);

    // Add disabled inputs to the form data, not included in the form by default
    const disabledInputs = document.querySelectorAll(
        ".input-box:disabled, .checkbox-input:disabled:checked"
    );
    disabledInputs.forEach((e) => {
        formData.append(e.name, e.value);
    });

    // Add czesci & źródła JSON to the form data
    if (czesciCount > 0) {
        const data = czesciJson();
        formData.append("czesci", JSON.stringify(data));
    } else {
        const data = zrodlaFinansowaniaJson();
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
            console.error(response.status);
            alert("Wystąpił błąd podczas generowania wniosku");
            return;
        }
    
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "wniosek.pdf";
        link.click();
    } catch (error) {
        console.error(error);
        alert("Wystąpił błąd podczas generowania wniosku");
    }
});

// 7. Zwraca wiersz wartości części
function getWartoscCzesci(i, nazwa = "", wartosc = DEFAULT_WARTOSC, wartoscEuro = DEFAULT_WARTOSC) {
    return `
        <section class="grid-row czesci-row">
            <div class="listing left input-padding-left">
                <div class="padding-left">Część ${i}:</div>
                <div class="input wartosc-nazwa">${nazwa}</div>
            </div>
            <div class="money input wartosc-zamowienia">${wartosc}</div>
            <div class="color">zł, co stanowi równowartość</div>
            <div class="money input wartosc-zamowienia-euro">${wartoscEuro}</div>
            <div class="color">euro</div>
        </section>`
    .trim();
}

// 10. Zwraca wiersz kwoty brutto
function getKwotaBrutto(i, kwota = DEFAULT_KWOTA) {
    return `
        <section class="grid-row czesci-row">
            <div class="nowrap">Część ${i}:</div>
            <div class="input money kwota-brutto">${kwota}</div>
            <div class="filler"></div>
        </section>`
    .trim();
}

// 11. Zwraca wiersz kwoty przeznaczonej
function getKwotaPrzeznaczona(i, kwota = DEFAULT_KWOTA, zrodla) {
    let zrodlaText = "";
    if (zrodla) {
        zrodlaText = zrodla.map((zrodlo) => getZrodloFinansowania(zrodlo.zrodlo, zrodlo.kwota)).join("");
    } else {
        zrodlaText = getZrodloFinansowania();
    }

    return `
        <section class="grid-row czesci-row">
            <div class="mult-flex-row3 input-padding-right">
                <div>Część ${i}:</div>
                <div class="input kwota-przeznaczona">${kwota}</div>
            </div>
            <section class="grid-11-row">
                ${zrodlaText}
            </section>
        </section>`
    .trim();
}

// 11+. Zwraca wiersz źródła finansowania (może być kilka dla części)
function getZrodloFinansowania(zrodlo = DEFAULT_ZRODLO, kwota = DEFAULT_KWOTA) {
    return `
        <section class="grid-row zrodlo-finansowania-row">
            <section class="block with-add-row">
                <div class="input listing left zrodlo-finansowania">${zrodlo}</div>
                <span class="add-row-button" onclick="dodajZrodlo(this)" title="Dodaj kolejne źródło">+</span>
                <span class="remove-row-button" onclick="usunZrodlo(this)" title="Usuń źródło">&times;</span>
            </section>
            <div class="money input-padding-right">
                <div class="input zrodlo-finansowania-kwota">${kwota}</div>
            </div>
        </section>`
    .trim();
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
            const wartoscEuro = czesc.wartoscEuro || DEFAULT_WARTOSC;
            const brutto = czesc.brutto || DEFAULT_KWOTA;
            const kwotaPrzeznaczona = czesc.kwotaPrzeznaczona || DEFAULT_KWOTA;
            const zrodla = czesc.zrodla || [];

            const wartosciText = getWartoscCzesci(i, nazwa, wartosc, wartoscEuro);
            wartosciBarrier.insertAdjacentHTML("beforebegin", wartosciText);

            const bruttoText = getKwotaBrutto(i, brutto);
            kwotyBrutto.insertAdjacentHTML("beforeend", bruttoText);

            const kwotyText = getKwotaPrzeznaczona(i, kwotaPrzeznaczona, zrodla);
            czesciKwoty.insertAdjacentHTML("beforeend", kwotyText);
        }
        setFormEditable();
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

        const zrodlaFinansowania = [];

        const zrodla = czesc.querySelectorAll(".zrodlo-finansowania-row");
        zrodla.forEach((zrodlo) => {
            zrodlaFinansowania.push({
                zrodlo: zrodlo.querySelector(".zrodlo-finansowania").innerText,
                kwota: zrodlo.querySelector(".zrodlo-finansowania-kwota").innerText,
            });
        });

        czesciJson[i + 1].zrodla = zrodlaFinansowania;
        czesciJson[i + 1].kwotaPrzeznaczona = czesc.querySelector(".kwota-przeznaczona").innerText;
    });

    return czesciJson;
}

// Zwraca JSONa źródeł finansowania (bez części)
function zrodlaFinansowaniaJson() {
    const zrodla = [];

    const zrodlaFinansowania = document.querySelectorAll("#zrodla-finansowania-bez-czesci > .zrodlo-finansowania-row");
    zrodlaFinansowania.forEach((zrodlo) => {
        zrodla.push({
            zrodlo: zrodlo.querySelector(".zrodlo-finansowania").innerText,
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
        const zrodloText = getZrodloFinansowania(zrodlo.zrodlo, zrodlo.kwota);
        zrodlaBezCzesci.insertAdjacentHTML("beforeend", zrodloText);
    });

    setFormEditable();
}

// Dodawanie źródła finansowania (zarówno bez części i części)
function dodajZrodlo(el) {
    const zrodlo = el.parentElement.parentElement;
    if (zrodlo.parentElement.childElementCount >= 8) {
        alert("Błąd: Nie można dodać więcej niż 8 źródeł finansowania");
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

    confirm("Czy na pewno chcesz usunąć to źródło finansowania?") &&
    zrodlo.remove();
}

// main

// dodaj pierwsze źródło finansowania
zrodlaBezCzesci.insertAdjacentHTML("beforeend", getZrodloFinansowania());

// domyślne wartości
planZamowienRok.value = new Date().getFullYear();
const dzienZamowienia = document.getElementById("dzien_zamowienia");
dzienZamowienia.value = new Date().toLocaleDateString("pl-PL") + " r."; // "dd.mm.yyyy r."

setFormEditable();