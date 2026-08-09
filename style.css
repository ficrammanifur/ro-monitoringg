// ==================== CONFIG ====================
const MQTT_BROKER = "wss://broker.hivemq.com:8884/mqtt";
const MQTT_TOPIC = "watermon/all";

let client = null;
let messageCount = 0;

const THEME = {
    accent: '#00F0FF',
    success: '#00FF66',
    warning: '#FFD700',
    danger: '#FF2A54',
    bg: 'rgba(255,255,255,0.05)',
    textMuted: 'rgba(255,255,255,0.4)'
};

// ==================== DOM CACHE ====================
const DOM = {
    connContainer: document.getElementById('connectionContainer'),
    connDot: document.getElementById('connectionDot'),
    connText: document.getElementById('connectionText'),
    mqttBadge: document.getElementById('mqttBadge'),
    espBadge: document.getElementById('espBadge'),
    lastUpdate: document.getElementById('lastUpdate'),
    dataCount: document.getElementById('dataCount'),
    lastMessage: document.getElementById('lastMessage'),
    waterStatusText: document.getElementById('waterStatusText'),
    statusIconWrapper: document.getElementById('statusIconWrapper'),
    statusDetail: document.getElementById('statusDetail'),
    filterHealth: document.getElementById('filterHealth'),
    healthBar: document.getElementById('healthBar'),
    daysLeft: document.getElementById('daysLeft'),
    volumeTotal: document.getElementById('volumeTotal'),
    phValue: document.getElementById('phValue'),
    tdsValue: document.getElementById('tdsValue'),
    turbidityValue: document.getElementById('turbidityValue'),
    tempValue: document.getElementById('tempValue'),
    phBadge: document.getElementById('phBadge'),
    tdsBadge: document.getElementById('tdsBadge'),
    turbBadge: document.getElementById('turbBadge'),
    tempBadge: document.getElementById('tempBadge'),
    filterReplaceStatus: document.getElementById('filterReplaceStatus'),
    filterReplaceScore: document.getElementById('filterReplaceScore'),
    filterReplaceReason: document.getElementById('filterReplaceReason'),
    filterReplaceRecommend: document.getElementById('filterReplaceRecommend'),
};

let charts = null;

// ==================== CHARTS ====================
Chart.defaults.color = 'rgba(255,255,255,0.5)';
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size = 10;

