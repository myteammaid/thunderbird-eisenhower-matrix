/**
 * Die vier Quadranten. `key` wird zum IMAP-Schlagwort und ist damit
 * das einzige, was diese Erweiterung dauerhaft in deinen Postfaechern
 * hinterlaesst - deinstallierst du sie, bleiben die Schlagwoerter.
 *
 * Die Schluessel duerfen sich nie aendern, sonst verlieren bestehende
 * Nutzer ihre Einordnung. Beschriftungen kommen aus _locales/.
 */
var QUADRANTS = [
  { key: "eisenhower_do", color: "#C4314B", tag: "tagDo", title: "titleDo", axis: "axisDo" },
  { key: "eisenhower_plan", color: "#2493EF", tag: "tagPlan", title: "titlePlan", axis: "axisPlan" },
  { key: "eisenhower_delegate", color: "#E8A33D", tag: "tagDelegate", title: "titleDelegate", axis: "axisDelegate" },
  { key: "eisenhower_drop", color: "#7A7A7A", tag: "tagDrop", title: "titleDrop", axis: "axisDrop" },
];

var QUADRANT_KEYS = QUADRANTS.map(q => q.key);
