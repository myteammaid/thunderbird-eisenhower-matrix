/**
 * Nachbau der Thunderbird-MailExtension-API, soweit matrix.js sie braucht.
 * Nur fuer Tests und Screenshots - landet nicht im Add-on (siehe build.sh).
 *
 * URL-Parameter:
 *   lang=en|de    Sprache der Oberflaeche und der Demo-Postfaecher
 *   nosort=1      messages.list ohne Sortierfunktion (wie alte Thunderbirds)
 *   page=N        Seitengroesse der Nachrichtenlisten (Standard 5, um das Blaettern zu pruefen)
 */
import { DEMO } from "./demo-daten.js";

const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "de" ? "de" : "en";
const pageSize = Number(params.get("page") || 5);
const noSort = params.get("nosort") === "1";

const catalog = await (await fetch(`../_locales/${lang}/messages.json`)).json();
const data = DEMO[lang];
const quadrantKeys = ["eisenhower_do", "eisenhower_plan", "eisenhower_delegate", "eisenhower_drop"];

const accounts = data.accounts.map((name, i) => ({
  id: `account${i + 1}`,
  name,
  inbox: { id: `account${i + 1}://INBOX`, name: "Inbox", specialUse: ["inbox"], accountId: `account${i + 1}`, subFolders: [] },
}));
const trash = { id: "account1://Trash", name: "Trash", specialUse: ["trash"], accountId: "account1", subFolders: [] };

const now = Date.now();
const messages = data.mails.map((m, i) => ({
  id: i + 1,
  date: new Date(now - m.h * 3600 * 1000),
  author: m.from,
  subject: m.s,
  read: Boolean(m.read),
  tags: [...(m.q ? [quadrantKeys[m.q - 1]] : []), ...(m.x ? [m.x] : [])],
  folder: accounts[m.a].inbox,
}));
// Eine geloeschte, aber noch markierte Mail: darf in keinem Quadranten auftauchen.
messages.push({
  id: 999,
  date: new Date(now - 3600 * 1000),
  author: "Deleted <gone@deleted.example>",
  subject: "THIS MUST NOT SHOW UP",
  read: true,
  tags: ["eisenhower_do"],
  folder: trash,
});

const tags = [];
const lists = new Map();
let listCounter = 0;
const log = { updates: [], opened: [], external: [], aborted: 0 };

function clone(m) {
  return { ...m, tags: [...m.tags] };
}

function paginate(all) {
  const first = all.slice(0, pageSize);
  const rest = all.slice(pageSize);
  if (!rest.length) {
    return { id: null, messages: first.map(clone) };
  }
  const id = `list-${++listCounter}`;
  lists.set(id, rest);
  return { id, messages: first.map(clone) };
}

function nextPage(id) {
  const rest = lists.get(id);
  if (!rest) {
    throw new Error(`unknown list ${id}`);
  }
  lists.delete(id);
  return paginate(rest);
}

function translate(key, subs = []) {
  const entry = catalog[key];
  if (!entry) {
    return "";
  }
  return entry.message.replace(/\$([A-Z_]+)\$/g, (_, name) => {
    const content = entry.placeholders?.[name.toLowerCase()]?.content ?? "";
    return content.replace(/\$(\d)/g, (__, n) => subs[Number(n) - 1] ?? "");
  });
}

const store = {};

window.__demo = { messages, log };

window.browser = {
  i18n: {
    getMessage: translate,
    getUILanguage: () => (lang === "de" ? "de" : "en-US"),
  },
  accounts: {
    async list(includeFolders) {
      return accounts.map(a => ({
        id: a.id,
        name: a.name,
        ...(includeFolders ? { rootFolder: { subFolders: [a.inbox, ...(a.id === "account1" ? [trash] : [])] } } : {}),
      }));
    },
  },
  messages: {
    async list(folderId, options) {
      let all = messages.filter(m => m.folder.id === folderId);
      if (options) {
        if (noSort) {
          throw new Error('Type error for parameter options (Property "sortType" is unsupported)');
        }
        const sign = options.sortOrder === "ascending" ? 1 : -1;
        all = [...all].sort((a, b) => sign * (a.date - b.date));
      } else {
        // Ordnerreihenfolge: aelteste zuerst, wie in Thunderbird
        all = [...all].sort((a, b) => a.date - b.date);
      }
      return paginate(all);
    },
    async query(info) {
      let all = [...messages].sort((a, b) => a.date - b.date);
      if (info.tags) {
        const wanted = Object.keys(info.tags.tags).filter(k => info.tags.tags[k]);
        all = all.filter(m => m.tags.some(t => wanted.includes(t)));
      }
      return paginate(all);
    },
    async continueList(id) {
      return nextPage(id);
    },
    async abortList(id) {
      lists.delete(id);
      log.aborted++;
    },
    async get(id) {
      const m = messages.find(x => x.id === id);
      if (!m) {
        throw new Error(`Message not found: ${id}`);
      }
      return clone(m);
    },
    async update(id, properties) {
      const m = messages.find(x => x.id === id);
      m.tags = [...properties.tags];
      log.updates.push({ id, tags: [...properties.tags] });
    },
    tags: {
      async list() {
        return tags;
      },
      async create(key, tag, color) {
        tags.push({ key, tag, color });
      },
    },
  },
  messageDisplay: {
    async open(info) {
      log.opened.push(info.messageId);
    },
  },
  windows: {
    async openDefaultBrowser(url) {
      log.external.push(url);
    },
  },
  storage: {
    local: {
      async get(key) {
        return key in store ? { [key]: store[key] } : {};
      },
      async set(values) {
        Object.assign(store, structuredClone(values));
      },
    },
  },
};
