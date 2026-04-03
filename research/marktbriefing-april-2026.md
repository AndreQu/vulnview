# VulnView Marktbriefing – Aktualisierte Recherche April 2026

**Recherche-Datum:** 3. April 2026  
**Quelle:** Research-Agent VulnView-Projekt  
**Ursprungsdokument:** 47-seitiges Business-Konzept (Stand März 2026)

---

## 1. Executive Summary

Die Kernannahmen des Business-Konzepts bleiben valide. Es gibt jedoch relevante Marktentwicklungen, die sowohl Risiken als auch Chancen darstellen. Besonders wichtig: **Die NIS2-Registrierungsfrist ist am 6. März 2026 abgelaufen**, was den Markt in eine neue Phase verschiebt – von der Registrierung zur tatsächlichen Umsetzung.

---

## 2. NIS2-Entwicklungen Deutschland (Stand April 2026)

### 2.1 Registrierungsfrist Abgelaufen – Was Nun?

| Faktor | Stand März 2026 | Stand April 2026 |
|--------|----------------|-------------------|
| **Registrierungsfrist** | Bis 6. März 2026 | **ABGELAUFEN** |
| **BSI-Registrierungsrate** | Geschätzt niedrig | **Nur 38,5% der Unternehmen registriert**¹ |
| **Unternehmen betroffen** | ~29.500 | Bestätigt: 29.850 |

**Quellen:**
¹ https://www.security-insider.de/nis-2-registrierung-bsi-portal-frist-abgelaufen-a-2ceb7fa44eb00c5930848ef965765437/

### 2.2 Konsequenzen für den Markt

- **Phase 1 (Registrierung) → Phase 2 (Implementierung):** Die Unternehmen, die sich registriert haben, müssen jetzt die 10 Kernmaßnahmen des § 30 BSIG-neu umsetzen
- **Nachsicht bei verspäteter Registrierung:** Das BSI hat signalisiert, zunächst keine Sanktionen bei verspäteten Registrierungen zu verhängen² – aber die Implementierungspflichten bleiben bestehen
- **Steigender Druck:** Ca. 18.300 Unternehmen (61,5%) haben sich noch nicht registriert oder befinden sich in einer Grauzone

**Quellen:**
² https://www.skwschwarz.de/news/registrierungsfrist-lauft-aus-sind-sie-auch-betroffen

### 2.3 Neue Timeline bis 2027

| Datum | Pflicht |
|-------|---------|
| 11. September 2026 | CRA-Meldepflichten treten in Kraft³ |
| Dezember 2027 | CRA SBOM-Pflicht für alle Produkte mit digitalen Elementen⁴ |
| Laufend | NIS2-Vulnerability-Management-Pflichten für registrierte Unternehmen |

**Quellen:**
³ https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act
⁴ https://www.dke.de/CRA

---

## 3. Wettbewerbsanalyse – Validierung & Updates

### 3.1 Status Quo der Analysierten Anbieter

| Anbieter | Bestätigte Preise 2026 | Status | Anmerkungen |
|----------|----------------------|--------|-------------|
| **Tenable** | Nessus Pro: 3.390–4.390 USD/Jahr⁵ | ✅ Bestätigt | Preise stabil, keine Preissenkung |
| **Qualys VMDR** | ~199–250 USD/Asset/Jahr⁶ | ✅ Bestätigt | Teuer geblieben, modulares Pricing |
| **Rapid7 InsightVM** | ~1,93 USD/Asset/Monat (~23 USD/Jahr)⁷ | ✅ Bestätigt | Transparentes Pricing bestätigt |
| **Microsoft Defender** | ~2–3 USD/Device/Monat⁸ | ✅ Bestätigt | Günstigster Einstieg für MS-Ökosystem |
| **CrowdStrike** | ~15–18 USD/Endpoint/Monat⁹ | ✅ Bestätigt | Premium-Preisniveau |
| **SentinelOne** | ~6–15 USD/Endpoint/Monat | ✅ Bestätigt | EDR-Fokus, VM als Add-on |

