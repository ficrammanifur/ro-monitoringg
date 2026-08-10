/**
 * ============================================================
 * SMART RO WATER QUALITY MONITOR - MQTT Web Client
 * Fully Synchronized with ESP32 .ino
 * ============================================================
 */

// ==================== MQTT CONFIGURATION ====================
const MQTT_CONFIG = {
    broker: "wss://broker.hivemq.com:8884/mqtt",
    topic: "watermon/all",
    clientId: "ro_dashboard_" + Math.random().toString(16).substr(2, 8),
    reconnectPeriod: 3000,
    keepAlive: 60
};

// ==================== DOM REFERENCES ====================
const DOM = {
    // Connection Status
    connContainer: document.getElementById('connectionContainer'),
    connDot: document.getElementById('connectionDot'),
    connText: document.getElementById('connectionText'),
    mqttBadge: document.getElementById('mqttBadge'),
    espBadge: document.getElementById('espBadge'),
    lastUpdate: document.getElementById('lastUpdate'),
    dataCount: document.getElementById('dataCount'),
    lastMessage: document.getElementById('lastMessage'),
    
    // Water Status
    waterStatusText: document.getElementById('waterStatusText'),
    statusIconWrapper: document.getElementById('statusIconWrapper'),
    statusDetail: document.getElementById('statusDetail'),
    
    // Filter Health
    filterHealth: document.getElementById('filterHealth'),
    healthBar: document.getElementById('healthBar'),
    daysLeft: document.getElementById('daysLeft'),
    volumeTotal: document.getElementById('volumeTotal'),
    
    // Sensor Values
    phValue: document.getElementById('phValue'),
    tdsValue: document.getElementById('tdsValue'),
    turbidityValue: document.getElementById('turbidityValue'),
    tempValue: document.getElementById('tempValue'),
    
    // Sensor Badges
    phBadge: document.getElementById('phBadge'),
    tdsBadge: document.getElementById('tdsBadge'),
    turbBadge: document.getElementById('turbBadge'),
    tempBadge: document.getElementById('tempBadge'),
    
    // Filter Replacement
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

// ==================== MQTT LOGIC ====================
let client = null;

function initMQTT() {
    updateConnectionUI('connecting', 'Connecting...');
    
    client = mqtt.connect(MQTT_CONFIG.broker, {
        clientId: MQTT_CONFIG.clientId,
        reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
        keepAlive: MQTT_CONFIG.keepAlive
    });

    client.on('connect', () => {
        console.log('✅ Connected to MQTT Broker');
        state.mqttConnected = true;
        updateConnectionUI('connected', 'Broker Connected');
        DOM.mqttBadge.className = 'badge active';
        
        client.subscribe(MQTT_CONFIG.topic, (err) => {
            if (!err) {
                console.log('✅ Subscribed to topic:', MQTT_CONFIG.topic);
            } else {
                console.error('❌ Subscribe error:', err);
            }
        });
    });

    client.on('message', (topic, message) => {
        if (topic === MQTT_CONFIG.topic) {
            handleIncomingData(message.toString());
        }
    });

    client.on('error', (error) => {
        console.error('❌ MQTT Error:', error);
        state.mqttConnected = false;
        updateConnectionUI('disconnected', 'Connection Error');
        DOM.mqttBadge.className = 'badge inactive';
        DOM.espBadge.className = 'badge inactive';
    });

    client.on('offline', () => {
        console.log('⚠️ MQTT Offline');
        state.mqttConnected = false;
        state.espOnline = false;
        updateConnectionUI('disconnected', 'Offline');
        DOM.mqttBadge.className = 'badge inactive';
        DOM.espBadge.className = 'badge inactive';
    });
}

function handleIncomingData(payload) {
    try {
        const data = JSON.parse(payload);
        console.log('📥 Data received:', data);
        
        // Update State
        state.messageCount++;
        state.lastUpdateTime = new Date();
        state.espOnline = true;
        state.lastData = data;
        
        // Populate state values
        state.ph = data.ph;
        state.tds = data.tds;
        state.turbidity = data.turbidity_ntu;
        state.temperature = data.temperature;
        state.status = data.status;
        state.health = data.health;
        state.daysLeft = data.days_left;
        state.volume = data.volume;
        state.flowRate = data.flow_rate;
        state.filterNeedReplacement = data.filter_need_replacement;
        state.filterReason = data.filter_reason;
        state.filterRecommendation = data.filter_recommendation;
        state.filterScore = data.filter_score;
        state.phWarning = data.ph_warning;

        updateUI();
        
    } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        console.error('Payload:', payload);
    }
}

function updateConnectionUI(status, text) {
    DOM.connText.textContent = text;
    DOM.connDot.className = `dot ${status === 'connected' ? 'connected' : status === 'connecting' ? 'connecting' : 'disconnected'}`;
}

