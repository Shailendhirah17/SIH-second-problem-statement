import React, { useState } from "react";
import Navbar from "./components/Navbar";
import ApplianceHMI from "./components/ApplianceHMI";
import AyurSyncPortal from "./components/AyurSyncPortal";
import ScientificValidation from "./components/ScientificValidation";
import HardwareArchitecture from "./components/HardwareArchitecture";
import ProjectBrief from "./components/ProjectBrief";

export default function App() {
  const [activeTab, setActiveTab] = useState("hmi");
  const [activeFormulationId, setActiveFormulationId] = useState("amruthotharam");

  const handleSendPrescriptionToBrew = (formulationId) => {
    setActiveFormulationId(formulationId);
    setActiveTab("hmi");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header & Navigation */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Interactive Stage */}
      <main style={{
        maxWidth: "1400px",
        width: "100%",
        margin: "0 auto",
        padding: "24px 20px 48px",
        flex: 1
      }}>
        {activeTab === "hmi" && (
          <ApplianceHMI 
            activeFormulationId={activeFormulationId} 
            onSelectFormulation={setActiveFormulationId} 
          />
        )}

        {activeTab === "ayursync" && (
          <AyurSyncPortal 
            onSendPrescriptionToBrew={handleSendPrescriptionToBrew} 
          />
        )}

        {activeTab === "validation" && (
          <ScientificValidation />
        )}

        {activeTab === "hardware" && (
          <HardwareArchitecture />
        )}

        {activeTab === "brief" && (
          <ProjectBrief />
        )}
      </main>

      {/* Footer with SIH 2026 Credits & Pharmacopoeia References */}
      <footer style={{
        background: "rgba(10, 14, 17, 0.95)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "24px 20px",
        fontSize: "0.8rem",
        color: "var(--text-dim)"
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, marginBottom: "4px" }}>
              Smart India Hackathon 2026 • Problem Statement SIH26048
            </div>
            <div>
              Team: <strong style={{ color: "var(--copper-bright)" }}>The Iron Logic</strong> (Team ID: 138890) • Theme: Traditional Knowledge / MedTech
            </div>
          </div>

          <div style={{ textAlign: "right", fontSize: "0.75rem" }}>
            <div>Grounded in <em>Sharngadhara Samhita</em> (Kashaya Kalpana) &amp; <em>Ayurvedic Formulary of India (AFI)</em></div>
            <div style={{ color: "#64748b", marginTop: "2px" }}>
              Compliant with AIIA &amp; PCIM&H Botanical Quality Standards • Single-Dose Yavakuta Pod Extraction
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
