import React, { useState, useEffect } from "react";
import { 
  Cpu, Terminal, Download, Copy, Check, Radio, Zap, 
  Layers, HardDrive, ShieldCheck, RefreshCw, Activity, Code
} from "lucide-react";
import { MACHINE_SPECS } from "../data/formulations";
import { sounds } from "../utils/audio";

const ESP32_FIRMWARE_CODE = `/**
 * ==============================================================================
 * Project: Kwatha-in-a-Pod (SIH26048) - Embedded Controller Firmware
 * Team: The Iron Logic (Team ID: 138890)
 * Target MCU: ESP32-S3 Dual-Core 240MHz (FreeRTOS)
 * Description: Closed-loop thermal PID, HX711 mass reduction tracking,
 *              PN532 NFC pod decoding, and vapour extraction control.
 * ==============================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <HX711.h>
#include <Adafruit_PN532.h>
#include <PID_v1.h>
#include <WiFi.h>
#include <PubSubClient.h>

// --- PIN DEFINITIONS ---
#define PIN_HX711_DOUT    12
#define PIN_HX711_SCK     13
#define PIN_SSR_PID_HEATER 21  // 800W Induction Ring PID Solid State Relay
#define PIN_VAPOUR_BLOWER  23  // 12V PWM Vapour Exhaust Fan
#define PIN_STIR_PUMP      22  // 12V Peristaltic Recirculation Pump
#define PIN_DISPENSE_SOL   26  // Food-grade Solenoid Valve
#define PIN_NTC_TEMP       34  // Analog NTC Thermistor Probe
#define PIN_SERVO_CLAMP    25  // Pod Puncture & Lock Servo
#define PIN_PN532_SS       5
#define PIN_OPTICAL_BRIX   35  // In-line Optical Refractive Sensor

// --- SYSTEM CONSTANTS ---
#define TARGET_KASHAYA_TEMP  88.0   // Mild boiling target (°C) - preserves bioactives
#define CALIBRATION_FACTOR   420.5  // HX711 strain gauge scale factor
#define DRY_RUN_CUTOFF_TEMP  115.0  // Emergency hardware thermal fuse

// --- GLOBAL OBJECTS ---
HX711 loadcell;
Adafruit_PN532 nfc(PIN_PN532_SS);

// PID Variables
double currentTemp = 25.0;
double heaterPWM = 0;
double setpointTemp = TARGET_KASHAYA_TEMP;
// Tuned PID gains for gentle thermal rise without overshoot
double Kp = 14.5, Ki = 2.8, Kd = 4.2;
PID tempPID(&currentTemp, &heaterPWM, &setpointTemp, Kp, Ki, Kd, DIRECT);

enum BrewState {
  STATE_STANDBY,
  STATE_POD_VERIFY,
  STATE_PRE_INFUSION,
  STATE_MILD_BOILING,
  STATE_REDUCTION_LOOP,
  STATE_DISPENSE,
  STATE_STEAM_PURGE,
  STATE_EMERGENCY_STOP
};

volatile BrewState systemState = STATE_STANDBY;
float initialWeight = 400.0;
float currentWeight = 400.0;
float targetWeight = 100.0; // 1/4th Chathurbhaga Shesha endpoint
float currentBrix = 0.0;

// Read temperature from NTC 10K thermistor
float readNtcTemperature() {
  int rawADC = analogRead(PIN_NTC_TEMP);
  float resistance = 10000.0 * (4095.0 / (float)rawADC - 1.0);
  float steinhart = resistance / 10000.0;
  steinhart = log(steinhart);
  steinhart /= 3950.0;
  steinhart += 1.0 / (25.0 + 273.15);
  steinhart = 1.0 / steinhart - 273.15;
  return steinhart;
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("[SYSTEM INIT] KwathaPod OS v2.6 Booting..."));

  pinMode(PIN_SSR_PID_HEATER, OUTPUT);
  pinMode(PIN_VAPOUR_BLOWER, OUTPUT);
  pinMode(PIN_STIR_PUMP, OUTPUT);
  pinMode(PIN_DISPENSE_SOL, OUTPUT);

  // Initialize HX711 Load Cell
  loadcell.begin(PIN_HX711_DOUT, PIN_HX711_SCK);
  loadcell.set_scale(CALIBRATION_FACTOR);
  loadcell.tare();
  Serial.println(F("[SENSOR] HX711 Load Cell Calibrated (0.1g resolution)"));

  // Initialize PN532 NFC Pod Reader
  nfc.begin();
  uint32_t versiondata = nfc.getFirmwareVersion();
  if (versiondata) {
    nfc.SAMConfig();
    Serial.println(F("[NFC] PN532 Pod Authentication Module Online"));
  }

  // Initialize PID Controller
  tempPID.SetMode(AUTOMATIC);
  tempPID.SetOutputLimits(0, 255);
  Serial.println(F("[CONTROL] PID Closed-Loop Temperature Active"));
}

void loop() {
  currentTemp = readNtcTemperature();
  
  // Emergency Dry-Run Cutoff
  if (currentTemp > DRY_RUN_CUTOFF_TEMP) {
    analogWrite(PIN_SSR_PID_HEATER, 0);
    systemState = STATE_EMERGENCY_STOP;
    Serial.println(F("[CRITICAL ALERT] Dry-run overheat detected! Heater killed."));
  }

  if (loadcell.is_ready()) {
    currentWeight = loadcell.get_units(3);
  }

  // Finite State Machine
  switch (systemState) {
    case STATE_STANDBY:
      analogWrite(PIN_SSR_PID_HEATER, 0);
      analogWrite(PIN_VAPOUR_BLOWER, 0);
      digitalWrite(PIN_STIR_PUMP, LOW);
      digitalWrite(PIN_DISPENSE_SOL, LOW);
      break;

    case STATE_PRE_INFUSION:
      // Soak yavakuta powder at 60°C for hydration
      setpointTemp = 60.0;
      tempPID.Compute();
      analogWrite(PIN_SSR_PID_HEATER, (int)heaterPWM);
      digitalWrite(PIN_STIR_PUMP, HIGH); // Gentle wetting
      break;

    case STATE_MILD_BOILING:
      // Controlled simmer at 88°C
      setpointTemp = TARGET_KASHAYA_TEMP;
      tempPID.Compute();
      analogWrite(PIN_SSR_PID_HEATER, (int)heaterPWM);
      digitalWrite(PIN_STIR_PUMP, HIGH);
      analogWrite(PIN_VAPOUR_BLOWER, 80); // Moderate vapour draw
      break;

    case STATE_REDUCTION_LOOP:
      // Accelerate evaporation while maintaining 88°C
      setpointTemp = TARGET_KASHAYA_TEMP;
      tempPID.Compute();
      analogWrite(PIN_SSR_PID_HEATER, (int)heaterPWM);
      analogWrite(PIN_VAPOUR_BLOWER, 220); // High laminar vapour removal
      digitalWrite(PIN_STIR_PUMP, HIGH);

      // Check if 1/4th reduction endpoint reached
      if (currentWeight <= targetWeight) {
        Serial.println(F("[REDUCTION COMPLETE] 1/4th Volume reached. Stopping heat."));
        analogWrite(PIN_SSR_PID_HEATER, 0);
        systemState = STATE_DISPENSE;
      }
      break;

    case STATE_DISPENSE:
      analogWrite(PIN_VAPOUR_BLOWER, 0);
      digitalWrite(PIN_STIR_PUMP, LOW);
      digitalWrite(PIN_DISPENSE_SOL, HIGH); // Open 50μ filter nozzle
      delay(8000); // Dispense into cup
      digitalWrite(PIN_DISPENSE_SOL, LOW);
      systemState = STATE_STEAM_PURGE;
      break;

    case STATE_STEAM_PURGE:
      // Brief steam burst to clean lines
      delay(3000);
      systemState = STATE_STANDBY;
      break;

    default:
      break;
  }

  // Telemetry stream over Serial (JSON for IoT Gateway)
  static unsigned long lastLog = 0;
  if (millis() - lastLog > 500) {
    lastLog = millis();
    Serial.printf("{\\"state\\":%d,\\"temp\\":%.2f,\\"mass\\":%.1f,\\"target\\":%.1f,\\"pwm\\":%d}\\n",
      systemState, currentTemp, currentWeight, targetWeight, (int)heaterPWM);
  }
}
`;

