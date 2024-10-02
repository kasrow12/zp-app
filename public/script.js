const dontAllowLinebreaks = (evt) => {
    if (evt.keyCode === 13) { // Enter
        evt.preventDefault();
    }
};

const uslugiCheckbox = document.getElementById("rodzaj_uslugi");
const kategorieUslug = document.getElementById("kategoria_uslug");
function rodzajeHandler() {
    kategorieUslug.classList.toggle("input", uslugiCheckbox.checked);
    kategorieUslug.classList.toggle("hidden", !uslugiCheckbox.checked);
    kategorieUslug.disabled = !uslugiCheckbox.checked;
}

const planZamowienTak = document.getElementById("plan_zamowien_tak");
const planZamowienRok = document.getElementById("plan_zamowien_rok");
const planZamowienOznaczenia = document.getElementById("plan_zamowien_oznaczenia_text");
const planZamowienWartosci = document.getElementById("plan_zamowien_wartosci_text");
function planZamowienHandler() {
    planZamowienRok.classList.toggle("hidden", !planZamowienTak.checked);
    planZamowienOznaczenia.classList.toggle("hidden", !planZamowienTak.checked);
    planZamowienWartosci.classList.toggle("hidden", !planZamowienTak.checked);
    planZamowienRok.classList.toggle("input", planZamowienTak.checked);
    planZamowienOznaczenia.classList.toggle("input", planZamowienTak.checked);
    planZamowienWartosci.classList.toggle("input", planZamowienTak.checked);
    planZamowienRok.disabled = !planZamowienTak.checked;
    planZamowienOznaczenia.contentEditable = planZamowienTak.checked;
    planZamowienWartosci.contentEditable = planZamowienTak.checked;
}
planZamowienHandler();

const admin = document.getElementById("admin");
const zamowieniePzpTak = document.getElementById("zamowienie_pzp_tak");
const zamowieniePzpNie = document.getElementById("zamowienie_pzp_nie");
const zamowieniePzpKwota = document.getElementById("zamowienie_pzp_kwota");
function zamowieniePzpHandler() {
    if (!admin.checked) {
        return;
    }
    
    zamowieniePzpKwota.classList.toggle("input", zamowieniePzpTak.checked);
    zamowieniePzpKwota.contentEditable = zamowieniePzpTak.checked;
}


document.getElementById("container").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("nazwa_zamowienia").value = document.getElementById("nazwa_zamowienia_text").innerText;
    console.log(document.getElementById("nazwa_zamowienia").value);
});


document.querySelectorAll('#dodatkowe_cpv_text, ' 
                        + '#termin_wykonania_text, '
                        + '#kwota_przeznaczona, #kwota_przeznaczona_1, #kwota_przeznaczona_2, '
                        + '#wartosc_brutto_1, #wartosc_brutto_2, #wartosc_zamowienia_1, '
                        + '#wartosc_zamowienia_2, #wartosc_zamowienia_euro_1,  #wartosc_zamowienia_euro_2'
                    ).forEach((e) => {
    try {
        e.contentEditable = "plaintext-only";
    }
    catch {
        e.contentEditable = true;
    }
    e.addEventListener('keydown', dontAllowLinebreaks);
});
document.querySelectorAll('#nazwa_zamowienia_text, #podstawa_ust_wartosci_text, #zalaczniki_text, '
                        + '#informacje_dodatkowe_text, '
                        + '#kwota_przeznaczona_nazwa_1, #kwota_przeznaczona_zrodlo_1, '
                        + '#kwota_przeznaczona_nazwa_2, #kwota_przeznaczona_zrodlo_2, '
                        + '#wartosc_nazwa_1, #wartosc_nazwa_2'
                    ).forEach((e) => {
    try {
        e.contentEditable = "plaintext-only";
    }
    catch {
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