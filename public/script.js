const dontAllowLinebreaks = (evt) => {
    if (evt.keyCode === 13) {
        // Enter
        evt.preventDefault();
    }
};

let czyCzesci = false;

function setCzesci() {
    if (czyCzesci) return;

    const count = prompt("Podaj liczbę części:");
    if (count === null || count === "") return;
    if (isNaN(count) || count < 2 || count > 16) {
        alert("Podano nieprawidłową liczbę części (2-16)");
        return;
    }

    czesci(count);
    
    czyCzesci = true;
    document.getElementById("czesciButton").disabled = true;

    document.getElementById("mainForm").classList.toggle("bez-czesci");
    document.getElementById("mainForm").classList.toggle("czesci");
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
    console.log("set content editable");
    document.querySelectorAll(
            "#dodatkowe_cpv_text, " +
            "#termin_wykonania_text, " +
            ".kwota-brutto, " +
            "#wartosc_zamowienia_1, " +
            ".kwota-przeznaczona, " +
            ".zrodlo-finansowania-kwota, " +
            ".wartosc-zamowienia, .wartosc-zamowienia-euro"
        ).forEach((e) => {
            try {
                e.contentEditable = "plaintext-only";
            } catch {
                e.contentEditable = true;
            }
            e.addEventListener("keydown", dontAllowLinebreaks);
        }
    );
    document.querySelectorAll(
            "#nazwa_zamowienia_text, #podstawa_ust_wartosci_text, #zalaczniki_text, #kwota_przeznaczona_zrodlo_text," +
            "#informacje_dodatkowe_text, " +
            ".zrodlo-finansowania, " +
            ".wartosc-nazwa"
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

// Templatka dla źródeł finansowania (zarówno bez części i części)
const zrodloFinansowaniaTemplate = `
    <section class="grid-row zrodlo-finansowania-row">
        <section class="block with-add-row">
            <div class="input listing left zrodlo-finansowania">ŚNDS <br>Wniosek nr </div>
            <span class="add-row-button" onclick="dodajZrodlo(this)" title="Dodaj kolejne źródło">+</span>
            <span class="remove-row-button" onclick="usunZrodlo(this)" title="Usuń źródło">&times;</span>
        </section>
        <div class="money input-padding-right">
            <div class="input zrodlo-finansowania-kwota">0,00 zł</div>
        </div>
    </section>`
.trim();

function czesci(count) {
    // 7.
    const afterWartosci = document.getElementById("czesci-7-after");
    for (let i = 1; i <= count; i++) {
        const wartoscTemplate = `
            <section class="grid-row czesci-row">
                <div class="listing left input-padding-left">
                    <div class="padding-left">Część ${i}:</div>
                    <div class="input wartosc-nazwa"></div>
                </div>
                <div class="money input wartosc-zamowienia">0,00</div>
                <div class="color">zł, co stanowi równowartość</div>
                <div class="money input wartosc-zamowienia-euro">0,00</div>
                <div class="color">euro</div>
            </section>`
        .trim();
        afterWartosci.insertAdjacentHTML("beforebegin", wartoscTemplate);
    }

    // 10.
    const kwotyBrutto = document.getElementById("czesci-brutto");
    for (let i = 1; i <= count; i++) {
        const bruttoTemplate = `
            <section class="grid-row czesci-row">
                <div class="nowrap">Część ${i}:</div>
                <div class="input money kwota-brutto">0,00 zł</div>
                <div class="filler"></div>
            </section>`
        .trim();
        kwotyBrutto.insertAdjacentHTML("beforeend", bruttoTemplate);
    }

    // 11.
    const container = document.getElementById("czesci-11");
    for (let i = 1; i <= count; i++) {
        const czescTemplate = `
            <section class="grid-row czesci-row">
                <div class="mult-flex-row3 input-padding-right">
                    <div>Część ${i}:</div>
                    <div class="input kwota-przeznaczona">0,00 zł</div>
                </div>
                <section class="grid-11-row">
                    ${zrodloFinansowaniaTemplate}
                </section>
            </section>`
        .trim();
        container.insertAdjacentHTML("beforeend", czescTemplate);
    }

    setContentEditable();
}

function kwotyCzesciJson() {
    const czesci = document.querySelectorAll("#czesci-11 > .czesci-row");
    const czesciJson = [];

    czesci.forEach((czesc, i) => {
        const czescJson = {
            nr: i + 1,
            kwotaPrzeznaczona: czesc.querySelector(".kwota-przeznaczona").innerText,
            zrodlaFinansowania: [],
        };

        const zrodla = czesc.querySelectorAll(".zrodlo-finansowania");
        const kwoty = czesc.querySelectorAll(".zrodlo-finansowania-kwota");

        zrodla.forEach((zrodlo, i) => {
            czescJson.zrodlaFinansowania.push({
                zrodlo: zrodlo.innerText,
                kwota: kwoty[i].innerText,
            });
        });

        czesciJson.push(czescJson);
    });

    return czesciJson;
}

// Dodawanie źródła finansowania (zarówno bez części i części)
function dodajZrodlo(el) {
    const zrodlo = el.parentElement.parentElement;
    zrodlo.insertAdjacentHTML("afterend", zrodloFinansowaniaTemplate);
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
document.getElementById("zrodla-finansowania-bez-czesci").insertAdjacentHTML("beforeend", zrodloFinansowaniaTemplate);

setContentEditable();