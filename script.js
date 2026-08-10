/**
 * ============================================================
 * SMART RO WATER QUALITY MONITOR - MQTT Web Client
 * FULLY SYNCHRONIZED WITH ESP32 .ino
 * DENGAN DEBUG LOG LENGKAP
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

// ==================== MQTT LOGIC ====================
function initMQTT() {
    console.log('🔄 Connecting to MQTT...');
    updateConnectionUI('connecting', 'Connecting...');
    
    try {
        client = mqtt.connect(MQTT_BROKER, {
            clientId: 'ro_dash_' + Math.random().toString(16).substr(2, 8),
            reconnectPeriod: 3000,
            keepAlive: 60,
            clean: true
        });

        client.on('connect', () => {
            console.log('✅ Connected to MQTT Broker');
            state.mqttConnected = true;
            updateConnectionUI('connected', 'Broker Connected');
            DOM.mqttBadge.className = 'badge active';
            
            // Subscribe dengan error handling
            client.subscribe(MQTT_TOPIC, { qos: 1 }, (err) => {
                if (!err) {
                    console.log('✅ Subscribed to topic:', MQTT_TOPIC);
                    DOM.lastMessage.textContent = '✅ Subscribed to: ' + MQTT_TOPIC;
                } else {
                    console.error('❌ Subscribe error:', err);
                    DOM.lastMessage.textContent = '❌ Subscribe error: ' + err.message;
                }
            });
        });

        client.on('message', (topic, message) => {
            console.log('📥 Raw message received on topic:', topic);
            console.log('📥 Payload:', message.toString());
            
            if (topic === MQTT_TOPIC) {
                handleIncomingData(message.toString());
            } else {
                console.log('⚠️ Ignoring topic:', topic);
            }
        });

        client.on('error', (error) => {
            console.error('❌ MQTT Error:', error);
            state.mqttConnected = false;
            updateConnectionUI('disconnected', 'Connection Error');
            DOM.mqttBadge.className = 'badge inactive';
            DOM.espBadge.className = 'badge inactive';
            DOM.lastMessage.textContent = '❌ MQTT Error: ' + error.message;
        });

        client.on('offline', () => {
            console.log('⚠️ MQTT Offline');
            state.mqttConnected = false;
            state.espOnline = false;
            updateConnectionUI('disconnected', 'Offline');
            DOM.mqttBadge.className = 'badge inactive';
            DOM.espBadge.className = 'badge inactive';
            DOM.lastMessage.textContent = '⚠️ MQTT Offline - Reconnecting...';
        });

        client.on('reconnect', () => {
            console.log('🔄 MQTT Reconnecting...');
            DOM.lastMessage.textContent = '🔄 MQTT Reconnecting...';
        });

    } catch (e) {
        console.error('❌ Connection error:', e);
        DOM.lastMessage.textContent = '❌ Connection error: ' + e.message;
        setTimeout(initMQTT, 5000);
    }
}

function handleIncomingData(payload) {
    console.log('📥 Processing payload...');
    
    try {
        const data = JSON.parse(payload);
        console.log('✅ JSON parsed successfully:', data);
        
        // Update State
        state.messageCount++;
        state.lastUpdateTime = new Date();
        state.espOnline = true;
        state.lastData = data;
        
        // Populate state values dengan validasi
        state.ph = data.ph !== undefined ? data.ph : null;
        state.tds = data.tds !== undefined ? data.tds : null;
        state.turbidity = data.turbidity_ntu !== undefined ? data.turbidity_ntu : null;
        state.temperature = data.temperature !== undefined ? data.temperature : null;
        state.status = data.status || "UNKNOWN";
        state.health = data.health !== undefined ? data.health : null;
        state.daysLeft = data.days_left !== undefined ? data.days_left : null;
        state.volume = data.volume !== undefined ? data.volume : null;
        state.flowRate = data.flow_rate !== undefined ? data.flow_rate : null;
        state.filterNeedReplacement = data.filter_need_replacement !== undefined ? data.filter_need_replacement : false;
        state.filterReason = data.filter_reason || "No data";
        state.filterRecommendation = data.filter_recommendation || "No data";
        state.filterScore = data.filter_score !== undefined ? data.filter_score : null;
        state.phWarning = data.ph_warning !== undefined ? data.ph_warning : false;

        console.log('📊 Updated state:', state);
        updateUI();
        
    } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        console.error('📄 Payload was:', payload);
        DOM.lastMessage.textContent = '❌ Parse error: ' + e.message + '\nPayload: ' + payload.substring(0, 100) + '...';
    }
}

function updateConnectionUI(status, text) {
    DOM.connText.textContent = text;
    DOM.connDot.className = `dot ${status === 'connected' ? 'connected' : status === 'connecting' ? 'connecting' : 'disconnected'}`;
}

// ==================== UI UPDATES ====================
function updateUI() {
    console.log('🔄 Updating UI...');
    
    // 1. Connection Header
    DOM.espBadge.className = 'badge active';
    DOM.dataCount.textContent = state.messageCount;
    if (state.lastUpdateTime) {
        DOM.lastUpdate.textContent = state.lastUpdateTime.toLocaleTimeString();
    }
    
    // 2. Raw Debug JSON
    if (state.lastData) {
        DOM.lastMessage.textContent = JSON.stringify(state.lastData, null, 2);
    }
    
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
    if (state.ph !== null) {
        DOM.phValue.textContent = state.ph.toFixed(2);
        updateParamBadge(DOM.phBadge, state.ph, 6.5, 8.5, "Safe", "Warn", "Danger");
    }
    
    if (state.tds !== null) {
        DOM.tdsValue.textContent = Math.round(state.tds);
        updateParamBadge(DOM.tdsBadge, state.tds, 0, 100, "Pure", "Warn", "High", true);
    }
    
    if (state.turbidity !== null) {
        DOM.turbidityValue.textContent = state.turbidity.toFixed(2);
        updateParamBadge(DOM.turbBadge, state.turbidity, 0, 1.0, "Clear", "Cloudy", "Dirty", true);
    }
    
    if (state.temperature !== null) {
        DOM.tempValue.textContent = state.temperature.toFixed(1);
        updateParamBadge(DOM.tempBadge, state.temperature, 15, 35, "Normal", "Warn", "Alert");
    }
    
    // 5. Filter Health & Stats
    if (state.health !== null) {
        const health = state.health;
        DOM.filterHealth.textContent = `${Math.round(health)}%`;
        DOM.healthBar.style.width = `${Math.min(health, 100)}%`;
        
        if (health > 50) {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
        } else if (health > 20) {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        } else {
            DOM.healthBar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        }
    }
    
    if (state.daysLeft !== null) {
        DOM.daysLeft.textContent = `${state.daysLeft} days`;
    }
    
    if (state.volume !== null) {
        DOM.volumeTotal.textContent = `${state.volume.toFixed(2)} L`;
    }
    
    // 6. Maintenance Insights
    if (state.filterNeedReplacement) {
        DOM.filterReplaceStatus.textContent = "Replace Now";
        DOM.filterReplaceStatus.className = "insight-val badge-danger";
    } else if (state.health !== null && state.health <= 30) {
        DOM.filterReplaceStatus.textContent = "Prepare to Replace";
        DOM.filterReplaceStatus.className = "insight-val badge-warning";
    } else {
        DOM.filterReplaceStatus.textContent = "Good Condition";
        DOM.filterReplaceStatus.className = "insight-val badge-success";
    }
    
    if (state.filterScore !== null) {
        DOM.filterReplaceScore.textContent = `${Math.round(state.filterScore)}/100`;
    }
    
    if (state.filterReason) {
        DOM.filterReplaceReason.textContent = state.filterReason;
    }
    
    if (state.filterRecommendation) {
        DOM.filterReplaceRecommend.textContent = state.filterRecommendation;
    }
    
    console.log('✅ UI Update complete');
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

setInterval(() => {
    if (!state.mqttConnected && client) {
        console.log('🔄 Auto-reconnect triggered...');
        client.reconnect();
    }
}, 30000);

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Smart RO Monitor Initialized');
    console.log('📡 MQTT Broker:', MQTT_BROKER);
    console.log('📋 Topic:', MQTT_TOPIC);
    initMQTT();
});

// ==================== EXPOSE FOR DEBUG ====================
window.debug = {
    state: state,
    DOM: DOM,
    client: client,
    MQTT_CONFIG: { broker: MQTT_BROKER, topic: MQTT_TOPIC }
};

console.log('🔧 Debug: Type "debug" in console to see state');
console.log('🔧 Debug: Type "debug.state" to see current data');
