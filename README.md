# ImmoManager

Responsive Immobilienverwaltung mit Immobilien-/Einheitenverwaltung, Mietern, Nebenkosten, Mieterhöhungen, Renditeberechnung, Portfolio-Freigaben und operativen Vorgängen (Leerstand, Übergaben, Wartung, Zähler, Bewerbungen und Aufgaben).

## Schnellstart

Voraussetzungen: Node.js 20 oder neuer und npm.

```bash
npm install
npm run dev
```

Öffne danach http://localhost:3000. Auf dem Anmeldebildschirm kannst du **Ohne Anmeldung ausprobieren** wählen. Im lokalen Demo-Modus werden Daten im Browser gespeichert; Google OAuth ist nicht erforderlich. Das eignet sich zum sofortigen Testen auf einem Gerät.

## Dauerhafte serverseitige Speicherung und Anmeldung

Kopiere `.env.example` nach `.env`. Die SQLite-Datenbank `immomanager.db` wird beim Start automatisch angelegt und speichert Portfolio-Daten auch dann, wenn Google Drive nicht verbunden ist.

Für Google-Anmeldung und optionalen Drive-Abgleich trage `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` und die öffentliche `APP_URL` ein. In der Google Cloud Console muss die Redirect-URL `<APP_URL>/auth/google/callback` als autorisierte Weiterleitungs-URI registriert sein. Ohne OAuth-Konfiguration bleibt der lokale Demo-Modus verfügbar.

```bash
npm run lint
npm run build
```

Für produktiven Betrieb: HTTPS verwenden, eine starke zufällige `SESSION_SECRET` setzen, Datenbank-Backups einrichten und die Google OAuth Redirect-URI exakt konfigurieren. Der aktuelle Demo-Modus ist browserlokal und wird nicht zwischen Geräten synchronisiert.

## Persistenz

- Nicht angemeldeter Demo-Modus: Browser-LocalStorage.
- Angemeldete Nutzer: serverseitige SQLite-Speicherung; Google Drive wird genutzt, wenn ein gültiger Refresh-Token verfügbar ist.
- Portfolio-Sharing: vorhandene Berechtigungsprüfung bleibt aktiv.

## Hinweise

Dieses Projekt ist eine eigenständige Immobilienverwaltungs-App und keine Kopie von NaHaus. Die öffentliche Referenz dient nur zur Orientierung bei Arbeitsabläufen. Mietrechtliche Berechnungen und Dokumente vor produktiver Verwendung fachlich prüfen.
