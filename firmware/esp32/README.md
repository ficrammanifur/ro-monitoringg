# 📄 README.md - ESP32 Firmware (FIXED)

<h1 align="center">💧 ESP32 RO Water Quality Monitor<br>
    <sub>Smart Reverse Osmosis Monitoring System</sub>
</h1>

<p align="center">
  <em>Sistem monitoring kualitas air Reverse Osmosis berbasis ESP32 dengan 5 sensor, LCD, MQTT, dan logika penggantian filter otomatis.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/last_commit-2026-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/language-C%2B%2B-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white" />
  <img src="https://img.shields.io/badge/platform-ESP32-00ADD8?style=for-the-badge&logo=espressif&logoColor=white" />
  <img src="https://img.shields.io/badge/framework-Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white" />
  <img src="https://img.shields.io/badge/protocol-MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white" />
  <img src="https://img.shields.io/badge/sensors-5-informational?style=for-the-badge" />
</p>

---

## 📋 Daftar Isi
- [🎯 Tentang Proyek](#-tentang-proyek)
- [📸 Demo Sistem](#-demo-sistem)
- [🧩 Komponen & Wiring](#-komponen--wiring)
- [💻 Software & Library](#-software--library)
- [⚙️ Instalasi](#%EF%B8%8F-instalasi)
- [🚀 Cara Menjalankan](#-cara-menjalankan)
- [📊 Data MQTT](#-data-mqtt)
- [🐞 Troubleshooting](#-troubleshooting)
- [📁 Struktur Folder](#-struktur-folder)
- [📄 Lisensi](#-lisensi)

---

## 🎯 Tentang Proyek

Sistem monitoring kualitas air RO (Reverse Osmosis) berbasis ESP32 yang mengirimkan data secara real-time melalui MQTT ke dashboard web.

### 🔧 Fitur Utama
- ✅ **5 Sensor Terintegrasi** – pH, TDS, Turbidity, Temperature, Flow  
- ✅ **Filter Replacement Logic** – 3 parameter: Volume, pH, TDS  
- ✅ **WiFi Auto-Connect** – Setup mudah via WiFiManager  
- ✅ **MQTT Communication** – Kirim data ke cloud real-time  
- ✅ **LCD Display** – Tampilan minimalis 20x4  
- ✅ **Non-Blocking Loop** – Timing presisi via millis()  
- ✅ **Buzzer Alert** – Notifikasi saat filter perlu diganti  

---

## 📸 Demo Sistem

### Tampilan LCD
```
┌────────────────────┐
│ SMART RO MONITOR WM│  <- W=WiFi, M=MQTT
│ pH 7.12 TDS  45    │  <- pH & TDS
│ 2.34NTU 26.5C      │  <- Turbidity & Temperature
│ STATUS: LAYAK      │  <- Water quality status
└────────────────────┘
```

### Tampilan Serial Monitor
```
╔═══════════════════════════════════════╗
║ SYSTEM STATUS                         ║
╠═══════════════════════════════════════╣
║ pH          :   7.12                  ║
║ TDS         :    45 ppm               ║
║ Temperature :   26.50 °C              ║
║ Turbidity   :    2.34 NTU (JERNIH)    ║ 
╠═══════════════════════════════════════╣
║ Volume      :   125.500 L             ║
║ Flow Rate   :     2.50 L/min          ║
╠═══════════════════════════════════════╣
║ Status      : LAYAK                   ║
║ Filter      :     85 %                ║
║ Days Left   :     22                  ║
╠═══════════════════════════════════════╣
║ FILTER REPLACEMENT STATUS             ║
╠═══════════════════════════════════════╣
║ Need Replace: TIDAK 🟢               ║
║ Reason      : Skor filter: 85%        ║
║ Recomendasi : Filter masih baik       ║
╚═══════════════════════════════════════╝
```

---

## 🧩 Komponen & Wiring

### Daftar Komponen
| Komponen | Fungsi | GPIO |
|----------|--------|------|
| **ESP32 DevKit** | Otak utama sistem | - |
| **pH Meter Analog** | Mengukur pH air | GPIO 32 |
| **TDS Meter Analog** | Mengukur TDS | GPIO 33 |
| **Turbidity Sensor** | Mengukur kekeruhan | GPIO 35 |
| **DS18B20** | Mengukur suhu air | GPIO 18 |
| **Flow Sensor YF-S201** | Mengukur debit & volume | GPIO 19 |
| **LCD 20x4 I2C** | Tampilan lokal | SDA=21, SCL=22 |
| **Buzzer** | Alert/notifikasi | GPIO 2 |

### Diagram Wiring
```
ESP32 DevKit
├─ GPIO 32 ──── pH Sensor (Analog)
├─ GPIO 33 ──── TDS Sensor (Analog)
├─ GPIO 35 ──── Turbidity Sensor (Analog)
├─ GPIO 18 ──── DS18B20 (1-Wire)
├─ GPIO 19 ──── Flow Sensor (Interrupt)
├─ GPIO 21 ──── LCD SDA (I2C)
├─ GPIO 22 ──── LCD SCL (I2C)
├─ GPIO 2  ──── Buzzer
├─ 3.3V   ──── Sensor VCC
└─ GND    ──── Sensor GND
```

---

## 💻 Software & Library

### Library yang Dibutuhkan
| Library | Instalasi |
|---------|-----------|
| **WiFiManager** by tzapu | Library Manager |
| **PubSubClient** by Nick O'Leary | Library Manager |
| **LiquidCrystal_I2C** by Frank de Brabander | Library Manager |
| **OneWire** by Paul Stoffregen | Library Manager |
| **DallasTemperature** by Miles Burton | Library Manager |

### Cara Install Library
```
Sketch → Include Library → Manage Libraries
Cari dan install masing-masing library di atas
```

---

## ⚙️ Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/username/smart-ro-monitor.git
cd smart-ro-monitor/esp32
```

### 2. Setup Arduino IDE
1. **Install ESP32 Board**:
   - File → Preferences → Additional Boards Manager URLs:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
   - Tools → Board Manager → Cari "ESP32" → Install

2. **Install Library** (lihat tabel di atas)

### 3. Upload ke ESP32
```
1. Tools → Board → ESP32 Dev Module
2. Tools → Port → Pilih port ESP32
3. Sketch → Upload
4. Tools → Serial Monitor (115200 baud)
```

---

## 🚀 Cara Menjalankan

### 1. Setup WiFi (Pertama Kali)
```
1. ESP32 akan buat hotspot "WaterMonitor"
2. Connect ke hotspot (password: water123)
3. Buka browser → 192.168.4.1
4. Pilih WiFi rumah → Masukkan password → Save
5. ESP32 akan connect & reboot
```

### 2. Kalibrasi Sensor
| Command | Fungsi |
|---------|--------|
| `cal_turb` | Kalibrasi sensor turbidity |
| `c1` | Start kalibrasi flow 1L |
| `c2` | Start kalibrasi flow 2L |
| `k` | Finish kalibrasi flow |

### 3. Perintah Serial
| Command | Fungsi |
|---------|--------|
| `status` | Tampilkan semua data sensor |
| `r` | Reset volume air |
| `reset` | Reset filter health |
| `test` | Test buzzer |
| `turb` | Debug turbidity |

---

## 📊 Data MQTT

### Topic
```
watermon/all
```

### JSON Payload (Minimal Version)
```json
{
  "ph": 7.12,
  "tds": 45,
  "turbidity_ntu": 2.34,
  "temperature": 26.50,
  "status": "LAYAK",
  "health": 85,
  "days_left": 22,
  "volume": 125.500,
  "flow_rate": 2.50,
  "filter_need_replacement": false,
  "filter_score": 85,
  "ph_warning": false
}
```

### Field Description
| Field | Type | Deskripsi |
|-------|------|-----------|
| `ph` | float | Nilai pH air |
| `tds` | float | Total Dissolved Solids (ppm) |
| `turbidity_ntu` | float | Kekeruhan air (NTU) |
| `temperature` | float | Suhu air (°C) |
| `status` | string | LAYAK / TIDAK LAYAK |
| `health` | float | Kesehatan filter (%) |
| `days_left` | int | Estimasi hari tersisa |
| `volume` | float | Total volume air (L) |
| `flow_rate` | float | Debit air (L/min) |
| `filter_need_replacement` | boolean | Perlu ganti filter? |
| `filter_score` | float | Skor filter (%) |
| `ph_warning` | boolean | Peringatan pH? |

---

## 🐞 Troubleshooting

### MQTT Publish Failed
| Masalah | Solusi |
|---------|--------|
| Payload terlalu besar | Gunakan versi minimal JSON |
| Koneksi MQTT terputus | Cek WiFi & broker |
| Client ID conflict | Ganti client ID |

### WiFi Gagal Connect
| Masalah | Solusi |
|---------|--------|
| Hotspot tidak muncul | Reset WiFiManager |
| Password salah | Ulangi setup WiFi |
| Router 5GHz | Gunakan 2.4GHz only |

### Sensor Error
| Sensor | Solusi |
|--------|--------|
| pH | Kalibrasi ulang dengan buffer solution |
| TDS | Periksa koneksi VCC/GND |
| Turbidity | Bersihkan lensa sensor |
| Flow | Cek kabel interrupt |

---

## 📁 Struktur Folder

```text
esp32/
├── 📄 smart_ro_monitor.ino     # Program utama
├── 📄 water_rules.h             # Aturan kualitas air & filter
├── 📁 test/
│   ├── 📄 ph_test.ino
│   ├── 📄 tds_test.ino
│   ├── 📄 turbidity_test.ino
│   ├── 📄 flow_test.ino
│   └── 📄 lcd_test.ino
└── 📄 README.md
```

---

## 📄 Lisensi

MIT License © 2026

---

<div align="center">
  <strong>💧 Smart RO Water Quality Monitor</strong><br>
  Powered by ESP32 • Arduino • MQTT
  <p><a href="#top">⬆ Kembali ke Atas</a></p>
</div>