function initCharts() {
    const createChartOptions = (borderColor, bgColor, minY, maxY) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(6, 19, 37, 0.9)',
                titleColor: '#fff',
                bodyColor: borderColor,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `Value: ${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { maxTicksLimit: 6, maxRotation: 0 }
            },
            y: {
                min: minY || 0,
                max: maxY || 100,
                grid: { color: 'rgba(255,255,255,0.05)', borderDash: [2, 4], drawBorder: false }
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 2,
                shadowBlur: 10,
                shadowColor: borderColor
            },
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4,
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: borderColor
            }
        }
    });

    const phCtx = document.getElementById('phChart').getContext('2d');
    const phGradient = phCtx.createLinearGradient(0, 0, 0, 300);
    phGradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    phGradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    const tdsCtx = document.getElementById('tdsChart').getContext('2d');
    const tdsGradient = tdsCtx.createLinearGradient(0, 0, 0, 300);
    tdsGradient.addColorStop(0, 'rgba(0, 255, 102, 0.4)');
    tdsGradient.addColorStop(1, 'rgba(0, 255, 102, 0.0)');

    charts = {
        ph: new Chart(phCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: THEME.accent,
                    backgroundColor: phGradient,
                    fill: true
                }]
            },
            options: { 
                ...createChartOptions(THEME.accent, null, 0, 14),
                scales: {
                    y: { 
                        min: 0, 
                        max: 14,
                        grid: { color: 'rgba(255,255,255,0.05)', borderDash: [2, 4], drawBorder: false }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { maxTicksLimit: 6, maxRotation: 0 }
                    }
                }
            }
        }),
        tds: new Chart(tdsCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: THEME.success,
                    backgroundColor: tdsGradient,
                    fill: true
                }]
            },
            options: { 
                ...createChartOptions(THEME.success, null, 0, 500),
                scales: {
                    y: { 
                        min: 0, 
                        max: 500,
                        grid: { color: 'rgba(255,255,255,0.05)', borderDash: [2, 4], drawBorder: false }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { maxTicksLimit: 6, maxRotation: 0 }
                    }
                }
            }
        })
    };
}

// ==================== MQTT ====================
function connectToMQTT() {
    client = mqtt.connect(MQTT_BROKER, {
        clientId: 'nexus_dash_' + Math.random().toString(16).substr(2, 8),
        reconnectPeriod: 3000
    });

    client.on("connect", () => {
        DOM.connText.textContent = "SYSTEM ONLINE";
        DOM.connText.className = "text-sm font-bold text-ocean-accent tracking-widest";
        DOM.connDot.className = "status-dot bg-ocean-accent shadow-neon-glow";
        DOM.connContainer.className = "flex items-center gap-3 px-4 py-2 rounded-xl bg-ocean-accent/10 border border-ocean-accent/30";
        updateMiniBadge(DOM.mqttBadge, true, "MQTT LINKED");
        updateMiniBadge(DOM.espBadge, false, "AWAITING NODE", THEME.warning);
        client.subscribe(MQTT_TOPIC);
    });

    client.on("offline", () => {
        DOM.connText.textContent = "CONNECTION LOST";
        DOM.connText.className = "text-sm font-bold text-ocean-danger tracking-widest";
        DOM.connDot.className = "status-dot bg-ocean-danger";
        DOM.connContainer.className = "flex items-center gap-3 px-4 py-2 rounded-xl bg-ocean-danger/10 border border-ocean-danger/30";
        updateMiniBadge(DOM.mqttBadge, false, "MQTT OFFLINE", THEME.danger);
        updateMiniBadge(DOM.espBadge, false, "NODE OFFLINE", THEME.danger);
    });

    client.on("message", (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            updateMiniBadge(DOM.espBadge, true, "NODE ACTIVE", THEME.success);
            messageCount++;
            DOM.dataCount.textContent = `RX: ${messageCount} PKT`;
            const now = new Date();
            DOM.lastUpdate.textContent = now.toLocaleTimeString('en-US', { hour12: false });
            DOM.lastMessage.textContent = `Last sig: ${now.getSeconds()}s ago`;
            processIncomingData(data);
        } catch (e) {
            console.error("Payload parse error:", e);
        }
    });
}

function updateMiniBadge(element, isGood, text, colorCode = THEME.success) {
    const dot = element.querySelector('.status-dot');
    const span = element.querySelector('span:last-child');
    span.textContent = text;
    if (isGood) {
        element.style.borderColor = `rgba(${hexToRgb(colorCode)}, 0.3)`;
        element.style.backgroundColor = `rgba(${hexToRgb(colorCode)}, 0.1)`;
        dot.style.backgroundColor = colorCode;
        dot.style.color = colorCode;
        span.style.color = colorCode;
    } else {
        element.style.borderColor = `rgba(${hexToRgb(colorCode)}, 0.3)`;
        element.style.backgroundColor = `rgba(0,0,0,0.4)`;
        dot.style.backgroundColor = colorCode;
        dot.style.color = colorCode;
        span.style.color = `rgba(${hexToRgb(colorCode)}, 0.8)`;
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255';
}

// ==================== DATA PROCESSING ====================
function styleValueBadge(element, condition, textGood, textBad) {
    if (condition) {
        element.textContent = textGood;
        element.className = "inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 uppercase tracking-widest";
    } else {
        element.textContent = textBad;
        element.className = "inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF2A54]/10 text-[#FF2A54] border border-[#FF2A54]/30 uppercase tracking-widest animate-pulse";
    }
}

function processIncomingData(data) {
    // 1. Update Grid Values
    if (data.ph !== undefined) {
        DOM.phValue.textContent = data.ph.toFixed(2);
        styleValueBadge(DOM.phBadge, data.ph >= 6.5 && data.ph <= 8.5, "OPTIMAL", "WARNING");
    }
    if (data.tds !== undefined) {
        DOM.tdsValue.textContent = data.tds.toFixed(0);
        styleValueBadge(DOM.tdsBadge, data.tds < 50, "PURE", "HIGH TDS");
    }
    if (data.turbidity_ntu !== undefined) {
        DOM.turbidityValue.textContent = data.turbidity_ntu.toFixed(1);
        styleValueBadge(DOM.turbBadge, data.turbidity_ntu < 5, "CLEAR", "CLOUDY");
    }
    if (data.temperature !== undefined) {
        DOM.tempValue.textContent = data.temperature.toFixed(1);
        styleValueBadge(DOM.tempBadge, data.temperature > 15 && data.temperature < 35, "NOMINAL", "ALERT");
    }

    // 2. Water Status
    if (data.status) {
        const status = data.status.toUpperCase();
        if (status === 'LAYAK' || status === 'SAFE') {
            DOM.waterStatusText.textContent = "SAFE TO DRINK";
            DOM.waterStatusText.className = "text-3xl font-extrabold tracking-tight z-10 text-ocean-success mb-1";
            DOM.statusIconWrapper.innerHTML = `<svg class="w-16 h-16 text-ocean-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            DOM.statusDetail.textContent = "Semua parameter dalam batas normal";
        } else if (status === 'CUKUP') {
            DOM.waterStatusText.textContent = "CAUTION";
            DOM.waterStatusText.className = "text-3xl font-extrabold tracking-tight z-10 text-ocean-warning mb-1";
            DOM.statusIconWrapper.innerHTML = `<svg class="w-16 h-16 text-ocean-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
            DOM.statusDetail.textContent = "Beberapa parameter mendekati batas";
        } else {
            DOM.waterStatusText.textContent = "NOT SAFE";
            DOM.waterStatusText.className = "text-3xl font-extrabold tracking-tight z-10 text-ocean-danger mb-1 animate-pulse";
            DOM.statusIconWrapper.innerHTML = `<svg class="w-16 h-16 text-ocean-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            DOM.statusDetail.textContent = "Air tidak layak konsumsi!";
        }
    }

    // 3. Filter Health
    if (data.health !== undefined) {
        const health = data.health;
        DOM.filterHealth.textContent = health.toFixed(0);
        DOM.healthBar.style.width = health + '%';
        if (health < 50) {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #FF2A54, #FFD700)';
        } else if (health < 70) {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #FFD700, #00FF66)';
        } else {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #00F0FF, #00FF66)';
        }
    }
    if (data.days_left !== undefined) {
        DOM.daysLeft.textContent = data.days_left + ' Days';
    }
    if (data.volume !== undefined) {
        DOM.volumeTotal.textContent = data.volume.toFixed(1) + ' L';
    }

    // 4. Filter Replacement
    if (data.filter_need_replacement !== undefined) {
        updateFilterReplacement({
            needReplacement: data.filter_need_replacement,
            filterHealth: data.filter_score || data.health,
            filterReason: data.filter_reason || "Normal",
            filterRecommendation: data.filter_recommendation || "Lanjutkan pemantauan"
        });
    }

    // 5. Charts
    const now = new Date();
    const timeLabel = now.getHours().toString().padStart(2,'0') + ':' + 
                      now.getMinutes().toString().padStart(2,'0');

    if (charts) {
        if (data.ph !== undefined) {
            charts.ph.data.labels.push(timeLabel);
            charts.ph.data.datasets[0].data.push(data.ph);
            if (charts.ph.data.labels.length > 20) {
                charts.ph.data.labels.shift();
                charts.ph.data.datasets[0].data.shift();
            }
            charts.ph.update();
        }
        if (data.tds !== undefined) {
            charts.tds.data.labels.push(timeLabel);
            charts.tds.data.datasets[0].data.push(data.tds);
            if (charts.tds.data.labels.length > 20) {
                charts.tds.data.labels.shift();
                charts.tds.data.datasets[0].data.shift();
            }
            charts.tds.update();
        }
    }
}

