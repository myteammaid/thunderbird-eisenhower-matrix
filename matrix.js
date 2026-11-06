/* global QUADRANTS, QUADRANT_KEYS */

const t = (key, ...subs) => browser.i18n.getMessage(key, subs.map(String));
const LOCALE = browser.i18n.getUILanguage();
const CREDIT_URL =
  "https://team-maid.de/?utm_source=thunderbird&utm_medium=addon&utm_campaign=eisenhower";

/** So viele Treffer je Quadrant werden hoechstens gelesen, bevor sortiert und gekuerzt wird. */
const QUADRANT_CAP = 2000;

/** Reihenfolge der Stapel fuer ←/→. "" ist "Unsortiert". */
const STACK_KEYS = ["", ...QUADRANT_KEYS];

const el = {
  account: document.getElementById("account"),
  scope: document.getElementById("scope"),
  order: document.getElementById("order"),
  limit: document.getElementById("limit"),
  reload: document.getElementById("reload"),
  status: document.getElementById("status"),
  grid: document.getElementById("grid"),
  inboxStack: document.getElementById("stack-inbox"),
  inboxCount: document.getElementById("count-inbox"),
  template: document.getElementById("card-template"),
  credit: document.getElementById("credit"),
};

/** Diese Auswahlfelder merkt sich die Erweiterung zwischen zwei Starts. */
const SETTINGS = ["account", "scope", "order", "limit"];

/** accountId -> Anzeigename, fuer die Fusszeile der Karten. */
const accountNames = new Map();

/**
 * Das Datenmodell: je Stapel die Nachrichtenkoepfe in Anzeigereihenfolge.
 * Nach dem Einsortieren wird nur das Modell nachgezogen, nicht neu geladen -
 * so springt nichts, und die naechste Karte steht sofort bereit.
 */
const lists = new Map();

/** Ausgewaehlte Nachrichten-IDs, die Karte mit dem Tastaturfokus, der Anker fuer Shift. */
const selection = new Set();
let focusId = null;
let anchorId = null;

function setStatus(text) {
  el.status.textContent = text;
}

/* ---------------------------------------------------------------- Aufbau */

function translatePage() {
  document.documentElement.lang = LOCALE;
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
}

function kbd(text) {
  return Object.assign(document.createElement("kbd"), { textContent: text });
}

function buildGrid() {
  QUADRANTS.forEach((q, i) => {
    const section = document.createElement("section");
    section.className = "quadrant";
    section.style.setProperty("--q-color", q.color);

    const h2 = document.createElement("h2");
    h2.append(
      kbd(String(i + 1)),
      t(q.title),
      Object.assign(document.createElement("span"), {
        className: "axis-hint",
        textContent: t(q.axis),
      }),
      Object.assign(document.createElement("span"), {
        className: "count",
        id: `count-${q.key}`,
        textContent: "–",
      })
    );

    const stack = document.createElement("div");
    stack.className = "stack";
    stack.id = `stack-${q.key}`;
    stack.dataset.quadrant = q.key;
    stack.setAttribute("role", "listbox");
    stack.setAttribute("aria-multiselectable", "true");

    section.append(h2, stack);
    el.grid.append(section);
  });
  el.inboxStack.parentElement.querySelector("h2").prepend(kbd("0"));
}

async function buildAccountFilter() {
  const accounts = await browser.accounts.list(false);
  for (const account of accounts) {
    accountNames.set(account.id, account.name);
    el.account.append(
      Object.assign(document.createElement("option"), {
        value: account.id,
        textContent: account.name,
      })
    );
  }
}

async function restoreSettings() {
  const { settings = {} } = await browser.storage.local.get("settings");
  for (const name of SETTINGS) {
    const value = settings[name];
    if (value !== undefined && [...el[name].options].some(o => o.value === value)) {
      el[name].value = value;
    }
  }
}

function saveSettings() {
  const settings = Object.fromEntries(SETTINGS.map(name => [name, el[name].value]));
  browser.storage.local.set({ settings });
}

/* ---------------------------------------------------------------- Laden */

/**
 * Holt die Posteingaenge der gewaehlten Konten. `accounts.list(false)`
 * liefert die Ordner nicht mit, deshalb einzeln nachfragen.
 */
async function inboxFolders(wanted) {
  const accounts = await browser.accounts.list(true);
  const folders = [];
  for (const account of accounts) {
    if (wanted && account.id !== wanted) {
      continue;
    }
    const flatten = list => {
      for (const folder of list || []) {
        if (folder.specialUse?.includes("inbox")) {
          folders.push(folder);
        }
        flatten(folder.subFolders);
      }
    };
    flatten(account.folders ?? account.rootFolder?.subFolders);
  }
  return folders;
}

