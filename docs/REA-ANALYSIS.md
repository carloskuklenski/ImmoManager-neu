# REA-orientierte Bestandsanalyse: ImmoManager-neu

Stand: 24.10.2026

## Auftrag und Grenzen
Ziel ist eine eigenständige, responsive Immobilienverwaltungs-App, die sich an öffentlich beschriebenen Arbeitsabläufen von NaHaus orientiert. Es werden keine geschützten Quelltexte, privaten Daten oder proprietären Implementierungsdetails kopiert. Die Referenz dient nur zur Funktionsanalyse.

## Verfügbarkeit von REA
Das öffentliche Repository [morluto/rea](https://github.com/morluto/rea) beschreibt REA als MCP für Reverse Engineering von nativen Binaries, JavaScript-/Electron-Apps, .NET und Websites. In der aktuellen Entwicklungsumgebung wurden keine REA-spezifischen MCP-/REA-Tools gefunden; daher konnte REA nicht live gegen nahaus.de ausgeführt werden. Die folgenden Erkenntnisse sind statische Codeprüfung und öffentliche Funktionsbeschreibungen, keine behauptete REA-Laufzeitanalyse.

## Codebasis vor Änderungen
- React 19, TypeScript, Vite, Tailwind CSS 4; Express-Server und SQLite sind im package.json vorhanden.
- Bestehender Zustand ist über AppContext und localStorage verfügbar; angemeldete Konten synchronisieren Daten über vorhandene API-Endpunkte/Google Drive.
- Bereits vorhandene Module: Dashboard, Immobilien mit Einheiten, Mieter, Nebenkostenabrechnungen, Mieterhöhungen, Renditerechner, Portfolio-Sharing.
- AppContext enthält CRUD-Funktionen für Immobilien, Einheiten, Mieter, Dokumente, Abrechnungen, Renditeberechnungen und Mieterhöhungen. Bestehende Login-/Portfolio-Logik sollte nicht ersetzt werden.

## Öffentliche Referenzfunktionen
Aus https://nahaus.de/funktionen/ und den dort verlinkten Funktionsseiten: Immobilien- und Eigentümerverwaltung, Mietverwaltung, Leerstandsverwaltung, Ein-/Auszüge und Protokolle, Mietverträge, digitale Mieterselbstauskunft, Vorlagen/Anschreiben, Zählerverwaltung, Vermögens- und Darlehensverwaltung, Nebenkosten, Banktransaktionen und Mahnwesen.

## Umsetzung in diesem Branch
- Bestehende Module bleiben erhalten.
- Neues Modul „Vorgänge & Aufgaben“ ergänzt operative Workflows für Leerstand, Übergaben, Wartung, Zähler, Bewerbungen und allgemeine Aufgaben.
- Vorgänge sind anlegbar, durchsuchbar, kategorisierbar, nach Status pflegbar und löschbar; responsive UI.
- Aktuell speichert das Modul Daten in browserlokalem localStorage. Es ist absichtlich nicht als Cloud-Synchronisierung ausgegeben; die Anbindung an AppContext/API ist ein Folgepunkt.

## Noch nicht umgesetzt / technische Folgearbeiten
1. Eigentümer, Bewerber und Zähler als echte typisierte Entitäten mit CRUD und Server-Synchronisierung.
2. Termin-/Übergabeprotokolle, PDF-/Vertragsvorlagen und Dokumentenarchiv integrieren.
3. Sollstellungen, Zahlungen und Mahnstufen mit Buchungsjournal und revisionsfähiger Historie.
4. Rollen/Rechte, Validierung, Fehlerzustände und Tests ergänzen.
5. Browser-/REA-Analyse nach Einrichtung von REA durchführen; Interaktionen, Navigation und zugängliche Oberflächen gegen öffentliche Referenz prüfen.

## Prüfschritte
- npm run lint
- npm run build
- Manuelle responsive Prüfung bei Mobil- und Desktopbreite
- CRUD-/Persistenztests für jeden Workflow