// ==================== FILTER REPLACEMENT ====================
function updateFilterReplacement(data) {
    if (!data) return;
    
    const needReplace = data.needReplacement || false;
    const filterScore = data.filterHealth || 0;
    const filterReason = data.filterReason || "Normal";
    const filterRecommend = data.filterRecommendation || "Lanjutkan pemantauan";
    
    if (DOM.filterReplaceStatus) {
        if (needReplace) {
            DOM.filterReplaceStatus.textContent = "⚠️ SEGERA GANTI FILTER";
            DOM.filterReplaceStatus.className = "text-sm font-bold text-ocean-danger tracking-wider animate-pulse";
        } else if (filterScore < 60) {
            DOM.filterReplaceStatus.textContent = "🔄 Persiapan Ganti Filter";
            DOM.filterReplaceStatus.className = "text-sm font-bold text-ocean-warning tracking-wider";
        } else {
            DOM.filterReplaceStatus.textContent = "✅ Filter OK";
            DOM.filterReplaceStatus.className = "text-sm font-bold text-ocean-success tracking-wider";
        }
    }
    if (DOM.filterReplaceScore) {
        DOM.filterReplaceScore.textContent = filterScore.toFixed(0) + "%";
    }
    if (DOM.filterReplaceReason) {
        DOM.filterReplaceReason.textContent = filterReason;
    }
    if (DOM.filterReplaceRecommend) {
        DOM.filterReplaceRecommend.textContent = filterRecommend;
    }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    connectToMQTT();
});
