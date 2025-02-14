const dontAllowLinebreaks = (evt) => {
    if (evt.keyCode === 13) {
        // Enter
        evt.preventDefault();
    }
};

const czesciCheckbox = document.getElementById("czesci");
function czesciHandler() {
    document.getElementById("container").classList.toggle("bez-czesci");
    document.getElementById("container").classList.toggle("czesci");
    document.getElementById("czesci-counter").classList.toggle("display-none");
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

document
    .querySelectorAll(
        "#dodatkowe_cpv_text, " +
            "#termin_wykonania_text, " +
            "#kwota_przeznaczona_1, #kwota_przeznaczona_2, " +
            "#wartosc_brutto_1, #wartosc_brutto_2, #wartosc_zamowienia_1, " +
            "#wartosc_zamowienia_2, #wartosc_zamowienia_euro_1,  #wartosc_zamowienia_euro_2"
    )
    .forEach((e) => {
        try {
            e.contentEditable = "plaintext-only";
        } catch {
            e.contentEditable = true;
        }
        e.addEventListener("keydown", dontAllowLinebreaks);
    });
document
    .querySelectorAll(
        "#nazwa_zamowienia_text, #podstawa_ust_wartosci_text, #zalaczniki_text, #kwota_przeznaczona_zrodlo_text," +
            "#informacje_dodatkowe_text, " +
            "#kwota_przeznaczona_nazwa_1, #kwota_przeznaczona_zrodlo_1, " +
            "#kwota_przeznaczona_nazwa_2, #kwota_przeznaczona_zrodlo_2, " +
            "#wartosc_nazwa_1, #wartosc_nazwa_2"
    )
    .forEach((e) => {
        try {
            e.contentEditable = "plaintext-only";
        } catch {
            e.contentEditable = true;
        }
    });

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
    document.getElementById("nazwa_zamowienia").value =
        document.getElementById("nazwa_zamowienia_text").innerText;
    document.getElementById("dodatkowe_cpv").value =
        document.getElementById("dodatkowe_cpv_text").innerText;
    document.getElementById("plan_zamowien_oznaczenia").value = document.getElementById(
        "plan_zamowien_oznaczenia_text"
    ).innerText;
    document.getElementById("plan_zamowien_wartosci").value = document.getElementById(
        "plan_zamowien_wartosci_text"
    ).innerText;
    document.getElementById("zamowienie_pzp_kwota").value = document.getElementById(
        "zamowienie_pzp_kwota_text"
    ).innerText;
    document.getElementById("podstawa_ust_wartosci").value = document.getElementById(
        "podstawa_ust_wartosci_text"
    ).innerText;
    document.getElementById("kwota_przeznaczona_zrodlo").value = document.getElementById(
        "kwota_przeznaczona_zrodlo_text"
    ).innerText;
    document.getElementById("termin_wykonania").value =
        document.getElementById("termin_wykonania_text").innerText;
    document.getElementById("informacje_dodatkowe").value = document.getElementById(
        "informacje_dodatkowe_text"
    ).innerText;
    document.getElementById("zalaczniki").value =
        document.getElementById("zalaczniki_text").innerText;

    const form = document.getElementById("container");

    const formData = new FormData(form);

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
