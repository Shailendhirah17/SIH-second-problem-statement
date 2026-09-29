# 🌿 Kwatha-in-a-Pod™ (AyurBrew OS)
### Smart India Hackathon 2026 • Problem Statement #SIH26048

[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://www.sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-Traditional%20Knowledge%20%2F%20MedTech-emerald.svg)]()
[![Category](https://img.shields.io/badge/Category-Hardware-blue.svg)]()
[![Team](https://img.shields.io/badge/Team-The%20Iron%20Logic%20(%23138890)-red.svg)]()
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]()

> **A pod-based countertop appliance that brews one fresh, pharmacopoeia-standard Ayurvedic decoction (Kashaya / Kadha) on demand.**

---

## 📌 Problem Overview & Challenge
* **The Problem:** Classical Ayurvedic decoctions (*Kwatha / Kashaya*) are therapeutically potent only when freshly brewed, but manual preparation is laborious—requiring precise coarse herb ratios (1:16 *Jala*), mild simmering, and slow reduction to exactly one-fourth volume (taking 2 to 3 hours).
* **The Market Gap:** Modern consumers and hospitals fall back on packaged, shelf-stable commercial concentrates loaded with chemical preservatives, which degrade thermolabile bioactives and lose therapeutic efficacy.
* **Our Solution:** **Kwatha-in-a-Pod™** accelerates the reduction cycle from **180 minutes to 12 minutes** at a sacred **85°C–90°C** thermal threshold using wide-surface evaporation, laminar vapor removal, and dual closed-loop sensors (HX711 24-bit mass reduction + optical Brix density verification).

---

## ⚡ Key System Features

### 1. 📟 Countertop Touchscreen HMI OS
* **NFC Smart Pod Bay:** Auto-detects single-dose *Yavakuta Churna* pods and configures the boiling profile to match the *Ayurvedic Formulary of India (AFI)* monograph.
* **Live Animated Fluidic Schematic:** Real-time visual monitoring of water reservoir, pump, induction heating ring, shallow evaporation chamber, vapor blower, stirring loop, and 50μ SS316 filter.
* **Real-time Telemetry:** Closed-loop monitoring of chamber temperature (°C), liquid mass (400g $\rightarrow$ 100g 1/4th reduction), extract density (°Bx), and vapor exhaust flow (CFM).
* **Synthesized Tactile Audio:** Built-in Web Audio API sound effects for mechanical pod locking, gentle simmering, and completion chime.

### 2. 📱 AyurSync™ Telehealth & Clinic Companion
* **Vaidya Prescription Portal:** Doctors can evaluate patient *Dosha Prakriti*, select formulations, specify dosage timing (*Pratah/Sayam*), and transmit IoT brewing protocols directly to the appliance.
* **Patient Compliance Tracker:** 7-day intake calendar, symptom tracking, and pyrexia resolution charts.
* **Farm-to-Cup Provenance:** Batch traceability, DNA barcoding authentication, and PCIM&H / AIIA Certificate of Analysis (CoA) verification.

### 3. 🔬 Pharmacopoeia & HPTLC Validation Lab
* **Phytochemical Fingerprint Overlay:** High-Performance Thin-Layer Chromatography (HPTLC) analysis comparing traditional 3-hour open-vessel decoctions against KwathaPod's 12-minute cycle with a **98.8% Pearson correlation match**.
* **Preservation of Thermolabile Bioactives:** Explains why high-pressure espresso extraction destroys delicate herbal actives (e.g. *Tinosporide*, *Eugenol*, *Gingerols*) and why KwathaPod's mild open-pan evaporation is strictly required.

### 4. 🛠️ Hardware Architecture & Embedded Firmware
* **Microcontroller:** ESP32-S3 Dual-Core 240MHz (FreeRTOS).
* **Sensors:** HX711 24-bit strain gauge bridge, NTC 10K thermistor, in-line optical refractometric sensor.
* **Actuators:** 800W induction ring with PID Triac Solid-State Relay, 12V high-CFM vapor exhaust blower, 12V food-grade peristaltic recirculation pump, and SS316 food-safe solenoid valve.
* **Firmware:** Complete Arduino C++ sketch (`KwathaPod_ESP32_Firmware.ino`) with PID control and dry-run safety cutoffs.

---

## 🌿 Standard Formulations Supported

| Formulation | Classical Reference | Lead Botanical Actives | Target Temp | Volume Reduction |
| :--- | :--- | :--- | :---: | :---: |
| **Amruthotharam Kashayam** | AFI Part-I 4:2 (*Sahasrayogam*) | Guduchi, Haritaki, Shunti | 88°C | 400 mL $\rightarrow$ 100 mL (4.8°Bx) |
| **Dashamoola Kashayam** | AFI Part-I 4:12 (*Sharngadhara*) | 10 Sacred Roots (*Brihat & Laghu*) | 89°C | 420 mL $\rightarrow$ 105 mL (5.3°Bx) |
| **Mahasudarshana Kadha** | AFI Part-II 4:18 (*Bhaishajya Ratnavali*) | Chirayata, Katuki, Triphala | 86°C | 450 mL $\rightarrow$ 110 mL (6.2°Bx) |
| **Ayush Kwath (Giloy & Tulsi)**| AYUSH Ministry Standardized | Tulsi, Dalchini, Shunti, Maricha | 85°C | 360 mL $\rightarrow$ 90 mL (3.9°Bx) |
| **Varanadi Kashayam** | AFI Part-I 4:26 (*Ashtanga Hridaya*) | Varana, Chitraka, Shatavari | 88°C | 400 mL $\rightarrow$ 100 mL (5.1°Bx) |

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [npm](https://www.npmjs.com/)

### Installation & Local Run
```bash
# 1. Clone the repository
git clone git@github.com:Shailendhirah17/SIH-second-problem-statement.git
cd SIH-second-problem-statement

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

### Building for Production
```bash
npm run build
```

---

## 👥 Team Information
* **Team Name:** The Iron Logic
* **Team ID:** 138890
* **Hackathon:** Smart India Hackathon (SIH) 2026
* **Problem Statement ID:** SIH26048

---

## 📜 References & Regulatory Standards
1. *Ayurvedic Formulary of India (AFI)*, Parts I-III: Kwatha preparation ratios.
2. *Ayurvedic Pharmacopoeia of India (API)*: Botanical powder grades, extraction standards.
3. *Sharngadhara Samhita*: Kashaya Kalpana (Madhyama Khanda 2/1-2).
4. *Pharmacopoeia Commission for Indian Medicine & Homoeopathy (PCIM&H)* & *All India Institute of Ayurveda (AIIA)* standards.
