/**
 * Katalog-Screenshots aus den erfundenen Demo-Postfaechern - nie aus echten Mails.
 * Aufruf aus dem Add-on-Ordner:  node werkzeuge/screenshots.mjs
 */
import { firefox } from "playwright";
import { mkdir } from "node:fs/promises";
import { serve } from "./server.mjs";

const OUT = new URL("../katalog/screenshots/", import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

const { url, close } = await serve();
const browser = await firefox.launch();

const SHOTS = [
  { name: "1-matrix-en", lang: "en", scheme: "light" },
  { name: "1-matrix-de", lang: "de", scheme: "light" },
  { name: "2-dark-en", lang: "en", scheme: "dark" },
  { name: "2-dark-de", lang: "de", scheme: "dark" },
];

for (const shot of SHOTS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: shot.scheme });
  await page.goto(`${url}/werkzeuge/demo.html?lang=${shot.lang}`);
  await page.waitForFunction(() => document.getElementById("status")?.textContent.includes("·"));
  // Zwei Karten markiert: zeigt Mehrfachauswahl und Fokus
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Shift+ArrowDown");
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `${OUT}${shot.name}.png` });
  await page.close();
  console.log(`${shot.name}.png`);
}

await browser.close();
close();
