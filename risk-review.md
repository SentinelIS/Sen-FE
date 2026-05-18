# Risk Review API & Kanban Integration Guide

Dieses Dokument beschreibt, wie das Frontend die Risk-Review Endpunkte nutzen kann, um ein funktionstüchtiges **Risk Review Kanban Board** zu bauen.

---

## 1. Basis-Konfiguration
- **Basis-URL:** `/api/risk-reviews`
- **Datenbank:** MySQL (`RISK_REVIEWS` Tabelle)

---

## 2. Der Workflow

### A. Review anfordern (Nach Risiko-Erstellung)
Nachdem ein Nutzer ein neues Risiko angelegt hat, sollte ein Button "Review anfordern" erscheinen. Dieser triggert den `POST` Endpunkt.

- **URL:** `POST /api/risk-reviews`
- **Payload:**
```json
{
  "riskId": 1,        // Die ID des soeben erstellten Risikos
  "companyId": 18,    // Die ID der Firma
  "notes": "Bitte dieses neue Risiko prüfen." // Optional
}
```
*Standardmäßig wird der Status auf `READY_FOR_REVIEW` gesetzt.*

---

### B. Kanban Board laden
Um das Board mit allen Karten zu füllen, wird dieser Endpunkt beim Laden der Seite aufgerufen.

- **URL:** `GET /api/risk-reviews?companyId=18`
- **Response:**
```json
[
  {
    "REVIEW_ID": 5,
    "RISK_ID": 1,
    "REVIEW_STATUS": "READY_FOR_REVIEW",
    "REVIEW_NOTES": "Bitte prüfen",
    "CREATED_AT": "2026-05-18T10:00:00.000Z",
    "REVIEWER_ID": null,
    "REVIEWER_ABBR": null
  }
]
```

---

### C. Karten verschieben (Status Update)
Wenn eine Karte im Kanban-Board von einer Spalte in eine andere gezogen wird (Drag & Drop), muss der Status im Backend aktualisiert werden.

- **URL:** `PUT /api/risk-reviews/:reviewId/status`
- **Payload:**
```json
{
  "status": "IN_REVIEW",  // Der neue Status der Spalte
  "reviewerId": 33,       // Optional: ID des Nutzers, der die Karte zieht
  "notes": "Übernehme den Review." // Optional
}
```

---

## 3. Die Kanban Spalten (Enums)

Das Backend erwartet exakt diese Werte für das Feld `status`. Diese sollten als IDs für eure Spalten im Frontend dienen:

| Spalten-Name (UI) | API Status (ID) | Beschreibung |
| :--- | :--- | :--- |
| **Ready for Review** | `READY_FOR_REVIEW` | Warteschlange für neue Anträge. |
| **In Review** | `IN_REVIEW` | Ein Reviewer hat die Arbeit begonnen. |
| **Needs Changes** | `NEEDS_CHANGES` | Der Reviewer hat Rückfragen oder Korrekturwünsche. |
| **Done** | `DONE` | Der Review-Prozess ist abgeschlossen. |

---

## 4. UI-Empfehlungen für das Board

1.  **Karten-Inhalt:** Zeige auf der Karte die `RISK_ID` und den `REVIEWER_ABBR` (falls vorhanden). Da das MySQL-Modell aktuell nur IDs speichert, müsst ihr für den Risiko-Titel eventuell einen Join im Frontend machen oder wir erweitern den GET-Endpunkt später.
2.  **Farbcodierung:**
    - `NEEDS_CHANGES`: Orange/Gelb (Achtung erforderlich)
    - `READY_FOR_REVIEW`: Blau
    - `DONE`: Grün
3.  **Aktionen:** Biete auf der Karte einen Button "Details öffnen", um die `REVIEW_NOTES` zu lesen oder zu bearbeiten.
4.  **Auto-Assign:** Wenn eine Karte von `READY_FOR_REVIEW` nach `IN_REVIEW` geschoben wird, sollte das Frontend automatisch die `reviewerId` des aktuell eingeloggten Nutzers mitsenden.

---

## 5. Fehlerbehandlung
- **404 Not Found:** Die `reviewId` existiert nicht.
- **400 Bad Request:** Der gesendete Status gehört nicht zu den erlaubten Enum-Werten.
