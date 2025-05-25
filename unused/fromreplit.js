// Global variables
let isConnected = false;
let selectedDevice = null;

// Ensure we're checking if Android interface is available
window.addEventListener('load', function() {
    console.log('Window loaded, checking Android interface again');
    if (typeof Android !== 'undefined') {
        console.log('Android interface is available on window load');
        checkConnectionState();
    } else {
        console.log('Android interface is still NOT available on window load');
    }
});

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing UI elements');
    // Connection elements
    const connectionStatus = document.getElementById('connection-status');
    const deviceName = document.getElementById('device-name');
    const deviceAddress = document.getElementById('device-address');
    const deviceNameContainer = document.getElementById('device-name-container');
    const deviceAddressContainer = document.getElementById('device-address-container');
    const btnScan = document.getElementById('btn-scan');
    const btnDisconnect = document.getElementById('btn-disconnect');
    
    // Control elements
    const messageInput = document.getElementById('message-input');
    const btnSend = document.getElementById('btn-send');
    const cmdButtons = document.querySelectorAll('.cmd-btn');
    
    // Log elements
    const logContainer = document.getElementById('log-container');
    const btnClearLog = document.getElementById('btn-clear-log');
    
    // Initialize by checking current connection state
    checkConnectionState();
    
    // Event Listeners
    btnScan.addEventListener('click', scanForDevices);
    btnDisconnect.addEventListener('click', disconnectDevice);
    btnSend.addEventListener('click', sendMessage);
    btnClearLog.addEventListener('click', clearLog);
    
    // Add event listeners to command buttons
    cmdButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.getAttribute('data-command');
            sendCommand(command);
        });
    });
    
    // Enter key in message input
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Functions
    function scanForDevices() {
        addLogEntry('System: Scanning for devices...', 'system');
        // Call Android function to show device list
        if (typeof Android !== 'undefined') {
            Android.showDeviceList();
        } else {
            addLogEntry('Error: Android interface not available', 'error');
        }
    }
    
    function disconnectDevice() {
        if (typeof Android !== 'undefined') {
            Android.disconnect();
            // The callback will handle UI updates
        } else {
            addLogEntry('Error: Android interface not available', 'error');
        }
    }
    
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message && isConnected) {
            if (typeof Android !== 'undefined') {
                // Check if it starts with "0x" for hex data
                if (message.startsWith('0x')) {
                    // This is a hex string, convert to binary
                    sendHexData(message.substring(2));
                } else if (message.startsWith('bin:')) {
                    // This is binary data in format like "bin:01001010"
                    sendBinaryString(message.substring(4));
                } else {
                    // Regular text message
                    const success = Android.sendData(message);
                    if (success) {
                        addLogEntry(`Sent text: ${message}`, 'sent');
                        messageInput.value = '';
                    } else {
                        addLogEntry('Error: Failed to send message', 'error');
                    }
                }
            } else {
                addLogEntry('Error: Android interface not available', 'error');
            }
        }
    }
    
    // Send binary data from a hex string
    function sendHexData(hexString) {
        try {
            if (!hexString.match(/^[0-9A-Fa-f]+$/)) {
                addLogEntry('Error: Invalid hex format. Use format 0xABCD', 'error');
                return;
            }
            
            // Make sure we have even number of characters
            if (hexString.length % 2 !== 0) {
                hexString = '0' + hexString;
            }
            
            // Convert hex string to byte array
            const bytes = [];
            for (let i = 0; i < hexString.length; i += 2) {
                bytes.push(parseInt(hexString.substring(i, i + 2), 16));
            }
            
            // Convert to Uint8Array
            const byteArray = new Uint8Array(bytes);
            
            // Convert to Base64 for sending through the bridge
            const base64Data = bytesToBase64(byteArray);
            
            if (typeof Android !== 'undefined') {
                const success = Android.sendBinaryData(base64Data);
                if (success) {
                    addLogEntry(`Sent hex data: 0x${hexString} (${bytes.length} bytes)`, 'sent');
                    messageInput.value = '';
                } else {
                    addLogEntry('Error: Failed to send binary data', 'error');
                }
            }
        } catch (e) {
            addLogEntry(`Error: ${e.message}`, 'error');
            console.error('Error sending hex data:', e);
        }
    }
    
    // Send binary data from a binary string (like "01001010")
    function sendBinaryString(binaryString) {
        try {
            if (!binaryString.match(/^[01]+$/)) {
                addLogEntry('Error: Invalid binary format. Use format bin:10101010', 'error');
                return;
            }
            
            // Make sure we have multiple of 8 bits
            const padding = 8 - (binaryString.length % 8);
            if (padding < 8) {
                binaryString = '0'.repeat(padding) + binaryString;
            }
            
            // Convert binary string to byte array
            const bytes = [];
            for (let i = 0; i < binaryString.length; i += 8) {
                const byte = binaryString.substring(i, i + 8);
                bytes.push(parseInt(byte, 2));
            }
            
            // Convert to Uint8Array
            const byteArray = new Uint8Array(bytes);
            
            // Convert to Base64 for sending through the bridge
            const base64Data = bytesToBase64(byteArray);
            
            if (typeof Android !== 'undefined') {
                const success = Android.sendBinaryData(base64Data);
                if (success) {
                    addLogEntry(`Sent binary data: ${binaryString} (${bytes.length} bytes)`, 'sent');
                    messageInput.value = '';
                } else {
                    addLogEntry('Error: Failed to send binary data', 'error');
                }
            }
        } catch (e) {
            addLogEntry(`Error: ${e.message}`, 'error');
            console.error('Error sending binary data:', e);
        }
    }
    
    // Convert a Uint8Array to a Base64 string
    function bytesToBase64(bytes) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    
    function sendCommand(command) {
        if (isConnected) {
            if (typeof Android !== 'undefined') {
                const success = Android.sendData(command);
                if (success) {
                    addLogEntry(`Sent command: ${command}`, 'sent');
                } else {
                    addLogEntry('Error: Failed to send command', 'error');
                }
            } else {
                addLogEntry('Error: Android interface not available', 'error');
            }
        }
    }
    
    function checkConnectionState() {
        if (typeof Android !== 'undefined') {
            isConnected = Android.isConnected();
            updateConnectionUI();
            
            // If connected, get device info
            if (isConnected) {
                try {
                    const deviceInfo = JSON.parse(Android.getConnectedDeviceInfo());
                    if (deviceInfo.connected) {
                        deviceName.textContent = deviceInfo.name || 'Unknown';
                        deviceAddress.textContent = deviceInfo.address;
                        deviceNameContainer.style.display = 'block';
                        deviceAddressContainer.style.display = 'block';
                        addLogEntry(`System: Connected to ${deviceInfo.name || 'Unknown'}`, 'system');
                    }
                } catch (e) {
                    console.error('Error parsing device info:', e);
                }
            }
        }
    }
    
    function updateConnectionUI() {
        if (isConnected) {
            connectionStatus.textContent = 'Connected';
            connectionStatus.classList.add('connected');
            btnDisconnect.disabled = false;
            messageInput.disabled = false;
            btnSend.disabled = false;
            cmdButtons.forEach(btn => btn.disabled = false);
        } else {
            connectionStatus.textContent = 'Disconnected';
            connectionStatus.classList.remove('connected');
            btnDisconnect.disabled = true;
            messageInput.disabled = true;
            btnSend.disabled = true;
            cmdButtons.forEach(btn => btn.disabled = true);
            deviceNameContainer.style.display = 'none';
            deviceAddressContainer.style.display = 'none';
        }
    }
    
    function addLogEntry(message, type = 'system') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = message;
        logContainer.appendChild(logEntry);
        
        // Auto-scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    function clearLog() {
        // Keep just the first welcome message
        while (logContainer.childNodes.length > 1) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }
});

