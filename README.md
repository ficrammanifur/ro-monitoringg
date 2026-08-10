# 📄 README.md - Dashboard

<h1 align="center">💧 SMART RO WATER QUALITY MONITOR</h1>

<p align="center">
  <img src="https://img.shields.io/badge/last%20update-2026-brightgreen" />
  <img src="https://img.shields.io/badge/language-HTML%20%7C%20CSS%20%7C%20JavaScript-blue" />
  <img src="https://img.shields.io/badge/hardware-ESP32-informational" />
  <img src="https://img.shields.io/badge/protocol-MQTT-green" />
  <img src="https://img.shields.io/badge/platform-GitHub%20Pages-orange" />
  <img src="https://img.shields.io/badge/status-Active-success" />
</p>

<p align="center">
  <em>Sistem Monitoring Kualitas Air RO Real-time berbasis ESP32 + MQTT</em>
</p>

---

## 🌐 Live Demo

👉 **[Buka Smart RO Console](https://wahyukurniaw4an.github.io/ro-monitoringg/)**

---

## 📑 Daftar Isi
- [✨ Overview](#-overview)
- [📊 Parameter yang Dimonitor](#-parameter-yang-dimonitor)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [📁 Project Structure](#-project-structure)
- [⚙️ Installation](#%EF%B8%8F-installation)
- [🚀 Usage](#-usage)
- [📦 Dependencies](#-dependencies)
- [🔧 Configuration](#-configuration)
- [🐞 Troubleshooting](#-troubleshooting)
- [📄 License](#-license)

---

## ✨ Overview

**Smart RO Water Quality Monitor** adalah dashboard web untuk monitoring kualitas air Reverse Osmosis secara real-time. Data diterima dari ESP32 melalui MQTT dan ditampilkan dalam antarmuka yang modern dan responsif.

### 🎯 Fitur Utama
- ✅ **Real-time Monitoring** – Data update setiap 5 detik via MQTT
- ✅ **Interactive Charts** – Grafik pH & TDS dengan Chart.js
- ✅ **Water Quality Status** – Status LAYAK / TIDAK LAYAK dengan ikon
- ✅ **Filter Health Monitor** – Estimasi umur filter (0-100%)
- ✅ **Volume Tracking** – Total produksi air dalam Liter
- ✅ **Responsive Design** – Mobile & Desktop friendly
- ✅ **Dark Theme** – Desain modern dengan efek glassmorphism

---

## 📊 Parameter yang Dimonitor

| Parameter | Display | Rentang Normal | Sumber Data |
|-----------|---------|----------------|-------------|
| **pH** | 0.00 - 14.00 | 6.5 - 9.8 | `data.ph` |
| **TDS** | 0 - 9999 ppm | < 500 ppm | `data.tds` |
| **Turbidity** | 0 - 100 NTU | < 5 NTU | `data.turbidity_ntu` |
| **Temperature** | -55 - 125 °C | 15 - 35 °C | `data.temperature` |
| **Volume** | 0 - ∞ L | - | `data.volume` |
| **Filter Health** | 0 - 100% | > 70% | `data.health` |
| **Days Left** | 0 - ∞ | - | `data.days_left` |
| **Flow Rate** | 0 - ∞ L/min | - | `data.flow_rate` |

### Badge Status
| Parameter | Optimal | Warning |
|-----------|---------|---------|
| **pH** | 🟢 OPTIMAL | 🔴 WARNING |
| **TDS** | 🟢 PURE | 🔴 HIGH TDS |
| **Turbidity** | 🟢 CLEAR | 🔴 CLOUDY |
| **Temperature** | 🟢 NOMINAL | 🔴 ALERT |

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB PAGES                              │
│                 (https://user.github.io/ro)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    WEB DASHBOARD                        │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │   │
│  │  │  Water Status │  │ Filter Health │  │   Charts   │  │   │
│  │  └───────────────┘  └───────────────┘  └────────────┘  │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │   │
│  │  │  pH / TDS     │  │ Turbidity/Temp│  │  Volume    │  │   │
│  │  └───────────────┘  └───────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ MQTT over WebSocket (WSS)
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MQTT BROKER (HiveMQ)                      │
│                    broker.hivemq.com:8884                      │
│                   Topic: watermon/all                         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ MQTT over TCP
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                            ESP32                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     SENSORS                             │   │
│  │  pH, TDS, Turbidity, Temperature, Flow                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
smart-ro-monitor/
├── 📄 index.html                 # Main Dashboard
├── 📜 script.js                  # MQTT + Logic
├── 🎨 style.css                  # Styling & Responsive
└── 📄 README.md                  # Dokumentasi
```

---

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/username/smart-ro-monitor.git
cd smart-ro-monitor
```

### 2. Deploy ke GitHub Pages
1. Upload semua file ke repository GitHub
2. Buka **Settings** → **Pages**
3. Pilih **Source**: `Deploy from a branch` → `main` → `/ (root)`
4. Simpan → Tunggu beberapa menit
5. Akses: `https://username.github.io/smart-ro-monitor`

### 3. ESP32 Setup
1. Upload `esp32/smart_ro_monitor.ino` ke ESP32
2. Setup WiFi melalui hotspot `WaterMonitor`
3. ESP32 akan otomatis publish data ke MQTT

---

## 🚀 Usage

### Dashboard
1. **Buka Dashboard** di browser
2. **Tunggu koneksi MQTT** (< 10 detik)
3. **Data akan muncul** secara real-time

### Connection Status
| Status | Warna | Arti |
|--------|-------|------|
| SYSTEM ONLINE | 🟢 | MQTT Terhubung |
| CONNECTION LOST | 🔴 | MQTT Terputus |
| AWAITING NODE | 🟡 | Menunggu data ESP32 |

---

## 📦 Dependencies

### Frontend (CDN)
| Library | Version | Purpose |
|---------|---------|---------|
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | Grafik real-time |
| [MQTT.js](https://github.com/mqttjs/MQTT.js) | 5.0.0 | MQTT over WebSocket |
| [Font Awesome](https://fontawesome.com/) | 6.5.0 | Ikon |

### ESP32 (Arduino)
| Library | Purpose |
|---------|---------|
| `WiFiManager` | WiFi setup via captive portal |
| `PubSubClient` | MQTT communication |
| `LiquidCrystal_I2C` | LCD 20x4 display |
| `DallasTemperature` | DS18B20 temperature sensor |
| `OneWire` | 1-Wire communication |

---

## 🔧 Configuration

### MQTT
```javascript
// script.js
const MQTT_BROKER = "wss://broker.hivemq.com:8884/mqtt";
const MQTT_TOPIC = "watermon/all";
```

```cpp
// smart_ro_monitor.ino
#define MQTT_BROKER "broker.hivemq.com"
#define MQTT_TOPIC_ALL "watermon/all"
```

### Filter Replacement
```cpp
// Bobot: Volume 50%, TDS 50%
// pH hanya sebagai info (bukan indikator kerusakan filter)
const float MAX_VOLUME_LITER = 30000.0;  // 30.000 liter
// TDS Ideal: < 50 ppm
// TDS > 200 ppm → KRITIS (Membran Rusak)
```

---

## 🐞 Troubleshooting

### Dashboard Tidak Connect
| Masalah | Solusi |
|---------|--------|
| MQTT offline | Cek koneksi internet |
| ESP32 tidak publish | Cek power & WiFi ESP32 |
| WebSocket error | Refresh halaman / clear cache |
| Tracking Prevention | Gunakan browser lain / nonaktifkan |

### Data Tidak Muncul
| Masalah | Solusi |
|---------|--------|
| JSON parse error | Buka Console Browser (F12) |
| Topic salah | Cek `watermon/all` |
| ESP32 offline | Periksa Serial Monitor |
| Payload terlalu besar | Update ESP32 dengan versi minimal |

### Tampilan Rusak
| Masalah | Solusi |
|---------|--------|
| Font Awesome tidak load | Ganti CDN ke `cdnjs` |
| CSS tidak apply | Clear cache browser |
| Chart tidak muncul | Cek Console untuk error |

---

## 📄 License

MIT License © 2026

---

<div align="center">
  <strong>💧 Smart RO Water Quality Monitoring System</strong><br>
  Built with ESP32 • MQTT • GitHub Pages
  <p><a href="#top">⬆ Kembali ke Atas</a></p>
</div>
