/*
 * ============================================================
 * WATER QUALITY RULES
 * ============================================================
 */
#ifndef WATER_RULES_H
#define WATER_RULES_H
#include <Arduino.h>

struct WaterStandards {
    float phMin = 6.5;
    float phMax = 9.8;
    float tdsMax = 500.0;
    float tdsIdealMax = 50.0;
    float ntuMax = 5.0;
    float ntuIdealMax = 1.0;
    float tempMin = 15.0;
    float tempMax = 35.0;
};

enum WaterQualityLevel {
    QUALITY_LAYAK,
    QUALITY_CUKUP,
    QUALITY_TIDAK_LAYAK
};

struct FilterHealth {
    float score;
    int daysLeft;
    String reason;
    bool needReplacement;
    String recommendation;
};

bool isWaterLayak(float ph, float tds, float ntu, float temp);
String getWaterStatus(float ph, float tds, float ntu, float temp);
WaterQualityLevel getWaterQualityLevel(float ph, float tds, float ntu, float temp);
String getQualityDescription(WaterQualityLevel level);
bool isPHNormal(float ph);
bool isTDSNormal(float tds);
bool isTurbidityNormal(float ntu);
bool isTemperatureNormal(float temp);
String getDetailedStatus(float ph, float tds, float ntu, float temp);
String getUnlayakReason(float ph, float tds, float ntu, float temp);
String getTurbidityDescription(float ntu);
FilterHealth calculateFilterReplacement(float volumeLiter, float ph, float tds, float temperature);

// ============================================================
// IMPLEMENTATION
// ============================================================
inline bool isPHNormal(float ph) {
    return (ph >= 6.5 && ph <= 9.8);
}

inline bool isPHExcellent(float ph) {
    return (ph >= 7.0 && ph <= 8.5);
}

inline bool isTDSNormal(float tds) {
    return (tds <= 500.0);
}

inline bool isTDSExcellent(float tds) {
    return (tds <= 50.0);
}

inline bool isTurbidityNormal(float ntu) {
    return (ntu <= 5.0);
}

inline bool isTurbidityExcellent(float ntu) {
    return (ntu <= 1.0);
}

inline bool isTemperatureNormal(float temp) {
    return (temp >= 15.0 && temp <= 35.0);
}

inline String getTurbidityDescription(float ntu) {
    if (ntu <= 10) return "SANGAT JERNIH";
    if (ntu <= 25) return "JERNIH";
    if (ntu <= 50) return "CUKUP JERNIH";
    if (ntu <= 75) return "AGAK KERUH";
    return "KERUH";
}

bool isWaterLayak(float ph, float tds, float ntu, float temp) {
    return (ph >= 6.5 && ph <= 9.8) &&
           (tds <= 500.0) &&
           (ntu <= 5.0) &&
           (temp >= 15 && temp <= 35);
}

inline WaterQualityLevel getWaterQualityLevel(float ph, float tds, float ntu, float temp) {
    bool phOK = isPHNormal(ph);
    bool tdsOK = isTDSNormal(tds);
    bool turbOK = isTurbidityNormal(ntu);
    bool tempOK = isTemperatureNormal(temp);
    
    if (phOK && tdsOK && turbOK && tempOK) {
        return QUALITY_LAYAK;
    }
    
    int failCount = 0;
    if (!phOK) failCount++;
    if (!tdsOK) failCount++;
    if (!turbOK) failCount++;
    if (!tempOK) failCount++;
    
    if (failCount <= 1) {
        return QUALITY_CUKUP;
    }
    return QUALITY_TIDAK_LAYAK;
}

inline String getQualityDescription(WaterQualityLevel level) {
    switch(level) {
        case QUALITY_LAYAK: return "LAYAK - Air sangat baik ✓";
        case QUALITY_CUKUP: return "CUKUP - Perlu perhatian ⚠️";
        case QUALITY_TIDAK_LAYAK: return "TIDAK LAYAK - Tidak aman ✗";
        default: return "UNKNOWN";
    }
}

inline String getWaterStatus(float ph, float tds, float ntu, float temp) {
    return isWaterLayak(ph, tds, ntu, temp) ? "LAYAK" : "TIDAK LAYAK";
}

inline String getDetailedStatus(float ph, float tds, float ntu, float temp) {
    String status = getWaterStatus(ph, tds, ntu, temp);
    if (status == "LAYAK") {
        return status + " ✓";
    } else {
        return status + " ✗ (" + getUnlayakReason(ph, tds, ntu, temp) + ")";
    }
}

inline String getUnlayakReason(float ph, float tds, float ntu, float temp) {
    String reasons = "";
    bool first = true;
    String separator;
    
    if (!isPHNormal(ph)) {
        separator = first ? "" : ", ";
        reasons += separator + "pH (" + String(ph, 2) + ")";
        first = false;
    }
    
    if (!isTDSNormal(tds)) {
        separator = first ? "" : ", ";
        reasons += separator + "TDS (" + String(tds, 0) + " ppm)";
        first = false;
    }
    
    if (!isTurbidityNormal(ntu)) {
        separator = first ? "" : ", ";
        reasons += separator + "Kekeruhan (" + String(ntu, 2) + " NTU)";
        first = false;
    }
    
    if (!isTemperatureNormal(temp)) {
        separator = first ? "" : ", ";
        reasons += separator + "Suhu (" + String(temp, 1) + "°C)";
        first = false;
    }
    
    if (reasons.isEmpty()) {
        reasons = "Semua parameter normal";
    }
    return reasons;
}