// Callback functions that will be called from Android

// Called when a device is selected from the list
function onDeviceSelected(device) {
    selectedDevice = device;
    
    // Log the selection
    const logMessage = `Selected device: ${device.name} (${device.address})`;
    addLogEntry(logMessage, 'system');
    
    // Connect to the selected device
    if (typeof Android !== 'undefined') {
        const success = Android.connectToDevice(device.address);
        if (success) {
            addLogEntry(`System: Connecting to ${device.name}...`, 'system');
        } else {
            addLogEntry('Error: Failed to initiate connection', 'error');
        }
    }
}

// Called when Bluetooth connection status changes
function onBluetoothStatusChanged(status) {
    isConnected = (status === 'connected');
    
    // Update UI
    const connectionStatus = document.getElementById('connection-status');
    if (isConnected) {
        connectionStatus.textContent = 'Connected';
        connectionStatus.classList.add('connected');
        
        // Get device info if connected
        if (typeof Android !== 'undefined') {
            try {
                const deviceInfo = JSON.parse(Android.getConnectedDeviceInfo());
                if (deviceInfo.connected) {
                    const deviceName = document.getElementById('device-name');
                    const deviceAddress = document.getElementById('device-address');
                    const deviceNameContainer = document.getElementById('device-name-container');
                    const deviceAddressContainer = document.getElementById('device-address-container');
                    
                    deviceName.textContent = deviceInfo.name || 'Unknown';
                    deviceAddress.textContent = deviceInfo.address;
                    deviceNameContainer.style.display = 'block';
                    deviceAddressContainer.style.display = 'block';
                }
            } catch (e) {
                console.error('Error parsing device info:', e);
            }
        }
        
        // Enable controls
        document.getElementById('btn-disconnect').disabled = false;
        document.getElementById('message-input').disabled = false;
        document.getElementById('btn-send').disabled = false;
        document.querySelectorAll('.cmd-btn').forEach(btn => btn.disabled = false);
        
        addLogEntry('System: Connected successfully', 'system');
    } else {
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.classList.remove('connected');
        
        // Hide device info
        document.getElementById('device-name-container').style.display = 'none';
        document.getElementById('device-address-container').style.display = 'none';
        
        // Disable controls
        document.getElementById('btn-disconnect').disabled = true;
        document.getElementById('message-input').disabled = true;
        document.getElementById('btn-send').disabled = true;
        document.querySelectorAll('.cmd-btn').forEach(btn => btn.disabled = true);
        
        addLogEntry('System: Disconnected', 'system');
    }
}

// Called when data is received from the Bluetooth device
function onBluetoothDataReceived(data) {
    addLogEntry(`Received: ${data}`, 'received');
}

// Helper function to add log entries
function addLogEntry(message, type = 'system') {
    const logContainer = document.getElementById('log-container');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
    
    // Auto-scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}
