# Notizen / nächste Schritte

## Erledigt in 1.0.0

- [x] Englisch und Deutsch (`_locales/`), Schlagwortnamen in der Sprache von Thunderbird
- [x] Tastatur: `1`–`4` einsortieren, `0` zurück, Pfeile, Enter, Esc, Strg+A
- [x] Mehrfachauswahl (Shift/Strg-Klick, Shift+Pfeil), auch beim Ziehen
- [x] Reihenfolge wählbar. **Fehler behoben:** `messages.query` liefert älteste
      zuerst, mit Obergrenze 150 kamen also die 150 ältesten Mails. Jetzt
      `messages.list` mit `sortType: "date"`, mit Rückweg für Versionen ohne Sortierung.
- [x] Ungelesene fett
- [x] Achsenbeschriftung: „wichtig“ stand auf Höhe von „nicht wichtig“
      (`writing-mode` am Container drehte die Flussrichtung mit)
- [x] Gelöschte oder als Spam verschobene Mails fallen aus den Quadranten
- [x] Nach dem Einsortieren wird nicht mehr neu geladen, die nächste Karte steht bereit
- [x] Kennung `eisenhower@team-maid.de`, Autor TeamMaid. **Die Kennung nie mehr ändern.**

## Als Nächstes

- [ ] „Streichen“-Quadrant: Knopf *alle archivieren* (`messages.archive`,
      braucht die Berechtigung `messagesMove`).
- [ ] Ratgeberseite auf team-maid.de („Eisenhower-Matrix“: 22.200 Suchen/Monat,
      KD 16, gemessen 06.11.2026) und dann `homepage_url` darauf umstellen.

## Automatische Einstufung

Zwei Wege, bewusst zu entscheiden:

**Lokal – `trial.ml`**
Thunderbird 140 bringt eine ML-Schnittstelle mit: `trial.ml.createEngine` /
`runEngine`. Modell läuft auf dem Rechner, kein Mailinhalt verlässt das Gerät.
Dafür klein und begrenzt. Für eine Klassifikation in vier Töpfe womöglich
ausreichend.

**Extern – API-Aufruf**
Deutlich bessere Einstufung, aber jeder bewertete Betreff bzw. Textausschnitt
geht dann an einen Dienst. Wenn, dann bewusst: nur Betreff und Absender
schicken statt des ganzen Textes, und im Add-on sichtbar machen, was rausgeht.
Achtung: Das würde die Aussage „keine Daten verlassen den Rechner“ im
Katalogeintrag brechen und `data_collection_permissions` ändern.

In beiden Fällen: **Vorschlag, keine Automatik.** Die Einstufung als
Vorauswahl anzeigen (etwa gestrichelter Rand), Bestätigung durch einen Klick.
Sonst verliert man das Vertrauen in das Brett, sobald es einmal danebenliegt.

## Offene Frage zur Semantik

Aktuell hält eine Nachricht genau ein Quadranten-Schlagwort — `moveIds()`
entfernt beim Einsortieren die anderen drei. Fremde Schlagwörter bleiben.
Falls sich das als zu streng erweist (etwa „Planen“ plus eigenes Projekt-Tag
gleichzeitig), ist die Stelle zum Ändern `moveIds()` in `matrix.js`.
