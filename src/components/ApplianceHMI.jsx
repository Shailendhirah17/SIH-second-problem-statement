import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, AlertTriangle, Droplets, Flame, 
  Cpu, CheckCircle2, ShieldCheck, Sparkles, Volume2, VolumeX,
  Gauge, Activity, ArrowRight, Check, Compass, Layers, Coffee,
  RefreshCw, Wifi, Thermometer, Radio, Scale, Wind, Zap
} from "lucide-react";
import { FORMULATIONS, MACHINE_SPECS } from "../data/formulations";
import { sounds } from "../utils/audio";

export default function ApplianceHMI({ activeFormulationId, onSelectFormulation }) {
  const [selectedPod, setSelectedPod] = useState(FORMULATIONS[0]);
  const [podInserted, setPodInserted] = useState(true);
  const [brewState, setBrewState] = useState("IDLE"); // IDLE, PRE_INFUSION, MILD_BOIL, REDUCTION, DISPENSING, PURGING, COMPLETED
  const [isDemoFast, setIsDemoFast] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live telemetry states
  const [temperature, setTemperature] = useState(26.5);
  const [currentWeight, setCurrentWeight] = useState(selectedPod.defaultWaterMl);
  const [currentBrix, setCurrentBrix] = useState(0.2);
  const [fanCfm, setFanCfm] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageDescription, setStageDescription] = useState("Insert certified Ayurvedic pod to initiate brewing protocol.");
  const [cupFillPercent, setCupFillPercent] = useState(0);
  const [waterTankLevel, setWaterTankLevel] = useState(86);
  const [podBinCount, setPodBinCount] = useState(3);
  const [targetVolume, setTargetVolume] = useState(selectedPod.reductionTargetMl);

  const timerRef = useRef(null);

  // Sync selected pod when prop changes
  useEffect(() => {
    if (activeFormulationId) {
      const match = FORMULATIONS.find(f => f.id === activeFormulationId);
      if (match) {
        setSelectedPod(match);
        if (brewState === "IDLE") {
          setCurrentWeight(match.defaultWaterMl);
          setTargetVolume(match.reductionTargetMl);
        }
      }
    }
  }, [activeFormulationId, brewState]);

  // Audio mute toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playBeep(880, "sine", 0.05);
  };

  // Pod Insertion simulation
  const handleInsertPod = (pod) => {
    if (brewState !== "IDLE" && brewState !== "COMPLETED") return;
    sounds.playPodInsert();
    setSelectedPod(pod);
    if (onSelectFormulation) onSelectFormulation(pod.id);
    setPodInserted(true);
    setBrewState("IDLE");
    setTemperature(27.0);
    setCurrentWeight(pod.defaultWaterMl);
    setTargetVolume(pod.reductionTargetMl);
    setCurrentBrix(0.2);
    setProgressPercent(0);
    setCupFillPercent(0);
    setFanCfm(0);
    setStageDescription(`Verified Pod: ${pod.name}. NFC Monograph Code: ${pod.podNfcUid}`);
  };

  const handleEjectPod = () => {
    if (brewState !== "IDLE" && brewState !== "COMPLETED") return;
    sounds.playBeep(440, "sine", 0.1);
    setPodInserted(false);
    setBrewState("IDLE");
    setStageDescription("Chamber empty. Please insert a standardized Kwatha pod.");
  };

  // Start Brew Cycle
  const startBrew = () => {
    if (!podInserted) {
      sounds.playBeep(320, "sawtooth", 0.3);
      alert("Please insert an Ayurvedic pod into the brewing chamber first!");
      return;
    }
    if (waterTankLevel < 20) {
      alert("Water reservoir low. Please refill potable Jala tank.");
      return;
    }

    sounds.playBrewStart();
    setBrewState("PRE_INFUSION");
    setProgressPercent(0);
    setCupFillPercent(0);
  };

  const resetBrew = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sounds.playBeep(520, "sine", 0.1);
    setBrewState("IDLE");
    setTemperature(27.0);
    setCurrentWeight(selectedPod.defaultWaterMl);
    setCurrentBrix(0.2);
    setProgressPercent(0);
    setCupFillPercent(0);
    setFanCfm(0);
    setStageDescription("Brew cycle cancelled. Machine returned to standby state.");
  };

  // Main Brewing State Machine Engine
  useEffect(() => {
    if (brewState === "IDLE" || brewState === "COMPLETED") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalStep = isDemoFast ? 100 : 400; // Fast preview vs normal
    const totalSteps = isDemoFast ? 240 : 800;
    let stepCount = 0;

    const initialWeight = selectedPod.defaultWaterMl;
    const finalWeight = targetVolume;
    const targetTemp = selectedPod.targetTempC;
    const finalBrix = selectedPod.targetBrix;

    timerRef.current = setInterval(() => {
      stepCount++;
      const overallRatio = Math.min(stepCount / totalSteps, 1);
      setProgressPercent(Math.round(overallRatio * 100));

      // Stage 1: PRE_INFUSION (0% - 15%)
      if (overallRatio < 0.15) {
        setBrewState("PRE_INFUSION");
        setStageDescription("Stage 1: Puncturing pod & pre-infusion maceration. Soaking Yavakuta coarse herb particles at 60°C to swell cell walls.");
        setTemperature(prev => Math.min(prev + (targetTemp * 0.7 - prev) * 0.08, 62));
        setFanCfm(0);
      } 
      // Stage 2: CONTROLLED MILD BOILING (15% - 40%)
      else if (overallRatio < 0.40) {
        setBrewState("MILD_BOIL");
        setStageDescription(`Stage 2: Mild decoction simmering at ${targetTemp}°C. PID loop strictly prevents bioactive scorching. Recirculation pump active.`);
        setTemperature(prev => Math.min(prev + (targetTemp - prev) * 0.12, targetTemp + (Math.sin(stepCount) * 0.4)));
        setFanCfm(8.5);
      } 
      // Stage 3: ACCELERATED 1/4 REDUCTION (40% - 78%)
      else if (overallRatio < 0.78) {
        setBrewState("REDUCTION");
        setStageDescription(`Stage 3: Accelerating 1/4th reduction (Chathurbhaga Shesha). Vapour blower removing steam. Continuous load-cell mass tracking.`);
        // Interpolate mass from initial to final
        const stageProgress = (overallRatio - 0.40) / 0.38;
        const currentM = initialWeight - (initialWeight - finalWeight) * stageProgress;
        setCurrentWeight(Math.round(currentM * 10) / 10);
        
        // Brix rises as water evaporates
        const currentB = 0.2 + (finalBrix - 0.2) * stageProgress;
        setCurrentBrix(Math.round(currentB * 10) / 10);
        
        setTemperature(targetTemp + (Math.sin(stepCount * 0.5) * 0.5));
        setFanCfm(16.8);
      } 
      // Stage 4: INLINE FILTRATION & DISPENSING (78% - 92%)
      else if (overallRatio < 0.92) {
        setBrewState("DISPENSING");
        setStageDescription(`Stage 4: Dispensing fresh decoction via 50-micron SS316 micro-filter. Soothing ~48°C consumption temperature.`);
        setCurrentWeight(finalWeight);
        setCurrentBrix(finalBrix);
        setFanCfm(4.0);
        setTemperature(prev => Math.max(prev - 0.5, 48.0));
        
        const dispenseProgress = (overallRatio - 0.78) / 0.14;
        setCupFillPercent(Math.min(Math.round(dispenseProgress * 100), 100));
      } 
      // Stage 5: AUTO-PURGE & CLEAN (92% - 100%)
      else if (overallRatio < 1.0) {
        setBrewState("PURGING");
        setStageDescription("Stage 5: High-temperature steam flush of lines. Auto-ejecting spent biodegradable pod into compost tray.");
        setFanCfm(12.0);
      } 
      // Complete!
      else {
        clearInterval(timerRef.current);
        setBrewState("COMPLETED");
        setStageDescription(`Fresh ${selectedPod.name} ready! Yield: ${finalWeight} mL at ${finalBrix}°Bx. Pharmacopoeia standard verified.`);
        setWaterTankLevel(prev => Math.max(prev - 12, 10));
        setPodBinCount(prev => prev + 1);
        sounds.playCompleteChime();
      }
    }, intervalStep);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [brewState, isDemoFast, selectedPod, targetVolume]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Upper Countertop Appliance Unit Frame */}
      <div className="appliance-frame">
        <div className="screen-display" style={{ padding: "20px 24px" }}>
          
          {/* Top Status Bar (Like a 10" Touchscreen Panel) */}
          <div style={{
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            paddingBottom: "14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: brewState === "IDLE" ? "#34d399" : (brewState === "COMPLETED" ? "#38bdf8" : "#fbbf24"),
                boxShadow: "0 0 10px currentColor"
              }} />
              <div>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }}>
                  KWATHAPOD™ TOUCH OS
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginLeft: "8px" }}>
                  v2.6.4 • SIH26048
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Water Tank Potable Jala Level">
                <Droplets size={15} color="#38bdf8" />
                <span>Jala Tank: <strong style={{ color: "#fff" }}>{waterTankLevel}%</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Spent Pods in Bin">
                <Coffee size={15} color="#c86a3b" />
                <span>Spent Pods: <strong style={{ color: "#fff" }}>{podBinCount}/15</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Wifi size={15} color="#34d399" />
                <span style={{ color: "#34d399" }}>AyurCloud IoT</span>
              </div>
              <button 
                onClick={toggleSound}
                style={{ 
                  background: "transparent", 
                  color: soundEnabled ? "#38bdf8" : "var(--text-dim)",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
                title={soundEnabled ? "Mute Synthesizer" : "Unmute Synthesizer"}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>

          {/* Main Appliance Screen Content (Split View: Brew Monitor & Pod Selector) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "24px"
          }}>
            
            {/* Left: Active Decoction Extraction Chamber Monitor */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Selected Pod Header Card */}
              <div style={{
                background: "linear-gradient(135deg, rgba(200, 106, 59, 0.15), rgba(18, 24, 29, 0.85))",
                border: "1px solid var(--border-copper)",
                borderRadius: "var(--radius-md)",
                padding: "16px 18px",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span className="badge badge-copper">API Monograph Standard</span>
                      <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                        NFC: {selectedPod.podNfcUid}
                      </span>
                    </div>
                    <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                      {selectedPod.name}
                    </h2>
                    <div style={{ fontSize: "0.85rem", color: "var(--saffron-bright)", fontStyle: "italic", marginBottom: "6px" }}>
                      {selectedPod.devanagari} • {selectedPod.afiReference}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {selectedPod.subtitle}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {podInserted ? (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        background: "rgba(34, 197, 94, 0.15)",
                        border: "1px solid rgba(34, 197, 94, 0.4)",
                        borderRadius: "20px",
                        color: "#4ade80",
                        fontSize: "0.75rem",
                        fontWeight: 600
                      }}>
                        <ShieldCheck size={14} /> Pod Locked & Clamped
                      </div>
                    ) : (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        background: "rgba(244, 63, 94, 0.15)",
                        border: "1px solid rgba(244, 63, 94, 0.4)",
                        borderRadius: "20px",
                        color: "#fb7185",
                        fontSize: "0.75rem",
                        fontWeight: 600
                      }}>
                        <AlertTriangle size={14} /> Chamber Empty
                      </div>
                    )}
                  </div>
                </div>

                {/* Classical formulation verse snippet */}
                <div style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  color: "#cbd5e1",
                  borderLeft: "3px solid var(--saffron-primary)"
                }}>
                  📜 {selectedPod.shastraVerse}
                </div>
              </div>

              {/* Animated Interactive Hardware Cross-Section Schematic */}
              <div style={{
                background: "#090d10",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "16px",
                position: "relative"
              }}>
                <div style={{
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: "12px",
                  fontSize: "0.75rem",
                  color: "var(--text-dim)"
                }}>
                  <span>FLUIDIC & THERMAL SCHEMATIC (ESP32 FEED)</span>
                  <span style={{ color: "var(--oled-cyan)", fontFamily: "var(--font-mono)" }}>
                    MODE: {brewState}
                  </span>
                </div>

                {/* SVG Live Simulation Schematic */}
                <svg viewBox="0 0 520 180" style={{ width: "100%", height: "180px", display: "block" }}>
                  <defs>
                    <linearGradient id="chamberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a252c" />
                      <stop offset="100%" stopColor="#0f1519" />
                    </linearGradient>
                    <linearGradient id="decoctionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>
                    <linearGradient id="heatGlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>

                  {/* 1. Potable Jala Water Tank */}
                  <rect x="15" y="30" width="60" height="110" rx="6" fill="#111827" stroke="#374151" strokeWidth="1.5" />
                  <rect 
                    x="17" 
                    y={30 + 110 * (1 - waterTankLevel / 100)} 
                    width="56" 
                    height={110 * (waterTankLevel / 100)} 
                    rx="4" 
                    fill="rgba(56, 189, 248, 0.4)" 
                  />
                  <text x="45" y="155" fill="#9ca3af" fontSize="9" textAnchor="middle">Jala Tank</text>

                  {/* Pipe: Tank -> Pump -> Chamber */}
                  <path 
                    d="M 75 80 L 105 80" 
                    stroke={brewState === "PRE_INFUSION" ? "#38bdf8" : "#4b5563"} 
                    strokeWidth="3" 
                    strokeDasharray={brewState === "PRE_INFUSION" ? "4 3" : "none"} 
                    style={{ animation: brewState === "PRE_INFUSION" ? "flowDash 0.8s linear infinite" : "none" }}
                  />

                  {/* Flow Meter & Pump */}
                  <circle x="115" y="80" r="12" fill="#1f2937" stroke="#60a5fa" strokeWidth="1.5" />
                  <text x="115" y="84" fill="#93c5fd" fontSize="8" textAnchor="middle">PUMP</text>

                  {/* Pipe: Pump to Evaporator Chamber */}
                  <path 
                    d="M 127 80 L 155 80" 
                    stroke={brewState === "PRE_INFUSION" ? "#38bdf8" : "#4b5563"} 
                    strokeWidth="3" 
                  />

                  {/* 2. Main Boiling & Evaporation Chamber (Shallow wide pan for quick reduction) */}
                  <rect x="155" y="40" width="180" height="90" rx="8" fill="url(#chamberGrad)" stroke="#475569" strokeWidth="1.5" />
                  
                  {/* Liquid inside chamber (height represents weight reduction: 400ml down to 100ml) */}
                  {brewState !== "IDLE" && (
                    <rect 
                      x="158" 
                      y={40 + 90 - (currentWeight / 450) * 80} 
                      width="174" 
                      height={(currentWeight / 450) * 80} 
                      rx="4" 
                      fill="url(#decoctionGrad)" 
                      opacity="0.85" 
                    />
                  )}

                  {/* Pod Clamped Inside Chamber */}
                  {podInserted && (
                    <g transform="translate(210, 48)">
                      <rect x="0" y="0" width="70" height="28" rx="5" fill="#3b2d20" stroke="#d97706" strokeWidth="1.5" />
                      <circle cx="12" cy="14" r="5" fill="#f59e0b" />
                      <text x="42" y="17" fill="#fef3c7" fontSize="8" fontWeight="bold" textAnchor="middle">POD: Yavakuta</text>
                    </g>
                  )}

                  {/* PID Heating Ring Underneath */}
                  <rect 
                    x="165" 
                    y="132" 
                    width="160" 
                    height="6" 
                    rx="3" 
                    fill={temperature > 50 ? "url(#heatGlow)" : "#374151"} 
                    filter={temperature > 70 ? "drop-shadow(0 0 6px #f97316)" : "none"} 
                  />
                  <text x="245" y="152" fill="#9ca3af" fontSize="9" textAnchor="middle">800W Dual Induction Coil (PID)</text>

                  {/* Vapour Extraction Duct on Top */}
                  <path d="M 235 40 L 235 15 L 285 15" stroke="#64748b" strokeWidth="3" fill="none" />
                  <circle cx="285" cy="15" r="9" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                  <text x="285" y="18" fill="#38bdf8" fontSize="7" textAnchor="middle">FAN</text>

                  {/* Rising steam dots when boiling/reducing */}
                  {(brewState === "MILD_BOIL" || brewState === "REDUCTION") && (
                    <g fill="#cbd5e1" opacity="0.6">
                      <circle cx="205" cy="65" r="3" className="animate-steam-1" />
                      <circle cx="245" cy="60" r="4" className="animate-steam-2" />
                      <circle cx="280" cy="68" r="3" className="animate-steam-3" />
                    </g>
                  )}

                  {/* 3. Recirculation & Stirring Loop (Prevents scorching) */}
                  <path 
                    d="M 160 110 L 140 110 L 140 55 L 160 55" 
                    stroke={brewState === "MILD_BOIL" || brewState === "REDUCTION" ? "#f59e0b" : "#475569"} 
                    strokeWidth="2" 
                    fill="none" 
                    strokeDasharray="3 3"
                    style={{ animation: brewState === "REDUCTION" ? "flowDash 0.5s linear infinite" : "none" }}
                  />

                  {/* 4. In-Line Microfilter & Dispense Valve */}
                  <path 
                    d="M 335 110 L 375 110 L 375 125" 
                    stroke={brewState === "DISPENSING" ? "#d97706" : "#475569"} 
                    strokeWidth="3" 
                  />
                  {/* Filter Box */}
                  <rect x="350" y="103" width="18" height="14" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
                  <text x="359" y="113" fill="#cbd5e1" fontSize="6" textAnchor="middle">50μ</text>

                  {/* 5. Serving Glass / Kup */}
                  <g transform="translate(425, 65)">
                    {/* Glass Cup Outer */}
                    <path d="M 10 20 L 18 80 L 52 80 L 60 20 Z" fill="rgba(255,255,255,0.06)" stroke="#94a3b8" strokeWidth="1.5" />
                    {/* Decoction in cup */}
                    {cupFillPercent > 0 && (
                      <path 
                        d={`M ${10 + (1 - cupFillPercent/100)*4} ${80 - (cupFillPercent/100)*55} L 18 80 L 52 80 L ${60 - (1 - cupFillPercent/100)*4} ${80 - (cupFillPercent/100)*55} Z`} 
                        fill="url(#decoctionGrad)" 
                      />
                    )}
                    <text x="35" y="96" fill="#9ca3af" fontSize="9" textAnchor="middle">Kup (100mL)</text>
                    {cupFillPercent > 10 && (
                      <text x="35" y="55" fill="#fef3c7" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {Math.round((cupFillPercent / 100) * targetVolume)} mL
                      </text>
                    )}
                  </g>

                  {/* Liquid Stream into Cup during dispense */}
                  {brewState === "DISPENSING" && (
                    <line x1="375" y1="125" x2="445" y2="125" stroke="#d97706" strokeWidth="2.5" strokeDasharray="3 2" style={{ animation: "flowDash 0.3s linear infinite" }} />
                  )}
                </svg>

                {/* Live Process Stage Callout */}
                <div style={{
                  marginTop: "10px",
                  padding: "10px 14px",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Activity size={18} color="var(--copper-bright)" className={brewState !== "IDLE" ? "animate-pulse" : ""} />
                    <span style={{ fontSize: "0.85rem", color: "#f8fafc" }}>
                      {stageDescription}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--oled-cyan)"
                  }}>
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{
                  height: "6px",
                  width: "100%",
                  background: "#1e293b",
                  borderRadius: "3px",
                  marginTop: "8px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, #c86a3b, #e8a638, #227c6c)",
                    transition: "width 0.3s ease",
                    boxShadow: "0 0 8px rgba(232, 166, 56, 0.6)"
                  }} />
                </div>
              </div>

              {/* Real-time Telemetry Metrics Quad */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px"
              }}>
                {/* 1. Temperature Gauge */}
                <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "4px" }}>
                    <Thermometer size={14} color="#f97316" />
                    <span>CHAMBER TEMP</span>
                  </div>
                  <div style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: temperature > 80 ? "#f97316" : (temperature > 50 ? "#facc15" : "#38bdf8")
                  }}>
                    {temperature.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                    Target: {selectedPod.targetTempC}°C (±0.8)
                  </div>
                </div>

                {/* 2. Load Cell Weight */}
                <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "4px" }}>
                    <Scale size={14} color="#38bdf8" />
                    <span>MASS / VOLUME</span>
                  </div>
                  <div style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: currentWeight <= targetVolume + 2 ? "#34d399" : "#38bdf8"
                  }}>
                    {currentWeight.toFixed(0)} <span style={{ fontSize: "0.9rem" }}>mL</span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                    Goal: {targetVolume} mL (1/4th)
                  </div>
                </div>

                {/* 3. Refractometric Brix Density */}
                <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "4px" }}>
                    <Gauge size={14} color="#a855f7" />
                    <span>EXTRACT BRIX</span>
                  </div>
                  <div style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: "#c084fc"
                  }}>
                    {currentBrix.toFixed(1)}°Bx
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                    API Min: {selectedPod.targetBrix}°Bx
                  </div>
                </div>

                {/* 4. Vapour Airflow Exhaust */}
                <div className="glass-panel" style={{ padding: "12px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "4px" }}>
                    <Wind size={14} color="#2dd4bf" />
                    <span>VAPOUR FLOW</span>
                  </div>
                  <div style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: "#2dd4bf"
                  }}>
                    {fanCfm.toFixed(1)} <span style={{ fontSize: "0.9rem" }}>CFM</span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                    Dynamic Gradient
                  </div>
                </div>
              </div>

              {/* Touchscreen Control Action Bar */}
              <div style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginTop: "4px"
              }}>
                {brewState === "IDLE" || brewState === "COMPLETED" ? (
                  <button
                    onClick={startBrew}
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      background: "linear-gradient(135deg, #c86a3b, #e77d49)",
                      color: "#fff",
                      borderRadius: "var(--radius-md)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      boxShadow: "0 6px 20px rgba(200, 106, 59, 0.45)"
                    }}
                  >
                    <Play size={18} fill="#fff" />
                    <span>START FRESH AYURVEDIC BREW</span>
                  </button>
                ) : (
                  <button
                    onClick={resetBrew}
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      background: "linear-gradient(135deg, #be123c, #e11d48)",
                      color: "#fff",
                      borderRadius: "var(--radius-md)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      boxShadow: "0 6px 20px rgba(225, 29, 72, 0.45)"
                    }}
                  >
                    <AlertTriangle size={18} />
                    <span>EMERGENCY ABORT / COOL</span>
                  </button>
                )}

                {/* Simulation speed toggle */}
                <button
                  onClick={() => setIsDemoFast(!isDemoFast)}
                  style={{
                    padding: "14px 16px",
                    background: isDemoFast ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isDemoFast ? "rgba(56, 189, 248, 0.4)" : "var(--border-subtle)"}`,
                    color: isDemoFast ? "#38bdf8" : "var(--text-muted)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  title="Toggle demo simulation speed (25s demo vs realistic cycle)"
                >
                  <Zap size={16} />
                  <span>{isDemoFast ? "Demo Fast (25s)" : "Standard Real"}</span>
                </button>

                {/* Flush / Clean Button */}
                <button
                  onClick={() => {
                    sounds.playPumpPurge();
                    setStageDescription("Chamber steam rinse & thermal purge completed.");
                  }}
                  disabled={brewState !== "IDLE" && brewState !== "COMPLETED"}
                  style={{
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <RefreshCw size={16} />
                  <span>Flush</span>
                </button>
              </div>

            </div>

            {/* Right: Pod Bay, Herbal Monograph & Volume Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Pod Insertion Bay */}
              <div className="glass-panel" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Radio size={16} color="var(--saffron-primary)" />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>NFC SMART POD BAY</h3>
                  </div>
                  {podInserted ? (
                    <button
                      onClick={handleEjectPod}
                      disabled={brewState !== "IDLE" && brewState !== "COMPLETED"}
                      style={{
                        fontSize: "0.75rem",
                        color: "#f87171",
                        background: "rgba(248, 113, 113, 0.12)",
                        border: "1px solid rgba(248, 113, 113, 0.3)",
                        padding: "3px 8px",
                        borderRadius: "4px"
                      }}
                    >
                      Eject Pod
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#fbbf24" }}>Select to Insert</span>
                  )}
                </div>

                {/* List of 5 Standard Pods */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {FORMULATIONS.map(pod => {
                    const isSelected = selectedPod.id === pod.id && podInserted;
                    return (
                      <div
                        key={pod.id}
                        onClick={() => handleInsertPod(pod)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          borderRadius: "var(--radius-sm)",
                          background: isSelected ? "rgba(200, 106, 59, 0.2)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "1px solid var(--copper-bright)" : "1px solid rgba(255, 255, 255, 0.05)",
                          cursor: brewState === "IDLE" || brewState === "COMPLETED" ? "pointer" : "not-allowed",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: pod.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            boxShadow: isSelected ? "0 0 10px rgba(200, 106, 59, 0.5)" : "none"
                          }}>
                            🌿
                          </div>
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: isSelected ? "#fff" : "var(--text-main)" }}>
                              {pod.name}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                              {pod.category} • {pod.targetTempC}°C
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "var(--copper-bright)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem"
                          }}>
                            ✓
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Tap to Load</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botanical Formulation Details & Active Phytochemical Markers */}
              <div className="glass-panel" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <Sparkles size={16} color="var(--herbal-bright)" />
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>STANDARDIZED BOTANICALS</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedPod.botanicalIngredients.map((ing, idx) => (
                    <div key={idx} style={{
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "var(--radius-sm)",
                      borderLeft: "2px solid var(--herbal-primary)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f1f5f9" }}>{ing.name}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--saffron-primary)" }}>{ing.ratio}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontStyle: "italic" }}>
                        {ing.latin} ({ing.part})
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#6ee7b7", marginTop: "2px" }}>
                        Active Marker: <strong>{ing.activeMarker}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Anupana / Adjuvant Recommendation */}
                <div style={{
                  marginTop: "12px",
                  padding: "8px 10px",
                  background: "rgba(232, 166, 56, 0.08)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px dashed rgba(232, 166, 56, 0.3)",
                  fontSize: "0.75rem",
                  color: "#fde68a"
                }}>
                  🍯 <strong>Anupana:</strong> {selectedPod.anupana}
                </div>
              </div>

              {/* Dose Volume Selector (50mL / 100mL / 150mL) */}
              <div className="glass-panel" style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "8px" }}>
                  DOSAGE YIELD (1/4TH CHATHURBHAGA ENDPOINT)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {[
                    { label: "Conc. (60 mL)", vol: 60 },
                    { label: "Standard (100 mL)", vol: 100 },
                    { label: "Mridu (150 mL)", vol: 150 }
                  ].map(option => (
                    <button
                      key={option.vol}
                      onClick={() => {
                        sounds.playBeep(700, "sine", 0.04);
                        setTargetVolume(option.vol);
                      }}
                      disabled={brewState !== "IDLE" && brewState !== "COMPLETED"}
                      style={{
                        padding: "8px 4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        borderRadius: "var(--radius-sm)",
                        background: targetVolume === option.vol ? "var(--copper-primary)" : "rgba(255,255,255,0.04)",
                        color: targetVolume === option.vol ? "#fff" : "var(--text-muted)",
                        border: targetVolume === option.vol ? "1px solid var(--copper-bright)" : "1px solid var(--border-subtle)"
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
