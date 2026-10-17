# Szótanuló — GitHub Pages változat

Ez a verzió kizárólag HTML-t, CSS-t és JavaScriptet használ. Nincs Python-backend, adatbázis vagy külön szerver. A teszt a felhasználó böngészőjében fut.

## Fájlok

- `index.html` — a weboldal szerkezete
- `style.css` — a megjelenés
- `app.js` — kérdések, válaszellenőrzés, pontozás
- `data/german/starter-skipped.txt` — tabulátorral elválasztott szólista

## Saját szólista

A szövegfájl minden sora pontosan ilyen formátumú legyen:

```text
apple	alma
house	ház
book	könyv
```

Az első oszlopot a program angolnak, a másodikat magyarnak tekinti. A fájl UTF-8 kódolású legyen. A fájlban ne legyen fejlécsor.

Új szólistához:
1. Hozz létre egy új `.txt` fájlt a `data/` mappában (például `data/french/alapok.txt`).
2. Az `index.html` fájlban adj hozzá egy új `<option>` elemet a `listSelect` listához, a megfelelő fájlútvonallal.
3. Ha a fájl új nyelvpárhoz tartozik, a nyelvi választó feliratait is módosítsd az `index.html` fájlban.

## GitHub Pages közzététel

1. Hozz létre egy GitHub repositoryt, például `szotanulo` néven.
2. Töltsd fel a projekt összes fájlját a repository gyökerébe. Az `index.html` ne kerüljön almappába.
3. Nyisd meg a repositoryban a **Settings → Pages** menüpontot.
4. A **Build and deployment** résznél válaszd a **Deploy from a branch** lehetőséget.
5. Branch: `main`, mappa: `/ (root)`, majd **Save**.
6. Várj pár percet. A weboldal címe általában `https://FELHASZNALONEV.github.io/szotanulo/` lesz.

A repository neve és a GitHub-felhasználóneved alapján a pontos URL eltérhet.

## Helyi tesztelés

A szólista `fetch()` használatával töltődik be, ezért ne csak az `index.html` fájlra kattints rá (file://). Ha telepítve van Python, a projekt mappájában futtasd:

```bash
python -m http.server 8000
```

Ez csak a helyi teszteléshez használja a Pythont; maga az alkalmazás ettől még kizárólag HTML/CSS/JavaScript. Ezután nyisd meg: `http://localhost:8000`.

## Működés és korlátok

- A teszt véletlenszerűen választ szavakat ismétlés nélkül az adott körben.
- A válaszellenőrzés nem érzékeny a kis-/nagybetűre, és a többszörös szóközöket egységesíti.
- A szavak a böngészőben töltődnek be. Nincs felhasználói fiók, online pontmentés vagy közös adatbázis.
- A GitHub Pages nem futtat Python-kódot, de ehhez a verzióhoz nincs is rá szükség.
