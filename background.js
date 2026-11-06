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
 *
 * Achtung: spaces.query liefert die Bereiche ALLER Erweiterungen. Ein fremder
 * Bereich mit demselben Namen laesst sich nicht aendern (update wirft), also
 * nur die eigenen nehmen. Fehlt isSelfOwned, faengt create den Rest ab.
 */
async function ensureSpace() {
  const tabProperties = { url: "/matrix.html" };
  const buttonProperties = {
    title: browser.i18n.getMessage("extensionName"),
    defaultIcons: "icons/space.svg",
  };
  const [own] = (await browser.spaces.query({ name: "eisenhower" })).filter(s => s.isSelfOwned);
  if (own) {
    await browser.spaces.update(own.id, tabProperties, buttonProperties);
    return;
  }
  try {
    await browser.spaces.create("eisenhower", tabProperties, buttonProperties);
  } catch (error) {
    console.warn("Bereich nicht angelegt:", error);
  }
}

(async () => {
  await ensureTags();
  await ensureSpace();
})();
