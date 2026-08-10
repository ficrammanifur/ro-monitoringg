/**
 * ============================================================
 * SMART RO WATER QUALITY MONITOR - MQTT Web Client
 * FULLY SYNCHRONIZED WITH ESP32 .ino
 * ============================================================
 */

// ==================== CONFIG ====================
const MQTT_BROKER = "wss://broker.hivemq.com:8884/mqtt";
const MQTT_TOPIC = "watermon/all";

let client = null;
let messageCount = 0;

// ==================== DOM REFERENCES ====================
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

// ==================== STATE ====================
let state = {
    connected: false,
    mqttConnected: false,
    espOnline: false,
    messageCount: 0,
    lastData: null,
    lastUpdateTime: null,
    ph: null,
    tds: null,
    turbidity: null,
    temperature: null,
    status: null,
    health: null,
    daysLeft: null,
    volume: null,
    flowRate: null,
    filterNeedReplacement: null,
    filterReason: null,
    filterRecommendation: null,
    filterScore: null,
    phWarning: null,
};

// ==================== CHARTS ====================
let charts = {
    ph: null,
    tds: null,
    labels: [],
    phData: [],
    tdsData: [],
    maxPoints: 20
};

// ==================== INIT CHARTS ====================
function initCharts() {
    Chart.defaults.color = 'rgba(255,255,255,0.5)';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.font.size = 10;

    // pH Chart
    const phCtx = document.getElementById('phChart').getContext('2d');
    const phGradient = phCtx.createLinearGradient(0, 0, 0, 200);
    phGradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    phGradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    charts.ph = new Chart(phCtx, {
        type: 'line',
        data: {
            labels: charts.labels,
            datasets: [{
                data: charts.phData,
                borderColor: '#00F0FF',
                backgroundColor: phGradient,
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(6,19,37,0.9)',
                    titleColor: '#fff',
                    bodyColor: '#00F0FF',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10,
                }
            },
            scales: {
                x: { 
                    grid: { display: false }, 
                    ticks: { maxTicksLimit: 6, color: 'rgba(255,255,255,0.3)' } 
                },
                y: { 
                    min: 0, 
                    max: 14, 
                    grid: { color: 'rgba(255,255,255,0.05)' }, 
                    ticks: { color: 'rgba(255,255,255,0.3)' } 
                }
            }
        }
    });

    // TDS Chart
    const tdsCtx = document.getElementById('tdsChart').getContext('2d');
    const tdsGradient = tdsCtx.createLinearGradient(0, 0, 0, 200);
    tdsGradient.addColorStop(0, 'rgba(0, 255, 102, 0.4)');
    tdsGradient.addColorStop(1, 'rgba(0, 255, 102, 0.0)');

    charts.tds = new Chart(tdsCtx, {
        type: 'line',
        data: {
            labels: charts.labels,
            datasets: [{
                data: charts.tdsData,
                borderColor: '#00FF66',
                backgroundColor: tdsGradient,
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(6,19,37,0.9)',
                    titleColor: '#fff',
                    bodyColor: '#00FF66',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10,
                }
            },
            scales: {
                x: { 
                    grid: { display: false }, 
                    ticks: { maxTicksLimit: 6, color: 'rgba(255,255,255,0.3)' } 
                },
                y: { 
                    min: 0, 
                    max: 500, 
                    grid: { color: 'rgba(255,255,255,0.05)' }, 
                    ticks: { color: 'rgba(255,255,255,0.3)' } 
                }
            }
        }
    });
}

// ==================== UPDATE CHARTS ====================
function updateCharts(ph, tds) {
    const now = new Date();
    const label = now.getHours().toString().padStart(2, '0') + ':' + 
                  now.getMinutes().toString().padStart(2, '0');

    if (ph !== null && ph !== undefined) {
        charts.labels.push(label);
        charts.phData.push(ph);
        if (charts.labels.length > charts.maxPoints) {
            charts.labels.shift();
            charts.phData.shift();
        }
        charts.ph.data.labels = charts.labels;
        charts.ph.data.datasets[0].data = charts.phData;
        charts.ph.update('none');
    }

    if (tds !== null && tds !== undefined) {
        charts.tdsData.push(tds);
        if (charts.tdsData.length > charts.maxPoints) {
            charts.tdsData.shift();
        }
        charts.tds.data.labels = charts.labels;
        charts.tds.data.datasets[0].data = charts.tdsData;
        charts.tds.update('none');
    }
}