function isQuadrantTagged(message) {
  return (message.tags || []).some(tag => QUADRANT_KEYS.includes(tag));
}

/** Geloeschte oder als Spam verschobene Mails gehoeren in keinen Quadranten mehr. */
function isBinned(message) {
  const use = message.folder?.specialUse || [];
  return use.includes("trash") || use.includes("junk");
}

function byDate(messages, order) {
  const sign = order === "ascending" ? 1 : -1;
  return messages.sort((a, b) => sign * (a.date - b.date));
}

/** Liest eine Nachrichtenliste seitenweise, bis `enough` zutrifft oder sie endet. */
async function drain(page, accept, enough) {
  const found = [];
  while (page) {
    found.push(...page.messages.filter(accept));
    if (!page.id) {
      break;
    }
    if (enough(found)) {
      await browser.messages.abortList(page.id);
      break;
    }
    page = await browser.messages.continueList(page.id);
  }
  return found;
}

/**
 * Die unsortierten Nachrichten eines Posteingangs, neueste oder aelteste zuerst.
 * messages.query liefert in Ordnerreihenfolge, also die aeltesten zuerst - mit
 * einer Obergrenze bekaeme man genau die falschen. messages.list kann vorsortiert
 * liefern; dann reicht es, bis zur Obergrenze zu lesen.
 */
async function unsortedInFolder(folderId, { limit, order, unreadOnly }) {
  const accept = m => !isQuadrantTagged(m) && (!unreadOnly || !m.read);
  try {
    const page = await browser.messages.list(folderId, { sortType: "date", sortOrder: order });
    return await drain(page, accept, found => found.length >= limit);
  } catch (error) {
    // Kennt diese Thunderbird-Version keine Sortierung: alles lesen, selbst sortieren.
    console.warn("messages.list ohne Sortierung:", error);
    return drain(await browser.messages.list(folderId), accept, () => false);
  }
}

async function quadrantMessages(key) {
  const page = await browser.messages.query({ tags: { mode: "any", tags: { [key]: true } } });
  return drain(page, m => !isBinned(m), found => found.length >= QUADRANT_CAP);
}

let loadRun = 0;

async function load() {
  const run = ++loadRun;
  setStatus(t("statusLoading"));
  const options = {
    limit: Number(el.limit.value),
    order: el.order.value,
    unreadOnly: el.scope.value === "unread",
  };
  const wanted = el.account.value;

  try {
    const folders = await inboxFolders(wanted);
    const [perFolder, perQuadrant] = await Promise.all([
      Promise.all(folders.map(f => unsortedInFolder(f.id, options))),
      Promise.all(QUADRANT_KEYS.map(quadrantMessages)),
    ]);
    if (run !== loadRun) {
      return; // ein neuerer Ladevorgang hat uebernommen
    }

    lists.set("", byDate(perFolder.flat(), options.order).slice(0, options.limit));
    QUADRANT_KEYS.forEach((key, i) => {
      const mine = perQuadrant[i].filter(m => !wanted || m.folder?.accountId === wanted);
      lists.set(key, byDate(mine, options.order).slice(0, options.limit));
    });

    for (const id of selection) {
      if (stackOf(id) === null) {
        selection.delete(id);
      }
    }
    if (stackOf(focusId) === null) {
      focusId = null;
    }

    STACK_KEYS.forEach(renderStack);
    paintSelection();
    const time = new Date().toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
    setStatus(t("statusLoaded", folders.length, time));
  } catch (error) {
    console.error(error);
    setStatus(t("statusLoadError", error.message));
  }
}

/* ---------------------------------------------------------------- Anzeige */

function stackNode(key) {
  return key ? document.getElementById(`stack-${key}`) : el.inboxStack;
}

function countNode(key) {
  return key ? document.getElementById(`count-${key}`) : el.inboxCount;
}

function cardNode(id) {
  return document.querySelector(`.card[data-message-id="${id}"]`);
}

function idsIn(key) {
  return (lists.get(key) || []).map(m => m.id);
}

function stackOf(id) {
  if (id === null) {
    return null;
  }
  for (const [key, list] of lists) {
    if (list.some(m => m.id === id)) {
      return key;
    }
  }
  return null;
}

function formatDate(value) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
  }
  const options = { day: "2-digit", month: "2-digit" };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "2-digit";
  }
  return date.toLocaleDateString(LOCALE, options);
}

function renderStack(key) {
  const list = lists.get(key) || [];
  countNode(key).textContent = list.length;
  if (!list.length) {
    stackNode(key).replaceChildren(
      Object.assign(document.createElement("div"), {
        className: "empty",
        textContent: key ? t("empty") : t("emptyInbox"),
      })
    );
    return;
  }
  const quadrant = QUADRANTS.find(q => q.key === key);
  stackNode(key).replaceChildren(...list.map(message => card(message, quadrant)));
}

