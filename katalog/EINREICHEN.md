# Einreichen bei addons.thunderbird.net

Alles, was das Formular abfragt, steht unten zum Hineinkopieren bereit.
Die Datei zum Hochladen entsteht mit `./build.sh`: `eisenhower-matrix-1.0.0.xpi`.

## Ablauf

1. Auf <https://addons.thunderbird.net/> anmelden. Das Konto ist kostenlos, als
   Anzeigename **TeamMaid** wählen.
2. Oben rechts **Tools → Submit a New Add-on**.
3. Vertrieb: **On this site** (gelistet, mit Prüfung).
4. `eisenhower-matrix-1.0.0.xpi` hochladen. Die automatische Prüfung meldet
   Firefox-Warnungen zu Thunderbird-Schnittstellen. Das ist normal, Fehler gibt es keine.
5. Frage nach Quellcode: **No**. Der Code ist weder gebündelt noch verkleinert.
6. Eintrag ausfüllen mit den Texten unten, die Screenshots aus `screenshots/`
   hochladen, Kategorie und Lizenz wählen.
7. Abschicken. Ehrenamtliche Prüfer schauen sich den Code an, erst danach ist
   das Add-on öffentlich.

Für den deutschen Eintrag: nach dem Anlegen im Eintrag oben die Sprache auf
**Deutsch** umschalten und Name, Zusammenfassung und Beschreibung aus dem
deutschen Teil eintragen.

---

## Englisch (Standard)

**Name**
Eisenhower Matrix

**URL-Kürzel**
eisenhower-matrix

**Summary** (max. 250 Zeichen)
Sort your inbox into the four Eisenhower quadrants – Do now, Schedule, Delegate, Eliminate – by drag & drop or keyboard. Stored as regular tags, synced via IMAP. No data leaves your computer.

**Description**

Too many emails, too little clarity? The Eisenhower Matrix sorts every message by two questions: Is it urgent? Is it important?

This add-on adds a board to Thunderbird's left bar. Your unsorted mail sits on the left, the four quadrants on the right:

• Do now – important and urgent
• Schedule – important, not urgent
• Delegate – urgent, not important
• Eliminate – neither

Drag a card into a quadrant, or fly through your inbox with the keyboard: 1–4 sorts, 0 puts back, arrow keys move, Shift and Ctrl select several messages at once. After each step the next message is ready.

Your decisions are stored as normal Thunderbird tags (IMAP keywords):
• visible and filterable in the regular message list
• synced to the server, available on every device
• kept even if you uninstall the add-on
• your own tags stay untouched

Privacy: no server, no account, no tracking. The add-on only reads message headers (sender, subject, date) to draw the board and sets tags. It remembers your filter settings locally. Nothing is sent anywhere.

English and German interface, following Thunderbird's language.

Made by TeamMaid – automation and AI for small and medium businesses.

**Categories**
Tags · Message and News Reading (oder was die Liste anbietet, am nächsten an „Productivity“)

**Tags**
eisenhower, productivity, inbox zero, priorities, tags, gtd, todo

**Support email**
hi@team-maid.de

**Support website / Homepage**
https://team-maid.de/
(sobald es die Ratgeberseite gibt: deren Adresse eintragen)

**License**
MIT License

**Privacy policy**
Nicht nötig, das Add-on sammelt keine Daten. Falls das Formular trotzdem fragt:
> This add-on does not collect, store or transmit any personal data. It reads message headers locally to display them and stores the user's filter settings in local extension storage.

**Release notes 1.0.0**
First public release: board with four quadrants, drag & drop, keyboard sorting (1–4, 0), multi-select, newest-first or oldest-first ordering, English and German.

**Notes to reviewer**
Plain MailExtension, no Experiment APIs, no remote code, no minified or bundled files.
Permissions: accountsRead (list inboxes), messagesRead (headers for the cards), messagesUpdate + messagesTags + messagesTagsList (create the four quadrant tags and set them), storage (remember the four filter dropdowns).
windows.openDefaultBrowser is only called when the user clicks the "A tool by TeamMaid" link in the footer.
Source repository with tests: <GitHub-Adresse eintragen>

**Screenshot captions**
1-matrix-en.png – Unsorted mail on the left, the four quadrants on the right. Two messages selected for keyboard sorting.
2-dark-en.png – Follows Thunderbird's dark mode.

---

## Deutsch

**Name**
Eisenhower-Matrix

**Zusammenfassung**
Sortiert den Posteingang per Drag & Drop oder Tastatur in die vier Eisenhower-Quadranten: Sofort, Planen, Delegieren, Streichen. Gespeichert als Schlagwort, per IMAP synchronisiert. Keine Daten verlassen den Rechner.

**Beschreibung**

Zu viele Mails, zu wenig Überblick? Die Eisenhower-Matrix sortiert jede Nachricht nach zwei Fragen: Ist es dringend? Ist es wichtig?

Das Add-on legt in der linken Leiste von Thunderbird ein Brett an. Links liegt die unsortierte Post, rechts die vier Quadranten:

• Sofort erledigen – wichtig und dringend
• Terminieren – wichtig, nicht dringend
• Delegieren – dringend, nicht wichtig
• Nicht bearbeiten – weder noch

Karte in einen Quadranten ziehen oder mit der Tastatur durch den Posteingang: 1–4 sortiert ein, 0 legt zurück, Pfeiltasten wandern, Shift und Strg wählen mehrere Mails auf einmal. Nach jedem Schritt steht die nächste Mail bereit.

Die Einordnung wird als normales Thunderbird-Schlagwort gespeichert (IMAP-Keyword):
• sichtbar und filterbar in der normalen Nachrichtenliste
• auf dem Server synchronisiert, auf jedem Gerät da
• bleibt auch nach der Deinstallation erhalten
• eigene Schlagwörter bleiben unangetastet

Datenschutz: kein Server, kein Konto, kein Tracking. Das Add-on liest nur die Kopfdaten (Absender, Betreff, Datum), um das Brett zu zeichnen, und setzt Schlagwörter. Die Filtereinstellungen merkt es sich lokal. Nichts wird irgendwohin gesendet.

Oberfläche auf Deutsch und Englisch, je nach Sprache von Thunderbird.

Ein Werkzeug von TeamMaid – Automatisierung und KI für den Mittelstand.

**Bildunterschriften**
1-matrix-de.png – Links die unsortierte Post, rechts die vier Quadranten. Zwei Mails sind zum Einsortieren per Tastatur markiert.
2-dark-de.png – Passt sich dem dunklen Modus von Thunderbird an.