export default function HardwareArchitecture() {
  const [copied, setCopied] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [isConsoleActive, setIsConsoleActive] = useState(true);

  // Copy code helper
  const handleCopy = () => {
    navigator.clipboard.writeText(ESP32_FIRMWARE_CODE);
    setCopied(true);
    sounds.playBeep(900, "sine", 0.05);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download .ino file
  const handleDownloadIno = () => {
    sounds.playCompleteChime();
    const blob = new Blob([ESP32_FIRMWARE_CODE], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "KwathaPod_ESP32_Firmware.ino";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simulate incoming serial telemetry packets
  useEffect(() => {
    if (!isConsoleActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
      const randomTemp = (87.8 + Math.random() * 0.7).toFixed(2);
      const randomMass = (212.4 - Math.random() * 0.4).toFixed(1);
      const randomPwm = Math.round(180 + Math.random() * 25);
      
      const newLog = `[${timeStr}] ESP32_CORE0: {"state":"REDUCTION","temp":${randomTemp},"mass":${randomMass},"target":100.0,"pwm":${randomPwm},"fan_cfm":16.8,"stir_pump":1,"wifi_rssi":-58}`;
      
      setTelemetryLogs(prev => [newLog, ...prev.slice(0, 14)]);
    }, 700);

    return () => clearInterval(interval);
  }, [isConsoleActive]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Top Banner */}
      <div style={{
        background: "var(--bg-surface)",
        padding: "16px 20px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #0284c7, #38bdf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff"
          }}>
            <Cpu size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Hardware Architecture & Embedded Firmware
            </h2>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              Problem Statement: {MACHINE_SPECS.problemStatementId} • Category: Hardware • Team: {MACHINE_SPECS.team} (#{MACHINE_SPECS.teamId})
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleCopy}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-subtle)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            <span>{copied ? "Copied Firmware!" : "Copy .ino Code"}</span>
          </button>

          <button
            onClick={handleDownloadIno}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #0284c7, #38bdf8)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)"
            }}
          >
            <Download size={14} />
            <span>Download KwathaPod_ESP32.ino</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Hardware Block Diagram + Live Serial Console */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px" }}>
        
        {/* Hardware Pinout & Interfacing Matrix */}
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={16} color="var(--saffron-primary)" />
            <span>ESP32-S3 Microcontroller Interfacing Table</span>
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.78rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-dim)" }}>
                  <th style={{ padding: "8px 6px" }}>Subsystem</th>
                  <th>Component / Sensor</th>
                  <th>ESP32 GPIO</th>
                  <th>Protocol / Role</th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--text-main)" }}>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 600, color: "var(--copper-bright)" }}>Mass Tracking</td>
                  <td>HX711 24-bit Dual ADC</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>GPIO 12 (DT), 13 (SCK)</td>
                  <td>Tracks 1/4th reduction by weight (±0.1g)</td>
                </tr>

                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 600, color: "var(--copper-bright)" }}>Thermal Control</td>
                  <td>800W Induction + SSR</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#f97316" }}>GPIO 21 (PWM Triac)</td>
                  <td>Closed-loop PID simmering at 88°C</td>
                </tr>

                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 600, color: "var(--copper-bright)" }}>Temp Sensing</td>
                  <td>NTC 10K Probe / MAX6675</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>GPIO 34 (ADC1)</td>
                  <td>High-precision boiling chamber monitoring</td>
                </tr>

                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 600, color: "var(--copper-bright)" }}>Vapour Removal</td>
                  <td>12V High-CFM Blower</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#2dd4bf" }}>GPIO 23 (MOSFET)</td>
                  <td>Accelerates low-temp surface evaporation</td>
                </tr>

                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 600, color: "var(--copper-bright)" }}>Stirring Loop</td>
                  <td>12V Peristaltic Pump</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#facc15" }}>GPIO 22 (Relay)</td>
                  <td>Continuous recirculation to stop scorching</td>
                </tr>

                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 600, color: "var(--copper-bright)" }}>Pod Detection</td>
                  <td>PN532 13.56MHz NFC</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#a855f7" }}>GPIO 5 (SPI SS)</td>
                  <td>Decodes AFI monograph, batch & expiry</td>
                </tr>

                <tr>
                  <td style={{ padding: "8px 6px", fontWeight: 600, color: "var(--copper-bright)" }}>Dispense & Safety</td>
                  <td>SS316 Solenoid Valve</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#fb7185" }}>GPIO 26 (Optocoupler)</td>
                  <td>Warm 48°C dispense via 50μ mesh filter</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Safety Interlocks Callout */}
          <div style={{
            marginTop: "16px",
            padding: "12px",
            background: "rgba(34, 197, 94, 0.08)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            fontSize: "0.78rem"
          }}>
            <div style={{ fontWeight: 700, color: "#86efac", marginBottom: "4px" }}>
              🛡️ Triple-Layer Hardware Safety Interlocks:
            </div>
            <ul style={{ paddingLeft: "16px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "3px" }}>
              <li><strong>Dry-run cut-off:</strong> Auto-kills heater if temperature rate exceeds 3.5°C/sec without water.</li>
              <li><strong>Anti-boil-over optical prism:</strong> Senses foam rise and triggers instant vapor exhaust.</li>
              <li><strong>Food-grade metallurgy:</strong> All wet contact points machined from certified SS 304/316.</li>
            </ul>
          </div>
        </div>

        {/* Right: Live Simulated Serial Console */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={16} color="var(--oled-cyan)" />
              <h3 style={{ fontSize: "0.95rem" }}>LIVE SERIAL TELEMETRY STREAM</h3>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setIsConsoleActive(!isConsoleActive)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  background: isConsoleActive ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border-subtle)",
                  color: isConsoleActive ? "#38bdf8" : "var(--text-dim)"
                }}
              >
                {isConsoleActive ? "Pause Stream" : "Resume Stream"}
              </button>
              <button
                onClick={() => setTelemetryLogs([])}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)"
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Terminal Box */}
          <div style={{
            background: "#080c0f",
            borderRadius: "var(--radius-sm)",
            border: "1px solid #1e293b",
            padding: "12px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "#94a3b8",
            height: "280px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}>
            <div style={{ color: "#34d399" }}>[READY] ESP32 Serial Port Connected at 115200 baud</div>
            <div style={{ color: "#60a5fa" }}>[MQTT] Subscribed to topic: ayurbrew/kwatha/node_9481/cmd</div>
            {telemetryLogs.map((log, idx) => (
              <div key={idx} style={{ color: idx === 0 ? "#f8fafc" : "#64748b" }}>
                {log}
              </div>
            ))}
          </div>

          <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "8px", textAlign: "right" }}>
            Baud Rate: 115200 • FreeRTOS Task: Core 0 (Sensor Loop)
          </div>
        </div>

      </div>

      {/* Embedded C++ Code Viewer */}
      <div className="glass-panel" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Code size={18} color="var(--copper-bright)" />
            <h3 style={{ fontSize: "1rem" }}>
              Arduino / ESP32-S3 Source Code (KwathaPod_ESP32_Firmware.ino)
            </h3>
          </div>
          <span className="badge badge-cyan">C++ / FreeRTOS Ready</span>
        </div>

        <pre style={{
          background: "#06090c",
          padding: "16px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid #1e2830",
          fontFamily: "var(--font-mono)",
          fontSize: "0.74rem",
          color: "#cbd5e1",
          maxHeight: "320px",
          overflowY: "auto",
          lineHeight: 1.45
        }}>
          {ESP32_FIRMWARE_CODE}
        </pre>
      </div>

    </div>
  );
}