function card(message, quadrant) {
  const node = el.template.content.firstElementChild.cloneNode(true);
  node.dataset.messageId = message.id;
  if (quadrant) {
    node.style.setProperty("--q-color", quadrant.color);
  }
  node.classList.toggle("unread", !message.read);

  node.querySelector(".author").textContent = message.author;
  node.querySelector(".subject").textContent = message.subject || t("noSubject");
  node.querySelector(".date").textContent = formatDate(message.date);
  node.querySelector(".account").textContent = accountNames.get(message.folder?.accountId) ?? "";

  const open = node.querySelector(".open");
  open.textContent = t("open");
  open.title = t("openTitle");
  open.addEventListener("click", event => {
    event.stopPropagation();
    openMessage(message.id);
  });

  node.addEventListener("click", event => onCardClick(event, message.id));
  node.addEventListener("dblclick", () => openMessage(message.id));

  node.addEventListener("dragstart", event => {
    // Wer eine nicht ausgewaehlte Karte zieht, meint nur diese eine.
    if (!selection.has(message.id)) {
      selectOnly(message.id);
      paintSelection();
    }
    event.dataTransfer.setData("text/plain", JSON.stringify([...selection]));
    event.dataTransfer.effectAllowed = "move";
    for (const id of selection) {
      cardNode(id)?.classList.add("dragging");
    }
  });
  node.addEventListener("dragend", () => {
    document.querySelectorAll(".card.dragging").forEach(n => n.classList.remove("dragging"));
  });

  return node;
}

/** Nur Klassen umschalten, nichts neu aufbauen - sonst bricht ein laufendes Ziehen ab. */
function paintSelection() {
  for (const node of document.querySelectorAll(".card")) {
    const id = Number(node.dataset.messageId);
    const on = selection.has(id);
    node.classList.toggle("selected", on);
    node.setAttribute("aria-selected", String(on));
    node.classList.toggle("focused", id === focusId);
  }
}

function openMessage(id) {
  browser.messageDisplay.open({ messageId: id });
}

/* ---------------------------------------------------------------- Auswahl */

function setFocus(id) {
  focusId = id;
  const node = cardNode(id);
  if (node) {
    node.focus({ preventScroll: true });
    node.scrollIntoView({ block: "nearest" });
  }
}

function selectOnly(id) {
  selection.clear();
  selection.add(id);
  anchorId = id;
  setFocus(id);
}

function toggle(id) {
  if (selection.has(id)) {
    selection.delete(id);
  } else {
    selection.add(id);
  }
  anchorId = id;
  setFocus(id);
}

/** Shift: alles zwischen Anker und Karte, aber nur innerhalb eines Stapels. */
function selectRange(id) {
  const key = stackOf(id);
  const ids = idsIn(key);
  const anchor = stackOf(anchorId) === key ? anchorId : id;
  const [from, to] = [ids.indexOf(anchor), ids.indexOf(id)].sort((a, b) => a - b);
  selection.clear();
  ids.slice(from, to + 1).forEach(x => selection.add(x));
  setFocus(id);
}

function onCardClick(event, id) {
  if (event.shiftKey) {
    selectRange(id);
  } else if (event.ctrlKey || event.metaKey) {
    toggle(id);
  } else {
    selectOnly(id);
  }
  paintSelection();
}

function step(delta, extend) {
  const ids = idsIn(stackOf(focusId) ?? "");
  if (!ids.length) {
    return;
  }
  const index = focusId === null ? 0 : ids.indexOf(focusId) + delta;
  const id = ids[Math.max(0, Math.min(ids.length - 1, index))];
  if (extend) {
    anchorId ??= focusId ?? id;
    selectRange(id);
  } else {
    selectOnly(id);
  }
  paintSelection();
}

/** ←/→ springt zum naechsten Stapel, der Karten hat. */
function hop(delta) {
  const from = focusId === null ? -1 : STACK_KEYS.indexOf(stackOf(focusId));
  for (let i = from + delta; i >= 0 && i < STACK_KEYS.length; i += delta) {
    const ids = idsIn(STACK_KEYS[i]);
    if (ids.length) {
      selectOnly(ids[0]);
      paintSelection();
      return;
    }
  }
}

function selectAllInStack() {
  const ids = idsIn(stackOf(focusId) ?? "");
  ids.forEach(id => selection.add(id));
  paintSelection();
}

/**
 * Welche Karte nach dem Verschieben den Fokus bekommt: die erste nicht
 * verschobene unterhalb der verschobenen, sonst die naechste darueber.
 */
