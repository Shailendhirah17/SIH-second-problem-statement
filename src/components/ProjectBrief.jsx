import React from "react";
import { Award, CheckCircle, ShieldCheck, Zap, HeartPulse, Clock, Sparkles } from "lucide-react";
import { MACHINE_SPECS } from "../data/formulations";

export default function ProjectBrief() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* SIH Header Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(200, 106, 59, 0.2), rgba(18, 24, 29, 0.9))",
        border: "1px solid var(--border-copper)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-elevated)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="badge badge-copper">SMART INDIA HACKATHON 2026</span>
              <span className="badge badge-herbal">THEME: TRADITIONAL KNOWLEDGE / MEDTECH</span>
              <span className="badge badge-saffron">PS CATEGORY: HARDWARE</span>
            </div>
            
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
              Kwatha-in-a-Pod™: On-Demand Pharmacopoeia-Standard Ayurvedic Decoction Appliance
            </h1>

            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Problem Statement ID: <strong style={{ color: "var(--copper-bright)" }}>{MACHINE_SPECS.problemStatementId}</strong> • Team: <strong style={{ color: "#fff" }}>{MACHINE_SPECS.team}</strong> (Team ID: <strong style={{ color: "#fff" }}>{MACHINE_SPECS.teamId}</strong>)
            </div>
          </div>

          <div style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px 18px",
            textAlign: "right"
          }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>APPLIANCE TARGET</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--saffron-bright)" }}>12-14 Mins</div>
            <div style={{ fontSize: "0.7rem", color: "#34d399" }}>Replaces 3-Hour Manual Boil</div>
          </div>
        </div>
      </div>

      {/* 3 Core Engineering Breakthroughs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        
        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(200, 106, 59, 0.2)",
            color: "var(--copper-bright)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px"
          }}>
            <Zap size={20} />
          </div>
          <h3 style={{ fontSize: "1rem", marginBottom: "6px" }}>Accelerated Mild Evaporation</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Maintains the sacred 85-90°C thermal threshold using a wide-surface shallow stainless pan & forced laminar vapour removal. Shortens time from 180 mins to 12 mins without thermal degradation.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(34, 124, 108, 0.2)",
            color: "var(--herbal-bright)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px"
          }}>
            <ShieldCheck size={20} />
          </div>
          <h3 style={{ fontSize: "1rem", marginBottom: "6px" }}>Dual-Sensor Endpoint Cut-Off</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Combines HX711 24-bit strain gauge weighing (tracking 400g to 100g exact 1/4th reduction) with in-line optical refractometric Brix sensing to ensure therapeutic total dissolved solids.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(232, 166, 56, 0.2)",
            color: "var(--saffron-bright)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px"
          }}>
            <HeartPulse size={20} />
          </div>
          <h3 style={{ fontSize: "1rem", marginBottom: "6px" }}>AFI/API NFC Monograph Pods</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Single-dose Yavakuta coarse herb pods encoded with RFID/NFC chips. Machine automatically configures water ratio, boiling profile, and dose per Ayurvedic Formulary of India standards.
          </p>
        </div>

      </div>

      {/* Target Audience & Impact */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--saffron-bright)", marginBottom: "10px" }}>
            WHO BENEFITS FROM KWATHAPOD?
          </h4>
          <ul style={{ paddingLeft: "18px", fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><strong>Ayurvedic Clinics & AYUSH Hospitals:</strong> Deliver instant, fresh, hygienic Kashaya to outpatients without hours of messy stovetop preparation.</li>
            <li><strong>Urban Households & Patients:</strong> Zero tedious boiling or straining. Get authentic, pharmacopoeia-grade preventive immunity decoctions in 1 tap.</li>
            <li><strong>Herbal Cooperatives & FPOs:</strong> Premium price realization for certified raw herbs packaged into value-added, sealed biodegradable pods.</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--herbal-bright)", marginBottom: "10px" }}>
            SUSTAINABILITY & CIRCULAR ECONOMY
          </h4>
          <ul style={{ paddingLeft: "18px", fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><strong>Zero Microplastic Pollution:</strong> Pods made from 100% bio-based corn-starch Polylactic Acid (PLA) and cellulose mesh.</li>
            <li><strong>100% Compostable Spent Herbs:</strong> Spent pods auto-ejected into an internal dry tray, directly usable as nutrient-dense organic garden fertilizer.</li>
            <li><strong>Energy Efficiency:</strong> Consumes only ~0.14 kWh per fresh brew compared to 1.8 kWh continuous gas flame burning.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
