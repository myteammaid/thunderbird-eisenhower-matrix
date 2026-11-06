/**
 * Prueft das Brett gegen die nachgebaute API in Firefox (gleiche Engine wie
 * Thunderbird). Aufruf aus dem Add-on-Ordner:  node werkzeuge/test.mjs
 */
import { firefox } from "playwright";
import { serve } from "./server.mjs";

const { url, close } = await serve();
const browser = await firefox.launch();
let failed = 0;

function check(label, ok, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${label}${ok ? "" : `  →  ${detail}`}`);
  if (!ok) {
    failed++;
  }
}

async function open(query) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${url}/werkzeuge/demo.html?${query}`);
  await page.waitForFunction(() => document.getElementById("status")?.textContent.includes("·"));
  return { page, errors };
}

const subjects = (page, stack) =>
  page.$$eval(`#stack-${stack} .card .subject`, nodes => nodes.map(n => n.textContent));
const dates = (page, stack) =>
  page.$$eval(`#stack-${stack} .card`, (nodes, s) => {
    const byId = new Map(window.__demo.messages.map(m => [m.id, m.date.getTime()]));
    return nodes.map(n => byId.get(Number(n.dataset.messageId)));
  }, stack);
const count = (page, stack) => page.$eval(`#count-${stack}`, n => Number(n.textContent));
const isSorted = (list, dir) => list.every((v, i) => i === 0 || (dir < 0 ? list[i - 1] >= v : list[i - 1] <= v));

/* ------------------------------------------------ Laden und Reihenfolge */
{
  const { page, errors } = await open("lang=en&page=3");
  const inbox = await dates(page, "inbox");
  check("Unsortiert: neueste zuerst", isSorted(inbox, -1), inbox);
  check("Unsortiert: nur ungelesene (11 von 14)", (await count(page, "inbox")) === 11, await count(page, "inbox"));
  check("Gelöschte Mail taucht nirgends auf", !(await page.content()).includes("THIS MUST NOT SHOW UP"));
  check("Sofort erledigen: 3 Karten", (await count(page, "eisenhower_do")) === 3);
  check("Englische Beschriftung", (await page.textContent("h1")) === "Eisenhower Matrix");

  await page.selectOption("#order", "ascending");
  await page.waitForFunction(() => document.getElementById("status").textContent.includes("·"));
  check("Umschalten auf älteste zuerst", isSorted(await dates(page, "inbox"), 1));

  await page.selectOption("#scope", "all");
  await page.selectOption("#limit", "50");
  await page.selectOption("#order", "descending");
  await page.waitForFunction(() => document.getElementById("status").textContent.includes("·"));
  check("Alle im Posteingang: 14", (await count(page, "inbox")) === 14, await count(page, "inbox"));

  /* ------------------------------------------------ Obergrenze greift auf die NEUESTEN */
  await page.evaluate(() => {
    const select = document.getElementById("limit");
    select.append(Object.assign(document.createElement("option"), { value: "4", textContent: "4" }));
    select.value = "4";
    select.dispatchEvent(new Event("change"));
  });
  await page.waitForFunction(() => document.getElementById("count-inbox").textContent === "4");
  const newest4 = await subjects(page, "inbox");
  check(
    "Obergrenze 4 nimmt die 4 neuesten",
    newest4[0].startsWith("Proposal: website relaunch") && !newest4.includes("Our summer edition is here"),
    newest4
  );
  check("Liste wird nach Obergrenze abgebrochen", (await page.evaluate(() => window.__demo.log.aborted)) > 0);
  check("Keine Fehler in der Konsole", errors.length === 0, errors);
  await page.close();
}

