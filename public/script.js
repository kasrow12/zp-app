const dontAllowLinebreaks = (evt) => {
    if (evt.keyCode === 13) {
        // Enter
        evt.preventDefault();
    }
};

let czyCzesci = false;

function czesciHandler() {
    if (czyCzesci) return;

    czyCzesci = true;
    czesci(2);
    document.getElementById("mainForm").classList.toggle("bez-czesci");
    document.getElementById("mainForm").classList.toggle("czesci");
    // document.getElementById("czesci-counter").classList.toggle("display-none");
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
            "#kwota_przeznaczona_1, #kwota_przeznaczona_2, " +
            "#wartosc_brutto_1, #wartosc_brutto_2, #wartosc_zamowienia_1, " +
            ".zrodlo-finansowania-kwota, " +
            "#wartosc_zamowienia_2, #wartosc_zamowienia_euro_1,  #wartosc_zamowienia_euro_2"
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
            "#wartosc_nazwa_1, #wartosc_nazwa_2"
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

const zrodloFinansowaniaTemplate = `
    <section class="grid-row zrodlo-finansowania-row">
        <section class="block with-add-row">
            <div class="input listing left zrodlo-finansowania">ŚnDS<br>Wniosek nr </div>
            <span class="add-row" onclick="addRow(this)">+</span>
        </section>
        <div class="money input-padding-right">
            <div class="input zrodlo-finansowania-kwota">0,00 zł</div>
        </div>
    </section>
`.trim();

function czesci(count) {
    console.log("części", count);
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
            </section>
        `.trim();

        container.insertAdjacentHTML("beforeend", czescTemplate);
    }
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

function addRow(el) {
    el.parentElement.insertAdjacentHTML("beforebegin", zrodloFinansowaniaTemplate);
    setContentEditable();
}



setContentEditable();