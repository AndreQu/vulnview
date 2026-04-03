# Zusammenfassung: VulnView Marktrecherche – Executive Summary

**Datum:** 3. April 2026  
**Recherche-Agent:** Frau Research  
**Ziel:** Validierung der Marktannahmen aus dem 47-seitigen Business-Konzept

---

## 🎯 Kernaussagen

### 1. NIS2-Entwicklung: Phase verschoben
- **Die NIS2-Registrierungsfrist ist am 6. März 2026 abgelaufen**
- Nur **38,5% der betroffenen Unternehmen** (29.850 insgesamt) haben sich registriert
- **~18.300 Unternehmen** sind noch nicht registriert oder im Verzug
- BSI zeigt Nachsicht bei verspäteter Registrierung (keine sofortigen Sanktionen)
- **Neue Phase:** Von "Registrierung" zu "tatsächlicher Umsetzung" der 10 Kernmaßnahmen

### 2. Runtime-SBOM: Existiert bereits, aber...

**Wichtige Korrektur:** Runtime-SBOM ist **NICHT** einzigartig. Folgende Anbieter bieten es bereits:

| Anbieter | Runtime-SBOM | Plattformen | Fokus |
|----------|--------------|-------------|-------|
| **Rezilion** | ✅ Ja | Linux, Windows (seit 2024) | DevSecOps, CI/CD |
| **OX Security** | ✅ Ja | Cloud-Native | Entwickler, Autonomous Security |
| **Anchore Syft** | ⚠️ Teilweise | Container, Dateisystem | Container-Security |

**ABER:** Keiner dieser Anbieter zielt auf **IT-Administratoren im Mittelstand** ab. Die Marktlücke ist spezifischer:
- Keine einfache 15-Minuten-Installation
- Keine NIS2-Compliance-Reports
- Keine deutsche UI
- Kein EU-Hosting für KMU-Preise
- Kein Endpoint-Management-Fokus

### 3. Wettbewerbsanalyse: Bestätigt mit Feinabstimmung

**Preise 2026 (200 Endpoints):**

| Anbieter | Preis/Jahr | Runtime-SBOM |
|----------|-----------|--------------|
| Qualys VMDR | ~40.000 USD | ❌ |
| CrowdStrike | ~36.000 USD | Teilweise |
| SentinelOne | ~29.000 USD | ❌ |
| Tenable VM | ~12.000–25.000 USD | ❌ |
| Microsoft Defender | ~4.800 USD | ❌ |
| Rapid7 InsightVM | ~4.600 USD | ❌ |
| **VulnView (Ziel)** | **~3.600 EUR** | **✅** |

**Günstige Konkurrenz existiert:** Rapid7 und Microsoft Defender sind preislich ähnlich, aber ohne Runtime-SBOM und EU-First-Ansatz.

**Neue KMU-Konkurrenten identifiziert:**
- Greenbone OpenVAS (Open Source, kostenlos)
- Aikido Security (Unified Security, niedriger Preis)
- ESET Vulnerability Manager (integriert in Endpoint)
- ManageEngine Vulnerability Manager Plus (Mittelstand-Fokus)

Keiner bietet jedoch die Kombination: **Runtime-SBOM + NIS2-Reports + EU-Hosting + Deutsche UI + KMU-Preise**

### 4. CRA (Cyber Resilience Act): Neue Deadline 2027

- **SBOM-Pflicht** für alle Produkte mit digitalen Elementen ab **Dezember 2027**
- **BSI TR-03183** definiert die technischen Anforderungen (CycloneDX/SPDX)
- Meldepflichten ab **11. September 2026**

Dies erweitert den Markt von reinen NIS2-Betroffenen auf **alle Software-Hersteller** in der EU.

---

## 📊 Empfohlene Strategie-Updates

### Positionierung präzisieren

**Von:** "Einzigartige Runtime-SBOM"  
**Zu:** "Erste Runtime-SBOM speziell für IT-Teams, nicht Entwickler – mit NIS2-Compliance-Ready-Reports"

### Zielgruppen-Segmentierung

| Segment | Status | Ansprache |
|---------|--------|-----------|
| NIS2-Drängler | ~18.300 Unternehmen nicht registriert | "Hol-Ab-Tool für verspätete Compliance" |
| NIS2-Implementierer | ~11.500 registriert, suchen Tools | "Einfachstes Vulnerability Management mit SBOM" |
| CRA-Vorbereiter | Alle Software-Hersteller | "SBOM-Automatisierung für 2027" |

### Technische Prioritäten (neu)

1. **CycloneDX-Export** (TR-03183-2-konform für CRA)
2. **NIS2-Compliance-Dashboard** mit Report-Vorlagen
3. **Delta-Reporting** ("Was hat sich seit letztem Scan geändert?")
4. **Integration mit BSI MUK-Portal** (falls API verfügbar)

---

## ✅ Validierung der Kernannahmen

| Annahme | Status | Kommentar |
|---------|--------|-----------|
| 29.500 Unternehmen betroffen (DE) | ✅ Bestätigt | Exakte Zahl: 29.850 |
| Enterprise-Tools zu teuer für Mittelstand | ✅ Bestätigt | 50–90% Preisvorteil realistisch |
| Runtime-SBOM existiert nicht | ⚠️ Korrigiert | Existiert, aber nicht für IT-Teams |
| EU-Hosting ist Differenzierer | ✅ Bestätigt | Azure EU hat US-Ursprung |
| NIS2 schafft regulatorischen Druck | ✅ Bestätigt | Phase jetzt: Implementierung |

---

## 📁 Erstellte Dateien

1. **`marktbriefing-april-2026.md`** – Vollständige Recherche mit Quellen, Tabellen, Analysen
2. **`executive-summary.md`** (diese Datei) – Kurzversion für Entscheider

---

## 🔗 Wichtige Quellen

- BSI TR-03183: https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Technische-Richtlinien/TR-nach-Thema-sortiert/tr03183/tr-03183.html
- NIS2-Registrierungsstatus: https://www.security-insider.de/nis-2-registrierung-bsi-portal-frist-abgelaufen-a-2ceb7fa44eb00c5930848ef965765437/
- Rezilion Dynamic SBOM: https://devops.com/rezilion-adds-windows-support-to-dynamic-sbom-tool/
- EU Cyber Resilience Act: https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act

---

**Gesamtergebnis:** Die Marktlücke existiert weiterhin, aber die Positionierung muss präzisiert werden. Der Fokus sollte auf "IT-Admin-Tool mit Runtime-SBOM" statt "einzigartige Runtime-SBOM" liegen. Die NIS2-Phase hat sich von "Registrierung" zu "Implementierung" verschoben, was die Messaging anpassen muss.

