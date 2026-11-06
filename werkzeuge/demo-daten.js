/**
 * Erfundene Postfaecher fuer Screenshots und Tests. Alle Namen sind
 * ausgedacht, alle Adressen enden auf .example (RFC 2606, gibt es nie).
 * `h` = Stunden vor jetzt, `q` = Quadrant (1-4), `x` = fremdes Schlagwort.
 */
export const DEMO = {
  en: {
    accounts: ["Office", "Projects"],
    mails: [
      { a: 0, h: 0.3, from: "Northwind Studio <hello@northwind-studio.example>", s: "Proposal: website relaunch, second draft" },
      { a: 0, h: 1.2, from: "Maya Lindqvist <maya@lindqvist-legal.example>", s: "Contract review – please confirm by Friday" },
      { a: 1, h: 2.5, from: "Priya Raman <priya@raman-consulting.example>", s: "Quick question about the onboarding flow" },
      { a: 0, h: 3.1, from: "Fernhill Bank <service@fernhill-bank.example>", s: "Your monthly statement is ready", read: true },
      { a: 1, h: 5, from: "Sofia Martins <sofia@martins-design.example>", s: "Logo files – final versions attached" },
      { a: 0, h: 7, from: "Tom Becker <tom@becker-events.example>", s: "Venue options for the team offsite", x: "$label2" },
      { a: 0, h: 20, from: "Cloudpeak Hosting <billing@cloudpeak.example>", s: "Invoice #20431 – due in 7 days" },
      { a: 1, h: 26, from: "Jonas Weber <jonas@atelier-weber.example>", s: "Photos from Tuesday's workshop" },
      { a: 0, h: 30, from: "Office Supplies Co. <news@officesupplies.example>", s: "Autumn sale: 20% off desk chairs" },
      { a: 0, h: 49, from: "City Tax Office <noreply@tax-office.example>", s: "Reminder: quarterly VAT return" },
      { a: 1, h: 55, from: "Webinar Hub <events@webinarhub.example>", s: "Last chance: AI for small teams (Thursday)" },
      { a: 0, h: 80, from: "LinkedOut <notify@linkedout.example>", s: "5 people viewed your profile" },
      { a: 0, h: 120, from: "Daniel Okafor <daniel@okafor-partners.example>", s: "Intro: two potential clients in Hamburg", read: true },
      { a: 1, h: 400, from: "Old Newsletter <news@old-letter.example>", s: "Our summer edition is here", read: true },

      { a: 0, h: 0.8, q: 1, from: "Anna Holm <anna@harbor-co.example>", s: "Server down? Customers can't log in" },
      { a: 0, h: 4, q: 1, from: "Maya Lindqvist <maya@lindqvist-legal.example>", s: "Signature needed today: NDA Greenfield" },
      { a: 1, h: 9, q: 1, from: "Cloudpeak Hosting <alerts@cloudpeak.example>", s: "Action required: SSL certificate expires tomorrow" },

      { a: 1, h: 6, q: 2, from: "Priya Raman <priya@raman-consulting.example>", s: "Q1 roadmap – your input by next week" },
      { a: 0, h: 28, q: 2, from: "Daniel Okafor <daniel@okafor-partners.example>", s: "Lunch to discuss the partnership?" },
      { a: 0, h: 52, q: 2, from: "K. Novak <k.novak@novak-tax.example>", s: "Annual report: documents checklist" },
      { a: 1, h: 75, q: 2, from: "Learning Lab <team@learninglab.example>", s: "Your course starts on Monday", read: true },

      { a: 0, h: 3, q: 3, from: "Support Desk <support@yourshop.example>", s: "3 new customer tickets" },
      { a: 0, h: 22, q: 3, from: "Tom Becker <tom@becker-events.example>", s: "Can someone book the hotel rooms?" },
      { a: 1, h: 46, q: 3, from: "Printwerk <orders@printwerk.example>", s: "Proof for business cards ready", read: true },

      { a: 0, h: 10, q: 4, from: "Daily Deals <deals@daily-deals.example>", s: "Flash sale ends in 2 hours!", read: true },
      { a: 0, h: 33, q: 4, from: "Social Network <notify@social.example>", s: "You have 12 new notifications", read: true },
    ],
  },

  de: {
    accounts: ["Büro", "Projekte"],
    mails: [
      { a: 0, h: 0.3, from: "Studio Nordwind <hallo@studio-nordwind.example>", s: "Angebot Website-Relaunch, zweiter Entwurf" },
      { a: 0, h: 1.2, from: "Maja Lindholm <maja@lindholm-recht.example>", s: "Vertragsprüfung – bitte bis Freitag bestätigen" },
      { a: 1, h: 2.5, from: "Priya Raman <priya@raman-beratung.example>", s: "Kurze Frage zum Onboarding-Ablauf" },
      { a: 0, h: 3.1, from: "Fernhain Bank <service@fernhain-bank.example>", s: "Ihr Kontoauszug ist da", read: true },
      { a: 1, h: 5, from: "Sofia Martins <sofia@martins-design.example>", s: "Logo-Dateien – finale Fassungen im Anhang" },
      { a: 0, h: 7, from: "Tom Becker <tom@becker-events.example>", s: "Locations für den Team-Workshop", x: "$label2" },
      { a: 0, h: 20, from: "Wolkengipfel Hosting <rechnung@wolkengipfel.example>", s: "Rechnung 20431 – fällig in 7 Tagen" },
      { a: 1, h: 26, from: "Jonas Weber <jonas@atelier-weber.example>", s: "Fotos vom Workshop am Dienstag" },
      { a: 0, h: 30, from: "Bürobedarf Meyer <news@buero-meyer.example>", s: "Herbstaktion: 20 % auf Bürostühle" },
      { a: 0, h: 49, from: "Finanzamt Musterstadt <noreply@finanzamt.example>", s: "Erinnerung: Umsatzsteuer-Voranmeldung" },
      { a: 1, h: 55, from: "Webinar-Forum <events@webinarforum.example>", s: "Letzte Chance: KI für kleine Teams (Donnerstag)" },
      { a: 0, h: 80, from: "Netzwerk Plus <info@netzwerk-plus.example>", s: "5 Personen haben Ihr Profil angesehen" },
      { a: 0, h: 120, from: "Daniel Okafor <daniel@okafor-partner.example>", s: "Kontakt: zwei mögliche Kunden in Hamburg", read: true },
      { a: 1, h: 400, from: "Alter Newsletter <news@alter-brief.example>", s: "Unsere Sommerausgabe ist da", read: true },

      { a: 0, h: 0.8, q: 1, from: "Anna Holm <anna@hafen-co.example>", s: "Server down? Kunden kommen nicht ins Konto" },
      { a: 0, h: 4, q: 1, from: "Maja Lindholm <maja@lindholm-recht.example>", s: "Unterschrift heute nötig: NDA Grünfeld" },
      { a: 1, h: 9, q: 1, from: "Wolkengipfel Hosting <alarm@wolkengipfel.example>", s: "Handlungsbedarf: SSL-Zertifikat läuft morgen ab" },

      { a: 1, h: 6, q: 2, from: "Priya Raman <priya@raman-beratung.example>", s: "Roadmap Q1 – Ihre Punkte bis nächste Woche" },
      { a: 0, h: 28, q: 2, from: "Daniel Okafor <daniel@okafor-partner.example>", s: "Mittagessen zur Partnerschaft?" },
      { a: 0, h: 52, q: 2, from: "K. Nowak <k.nowak@nowak-steuer.example>", s: "Jahresabschluss: Unterlagen-Checkliste" },
      { a: 1, h: 75, q: 2, from: "Lernwerkstatt <team@lernwerkstatt.example>", s: "Ihr Kurs beginnt am Montag", read: true },

      { a: 0, h: 3, q: 3, from: "Kundenservice <support@ihr-shop.example>", s: "3 neue Kundenanfragen" },
      { a: 0, h: 22, q: 3, from: "Tom Becker <tom@becker-events.example>", s: "Kann jemand die Hotelzimmer buchen?" },
      { a: 1, h: 46, q: 3, from: "Druckwerk <auftrag@druckwerk.example>", s: "Korrekturabzug Visitenkarten liegt bereit", read: true },

      { a: 0, h: 10, q: 4, from: "Tagesangebote <deals@tagesangebote.example>", s: "Blitzangebot endet in 2 Stunden!", read: true },
      { a: 0, h: 33, q: 4, from: "Soziales Netz <info@soziales-netz.example>", s: "Sie haben 12 neue Benachrichtigungen", read: true },
    ],
  },
};