// ==================== UI UPDATES ====================
function updateUI() {
    // 1. Connection Header
    DOM.espBadge.className = 'badge active';
    DOM.dataCount.textContent = state.messageCount;
    DOM.lastUpdate.textContent = state.lastUpdateTime.toLocaleTimeString();
    
    // 2. Raw Debug JSON
    DOM.lastMessage.textContent = JSON.stringify(state.lastData, null, 2);
    
    // 3. Overall Status
    const status = state.status || "MENUNGGU";
    DOM.waterStatusText.textContent = status;
    
    let iconClass = 'fa-check';
    let wrapperClass = 'status-icon-wrapper good';
    let detailText = "Water is safe for consumption.";
    let textClass = 'good-text';
    
    if (status === "TIDAK LAYAK" || status === "BAHAYA") {
        iconClass = 'fa-triangle-exclamation';
        wrapperClass = 'status-icon-wrapper bad';
        detailText = "Water quality is unsafe. Do not consume.";
        textClass = 'bad-text';
    } else if (status === "PERINGATAN" || status === "KURANG LAYAK" || status === "CUKUP") {
        iconClass = 'fa-circle-exclamation';
        wrapperClass = 'status-icon-wrapper warning';
        detailText = "Parameters are borderline. Proceed with caution.";
        textClass = 'warning-text';
    } else if (status === "LAYAK" || status === "SAFE") {
        iconClass = 'fa-check';
        wrapperClass = 'status-icon-wrapper good';
        detailText = "Water is safe for consumption.";
        textClass = 'good-text';
    }
    
    DOM.statusIconWrapper.className = wrapperClass;
    DOM.statusIconWrapper.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    DOM.statusDetail.textContent = detailText;
    DOM.waterStatusText.className = textClass;
    
    // 4. Sensors
    DOM.phValue.textContent = typeof state.ph === 'number' ? state.ph.toFixed(2) : state.ph;
    updateParamBadge(DOM.phBadge, state.ph, 6.5, 8.5, "Safe", "Warn", "Danger");
    
    DOM.tdsValue.textContent = Math.round(state.tds || 0);
    updateParamBadge(DOM.tdsBadge, state.tds, 0, 100, "Pure", "Warn", "High", true);
    
    DOM.turbidityValue.textContent = typeof state.turbidity === 'number' ? state.turbidity.toFixed(2) : state.turbidity;
    updateParamBadge(DOM.turbBadge, state.turbidity, 0, 1.0, "Clear", "Cloudy", "Dirty", true);
    
    DOM.tempValue.textContent = typeof state.temperature === 'number' ? state.temperature.toFixed(1) : state.temperature;
    updateParamBadge(DOM.tempBadge, state.temperature, 15, 35, "Normal", "Warn", "Alert");
    
    // 5. Filter Health & Stats
    const health = state.health || 0;
    DOM.filterHealth.textContent = `${Math.round(health)}%`;
    DOM.healthBar.style.width = `${Math.min(health, 100)}%`;
    
    // Color health bar based on value
    if (health > 50) {
        DOM.healthBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
    } else if (health > 20) {
        DOM.healthBar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    } else {
        DOM.healthBar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    }
    
    DOM.daysLeft.textContent = `${state.daysLeft || 0} days`;
    DOM.volumeTotal.textContent = `${typeof state.volume === 'number' ? state.volume.toFixed(2) : state.volume || 0} L`;
    
    // 6. Maintenance Insights
    if (state.filterNeedReplacement) {
        DOM.filterReplaceStatus.textContent = "Replace Now";
        DOM.filterReplaceStatus.className = "insight-val badge-danger";
    } else if (health <= 30) {
        DOM.filterReplaceStatus.textContent = "Prepare to Replace";
        DOM.filterReplaceStatus.className = "insight-val badge-warning";
    } else {
        DOM.filterReplaceStatus.textContent = "Good Condition";
        DOM.filterReplaceStatus.className = "insight-val badge-success";
    }
    
    DOM.filterReplaceScore.textContent = `${Math.round(state.filterScore || 0)}/100`;
    DOM.filterReplaceReason.textContent = state.filterReason || "No data yet.";
    DOM.filterReplaceRecommend.textContent = state.filterRecommendation || "Please wait for data synchronization...";
}

function updateParamBadge(element, value, minSafe, maxSafe, safeLabel, warnLabel, dangerLabel, isLowerBetter = false) {
    if (value === null || value === undefined) {
        element.textContent = '--';
        element.className = 'param-badge neutral';
        return;
    }
    
    if (isLowerBetter) {
        if (value <= maxSafe) {
            element.textContent = safeLabel;
            element.className = 'param-badge safe';
        } else if (value <= maxSafe * 2) {
            element.textContent = warnLabel;
            element.className = 'param-badge warn';
        } else {
            element.textContent = dangerLabel;
            element.className = 'param-badge danger';
        }
    } else {
        if (value >= minSafe && value <= maxSafe) {
            element.textContent = safeLabel;
            element.className = 'param-badge safe';
        } else if (value < minSafe - 1 || value > maxSafe + 1) {
            element.textContent = dangerLabel;
            element.className = 'param-badge danger';
        } else {
            element.textContent = warnLabel;
            element.className = 'param-badge warn';
        }
    }
}

// ==================== AUTO-RECONNECT ====================
// Check ESP timeout
setInterval(() => {
    if (state.lastUpdateTime) {
        const now = new Date();
        const diff = (now - state.lastUpdateTime) / 1000;
        if (diff > 15 && state.espOnline) {
            state.espOnline = false;
            DOM.espBadge.className = 'badge inactive';
        }
    }
}, 5000);

// Auto-retry MQTT
setInterval(() => {
    if (!state.mqttConnected && client) {
        console.log('🔄 Attempting to reconnect...');
        client.reconnect();
    }
}, 30000);

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Smart RO Monitor Initialized');
    console.log('📡 MQTT Broker:', MQTT_CONFIG.broker);
    console.log('📋 Topic:', MQTT_CONFIG.topic);
    initMQTT();
});

// ==================== EXPOSE FOR DEBUG ====================
window.debug = {
    state: state,
    DOM: DOM,
    client: client
};