// ==================== MQTT CONNECTION ====================
function connectMQTT() {
    try {
        client = mqtt.connect(MQTT_BROKER, {
            clientId: 'ro_dash_' + Math.random().toString(16).substr(2, 8),
            reconnectPeriod: 3000,
            keepAlive: 60
        });

        client.on('connect', function() {
            console.log('✅ MQTT Connected to:', MQTT_BROKER);
            state.mqttConnected = true;
            updateConnectionStatus(true);
            client.subscribe(MQTT_TOPIC, function(err) {
                if (!err) {
                    console.log('✅ Subscribed to:', MQTT_TOPIC);
                } else {
                    console.error('❌ Subscribe error:', err);
                }
            });
        });

        client.on('offline', function() {
            console.log('⚠️ MQTT Offline');
            state.mqttConnected = false;
            updateConnectionStatus(false);
        });

        client.on('error', function(err) {
            console.error('❌ MQTT Error:', err);
            state.mqttConnected = false;
            updateConnectionStatus(false);
        });

        client.on('message', function(topic, message) {
            try {
                const payload = message.toString();
                const data = JSON.parse(payload);
                console.log('📥 Data received:', data);
                processData(data);
            } catch (e) {
                console.error('❌ Parse error:', e);
            }
        });

    } catch (e) {
        console.error('❌ Connection error:', e);
        setTimeout(connectMQTT, 5000);
    }
}

// ==================== CONNECTION STATUS ====================
function updateConnectionStatus(isConnected) {
    state.connected = isConnected;
    
    if (isConnected) {
        DOM.connText.textContent = 'SYSTEM ONLINE';
        DOM.connText.className = 'text-sm font-bold text-[#00F0FF] tracking-widest';
        DOM.connDot.className = 'status-dot online';
        DOM.connContainer.className = 'flex items-center gap-3 px-4 py-2 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30';
        updateBadge(DOM.mqttBadge, true, 'MQTT LINKED', '#00FF66');
    } else {
        DOM.connText.textContent = 'CONNECTION LOST';
        DOM.connText.className = 'text-sm font-bold text-[#FF2A54] tracking-widest';
        DOM.connDot.className = 'status-dot offline';
        DOM.connContainer.className = 'flex items-center gap-3 px-4 py-2 rounded-xl bg-[#FF2A54]/10 border border-[#FF2A54]/30';
        updateBadge(DOM.mqttBadge, false, 'MQTT OFFLINE', '#FF2A54');
        updateBadge(DOM.espBadge, false, 'NODE OFFLINE', '#FF2A54');
    }
}

function updateBadge(element, isGood, text, color) {
    const dot = element.querySelector('.status-dot');
    const span = element.querySelector('span:last-child');
    span.textContent = text;
    if (isGood) {
        element.style.borderColor = 'rgba(0, 255, 102, 0.3)';
        element.style.backgroundColor = 'rgba(0, 255, 102, 0.1)';
        dot.className = 'status-dot online';
        dot.style.width = '8px';
        dot.style.height = '8px';
        span.style.color = '#00FF66';
    } else {
        element.style.borderColor = 'rgba(255, 42, 84, 0.3)';
        element.style.backgroundColor = 'rgba(0,0,0,0.4)';
        dot.className = 'status-dot offline';
        dot.style.width = '8px';
        dot.style.height = '8px';
        span.style.color = color || '#FF2A54';
    }
}