/* ------------------------------------------------ Tastatur */
{
  const { page, errors } = await open("lang=en");
  const before = await count(page, "inbox");
  const first = (await subjects(page, "inbox"))[0];
  const second = (await subjects(page, "inbox"))[1];

  await page.keyboard.press("ArrowDown");
  check("↓ wählt die erste Karte", (await page.$$("#stack-inbox .card.selected")).length === 1);
  await page.keyboard.press("1");
  await page.waitForFunction(n => Number(document.getElementById("count-inbox").textContent) === n - 1, before);
  check("Taste 1 → Sofort erledigen", (await subjects(page, "eisenhower_do")).includes(first));
  const focused = await page.$eval("#stack-inbox .card.focused .subject", n => n.textContent);
  check("Danach steht die nächste Karte bereit", focused === second, focused);

  await page.keyboard.press("Shift+ArrowDown");
  await page.keyboard.press("Shift+ArrowDown");
  check("Shift+↓ wählt drei", (await page.$$("#stack-inbox .card.selected")).length === 3);
  await page.keyboard.press("2");
  await page.waitForFunction(n => Number(document.getElementById("count-inbox").textContent) === n - 4, before);
  check("Taste 2 verschiebt alle drei", (await count(page, "eisenhower_plan")) === 7, await count(page, "eisenhower_plan"));

  // Fremdes Schlagwort bleibt erhalten ("Venue options" traegt $label2)
  const venue = await page.$('#stack-inbox .card:has-text("Venue options")');
  await venue.click();
  await page.keyboard.press("3");
  await page.waitForFunction(() => document.querySelector('#stack-eisenhower_delegate .card:has(.subject)') !== null);
  const venueTags = await page.evaluate(
    () => window.__demo.messages.find(m => m.subject.startsWith("Venue options")).tags
  );
  check(
    "Eigenes Schlagwort bleibt, Quadrant kommt dazu",
    venueTags.includes("$label2") && venueTags.includes("eisenhower_delegate") && venueTags.length === 2,
    venueTags
  );

  // Strg-Klick, dann 4
  const cards = await page.$$("#stack-inbox .card");
  await cards[0].click();
  await cards[2].click({ modifiers: ["Control"] });
  check("Strg-Klick wählt zwei", (await page.$$("#stack-inbox .card.selected")).length === 2);
  await page.keyboard.press("4");
  await page.waitForFunction(() => document.getElementById("count-eisenhower_drop").textContent === "4");
  check("Taste 4 verschiebt beide", true);

  // Zurueck: 0
  await page.click("#stack-eisenhower_drop .card");
  await page.keyboard.press("0");
  await page.waitForFunction(() => document.getElementById("count-eisenhower_drop").textContent === "3");
  check("Taste 0 → zurück nach Unsortiert", true);
  const tagsAfterZero = await page.evaluate(() => window.__demo.log.updates.at(-1).tags);
  check("Zurück entfernt das Quadranten-Schlagwort", tagsAfterZero.every(t => !t.startsWith("eisenhower_")), tagsAfterZero);

  // → springt in den naechsten Stapel, Enter oeffnet
  await page.click("#stack-inbox .card");
  await page.keyboard.press("ArrowRight");
  const inDo = await page.$("#stack-eisenhower_do .card.focused");
  check("→ springt nach Sofort erledigen", inDo !== null);
  await page.keyboard.press("Enter");
  check("Enter öffnet die Nachricht", (await page.evaluate(() => window.__demo.log.opened.length)) === 1);

  await page.keyboard.press("Control+a");
  const doCards = (await page.$$("#stack-eisenhower_do .card")).length;
  const doSelected = (await page.$$("#stack-eisenhower_do .card.selected")).length;
  check("Strg+A wählt die ganze Spalte", doCards > 1 && doSelected === doCards, `${doSelected}/${doCards}`);

  await page.keyboard.press("Escape");
  check("Esc hebt die Auswahl auf", (await page.$$(".card.selected")).length === 0);

  await page.click("#credit");
  const external = await page.evaluate(() => window.__demo.log.external[0] || "");
  check("Fußzeilen-Link öffnet team-maid.de im Browser", external.startsWith("https://team-maid.de/"), external);
  check("Keine Fehler in der Konsole", errors.length === 0, errors);
  await page.close();
}

/* ------------------------------------------------ Ziehen mit Mehrfachauswahl */
{
  const { page, errors } = await open("lang=en");
  const cards = await page.$$("#stack-inbox .card");
  await cards[0].click();
  await cards[1].click({ modifiers: ["Shift"] });
  await page.dragAndDrop("#stack-inbox .card.selected >> nth=0", "#stack-eisenhower_plan");
  await page.waitForFunction(() => document.getElementById("count-eisenhower_plan").textContent === "6");
  check("Ziehen nimmt beide ausgewählten Karten mit", true);
  check("Keine Fehler in der Konsole", errors.length === 0, errors);
  await page.close();
}

/* ------------------------------------------------ Thunderbird ohne Sortierfunktion */
{
  const { page, errors } = await open("lang=de&nosort=1");
  check("Rückweg ohne sortType: trotzdem neueste zuerst", isSorted(await dates(page, "inbox"), -1));
  check("Deutsche Beschriftung", (await page.textContent("h1")) === "Eisenhower-Matrix");
  const warned = errors.filter(e => !e.includes("sortType"));
  check("Keine weiteren Fehler", warned.length === 0, warned);
  await page.close();
}

await browser.close();
close();
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : "\nAlle Prüfungen bestanden");
process.exit(failed ? 1 : 0);