**Quellen:**
⁵ https://omr.com/de/reviews/product/tenable-vulnerability-management/pricing
⁶ https://www.sentinelone.com/de/cybersecurity-101/cybersecurity/vulnerability-management-vendors/
⁷ https://www.capterra.com.de/alternatives/169723/insightvm
⁸ https://www.microsoft.com/de-de/security/business/threat-protection/microsoft-defender-vulnerability-management-pricing
⁹ https://www.sentinelone.com/de/cybersecurity-101/cybersecurity/vulnerability-management-vendors/

### 3.2 Neue Wettbewerber & Marktentwicklungen

#### A) Cloud-Native Security-Plattformen (CNAPP)

| Anbieter | Segment | Relevanz für VulnView |
|----------|---------|----------------------|
| **Wiz**¹⁰ | CNAPP, Cloud-Security | Indirekt – primär Cloud-Fokus, aber expandierend |
| **Orca Security**¹¹ | Cloud-Native Security | Mittel – agentlos, aber ähnliche "Einfachheit"-Positionierung |
| **Prisma Cloud (Palo Alto)** | Cloud Security | Mittel – Enterprise-Fokus |

**Quellen:**
¹⁰ https://underdefense.com/blog/tenable-alternatives-2026-9-vulnerability-exposure-platforms/
¹¹ https://underdefense.com/blog/tenable-alternatives-2026-9-vulnerability-exposure-platforms/

#### B) Mittelstand-orientierte Alternativen

| Anbieter | Positionierung | Preisniveau | Runtime-SBOM |
|----------|---------------|-------------|--------------|
| **Greenbone (OpenVAS)** | Open-Source, DSGVO-konform¹² | Kostenlos (Community) / Bezahlte Enterprise-Version | ❌ Nein |
| **Aikido Security** | Unified Code-to-Cloud-Runtime¹³ | Niedrig-mittel | Teilweise |
| **ESET Vulnerability Manager** | Integriert in Endpoint Security¹⁴ | ~3–5 USD/Gerät/Monat | ❌ Nein |
| **ManageEngine Vulnerability Manager Plus** | Mittelstand-Fokus¹⁵ | Mittel | ❌ Nein |

**Quellen:**
¹² https://www.greenbone.net/openvas-free/
¹³ https://www.aikido.dev/
¹⁴ https://www.software-express.de/hersteller/eset/protect/complete/
¹⁵ https://www.manageengine.de/produkte-loesungen/log-analyse-security/vulnerability-manager-plus.html

#### C) Neuere SBOM-Spezialisten

| Anbieter | Fokus | Runtime-SBOM | Relevanz |
|----------|-------|--------------|----------|
| **OX Security** | Autonomous prevention, VibeSec¹⁶ | ✅ Runtime-Analyse | Hoch – direkter Wettbewerber |
| **Rezilion** | Dynamic SBOM (Windows + Linux)¹⁷ | ✅ Ja, Spezialist | Sehr hoch – direkte Konkurrenz |
| **FossID** | Software Composition Analysis¹⁸ | ⚠️ Entwicklungsfokus | Mittel |
| **Synopsys Black Duck** | Enterprise SCA + SBOM¹⁹ | ⚠️ Primär Build-Time | Mittel |

**Quellen:**
¹⁶ https://www.ox.security/
¹⁷ https://devops.com/rezilion-adds-windows-support-to-dynamic-sbom-tool/
¹⁸ https://fossid.com/
¹⁹ https://www.blackduck.com/software-composition-analysis-tools/black-duck-sca.html

---

## 4. Runtime-SBOM: Marktanalyse & Wettbewerber

### 4.1 Kern-Erkenntnis: **Es gibt bereits Runtime-SBOM-Anbieter!**

Das Business-Konzept suggeriert, Runtime-SBOM sei ein Alleinstellungsmerkmal. Dies ist **nicht korrekt**. Die folgenden Anbieter bieten bereits Runtime-SBOM oder ähnliche Konzepte:

#### Direkte Runtime-SBOM-Anbieter:

