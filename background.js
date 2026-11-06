/* global QUADRANTS - kommt aus quadrants.js, siehe manifest.json */

/**
 * Legt die vier Schlagwoerter an, falls sie fehlen - in der Sprache der
 * Thunderbird-Oberflaeche. Vorhandene werden nicht angefasst: wer eines
 * umbenennt oder umfaerbt, behaelt das.
 */
async function ensureTags() {
  const existing = await browser.messages.tags.list();
  const known = new Set(existing.map(t => t.key));
  for (const q of QUADRANTS) {
    if (!known.has(q.key)) {
      await browser.messages.tags.create(q.key, browser.i18n.getMessage(q.tag), q.color);
    }
  }
}

/**
 * spaces.create wirft, wenn der Bereich schon existiert - beim zweiten
 * Start also normal. Darum erst nachsehen.
 */
async function ensureSpace() {
  const [existing] = await browser.spaces.query({ name: "eisenhower" });
  const tabProperties = { url: "/matrix.html" };
  const buttonProperties = {
    title: browser.i18n.getMessage("extensionName"),
    defaultIcons: "icons/matrix.svg",
  };
  if (existing) {
    await browser.spaces.update(existing.id, tabProperties, buttonProperties);
  } else {
    await browser.spaces.create("eisenhower", tabProperties, buttonProperties);
  }
}

(async () => {
  await ensureTags();
  await ensureSpace();
})();