// ============================================================
// FILTER REPLACEMENT LOGIC
// ============================================================
inline FilterHealth calculateFilterReplacement(float volumeLiter, float ph, float tds, float temperature) {
    FilterHealth result;
    result.needReplacement = false;
    result.reason = "";
    result.recommendation = "";
    
    const float MAX_VOLUME_LITER = 30000.0;
    float volumeScore = 0.0;
    String volumeReason = "";
    
    if (volumeLiter >= MAX_VOLUME_LITER) {
        volumeScore = 0.0;
        volumeReason = "Volume sudah mencapai " + String(volumeLiter, 0) + "L (max 30.000L)";
    } else if (volumeLiter >= MAX_VOLUME_LITER * 0.9) {
        volumeScore = 30.0;
        volumeReason = "Volume " + String(volumeLiter, 0) + "L > 90% dari kapasitas";
    } else if (volumeLiter >= MAX_VOLUME_LITER * 0.75) {
        volumeScore = 50.0;
        volumeReason = "Volume " + String(volumeLiter, 0) + "L > 75% dari kapasitas";
    } else if (volumeLiter >= MAX_VOLUME_LITER * 0.5) {
        volumeScore = 70.0;
        volumeReason = "Volume " + String(volumeLiter, 0) + "L > 50% dari kapasitas";
    } else {
        volumeScore = 100.0;
        volumeReason = "Volume masih aman (" + String(volumeLiter, 0) + "L)";
    }
    
    float tdsScore = 100.0;
    String tdsReason = "";
    
    if (tds > 200.0) {
        tdsScore = 0.0;
        tdsReason = "TDS sangat tinggi (" + String(tds, 0) + " ppm) > 200 - MEMBRAN RUSAK!";
    } else if (tds > 100.0) {
        tdsScore = 20.0;
        tdsReason = "TDS tinggi (" + String(tds, 0) + " ppm) > 100 - MEMBRAN MENURUN!";
    } else if (tds > 50.0) {
        tdsScore = 50.0;
        tdsReason = "TDS mulai naik (" + String(tds, 0) + " ppm) > 50 - PERLU DIPERHATIKAN";
    } else if (tds > 30.0) {
        tdsScore = 80.0;
        tdsReason = "TDS cukup baik (" + String(tds, 0) + " ppm)";
    } else {
        tdsScore = 100.0;
        tdsReason = "TDS sangat baik (" + String(tds, 0) + " ppm) - MEMBRAN BAGUS!";
    }
    
    float phScore = 100.0;
    String phReason = "";
    
    if (ph < 6.5) {
        phScore = 100.0;
        phReason = "⚠️ pH rendah (" + String(ph, 2) + ") - Cek sumber air atau kalibrasi sensor";
    } else if (ph > 9.8) {
        phScore = 100.0;
        phReason = "⚠️ pH tinggi (" + String(ph, 2) + ") - Cek sumber air atau kalibrasi sensor";
    } else if (ph < 7.0 || ph > 8.5) {
        phScore = 100.0;
        phReason = "pH mendekati batas (" + String(ph, 2) + ") - Perhatikan tren";
    } else {
        phReason = "pH normal (" + String(ph, 2) + ")";
    }
    
    float totalScore = (volumeScore * 0.5) + (tdsScore * 0.5);
    
    bool criticalFailure = false;
    String criticalReason = "";
    
    if (tdsScore == 0) {
        criticalFailure = true;
        criticalReason = "TDS sangat tinggi (" + String(tds, 0) + " ppm) - MEMBRAN RUSAK!";
    }
    
    if (volumeScore == 0) {
        if (criticalFailure) {
            criticalReason += " & Volume mencapai limit 30.000L";
        } else {
            criticalFailure = true;
            criticalReason = "Volume mencapai limit 30.000L - GANTI FILTER!";
        }
    }
    
    if (criticalFailure) {
        result.needReplacement = true;
        result.score = 0;
        result.reason = "KRITIS: " + criticalReason;
        result.recommendation = "SEGERA GANTI FILTER! Sistem tidak berfungsi optimal.";
        result.daysLeft = 0;
        return result;
    }
    
    if (totalScore < 40) {
        result.needReplacement = true;
        result.score = totalScore;
        result.reason = "Skor filter: " + String(totalScore, 0) + "% - Performa menurun drastis";
        result.recommendation = "Ganti filter sesegera mungkin. Kualitas air menurun.";
        result.daysLeft = 3;
    } else if (totalScore < 60) {
        result.needReplacement = true;
        result.score = totalScore;
        result.reason = "Skor filter: " + String(totalScore, 0) + "% - Mulai menurun";
        result.recommendation = "Persiapan ganti filter dalam 1-2 minggu.";
        result.daysLeft = 10;
    } else if (totalScore < 75) {
        result.needReplacement = false;
        result.score = totalScore;
        result.reason = "Skor filter: " + String(totalScore, 0) + "% - Cukup baik";
        result.recommendation = "Filter masih berfungsi, pantau terus.";
        result.daysLeft = 20;
    } else {
        result.needReplacement = false;
        result.score = totalScore;
        result.reason = "Skor filter: " + String(totalScore, 0) + "% - Kondisi sangat baik";
        result.recommendation = "Filter dalam kondisi prima. Lanjutkan pemantauan.";
        result.daysLeft = 30 - (int)(volumeLiter / 1000);
        if (result.daysLeft < 0) result.daysLeft = 0;
    }
    
    if (ph < 6.5 || ph > 9.8) {
        result.reason += " | ⚠️ pH: " + String(ph, 2) + " (tidak normal - cek sumber air)";
    }
    
    return result;
}

#endif // WATER_RULES_H
