# OFK Kovarce – návrh webu

Návrh nového webu futbalového klubu OFK Kovarce (Obecný futbalový klub Kovarce). **Nie je to oficiálna stránka klubu.** Ukážka má v hlavičke pás s týmto upozornením a vyhľadávače ju neindexujú (`noindex`).

Ukážka: https://matuslenicky.github.io/ofk-kovarce/ · administrácia (ukážka bez ukladania): https://matuslenicky.github.io/ofk-kovarce/admin/

## Vzhľad

**„Mesačný kalendár“ (dizajn v2, 18. 11. 2026).** Svetlosivá a biela, modrá z erbu, zlatá z koruny len v drobnostiach. Písmo Bricolage Grotesque (titulky) a Alegreya (text).

- úvod tvoria mesiace ako kalendárne mriežky: posledný odohraný mesiac so skóre a mesiac najbližšieho zápasu s časmi výkopov; v dni so zápasom je erb súpera, dni áčka sú modré, dnešok má zlatý rámik,
- pod každým mesiacom zoznam jeho zápasov, ďalej tabuľka VI. ligy a znak klubu s dvoma futbalistami (1927 a dnes),
- história od roku 1927, ročníky, úspechy, ihrisko a obec sú na stránke Klub,
- menu na telefóne je biela plocha cez celú obrazovku.

Web sa skladá zo spoločného jadra v2 (`kluby-siet/engine`: `python assemble.py <web>`), vlastný je `src/site.js` (úvod, Klub, nastavenia) a `src/css/skin.css`.

## Obsah a zdroje

- Zápasy, výsledky, strelci, karty, počty divákov, zostavy dospelých, tabuľky a súpisky 4 tímov (áčko, U19, U15, U11) zo Sportnetu (Futbalnet), verejné API súťaží (`scripts/sportnet.mjs` → `data/sportnet.json`). Vek hráčov sa neukladá, zostavy len pri dospelých.
- Ročníky áčka 2013/14 – 2025/26 z konečných tabuliek na Sportnete, tituly vo VI. lige ObFZ Topoľčany 2017/18 a VII. lige ObFZ Topoľčany 2025/26 (`data/klub.json`).
- Začiatky futbalu (Ústav vojnových invalidov 1926, robotnícky klub 1927, agrárny klub 1928) a popis znaku klubu z článku na webe obce Kovarce (Organizácie – Futbal). Obec podľa webu obce (Kronika, Symboly obce).
- E-mail z webu obce a Sportnetu, odkaz na hymnu klubu zo stránky klubu na webe obce. Vlastný web ani sociálne siete klubu sme nenašli (18. 11. 2026).
- Erb klubu a erby súperov zo Sportnetu (`scripts/logos.py`). Patria príslušným klubom.
- Písmo Bricolage Grotesque a Alegreya, licencia SIL Open Font License 1.1 (`scripts/fonts.py`, rovné číslice sú zapečené do písma).

## Zostavenie

Statický generátor bez závislostí (Node 20+, Python 3 s Pillow na erby a fontTools na písmo):

```
python C:\Users\lenic\kluby-siet\engine\assemble.py .   # zloží build.js a site.css zo spoločného jadra
node scripts/sportnet.mjs        # zápasy, tabuľky a súpisky (FULL=1 stiahne znova aj detaily zápasov)
python -I scripts/logos.py       # erby súperov a náš erb do src/img (FORCE=1 stiahne znova)
node build.js                    # data/ + src/ -> dist/ (TODAY=2026-11-18 prepíše dnešný dátum)
node scripts/serve.mjs dist 5453 # náhľad na http://127.0.0.1:5453/ (?nolr = bez obnovovania, s CSP)
node scripts/deploy.mjs          # nasadenie dist/ na vetvu gh-pages (GitHub Pages)
```

Výsledky sa po zápasoch aktualizujú samé cez GitHub Actions (`.github/workflows/sportnet.yml`). Ročníky v `data/klub.json` treba po sezóne doplniť ručne.
