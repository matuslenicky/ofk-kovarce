// Statický generátor webu OFK Kovarce: data/ + src/ -> dist/   (node build.js; TODAY=2026-11-18 prepíše dnešný dátum)
// Zostavuje ho kluby-siet/engine/assemble.py zo spoločného jadra v2 a tohto súboru (vzhľad, úvod, stránka Klub).
// Kostra „Mesačný kalendár“: úvod tvoria mesiace ako kalendárne mriežky – posledný odohraný mesiac so skóre a mesiac
// najbližšieho zápasu s časmi výkopov; v dni so zápasom je erb súpera. Pod mriežkou zoznam zápasov mesiaca, ďalej
// tabuľka ligy a znak klubu s dvoma futbalistami (1927 a dnes). Svetlosivá, biela, modrá z erbu, zlatá z koruny len
// v drobnostiach. Písmo Bricolage Grotesque (titulky) a Alegreya (text).
const SKIN = {
  nav: 'bar', theme: '#1f63a3', brand: 'OFK Kovarce', brandSub: 'futbal od roku 1927',
  fonts: ['bricolage-grotesque-700.woff', 'alegreya-400.woff', 'alegreya-700.woff'],
  sources: 'História klubu a obce podľa webu obce Kovarce.',
  adminHero: 'Futbal v Kovarciach od roku 1927',
  adminFacts: club.kronika.zoznam.map((x) => ({ k: x.rok, t: x.text })),
  links: [[club.obecKlub, 'Klub na webe obce'], [club.hymna, 'Hymna OFK Kovarce (YouTube)']],
};
const NAV = [['zapasy/', 'Zápasy'], ['tabulky/', 'Tabuľky'], ['timy/', 'Tímy'], ['klub/', 'Klub'], ['kontakt/', 'Kontakt']];
const DESC = `${club.nazov} – futbal v Kovarciach od roku ${club.zalozenie}. Zápasy, výsledky, tabuľky a súpisky áčka (${A.leagueName}), dorastu a žiakov. Víťaz VII. ligy ObFZ Topoľčany 2025/26.`;

// ---- mesačný kalendár ----------------------------------------------------------------------------
const WD = ['po', 'ut', 'st', 'št', 'pi', 'so', 'ne'];
const WD_L = ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota', 'nedeľa'];
const calTitle = (ym) => { const t = monthName(ym); return t[0].toUpperCase() + t.slice(1); };
const monthMatches = (ym) => matches.filter((m) => m.date.startsWith(ym) && !isPrep(m.teamObj));
function calCell(m, R) {
  const isA = m.teamObj === A;
  const tag = m.detail || !m.past ? 'a' : 'span';
  const href = tag === 'a' ? ` href="${R}${m.url}"` : '';
  const val = m.past ? (m.score ? `<span class="cal-s cal-s--${m.res}">${m.gf}:${m.ga}</span>` : '<span class="cal-s">–</span>') : `<span class="cal-s">${esc(m.time || '')}</span>`;
  const sr = `${esc(m.teamObj.short)}: ${m.home ? 'doma' : 'vonku'} proti ${esc(m.opponent)}, ${m.past ? (m.score ? `${RES[m.res].toLowerCase()} ${m.gf}:${m.ga}` : 'bez výsledku') : `výkop ${esc(m.time || 'neuvedený')}`}`;
  return `<${tag} class="cal-x${isA ? ' cal-x--a' : ''}"${href}><span class="sr">${sr}</span><span aria-hidden="true" class="cal-v">${isA ? '' : `<span class="cal-t">${esc(m.teamObj.short)}</span>`}${logo(m.oppSpace, m.opponent, R, 24)}${val}</span></${tag}>`;
}
function monthCal(ym, R) {
  const [y, mo] = ym.split('-').map(Number);
  const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() + 6) % 7;
  const by = new Map();
  for (const m of monthMatches(ym)) { const d = Number(m.date.slice(8, 10)); if (!by.has(d)) by.set(d, []); by.get(d).push(m); }
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(`<tr>${cells.slice(i, i + 7).map((d) => {
      if (!d) return '<td class="cal-e"></td>';
      const iso = `${ym}-${String(d).padStart(2, '0')}`;
      const list = by.get(d) || [];
      const cls = [list.length ? 'cal-m' : '', list.some((m) => m.teamObj === A) ? 'cal-a' : '', iso === TODAY ? 'cal-today' : ''].filter(Boolean).join(' ');
      return `<td${cls ? ` class="${cls}"` : ''}><span class="cal-d">${d}<span class="sr">. ${MONTHS_G[mo - 1]}${iso === TODAY ? ', dnes' : ''}</span></span>${list.map((m) => calCell(m, R)).join('')}</td>`;
    }).join('')}</tr>`);
  }
  return `<table class="calm"><caption class="sr">${calTitle(ym)}: zápasy áčka, dorastu a žiakov</caption>
<thead><tr>${WD.map((w, i) => `<th scope="col"><abbr title="${WD_L[i]}">${w}</abbr></th>`).join('')}</tr></thead>
<tbody>${rows.join('')}</tbody></table>`;
}

