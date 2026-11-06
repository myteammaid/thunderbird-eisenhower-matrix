/**
 * Prueft background.js gegen nachgebaute spaces- und tags-Schnittstellen,
 * nachgebildet nach ext-spaces.js aus Thunderbird 153: query liefert die
 * Bereiche ALLER Erweiterungen, update auf fremde Bereiche wirft.
 * Aufruf aus dem Add-on-Ordner:  node werkzeuge/test-hintergrund.mjs
 */
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const code = (await readFile(new URL("quadrants.js", ROOT), "utf8")) + (await readFile(new URL("background.js", ROOT), "utf8"));
const de = JSON.parse(await readFile(new URL("_locales/de/messages.json", ROOT), "utf8"));
let failed = 0;

function check(label, ok, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${label}${ok ? "" : `  →  ${detail}`}`);
  if (!ok) {
    failed++;
  }
}

async function run({ spaces = [], tags = [] }) {
  const log = { created: [], updated: [], tagsCreated: [], errors: [] };
  const browser = {
    i18n: { getMessage: key => de[key]?.message ?? "" },
    messages: {
      tags: {
        list: async () => tags,
        create: async (key, tag, color) => log.tagsCreated.push({ key, tag, color }),
      },
    },
    spaces: {
      query: async ({ name }) => spaces.filter(s => s.name === name),
      create: async name => {
        if (spaces.some(s => s.name === name && s.isSelfOwned)) {
          throw new Error(`Failed to create space with name ${name}: Space already exists for this extension.`);
        }
        log.created.push(name);
      },
      update: async id => {
        const space = spaces.find(s => s.id === id);
        if (!space.isSelfOwned) {
          throw new Error(`Failed to update space with id ${id}: Space does not belong to this extension.`);
        }
        log.updated.push(id);
      },
    },
  };
  const consoleCapture = { warn: (...a) => log.errors.push(a.join(" ")), error: (...a) => log.errors.push(a.join(" ")) };
  const context = vm.createContext({ browser, console: consoleCapture });
  const unhandled = e => log.errors.push(String(e));
  process.on("unhandledRejection", unhandled);
  vm.runInContext(code, context);
  await new Promise(r => setTimeout(r, 50));
  process.off("unhandledRejection", unhandled);
  return log;
}

{
  const log = await run({});
  check("Erststart: Bereich wird angelegt", log.created.length === 1);
  check("Erststart: vier Schlagwörter auf Deutsch", log.tagsCreated.map(t => t.tag).join(",") === "1 Sofort,2 Planen,3 Delegieren,4 Streichen", log.tagsCreated);
}
{
  const log = await run({ spaces: [{ id: 7, name: "eisenhower", isSelfOwned: false }] });
  check("Fremder Bereich gleichen Namens: eigener wird trotzdem angelegt", log.created.length === 1 && log.updated.length === 0, JSON.stringify(log));
  check("…ohne Fehler", log.errors.length === 0, log.errors);
}
{
  const log = await run({ spaces: [{ id: 7, name: "eisenhower", isSelfOwned: false }, { id: 9, name: "eisenhower", isSelfOwned: true }] });
  check("Eigener Bereich vorhanden: wird aktualisiert, nicht doppelt angelegt", log.updated[0] === 9 && log.created.length === 0, JSON.stringify(log));
}
{
  const existing = ["eisenhower_do", "eisenhower_plan", "eisenhower_delegate", "eisenhower_drop"].map(key => ({ key }));
  const log = await run({ tags: existing });
  check("Vorhandene Schlagwörter bleiben unangetastet", log.tagsCreated.length === 0);
}

console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : "\nAlle Prüfungen bestanden");
process.exit(failed ? 1 : 0);
