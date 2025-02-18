const dontAllowLinebreaks = (evt) => {
    if (evt.keyCode === 13) {
        // Enter
        evt.preventDefault();
    }
};

let czesciCount = 0;

function setCzesci() {
    if (czesciCount > 0) return;

    const count = prompt("Podaj liczbę części (2-16):");
    if (count === null || count === "") return;
    if (isNaN(count) || count < 2 || count > 16) {
        alert("Podano nieprawidłową liczbę części (2-16)");
        return;
    }

    czesciCount = count;
    czesciForm(count);
    
    document.getElementById("czesciButton").disabled = true;
}

const uslugiCheckbox = document.getElementById("rodzaj_uslugi");
const kategorieUslug = document.getElementById("kategoria_uslug");
const planZamowienTak = document.getElementById("plan_zamowien_tak");
const planZamowienRok = document.getElementById("plan_zamowien_rok");
const planZamowienOznaczenia = document.getElementById("plan_zamowien_oznaczenia_text");
const planZamowienWartosci = document.getElementById("plan_zamowien_wartosci_text");

// 5. Handler
function rodzajeHandler() {
    const czyUslugi = uslugiCheckbox.checked;
    kategorieUslug.classList.toggle("input", czyUslugi);
    kategorieUslug.classList.toggle("hidden", !czyUslugi);
    kategorieUslug.disabled = !czyUslugi;
}

// 6.2. Handler
function planZamowienHandler() {
    const visible = planZamowienTak.checked;

    planZamowienRok.classList.toggle("input", visible);
    planZamowienRok.classList.toggle("hidden", !visible);
    planZamowienRok.disabled = !visible;

    planZamowienOznaczenia.classList.toggle("input", visible);
    planZamowienOznaczenia.classList.toggle("hidden", !visible);
    planZamowienOznaczenia.contentEditable = visible;

    planZamowienWartosci.classList.toggle("input", visible);
    planZamowienWartosci.classList.toggle("hidden", !visible);
    planZamowienWartosci.contentEditable = visible;
}
planZamowienHandler();

const admin = document.getElementById("admin");
const zamowieniePzpTak = document.getElementById("zamowienie_pzp_tak");
const zamowieniePzpNie = document.getElementById("zamowienie_pzp_nie");
const zamowieniePzpKwota = document.getElementById("zamowienie_pzp_kwota_text");
function zamowieniePzpHandler() {
    zamowieniePzpKwota.classList.toggle("input", zamowieniePzpTak.checked);
    zamowieniePzpKwota.contentEditable = zamowieniePzpTak.checked;
}

function setContentEditable() {
    document.querySelectorAll(`
            #dodatkowe_cpv_text,
            .wartosc-zamowienia,
            .wartosc-zamowienia-euro,
            .kwota-brutto,
            .kwota-przeznaczona,
            .zrodlo-finansowania-kwota,
            #termin_wykonania_text
            `
        ).forEach((e) => {
            try {
                e.contentEditable = "plaintext-only";
            } catch {
                e.contentEditable = true;
            }
            e.addEventListener("keydown", dontAllowLinebreaks);
        }
    );
    document.querySelectorAll(`
            #nazwa_zamowienia_text,
            #podstawa_ust_wartosci_text,
            .wartosc-nazwa,
            .zrodlo-finansowania,
            #informacje_dodatkowe_text,
            #zalaczniki_text
            `
        ).forEach((e) => {
            try {
                e.contentEditable = "plaintext-only";
            } catch {
                e.contentEditable = true;
            }
        }
    );
}

const nazwaJednostki = document.getElementById("nazwa_jednostki");
function adminHandler() {
    nazwaJednostki.classList.toggle("input", admin.checked);
    nazwaJednostki.disabled = !admin.checked;

    zamowieniePzpTak.parentElement.classList.toggle("input", admin.checked);
    zamowieniePzpNie.parentElement.classList.toggle("input", admin.checked);

    zamowieniePzpTak.disabled = !admin.checked;
    zamowieniePzpNie.disabled = !admin.checked;
    zamowieniePzpKwota.disabled = !admin.checked;
}