// ==================== DATA PROCESSING ====================
function processData(data) {
    // Update state
    state.lastData = data;
    state.lastUpdateTime = new Date();
    state.messageCount++;
    state.espOnline = true;

    // Update counters
    DOM.dataCount.textContent = state.messageCount + ' packets rx';
    DOM.lastUpdate.textContent = state.lastUpdateTime.toLocaleTimeString('en-US', { hour12: false });
    DOM.lastMessage.textContent = 'Last signal: ' + state.lastUpdateTime.getSeconds() + 's ago';

    // ESP is online
    updateBadge(DOM.espBadge, true, 'NODE ACTIVE', '#00FF66');

    // ========== SENSOR VALUES ==========
    // pH
    if (data.ph !== undefined) {
        state.ph = data.ph;
        DOM.phValue.textContent = data.ph.toFixed(2);
        setBadge(DOM.phBadge, data.ph >= 6.5 && data.ph <= 8.5, 'OPTIMAL', 'WARNING');
    }

    // TDS
    if (data.tds !== undefined) {
        state.tds = data.tds;
        DOM.tdsValue.textContent = data.tds.toFixed(0);
        setBadge(DOM.tdsBadge, data.tds < 50, 'PURE', 'HIGH TDS');
    }

    // Turbidity
    if (data.turbidity_ntu !== undefined) {
        state.turbidity = data.turbidity_ntu;
        DOM.turbidityValue.textContent = data.turbidity_ntu.toFixed(1);
        setBadge(DOM.turbBadge, data.turbidity_ntu < 5, 'CLEAR', 'CLOUDY');
    }

    // Temperature
    if (data.temperature !== undefined) {
        state.temperature = data.temperature;
        DOM.tempValue.textContent = data.temperature.toFixed(1);
        setBadge(DOM.tempBadge, data.temperature >= 15 && data.temperature <= 35, 'NOMINAL', 'ALERT');
    }

    // ========== WATER STATUS ==========
    if (data.status) {
        state.status = data.status;
        const status = data.status.toUpperCase();
        if (status === 'LAYAK' || status === 'SAFE') {
            DOM.waterStatusText.textContent = 'SAFE TO DRINK';
            DOM.waterStatusText.className = 'text-3xl font-extrabold tracking-tight z-10 text-[#00FF66] mb-1 text-shadow-sm';
            DOM.statusIconWrapper.innerHTML = '✅';
            DOM.statusDetail.textContent = 'Semua parameter dalam batas normal';
        } else if (status === 'CUKUP') {
            DOM.waterStatusText.textContent = 'CAUTION';
            DOM.waterStatusText.className = 'text-3xl font-extrabold tracking-tight z-10 text-[#FFD700] mb-1';
            DOM.statusIconWrapper.innerHTML = '⚠️';
            DOM.statusDetail.textContent = 'Beberapa parameter mendekati batas';
        } else {
            DOM.waterStatusText.textContent = 'NOT SAFE';
            DOM.waterStatusText.className = 'text-3xl font-extrabold tracking-tight z-10 text-[#FF2A54] mb-1 animate-pulse';
            DOM.statusIconWrapper.innerHTML = '❌';
            DOM.statusDetail.textContent = 'Air tidak layak konsumsi!';
        }
    }

    // ========== FILTER HEALTH ==========
    if (data.health !== undefined) {
        state.health = data.health;
        state.filterScore = data.health;
        DOM.filterHealth.textContent = data.health.toFixed(0);
        DOM.healthBar.style.width = data.health + '%';
        
        if (data.health < 50) {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #FF2A54, #FFD700)';
        } else if (data.health < 70) {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #FFD700, #00FF66)';
        } else {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #00F0FF, #00FF66)';
        }
    }

    if (data.days_left !== undefined) {
        state.daysLeft = data.days_left;
        DOM.daysLeft.textContent = data.days_left + ' Days';
    }

    if (data.volume !== undefined) {
        state.volume = data.volume;
        DOM.volumeTotal.textContent = data.volume.toFixed(1) + ' L';
    }

    // ========== FILTER REPLACEMENT ==========
    if (data.filter_need_replacement !== undefined) {
        state.filterNeedReplacement = data.filter_need_replacement;
        state.filterReason = data.filter_reason || 'Normal';
        state.filterRecommendation = data.filter_recommendation || 'Lanjutkan pemantauan';
        
        if (data.filter_need_replacement === true) {
            DOM.filterReplaceStatus.textContent = '⚠️ SEGERA GANTI FILTER';
            DOM.filterReplaceStatus.className = 'text-sm font-bold text-[#FF2A54] tracking-wider animate-pulse';
        } else if (data.filter_score < 60) {
            DOM.filterReplaceStatus.textContent = '🔄 Persiapan Ganti';
            DOM.filterReplaceStatus.className = 'text-sm font-bold text-[#FFD700] tracking-wider';
        } else {
            DOM.filterReplaceStatus.textContent = '✅ Filter OK';
            DOM.filterReplaceStatus.className = 'text-sm font-bold text-[#00FF66] tracking-wider';
        }
        
        DOM.filterReplaceScore.textContent = (data.filter_score || 0).toFixed(0) + '%';
        DOM.filterReplaceReason.textContent = data.filter_reason || 'Normal';
        DOM.filterReplaceRecommend.textContent = data.filter_recommendation || 'Lanjutkan pemantauan';
    }

    // ========== UPDATE CHARTS ==========
    updateCharts(state.ph, state.tds);
}

// ==================== BADGE HELPER ====================
function setBadge(element, isGood, textGood, textBad) {
    if (isGood) {
        element.textContent = textGood;
        element.className = 'inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30 uppercase tracking-wider';
    } else {
        element.textContent = textBad;
        element.className = 'inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF2A54]/15 text-[#FF2A54] border border-[#FF2A54]/30 uppercase tracking-wider animate-pulse';
    }
}

// ==================== AUTO-RECONNECT HEARTBEAT ====================
setInterval(function() {
    if (!state.mqttConnected && window.mqttClient) {
        console.log('🔄 Reconnecting...');
        window.mqttClient.reconnect();
    }
}, 30000);

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Smart RO Monitor Initialized');
    console.log('📡 MQTT Broker:', MQTT_BROKER);
    console.log('📋 Topic:', MQTT_TOPIC);
    initCharts();
    connectMQTT();
});

// ==================== EXPOSE FOR DEBUG ====================
window.debug = {
    state: state,
    DOM: DOM,
    charts: charts,
    client: client
};
