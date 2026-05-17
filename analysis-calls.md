# GRC Analytics - Frontend Integration & Visualization Guide

Dieses Dokument beschreibt, wie die neuen Analytics-Daten für Risks (Risiken) und Controls (Kontrollen) im Frontend aufgerufen und optimal visualisiert werden sollten.

---

## 1. Risikomanagement (Risks)

### A. Risk Heatmap (Matrix)
- **Endpoint:** `GET /api/risks/analytics/matrix?companyId=1` oder GQL `riskMatrix`
- **Datenformat:** `[{ "key": "high/critical", "count": 5 }, ...]`
- **Darstellung:** **Heatmap / Grid (4x4 oder 5x5)**
    - Die X-Achse ist `Likelihood`, die Y-Achse `Impact`.
    - Zerlege den `key` am Slash (`split('/')`), um die Koordinate in der Matrix zu finden.
    - Färbe die Zellen basierend auf dem Risiko-Level (Rot für High/Critical, Gelb für Medium, Grün für Low).

### B. Risk Treatment Strategie
- **Endpoint:** `GET /api/risks/analytics/by-treatment` oder GQL `risksByTreatment`
- **Datenformat:** `[{ "key": "mitigate", "count": 12 }, { "key": "accept", "count": 3 }]`
- **Darstellung:** **Pie Chart oder Donut Chart**
    - Zeigt auf einen Blick, wie viele Risiken aktiv behandelt werden vs. wie viele nur akzeptiert werden.

### C. Risk Reduction (Score Summary)
- **Endpoint:** `GET /api/risks/analytics/score-summary` oder GQL `riskScoreSummary`
- **Datenformat:** `{ "avgInherentScore": 18.5, "avgResidualScore": 8.2, "reductionPercentage": 55.6 }`
- **Darstellung:** **Radial Gauge oder Dashboard Cards**
    - Nutze zwei große Karten für die Scores und ein Prozent-Badge für die `reductionPercentage`.
    - Ein Balkendiagramm (Inherent vs. Residual) nebeneinander visualisiert den Sicherheitsgewinn der Kontrollen sehr gut.

### D. Compliance Monitor (Overdue Reviews)
- **Endpoint:** `GET /api/risks/analytics/overdue` oder GQL `overdueRiskReviews`
- **Datenformat:** Array von vollständigen Risk-Objekten.
- **Darstellung:** **Action List / Data Table**
    - Zeige diese Daten in einer speziellen "Urgent"-Sektion an.
    - Spalten: Risk Title, Owner, Review Date (rot markiert).

---

## 2. Kontroll-Management (Controls)

### A. Control Effectiveness (Wirksamkeit)
- **Endpoint:** `GET /api/controls/analytics/by-effectiveness` oder GQL `controlsByEffectiveness`
- **Datenformat:** `[{ "key": "effective", "count": 40 }, { "key": "ineffective", "count": 2 }]`
- **Darstellung:** **Stacked Bar Chart oder Donut Chart**
    - Kritischer KPI: Der Anteil an "ineffective" Kontrollen sollte im Dashboard rot hervorgehoben werden.

### B. Automatisierungsgrad
- **Endpoint:** `GET /api/controls/analytics/by-automation` oder GQL `controlsByAutomation`
- **Datenformat:** `[{ "key": "manual", "count": 10 }, { "key": "fully-automated", "count": 25 }]`
- **Darstellung:** **Horizontal Bar Chart**
    - Hilft dem Management zu sehen, wie weit die digitale Transformation der Sicherheit fortgeschritten ist.

### C. Framework Compliance (ISO 27001, etc.)
- **Endpoint:** `GET /api/controls/analytics/by-framework` oder GQL `controlsByFramework`
- **Datenformat:** `[{ "key": "ISO27001", "count": 45 }, { "key": "GDPR", "count": 12 }]`
- **Darstellung:** **Radar Chart (Netzdiagramm) oder Bar Chart**
    - Ein Radar Chart zeigt sehr gut, in welchen Frameworks das Unternehmen stark aufgestellt ist und wo es Lücken gibt.

---

## 3. Implementierungs-Tipp (React + Recharts)

Hier ein Beispiel, wie man den `key` der Risk Matrix für ein Grid aufbereitet:

```typescript
const mapMatrixData = (apiData) => {
  const grid = {};
  apiData.forEach(item => {
    const [impact, likelihood] = item.key.split('/');
    if (!grid[impact]) grid[impact] = {};
    grid[impact][likelihood] = item.count;
  });
  return grid;
};

// Verwendung: grid['high']['critical'] -> liefert die Anzahl
```

## 4. Caching-Hinweis
Die Daten werden im Backend für **5 Minuten** in Redis zwischengespeichert. Das Frontend muss also keinen eigenen Cache implementieren, sollte aber bei manuellen "Refresh"-Buttons einen harten Neuladen des Dashboards triggern.
