import React, { useState } from "react";
import { 
  User, Calendar, Stethoscope, CheckCircle, Clock, ShieldCheck, 
  Send, QrCode, FileText, AlertCircle, ShoppingBag, Award, 
  TrendingDown, HeartPulse, Check, Sparkles, ExternalLink
} from "lucide-react";
import { FORMULATIONS } from "../data/formulations";
import { sounds } from "../utils/audio";

export default function AyurSyncPortal({ onSendPrescriptionToBrew }) {
  const [activeTab, setActiveTab] = useState("doctor"); // "doctor" | "patient" | "traceability"
  const [prescribedFormulation, setPrescribedFormulation] = useState(FORMULATIONS[0].id);
  const [patientName, setPatientName] = useState("Rajesh Sharma");
  const [patientPrakriti, setPatientPrakriti] = useState("Vata-Pitta");
  const [dosageTime, setDosageTime] = useState("pratah_sayam"); // "pratah" | "sayam" | "pratah_sayam"
  const [doseVolume, setDoseVolume] = useState("100");
  const [courseDays, setCourseDays] = useState("7");
  const [prescriptionSent, setPrescriptionSent] = useState(false);

  // Patient compliance calendar state
  const [complianceLogs, setComplianceLogs] = useState([
    { day: "Mon", morning: true, evening: true },
    { day: "Tue", morning: true, evening: true },
    { day: "Wed", morning: true, evening: true },
    { day: "Thu", morning: true, evening: false },
    { day: "Fri", morning: true, evening: true },
    { day: "Sat", morning: true, evening: true },
    { day: "Sun (Today)", morning: true, evening: false }
  ]);

  const handleSendPrescription = (e) => {
    e.preventDefault();
    sounds.playCompleteChime();
    setPrescriptionSent(true);
    if (onSendPrescriptionToBrew) {
      onSendPrescriptionToBrew(prescribedFormulation);
    }
    setTimeout(() => setPrescriptionSent(false), 4000);
  };

  const selectedFormulationObj = FORMULATIONS.find(f => f.id === prescribedFormulation) || FORMULATIONS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Portal Top Navigation Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        background: "var(--bg-surface)",
        padding: "12px 20px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #227c6c, #2fa893)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff"
          }}>
            <HeartPulse size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>AyurSync™ Telehealth & Clinic Companion</h2>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              AFI/API Pharmacopoeial IoT Connectivity • Doctor to Appliance Protocol
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div style={{ display: "flex", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "10px" }}>
          <button
            onClick={() => { sounds.playBeep(600, "sine", 0.05); setActiveTab("doctor"); }}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: activeTab === "doctor" ? "var(--herbal-primary)" : "transparent",
              color: activeTab === "doctor" ? "#fff" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Stethoscope size={15} />
            <span>Vaidya / Clinic Portal</span>
          </button>

          <button
            onClick={() => { sounds.playBeep(600, "sine", 0.05); setActiveTab("patient"); }}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: activeTab === "patient" ? "var(--copper-primary)" : "transparent",
              color: activeTab === "patient" ? "#fff" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <User size={15} />
            <span>Patient App & Dosage</span>
          </button>

          <button
            onClick={() => { sounds.playBeep(600, "sine", 0.05); setActiveTab("traceability"); }}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: activeTab === "traceability" ? "var(--saffron-primary)" : "transparent",
              color: activeTab === "traceability" ? "#1f1f1f" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Award size={15} />
            <span>Farm-to-Cup Traceability</span>
          </button>
        </div>
      </div>

      {/* 1. VAIDYA / CLINIC PORTAL TAB */}
      {activeTab === "doctor" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
          
          {/* Prescription Form */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Stethoscope size={18} color="var(--herbal-bright)" />
              <h3 style={{ fontSize: "1.1rem" }}>Prescribe Pharmacopoeia Decoction</h3>
            </div>

            <form onSubmit={handleSendPrescription} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                    PATIENT NAME & ID
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "#fff",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                    DOSHA PRAKRITI ASSESSMENT
                  </label>
                  <select
                    value={patientPrakriti}
                    onChange={(e) => setPatientPrakriti(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "#fff",
                      fontSize: "0.9rem"
                    }}
                  >
                    <option value="Vata-Pitta">Vata-Pitta (Predominant Heat & Air)</option>
                    <option value="Pitta-Kapha">Pitta-Kapha (Inflammatory & Fluid)</option>
                    <option value="Kapha-Vata">Kapha-Vata (Congestion & Sluggish)</option>
                    <option value="Tridoshaja">Tridoshaja Sama Prakriti</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                  AYURVEDIC FORMULARY OF INDIA (AFI) FORMULATION
                </label>
                <select
                  value={prescribedFormulation}
                  onChange={(e) => setPrescribedFormulation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    color: "#fff",
                    fontSize: "0.9rem"
                  }}
                >
                  {FORMULATIONS.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.afiReference}) — {f.category}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                    DOSAGE TIMING (KALA)
                  </label>
                  <select
                    value={dosageTime}
                    onChange={(e) => setDosageTime(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "#fff",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="pratah">Pratah (Morning 6:30 AM)</option>
                    <option value="sayam">Sayam (Evening 6:00 PM)</option>
                    <option value="pratah_sayam">Bid (Morning & Evening)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                    YIELD VOLUME
                  </label>
                  <select
                    value={doseVolume}
                    onChange={(e) => setDoseVolume(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "#fff",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="60">60 mL (Concentrated)</option>
                    <option value="100">100 mL (Classical API)</option>
                    <option value="150">150 mL (Mild / Pediatric)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                    COURSE DURATION
                  </label>
                  <select
                    value={courseDays}
                    onChange={(e) => setCourseDays(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "#fff",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="5">5 Days Course (10 Pods)</option>
                    <option value="7">7 Days Course (14 Pods)</option>
                    <option value="14">14 Days Course (28 Pods)</option>
                    <option value="21">21 Days Rasayana (42 Pods)</option>
                  </select>
                </div>
              </div>

              {/* Anupana notes generated from formulation */}
              <div style={{
                padding: "10px 14px",
                background: "rgba(34, 124, 108, 0.12)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(34, 124, 108, 0.3)",
                fontSize: "0.8rem",
                color: "#6ee7b7"
              }}>
                🍯 <strong>Vaidya Advice:</strong> Patient advised {selectedFormulationObj.indications}. Instruct patient to consume warm at ~45°C. Recommended Anupana: {selectedFormulationObj.anupana}.
              </div>

              {/* Submit Prescription to Appliance */}
              <button
                type="submit"
                style={{
                  padding: "12px 20px",
                  background: prescriptionSent 
                    ? "linear-gradient(135deg, #15803d, #22c55e)" 
                    : "linear-gradient(135deg, #227c6c, #2fa893)",
                  color: "#fff",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 15px rgba(34, 124, 108, 0.4)"
                }}
              >
                {prescriptionSent ? <CheckCircle size={18} /> : <Send size={18} />}
                <span>{prescriptionSent ? "PRESCRIPTION TRANSMITTED TO APPLIANCE!" : "TRANSMIT IOT BREW PROTOCOL TO PATIENT APPLIANCE"}</span>
              </button>
            </form>
          </div>

          {/* Right: Active IoT Appliance Sync Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="glass-panel" style={{ padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>PATIENT APPLIANCE LINK</h4>
                <span className="badge badge-herbal">LIVE CONNECTED</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Appliance Node ID:</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "#fff" }}>KW-ESP32-9481</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Registered Patient:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{patientName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Active Pod Formulation:</span>
                  <span style={{ color: "var(--copper-bright)" }}>{selectedFormulationObj.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Chamber Temp Calibration:</span>
                  <span style={{ color: "#34d399" }}>88.0°C ±0.2 (PID OK)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Load-Cell Tare Status:</span>
                  <span style={{ color: "#38bdf8" }}>0.0g (Calibrated)</span>
                </div>
              </div>

              <div style={{
                marginTop: "16px",
                padding: "12px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "var(--radius-sm)",
                border: "1px dashed var(--border-subtle)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "4px" }}>
                  DIGITAL PRESCRIPTION TOKEN
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "var(--oled-cyan)",
                  wordBreak: "break-all"
                }}>
                  RX-AFI-2026-{selectedFormulationObj.id.toUpperCase()}-DOS7
                </div>
              </div>
            </div>

            {/* Quick Prescriptions Preset */}
            <div className="glass-panel" style={{ padding: "18px" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "10px" }}>
                COMMON CLINICAL PROTOCOLS
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { name: "Viral Pyrexia / Dengue Care", pod: "amruthotharam", days: "5 Days • 100mL bid" },
                  { name: "Post-Viral Fatigue & Cough", pod: "dashamoola", days: "7 Days • 100mL morning" },
                  { name: "Hepatic Sluggishness / Bilious", pod: "mahasudarshana", days: "7 Days • 60mL before meals" }
                ].map((proto, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setPrescribedFormulation(proto.pod);
                      sounds.playBeep(750, "sine", 0.04);
                    }}
                    style={{
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{proto.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{proto.days}</div>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--herbal-bright)" }}>Apply</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. PATIENT APP & DOSAGE TRACKER TAB */}
      {activeTab === "patient" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
          
          {/* Patient 7-Day Compliance Tracker */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem" }}>My Ayurvedic Course Schedule</h3>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                  Current Prescribed Decoction: <strong style={{ color: "var(--copper-bright)" }}>{selectedFormulationObj.name}</strong>
                </div>
              </div>
              <span className="badge badge-copper">Day 7 of 7</span>
            </div>

            {/* Daily grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "20px" }}>
              {complianceLogs.map((item, idx) => (
                <div key={idx} style={{
                  padding: "10px 6px",
                  background: idx === 6 ? "rgba(200, 106, 59, 0.15)" : "rgba(255,255,255,0.03)",
                  border: idx === 6 ? "1px solid var(--copper-primary)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: idx === 6 ? "#fff" : "var(--text-dim)", marginBottom: "6px" }}>
                    {item.day}
                  </div>
                  
                  {/* Morning Dose Status */}
                  <div style={{
                    fontSize: "0.65rem",
                    padding: "3px 0",
                    background: item.morning ? "rgba(34, 197, 94, 0.2)" : "rgba(244, 63, 94, 0.15)",
                    color: item.morning ? "#4ade80" : "#fb7185",
                    borderRadius: "4px",
                    marginBottom: "4px",
                    fontWeight: 600
                  }}>
                    {item.morning ? "AM ✓" : "AM ✗"}
                  </div>

                  {/* Evening Dose Status */}
                  <div style={{
                    fontSize: "0.65rem",
                    padding: "3px 0",
                    background: item.evening ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.15)",
                    color: item.evening ? "#4ade80" : "#fde047",
                    borderRadius: "4px",
                    fontWeight: 600
                  }}>
                    {item.evening ? "PM ✓" : (idx === 6 ? "DUE" : "PM ✗")}
                  </div>
                </div>
              ))}
            </div>

            {/* Health Vitals Outcome Trend */}
            <div style={{
              background: "#0c1115",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingDown size={16} color="#34d399" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Clinical Recovery Curve (Body Temp & Pyrexia)</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#34d399" }}>Normalized: 98.4°F</span>
              </div>

              {/* Simple SVG Chart */}
              <svg viewBox="0 0 400 80" style={{ width: "100%", height: "80px" }}>
                {/* Reference line */}
                <line x1="20" y1="65" x2="380" y2="65" stroke="#334155" strokeDasharray="3 3" />
                <text x="385" y="68" fill="#64748b" fontSize="8">98.4°F</text>
                
                {/* Trend line: Day 1 (102°F) to Day 7 (98.4°F) */}
                <path 
                  d="M 30 15 Q 120 25, 200 45 T 370 65" 
                  fill="none" 
                  stroke="url(#trendGrad)" 
                  strokeWidth="3" 
                />
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle cx="30" cy="15" r="4" fill="#f43f5e" />
                <circle cx="150" cy="35" r="4" fill="#f59e0b" />
                <circle cx="370" cy="65" r="4" fill="#10b981" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "4px" }}>
                <span>Day 1: 101.8°F (Fever onset)</span>
                <span>Day 4: 99.4°F (Pachana stage)</span>
                <span>Day 7: 98.4°F (Apyrexia achieved)</span>
              </div>
            </div>

            {/* Preparation Instructions Card */}
            <div style={{
              marginTop: "16px",
              padding: "12px 14px",
              background: "rgba(200, 106, 59, 0.1)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-copper)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                  Evening Dose Due at 6:00 PM
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Fresh brew takes only 12 minutes. Insert pod and press Start.
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playBrewStart();
                  if (onSendPrescriptionToBrew) onSendPrescriptionToBrew(selectedFormulationObj.id);
                }}
                style={{
                  padding: "10px 16px",
                  background: "var(--copper-primary)",
                  color: "#fff",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>Brew Now On Appliance</span>
              </button>
            </div>
          </div>

          {/* Smart Pantry & Pod Inventory */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="glass-panel" style={{ padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShoppingBag size={18} color="var(--saffron-primary)" />
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>SMART POD PANTRY</h4>
                </div>
                <span className="badge badge-saffron">Auto-Restock</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { name: "Amruthotharam Kashayam", left: 2, total: 10, status: "Low - Order Soon", warn: true },
                  { name: "Ayush Kwath (Giloy Tulsi)", left: 8, total: 10, status: "Adequate", warn: false },
                  { name: "Dashamoola Kashayam", left: 6, total: 10, status: "Adequate", warn: false }
                ].map((p, i) => (
                  <div key={i} style={{
                    padding: "10px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                    border: p.warn ? "1px solid rgba(234, 179, 8, 0.4)" : "1px solid var(--border-subtle)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>
                      <span>{p.name}</span>
                      <span style={{ color: p.warn ? "#facc15" : "#34d399" }}>{p.left}/{p.total} Pods</span>
                    </div>
                    <div style={{
                      height: "4px",
                      width: "100%",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "2px",
                      margin: "6px 0",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${(p.left / p.total) * 100}%`,
                        background: p.warn ? "#facc15" : "#34d399"
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-dim)" }}>
                      <span>{p.status}</span>
                      {p.warn && <span style={{ color: "var(--copper-bright)", cursor: "pointer", fontWeight: 600 }}>Reorder Pack</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ayurvedic Wellness Tip */}
            <div className="glass-panel" style={{ padding: "16px", borderLeft: "3px solid var(--saffron-primary)" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--saffron-bright)", marginBottom: "4px" }}>
                🌿 Ritucharya Seasonal Guidance
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                During seasonal transitions (Ritusandhi), digestive fire (Agni) fluctuates. Drinking fresh, warm Kashaya 30 minutes before breakfast ignites Jatharagni and purges accumulated Ama (metabolic toxins).
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 3. FARM-TO-CUP BOTANICAL TRACEABILITY TAB */}
      {activeTab === "traceability" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px" }}>
          
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <QrCode size={20} color="var(--saffron-bright)" />
                <div>
                  <h3 style={{ fontSize: "1.1rem" }}>Botanical Verification & Provenance</h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Batch: {selectedFormulationObj.batchNumber} • NFC UID: {selectedFormulationObj.podNfcUid}
                  </div>
                </div>
              </div>
              <span className="badge badge-copper">AIIA / PCIM&H Monograph Matched</span>
            </div>

            {/* Botanical Step-by-Step Blockchain Ledger */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", position: "relative" }}>
              
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--herbal-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  flexShrink: 0
                }}>1</div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                    Sustainable Wildcraft Harvesting & Geotag
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Origin: {selectedFormulationObj.harvestOrigin}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6ee7b7", marginTop: "2px" }}>
                    Geo-Coordinates: 11.6854° N, 76.1320° E • Season: Sharad Ritu (Optimal potency harvest)
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--saffron-primary)",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  flexShrink: 0
                }}>2</div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                    DNA Barcoding & Species Authentication
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Conducted by: Centre for Medicinal Plants Research (CMPR)
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6ee7b7", marginTop: "2px" }}>
                    matK and rbcL genetic sequence: 100% species match. Zero adulteration detected.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--copper-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  flexShrink: 0
                }}>3</div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                    Yavakuta Churna Standardized Coarse Milling
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Standard: Sieve Mesh #20/40 per Ayurvedic Pharmacopoeia of India
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6ee7b7", marginTop: "2px" }}>
                    Particle dimension: 0.85mm - 1.2mm. Optimal for uniform fluid flow without clogging.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#38bdf8",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  flexShrink: 0
                }}>4</div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                    Biodegradable PLA Pod Packaging & Nitrogen Flush
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    Oxygen barrier layer with 100% corn-starch polylactic acid filter mesh
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6ee7b7", marginTop: "2px" }}>
                    Residual Oxygen: &lt;0.5% • Shelf-life: 18 months without chemical preservatives.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Certificate of Analysis (CoA) Card */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <FileText size={18} color="var(--copper-bright)" />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>CERTIFICATE OF ANALYSIS (COA)</h4>
            </div>

            <table style={{ width: "100%", fontSize: "0.78rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-dim)" }}>
                  <th style={{ padding: "6px 0" }}>Test Parameter</th>
                  <th>API Specification</th>
                  <th>Observed Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--text-main)" }}>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 0" }}>Total Ash</td>
                  <td>Not more than 8.0%</td>
                  <td>6.12%</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>PASSED</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 0" }}>Acid Insoluble Ash</td>
                  <td>Not more than 1.5%</td>
                  <td>0.48%</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>PASSED</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 0" }}>Water-Soluble Extractive</td>
                  <td>Not less than 15.0%</td>
                  <td>18.4%</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>PASSED</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 0" }}>Lead (Pb)</td>
                  <td>&lt; 10.0 ppm</td>
                  <td>0.04 ppm (ICP-MS)</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>PASSED</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 0" }}>Aflatoxins (B1+B2+G1+G2)</td>
                  <td>&lt; 10.0 ppb</td>
                  <td>Not Detected</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>PASSED</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0" }}>Microbial Total Plate Count</td>
                  <td>&lt; 10⁵ CFU/g</td>
                  <td>120 CFU/g</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>PASSED</td>
                </tr>
              </tbody>
            </table>

            <div style={{
              marginTop: "16px",
              padding: "10px",
              background: "rgba(34, 197, 94, 0.08)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem"
            }}>
              <span style={{ color: "#86efac" }}>Verified by Pharmacopoeia Commission for Indian Medicine (PCIM&H)</span>
              <Award size={16} color="#34d399" />
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