add('', {
  title: `futbal od roku ${club.zalozenie}`, active: '', bodyClass: 'home',
  body: (R) => {
    const lastYm = (lastA || results.find((m) => m.score))?.date.slice(0, 7);
    const nextYm = (nextA || upcoming[0])?.date.slice(0, 7);
    const months = [...new Set([lastYm, nextYm].filter(Boolean))];
    const wl = winterLine();
    const sub = (ym) => (ym === nextYm && ym !== lastYm ? (wl || 'Najbližšie zápasy') : ym === lastYm && ym !== nextYm ? 'Posledné zápasy jesene' : 'Výsledky a program');
    return `<section class="kv-top"><div class="wrap kv-top-in">
  <h1 class="h1">OFK Kovarce</h1>
  <p class="kv-p">Futbal v Kovarciach od roku ${club.zalozenie}. Víťaz VII. ligy ObFZ Topoľčany 2025/26, teraz ${esc(A.leagueName)}${A.pos ? `, ${A.pos}. miesto ${zo(A.of)}` : ''}.</p>
</div></section>
<section class="sec sec--first" aria-label="Kalendár zápasov"><div class="wrap kv-months${months.length > 1 ? ' kv-months--2' : ''}">
  <p class="kv-legend">V kalendári: <span class="kv-key kv-key--a"></span>áčko <span class="kv-key"></span>dorast a žiaci <span class="kv-key kv-key--gold"></span>dnes</p>
${months.map((ym) => `  <section class="kv-month" aria-labelledby="m-${ym}">
    <h2 class="h2" id="m-${ym}">${calTitle(ym)}</h2>
    <p class="kv-sub">${sub(ym)}</p>
    ${monthCal(ym, R)}
    ${fxList(monthMatches(ym).slice(0, 8), R)}
  </section>`).join('\n')}
  <p class="kv-all">${more(`${R}zapasy/`, 'Všetky zápasy a výsledky')}</p>
</div></section>
${A.table ? `<section class="sec sec--paper" aria-labelledby="t-h"><div class="wrap kv-table">
  <h2 class="h2" id="t-h">${esc(A.leagueName)}</h2>
  ${tableHtml(A.table, R)}
  ${more(`${R}tabulky/`, 'Tabuľky všetkých tímov')}
</div></section>` : ''}
<section class="sec" aria-labelledby="z-h"><div class="wrap kv-crest">
  <img src="${R}img/erb-240.webp" alt="${esc(club.erbAlt)}" width="${Math.round(160 * CREST_R)}" height="160" loading="lazy">
  <div>
    <h2 class="h2" id="z-h">Dvaja futbalisti v znaku</h2>
    <p>Vpravo hráč z roku 1927, keď v obci vznikol prvý futbalový klub, v dobovom výstroji s čiapkou. Vľavo dnešný hráč v modro-bielom drese. Medzi nimi erb a koruna obce.</p>
    ${more(`${R}klub/`, 'Klub a jeho história')}
  </div>
</div></section>`;
  },
});

add('klub/', {
  title: 'Klub', active: 'klub/', desc: `${club.nazov}: futbal od roku ${club.zalozenie}, robotnícky klub a vojnoví invalidi, znak s dvoma futbalistami, ročníky áčka a obec Kovarce.`,
  body: (R) => `${pageHead({ title: 'Klub', sub: `${esc(club.pravnyNazov)}, futbal v obci od roku ${club.zalozenie}. Klubové farby: ${esc(club.farby)}.`, R, crumbs: [[null, 'Klub']] })}
<section class="sec sec--first"><div class="wrap cols2">
  <div><h2 class="h2">Od roku 1927</h2>${facts(club.kronika.zoznam.map((x) => ({ k: x.rok, t: x.text })))}
    <p class="kv-hymn"><a href="${esc(club.hymna)}" rel="noopener">Hymna OFK Kovarce na YouTube</a></p></div>
  <div><h2 class="h2">Ročníky áčka</h2>${seasonsTable(club.rocniky.zoznam)}
    <h2 class="h2 h2--gap">Úspechy</h2>${facts(club.uspechy.map((u) => ({ k: u.rok, t: u.text })))}</div>
</div></section>
<section class="sec sec--paper"><div class="wrap cols2">
  <div><h2 class="h2">${esc(ST.nazov)}</h2><p>${club.adresa.map(esc).join(', ')}.</p>
    <p class="btns"><a class="btn btn--line" href="https://www.google.com/maps/dir/?api=1&amp;destination=${ST.geo.join(',')}" rel="noopener">Navigovať na ihrisko</a></p></div>
  <div><h2 class="h2">Kovarce</h2>${facts(club.obec.fakty)}<p class="note">Zdroje: web obce Kovarce (Futbal, Kronika, Symboly obce), Sportnet.</p></div>
</div></section>`,
});