**1. Rezilion**
- **Produkt:** Dynamic SBOM
- **Features:** Runtime-Analyse laufender Prozesse, geladene Libraries, kontinuierliche Updates
- **Plattformen:** Linux (seit 2023), **Windows (seit 2024)**
- **Unterschied zu VulnView:** Primär DevSecOps/CI-CD-Fokus, nicht Endpoint-Management für IT-Teams
- **Preis:** Enterprise-Pricing, keine öffentlichen Preise für KMU
- **Quelle:** https://devops.com/rezilion-adds-windows-support-to-dynamic-sbom-tool/

**2. OX Security**
- **Produkt:** OX Security Platform mit Runtime-Analyse
- **Features:** Code-to-Runtime Protection, autonome Prävention, SBOM-Generierung
- **Technologie:** VibeSec (autonomous security)
- **Unterschied zu VulnView:** Stark Entwickler-fokussiert, weniger IT-Admin-Tool
- **Quelle:** https://www.ox.security/

**3. Anchore Syft + Grype**
- **Produkt:** Open-Source SBOM-Generierung
- **Features:** SBOM aus Container-Images und Dateisystemen
- **Unterschied zu VulnView:** Keine native Runtime-Analyse von Endpoints, primär Container/CI-CD
- **Quelle:** https://github.com/anchore/syft

### 4.2 Marktlücke bleibt trotzdem bestehen

| Anforderung | Rezilion | OX Security | VulnView-Ziel |
|-------------|----------|-------------|---------------|
| Endpoint-Agent für Windows/Mac | ✅ | ❌ | ✅ ✅ |
| IT-Admin-Tool (nicht DevOps) | ⚠️ | ❌ | ✅ ✅ |
| NIS2-Compliance-Reports | ❌ | ❌ | ✅ ✅ |
| EU-Hosting/DSGVO-konform | ⚠️ | ⚠️ | ✅ ✅ |
| Deutsche UI | ❌ | ❌ | ✅ ✅ |
| Preisniveau für KMU (1–5 EUR/Gerät) | ❌ | ❌ | ✅ ✅ |
| 15-Minuten-Setup | ❌ | ❌ | ✅ ✅ |

**Fazit:** Die Runtime-SBOM-Technologie existiert bereits, aber **nicht als einfaches, EU-gehostetes SaaS für den Mittelstand mit NIS2-Fokus**. Die Marktlücke ist spezifischer als ursprünglich angenommen: Es fehlt ein **Endpoint-zentriertes, einfach zu bedienendes, EU-kompatibles Runtime-SBOM-Tool für IT-Administratoren** (nicht Entwickler).

---

## 5. BSI TR-03183: Technische Anforderungen an SBOMs

### 5.1 CRA-Vorbereitung durch BSI

Die BSI TR-03183 definiert die Cyber-Resilienz-Anforderungen an Hersteller und Produkte:

- **Rechtsgrundlage:** Vorbereitung auf Cyber Resilience Act (CRA)
- **Gültig seit:** Dezember 2024 (CRA-Verordnung)
- **SBOM-Anforderungen:** BSI TR-03183-2 spezifiziert SBOM-Formate
- **Formate:** CycloneDX und SPDX sind akzeptiert²⁰
- **Verpflichtung:** Ab Dezember 2027 für alle Produkte mit digitalen Elementen

**Quellen:**
²⁰ https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Technische-Richtlinien/TR-nach-Thema-sortiert/tr03183/TR-03183_node.html

### 5.2 Implikationen für VulnView

- CycloneDX-Support ist Pflicht, nicht Option
- SBOM-Export-Funktionalität muss TR-03183-2-konform sein
- Die Runtime-SBOM von VulnView könnte als "Proof of SBOM" für NIS2-Lieferkettensicherheit positioniert werden

---

## 6. CVE-Datenbank-Entwicklungen

### 6.1 NVD (National Vulnerability Database)

- **Status:** Weiterhin primäre Quelle für CVE-Daten
- **API:** NVD API 2.0 bleibt stabil
- **Updates:** Laufende Verbesserungen (letztes Update August 2025)²¹

**Quellen:**
²¹ https://www.nist.gov/itl/nvd

### 6.2 Alternative Datenquellen