function successor(movedIds) {
  const ids = idsIn(stackOf(focusId) ?? stackOf(movedIds[0]));
  const moved = new Set(movedIds);
  const first = ids.findIndex(id => moved.has(id));
  const last = ids.findLastIndex(id => moved.has(id));
  return (
    ids.slice(last + 1).find(id => !moved.has(id)) ??
    ids.slice(0, Math.max(first, 0)).reverse().find(id => !moved.has(id)) ??
    null
  );
}

/* ---------------------------------------------------------------- Einsortieren */

/**
 * Setzt genau ein Quadranten-Schlagwort und entfernt die anderen drei.
 * Fremde Schlagwoerter (deine eigenen) bleiben unangetastet. `targetKey`
 * leer heisst: zurueck nach "Unsortiert".
 */
async function moveIds(ids, targetKey) {
  ids = ids.filter(id => stackOf(id) !== null && stackOf(id) !== targetKey);
  if (!ids.length) {
    return;
  }
  const next = successor(ids);
  setStatus(t("statusSaving"));

  const moved = [];
  try {
    for (const id of ids) {
      const header = await browser.messages.get(id);
      const kept = (header.tags || []).filter(tag => !QUADRANT_KEYS.includes(tag));
      const tags = targetKey ? [...kept, targetKey] : kept;
      await browser.messages.update(id, { tags });
      moved.push({ ...header, tags });
    }
    setStatus(t("statusMoved", moved.length));
  } catch (error) {
    console.error(error);
    setStatus(t("statusError", error.message));
  }

  const movedIds = new Set(moved.map(m => m.id));
  const touched = new Set([targetKey]);
  for (const [key, list] of lists) {
    if (list.some(m => movedIds.has(m.id))) {
      touched.add(key);
      lists.set(key, list.filter(m => !movedIds.has(m.id)));
    }
  }
  lists.set(targetKey, byDate([...(lists.get(targetKey) || []), ...moved], el.order.value));
  touched.forEach(renderStack);

  selection.clear();
  if (next !== null && !movedIds.has(next)) {
    selectOnly(next);
  } else {
    focusId = null;
  }
  paintSelection();
}

function wireDropTarget(stack) {
  stack.addEventListener("dragover", event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    stack.classList.add("dropping");
  });
  stack.addEventListener("dragleave", event => {
    if (!stack.contains(event.relatedTarget)) {
      stack.classList.remove("dropping");
    }
  });
  stack.addEventListener("drop", async event => {
    event.preventDefault();
    stack.classList.remove("dropping");
    let ids;
    try {
      ids = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }
    if (Array.isArray(ids)) {
      await moveIds(ids.map(Number), stack.dataset.quadrant);
    }
  });
  // Klick ins Leere hebt die Auswahl auf.
  stack.addEventListener("click", event => {
    if (event.target === stack) {
      selection.clear();
      paintSelection();
    }
  });
}

/* ---------------------------------------------------------------- Tastatur */

function onKey(event) {
  if (event.target.closest("select, input, textarea")) {
    return;
  }
  if (event.altKey) {
    return;
  }
  const plain = !event.ctrlKey && !event.metaKey;

  if (plain && /^[0-4]$/.test(event.key)) {
    event.preventDefault();
    const target = event.key === "0" ? "" : QUADRANT_KEYS[Number(event.key) - 1];
    moveIds([...selection], target);
    return;
  }

  switch (event.key) {
    case "ArrowDown":
      step(1, event.shiftKey);
      break;
    case "ArrowUp":
      step(-1, event.shiftKey);
      break;
    case "ArrowRight":
      hop(1);
      break;
    case "ArrowLeft":
      hop(-1);
      break;
    case "Enter":
      if (event.target.closest("button, a") || focusId === null) {
        return;
      }
      openMessage(focusId);
      break;
    case "Escape":
      selection.clear();
      paintSelection();
      break;
    case "a":
      if (plain) {
        return;
      }
      selectAllInStack();
      break;
    default:
      return;
  }
  event.preventDefault();
}

/* ---------------------------------------------------------------- Start */

(async () => {
  translatePage();
  buildGrid();
  await buildAccountFilter();
  await restoreSettings();
  document.querySelectorAll(".stack").forEach(wireDropTarget);
  for (const name of SETTINGS) {
    el[name].addEventListener("change", () => {
      saveSettings();
      load();
    });
  }
  el.reload.addEventListener("click", load);
  el.credit.addEventListener("click", event => {
    event.preventDefault();
    browser.windows.openDefaultBrowser(CREDIT_URL);
  });
  document.addEventListener("keydown", onKey);
  await load();
})();