document.getElementById("download").addEventListener("click", async () => {
    // Setup the form data, get values form the visible fields with content-editable
    document.querySelectorAll("[type=hidden]").forEach((e) => {
        const visible = document.getElementById(e.id + "_text");
        if (visible) {
            e.value = visible.innerText;
        }
    });

    const form = document.getElementById("mainForm");
    const formData = new FormData(form);

    // Add disabled inputs to the form data, not included in the form by default
    const disabledInputs = document.querySelectorAll(
        ".input-box:disabled, .checkbox-input:disabled:checked"
    );
    disabledInputs.forEach((e) => {
        formData.append(e.name, e.value);
    });

    // Add czesci JSON to the form data
    if (czesciCount > 0) {
        formData.append("czesci", JSON.stringify(czesciJson()));
    }

    const formBody = new URLSearchParams(formData).toString();

    const response = await fetch("/generate-pdf", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
    });

    if (response.status !== 200) {
        alert("Wystąpił błąd podczas generowania wniosku");
        return;
    }

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "wniosek.pdf";
    link.click();
});



// 7. Zwraca wiersz wartości części
function getWartoscCzesci(i, nazwa = "", wartosc = "0,00", wartoscEuro = "0,00") {
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
function getKwotaBrutto(i, kwota = "0,00 zł") {
    return `
        <section class="grid-row czesci-row">
            <div class="nowrap">Część ${i}:</div>
            <div class="input money kwota-brutto">${kwota}</div>
            <div class="filler"></div>
        </section>`
    .trim();
}

// 11. Zwraca wiersz kwoty przeznaczonej
function getKwotaPrzeznaczona(i, kwota = "0,00 zł", zrodla) {
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
function getZrodloFinansowania(zrodlo = "ŚNDS <br>Wniosek nr ", kwota = "0,00 zł") {
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
    document.getElementById("mainForm").classList.toggle("bez-czesci");
    document.getElementById("mainForm").classList.toggle("czesci");

    // 7.
    const wartosciBarrier = document.getElementById("czesci-7-after");
    // 10.
    const kwotyBrutto = document.getElementById("czesci-brutto");
    // 11.
    const czesciKwoty = document.getElementById("czesci-11");

    const count = Object.keys(czesci).length;
    for (let i = 1; i <= count; i++) {
        const czesc = czesci[i];

        wartosciBarrier.insertAdjacentHTML("beforebegin", getWartoscCzesci(i, czesc.nazwa, czesc.wartosc, czesc.wartoscEuro));
        kwotyBrutto.insertAdjacentHTML("beforeend", getKwotaBrutto(i, czesc.brutto));
        czesciKwoty.insertAdjacentHTML("beforeend", getKwotaPrzeznaczona(i, czesc.kwotaPrzeznaczona, czesc.zrodla));
    }
    setContentEditable();
}

// Formualrz części z domyślnymi wartościami i zadaną liczbą części
function czesciForm(count) {
    document.getElementById("mainForm").classList.toggle("bez-czesci");
    document.getElementById("mainForm").classList.toggle("czesci");

    // 7.
    const wartosciBarrier = document.getElementById("czesci-7-after");
    // 10.
    const kwotyBrutto = document.getElementById("czesci-brutto");
    // 11.
    const czesciKwoty = document.getElementById("czesci-11");

    for (let i = 1; i <= count; i++) {
        wartosciBarrier.insertAdjacentHTML("beforebegin", getWartoscCzesci(i));
        kwotyBrutto.insertAdjacentHTML("beforeend", getKwotaBrutto(i));
        czesciKwoty.insertAdjacentHTML("beforeend", getKwotaPrzeznaczona(i));
    }

    setContentEditable();
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

// Dodawanie źródła finansowania (zarówno bez części i części)
function dodajZrodlo(el) {
    const zrodlo = el.parentElement.parentElement;
    zrodlo.insertAdjacentHTML("afterend", getZrodloFinansowania());
    setContentEditable();
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
document.getElementById("zrodla-finansowania-bez-czesci").insertAdjacentHTML("beforeend", getZrodloFinansowania());

setContentEditable();