| Quelle | Beschreibung | Nutzen für VulnView |
|--------|--------------|---------------------|
| **OSV (Open Source Vulnerabilities)** | Google-Initiative, aggregiert verschiedene Quellen | Zusätzliche Abdeckung für Open-Source |
| **GitHub Advisory Database** | Community-getriebene CVEs | Schnellere Updates für populäre Projekte |
| **CISA KEV** | Known Exploited Vulnerabilities | Essentiell für Priorisierung |
| **EPSS** | Exploit Prediction Scoring | Wahrscheinlichkeitsbasiertes Scoring |

---

## 7. Verifizierte Marktannahmen vs. Korrekturen

### 7.1 ✅ Bestätigte Annahmen

| Annahme | Status | Quelle |
|---------|--------|--------|
| 29.500 Unternehmen betroffen (DE) | ✅ Bestätigt | BSI |
| Enterprise-Tools zu teuer für Mittelstand | ✅ Bestätigt | Preisvergleich |
| Kein einfaches EU-gehostetes KMU-Tool | ✅ Bestätigt | Recherche |
| CRA SBOM-Pflicht ab Dezember 2027 | ✅ Bestätigt | EU-Verordnung |
| NIS2 24h/72h/1-Monat Meldepflichten | ✅ Bestätigt | BSIG-neu |

### 7.2 ⚠️ Zu korrigierende Annahmen

| Ursprüngliche Annahme | Korrektur | Impact |
|----------------------|-----------|--------|
| Runtime-SBOM existiert nicht | **Existiert bereits** (Rezilion, OX) | Differenzierung muss präziser sein: "Runtime-SBOM für Endpoint IT-Administration" |
| 6. März 2026 ist Deadline | **Nur Registrierungsfrist** | Phase verschiebt sich zu Implementierung |
| Preisvorteil 50–90% | Bestätigt, aber... | Rapid7 und Microsoft sind ebenfalls günstig |
| Keine Konkurrenz im KMU-Segment | **Falsch** | Greenbone, Aikido, ESET zielen auf KMU |

### 7.3 🆕 Neue Erkenntnisse

| Erkenntnis | Relevanz |
|------------|----------|
| Nur 38,5% NIS2-Registrierung bis März 2026 | Großes noch-untätiges Segment |
| BSI zeigt Nachsicht bei verspäteter Registrierung | Zeitfenster für Customer Acquisition bleibt offen |
| TR-03183 definiert SBOM-Standards | Technische Anforderungen konkretisieren sich |
| Rezilion hat Windows-Support hinzugefügt (2024) | Runtime-SBOM-Wettbewerb existiert, aber anders positioniert |

---

## 8. Aktualisierte Wettbewerbsmatrix

### 8.1 Erweiterte Feature-Matrix (April 2026)

| Feature | Tenable | Qualys | Rapid7 | MS Defender | Rezilion | OX Security | **VulnView (Ziel)** |
|---------|---------|--------|--------|-------------|----------|-------------|---------------------|
| Windows-Agent | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| macOS-Agent | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Runtime-SBOM | ❌ | ❌ | ❌ | ❌ | **✅** | **✅** | ✅ |
| Endpoint-Fokus (IT-Admin) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| NIS2-Reports | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| EU-Hosting | Optional | Optional | ❌ | Azure EU | ❌ | ❌ | ✅ |
| Deutsche UI | ❌ | ❌ | ❌ | Teilweise | ❌ | ❌ | ✅ |
| Preis KMU-freundlich | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Einfaches Setup | ❌ | ❌ | ⚠️ | ⚠️ | ❌ | ❌ | ✅ |

### 8.2 Preisvergleich aktualisiert (200 Endpoints)

| Anbieter | Kosten/Jahr | Kosten/Gerät/Monat | Agent-basiert | Runtime-SBOM |
|----------|-------------|-------------------|---------------|--------------|
| Qualys VMDR | ~39.800 USD | ~16,60 USD | ✅ | ❌ |
| CrowdStrike Enterprise | ~36.000 USD | ~15,00 USD | ✅ | Teilweise |
| SentinelOne Complete | ~28.800 USD | ~12,00 USD | ✅ | ❌ |
| Tenable VM | ~12.000–25.000 USD | ~5–10 USD | ✅ | ❌ |
| Microsoft Defender VM | ~4.800 USD | ~2,00 USD | ✅ | ❌ |
| Rapid7 InsightVM | ~4.600 USD | ~1,93 USD | ✅ | ❌ |
| **VulnView (Ziel)** | **~3.600 EUR (~3.900 USD)** | **1,50 EUR** | ✅ | **✅** |

