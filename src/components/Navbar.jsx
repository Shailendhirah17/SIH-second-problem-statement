import React from "react";
import { 
  Cpu, HeartPulse, Microscope, Coffee, Info, 
  Sparkles, Wifi, ShieldCheck, Flame, Radio
} from "lucide-react";
import { sounds } from "../utils/audio";

export default function Navbar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: "hmi", label: "Countertop Touch OS", icon: Coffee, badge: "Live HMI" },
    { id: "ayursync", label: "AyurSync Portal", icon: HeartPulse, badge: "Clinic & Patient" },
    { id: "validation", label: "Pharmacopoeia & HPTLC Lab", icon: Microscope, badge: "Bioequivalence" },
    { id: "hardware", label: "Hardware & ESP32 Code", icon: Cpu, badge: "Firmware" },
    { id: "brief", label: "SIH Project Brief", icon: Info, badge: "SIH26048" }
  ];

  return (
    <header style={{
      background: "rgba(18, 24, 29, 0.85)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid var(--border-subtle)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "12px 24px"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px"
      }}>
        
        {/* Brand & Team Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #c86a3b, #e8a638)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            boxShadow: "0 0 16px rgba(200, 106, 59, 0.4)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            🌿
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
                Kwatha-in-a-Pod™
              </span>
              <span className="badge badge-copper">SIH 2026</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              The Iron Logic • Smart India Hackathon PS #SIH26048
            </div>
          </div>
        </div>

        {/* Center Nav Switcher */}
        <nav style={{
          display: "flex",
          gap: "4px",
          background: "rgba(10, 14, 17, 0.75)",
          padding: "5px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playBeep(850, "sine", 0.04);
                  onSelectTab(tab.id);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  background: isActive ? "var(--copper-primary)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  border: isActive ? "1px solid var(--copper-bright)" : "1px solid transparent",
                  transition: "all 0.2s ease"
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live IoT Node Status Pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "6px 14px",
          borderRadius: "30px",
          fontSize: "0.75rem"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#34d399",
            boxShadow: "0 0 8px #34d399"
          }} />
          <span style={{ color: "var(--text-muted)" }}>ESP32 Node:</span>
          <span style={{ color: "#fff", fontWeight: 600, fontFamily: "var(--font-mono)" }}>ONLINE</span>
        </div>

      </div>
    </header>
  );
}