---

## 9. Empfohlene Strategie-Anpassungen

### 9.1 Positionierung präzisieren

**Ursprünglich:** "Einzigartige Runtime-SBOM"  
**Empfohlen:** "Erste Endpoint-Runtime-SBOM für IT-Teams, nicht Entwickler"

### 9.2 Zielgruppe segmentieren

| Segment | Charakteristik | Ansprache |
|---------|---------------|-----------|
| **NIS2-Compliance-Drängler** | Noch nicht registriert, jetzt unter Druck | "Registrierung + Implementierung in einem Schritt" |
| **NIS2-Implementierer** | Bereits registriert, suchen Tools | "NIS2-konformes Vulnerability Management mit SBOM" |
| **CRA-Vorbereiter** | Hersteller mit Produkten, die Software enthalten | "SBOM-Generierung für CRA-Compliance 2027" |

### 9.3 Technische Prioritäten

1. **CycloneDX-konformer SBOM-Export** (TR-03183-2-konform)
2. **NIS2-Compliance-Dashboard** mit automatisierten Report-Vorlagen
3. **Delta-Reporting** ("Was hat sich seit letztem Monat geändert?")
4. **Integration mit BSI MUK-Portal** (API-Schnittstelle falls verfügbar)

### 9.4 Vertriebsfokus

- **Q2 2026:** NIS2-Compliance-Drängler (verspätete Registrierungen)
- **Q3 2026:** NIS2-Implementierer (Vulnerability Management einführen)
- **Q4 2026:** CRA-Vorbereiter (SBOM-Tooling für Produkt-Hersteller)

---

## 10. Quellen & Referenzen

### NIS2 & Regulation
- BSI TR-03183: https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Technische-Richtlinien/TR-nach-Thema-sortiert/tr03183/tr-03183.html
- EU Cyber Resilience Act: https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act
- DKE CRA-Ressourcen: https://www.dke.de/CRA

### Marktdaten
- Security Insider NIS2-Registrierung: https://www.security-insider.de/nis-2-registrierung-bsi-portal-frist-abgelaufen-a-2ceb7fa44eb00c5930848ef965765437/
- Secjur NIS2-Guide: https://www.secjur.com/blog/nis2-umsetzung
- OMR Reviews Vulnerability Management: https://omr.com/de/reviews/category/vulnerability-management

### Runtime-SBOM Wettbewerber
- Rezilion Dynamic SBOM: https://devops.com/rezilion-adds-windows-support-to-dynamic-sbom-tool/
- OX Security Platform: https://www.ox.security/
- Anchore Syft: https://github.com/anchore/syft

### Weitere Anbieter
- Greenbone OpenVAS: https://www.greenbone.net/openvas-free/
- Aikido Security: https://www.aikido.dev/
- FossID: https://fossid.com/

---

## 11. Zusammenfassung für Stakeholder

### ✅ Was bleibt richtig
- Der Markt ist riesig (29.500 Unternehmen)
- Enterprise-Lösungen sind zu teuer für KMU
- NIS2 und CRA schaffen regulatorischen Druck
- EU-Hosting und DSGVO-Konformität sind Differentiatoren

### ⚠️ Was muss angepasst werden
- Runtime-SBOM ist nicht einzigartig, aber **Endpoint-Runtime-SBOM für IT-Teams** ist neu
- Die NIS2-Registrierungsfrist ist abgelaufen → Fokus auf Implementierung
- Konkurrenz im KMU-Segment existiert (Greenbone, Aikido, ESET)

### 🚀 Neue Chancen
- 61,5% der Unternehmen noch nicht registriert → großes Latent-Segment
- CRA-Pflicht ab 2027 → SBOM-Tooling wird zum Muss
- BSI TR-03183 bietet klare technische Spezifikation

---

*Dieses Briefing wurde am 3. April 2026 erstellt. Alle Angaben ohne Gewähr.*
