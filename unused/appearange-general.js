var last_Command = "";

// open Connection Form
function OpenConnectionFormUSB()
{
  if(isConnected)
    showConnectConfirmDialog();
  else
    kukiConnectSerial();  
}

function ConnectedSerialPort()
{
  isConnected = true;
  connectionType = "Serial";
  $("#btConnect").removeClass("notConnectedButton");
  $("#btConnect").addClass("connectedButton");
  $("#btConnect svg").attr('data-icon', 'plug-circle-minus');
  showModalDialog(SerialPortSuccessText, "success");
}

function DisconnectedSerialPort()
{
  isConnected = false;
  $("#btConnect").removeClass("connectedButton");
  $("#btConnect").addClass("notConnectedButton");
  $("#btConnect svg").attr('data-icon', 'plug-circle-plus');

  enableRunButton(false);
  enableStopButton(false);

  $("#kuki_version").text('');
  $(".Kuki-version").hide();
}

function disConnect()
{
    if(connectionType == "Serial")
    {
      kukiDisConnectSerial();
    }
}

// bluetooth
// APP WEBVIEW
// Ensure we're checking if ROBOTECH_APP interface is available
window.addEventListener('load', function() {
  // console.log('Window loaded, checking ROBOTECH_APP interface again');
  if (typeof ROBOTECH_APP !== 'undefined') {
      console.log('ROBOTECH_APP interface is available on window load');
      checkConnectionState();
  } else {
      console.log('ROBOTECH_APP interface is still NOT available on window load');
  }
});

function checkConnectionState() {
  if (typeof ROBOTECH_APP !== 'undefined') {
      isConnected = ROBOTECH_APP.isConnected();
      updateConnectionUI();
      
      // If connected, get device info
      if (isConnected) {
          try {
              const deviceInfo = JSON.parse(Android.getConnectedDeviceInfo());
              if (deviceInfo.connected) {
                  // deviceName.textContent = deviceInfo.name || 'Unknown';
                  // deviceAddress.textContent = deviceInfo.address;
                  // deviceNameContainer.style.display = 'block';
                  // deviceAddressContainer.style.display = 'block';
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
    $("#btConnectBLE").removeClass("notConnectedButton");
    $("#btConnectBLE").addClass("connectedButton");
    enableRunButton(true);
    
  } else {
    enableRunButton(false);
    enableStopButton(false);
    $("#btConnectBLE").removeClass("connectedButton");
    $("#btConnectBLE").addClass("notConnectedButton");
      // deviceNameContainer.style.display = 'none';
      // deviceAddressContainer.style.display = 'none';
  }
}

function showsidepanel(){
  if($("#log_container_div").hasClass("open")){
    $("#log_container_div").removeClass("open");
  }else{
    $("#log_container_div").addClass("open");
  }
 
}

// call app to open bluetooth
function openBluetoothApp(){
    if(isConnected){
      showConnectConfirmDialog();
    } else {
        if (typeof ROBOTECH_APP !== 'undefined') {
          ROBOTECH_APP.showDeviceList();
        } else {
            addLogEntry('Error: ROBOTECH_APP interface not available', 'error');
        }
    }
}

function disconnectBluetoothAppDevice() {
  isConnected = false;
  $("#btConnectBLE").removeClass("connectedButton");
  $("#btConnectBLE").addClass("notConnectedButton");

  if (typeof ROBOTECH_APP !== 'undefined') {
    ROBOTECH_APP.disconnect();
      // The callback will handle UI updates
  } else {
      addLogEntry('Error: ROBOTECH_APP interface not available', 'error');
  }
}


// Dialog Modal
function showModalDialog(message, icon)
{
  Swal.fire({
    text: message,
    icon: icon, 
    confirmButtonText: OkText
  });
}

function showConnectConfirmDialog()
{
  Swal.fire({
    text: "Do you want to disconnect?",
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: OkText,
    cancelButtonText: CancelText,
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      if(typeof ROBOTECH_APP !== 'undefined' || AppSource == "app"){
        disconnectBluetoothAppDevice();
      }else{
        disConnect();
      }

    }
  });
}

function enableRunButton(en_flag){
  if(en_flag){
    $("#runButton").removeClass("notConnectedButton");
    $("#runButton").addClass("connectedButton");
    $("#runButton").prop("disabled",false);
  }else{
    $("#runButton").removeClass("connectedButton");
    $("#runButton").addClass("notConnectedButton");
    $("#runButton").prop("disabled",true);
  }
}

function enableStopButton(en_flag){
  if(en_flag){
      $("#stopButton").removeClass("notConnectedButton");
      $("#stopButton").addClass("connectedButton");
      $("#stopButton").prop("disabled",false);
  }else{
      $("#stopButton").removeClass("connectedButton");
      $("#stopButton").addClass("notConnectedButton");
      $("#stopButton").prop("disabled",true);
  }
}


// Callback functions that will be called from Android

// Called when a device is selected from the list
function onDeviceSelected(device) {
  selectedDevice = device;
  
  // Log the selection
  const logMessage = `Selected device: ${device.name} (${device.address})`;
  addLogEntry(logMessage, 'system');
  
  // Connect to the selected device
  if (typeof ROBOTECH_APP !== 'undefined') {
      const success = ROBOTECH_APP.connectToDevice(device.address);
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
  // const connectionStatus = document.getElementById('connection-status');
  if (isConnected) {
      enableRunButton(true);
      $("#btConnectBLE").removeClass("notConnectedButton");
      $("#btConnectBLE").addClass("connectedButton");

      // Get device info if connected
      if (typeof ROBOTECH_APP !== 'undefined') {
          try {
              const deviceInfo = JSON.parse(ROBOTECH_APP.getConnectedDeviceInfo());
              if (deviceInfo.connected) {
                  isConnected = true;                  
              }
          } catch (e) {
              console.error('Error parsing device info:', e);
              isConnected = false;
          }
      }
      setTimeout(sendAPPCheckKukiCommand , 8000);
      addLogEntry('System: Connected successfully', 'system');
  } else {
    enableRunButton(false);
    enableStopButton(false);
    $("#btConnectBLE").removeClass("connectedButton");
    $("#btConnectBLE").addClass("notConnectedButton");      
    iskukichecked = false;
    IsKuki = false;
    $(".Kuki-version").hide();
    addLogEntry('System: STATUS Disconnected', 'system');
  }
}

function sendAPPCheckKukiCommand(){
  last_Command = "DE";
  iskukichecked = false;
  IsKuki = false;
  sendHexData(last_Command);
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
        
        if (typeof ROBOTECH_APP !== 'undefined') {
            const success = ROBOTECH_APP.sendBinaryData(base64Data);
            if (success) {
                addLogEntry(`Sent hex data: 0x${hexString} (${bytes.length} bytes)`, 'sent');
                // messageInput.value = '';
            } else {
                addLogEntry('Error: Failed to send binary data', 'error');
            }
        }
    } catch (e) {
        addLogEntry(`Error: ${e.message}`, 'error');
        console.error('Error sending hex data:', e);
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

function sendAPPCommand(command) {
  if (isConnected) {
      if (typeof ROBOTECH_APP !== 'undefined') {
          const success = ROBOTECH_APP.sendData(command);
          if (success) {
              addLogEntry(`Sent command: ${command}`, 'sent');
          } else {
              addLogEntry('Error: Failed to send command', 'error');
          }
      } else {
          addLogEntry('Error: ROBOTECH_APP interface not available', 'error');
      }
  }
}

// Called when data is received from the Bluetooth device
function onBluetoothDataReceived(data) {
  try {
    addLogEntry(`Received: ${data}`, 'received');
    if(last_Command == "DE"){
      addLogEntry(`Received: ${data}`, 'received');
      if(data.includes("uki") && iskukichecked == false)
        {
            last_Command = "";
            KukiVersion = "V1.2.25"
            IsKuki = true;
            iskukichecked = true;
          addLogEntry(`Received: IS KUKI `, 'received');
          $("#kuki_version").text(KukiVersion);
          $(".Kuki-version").show();
          enableRunButton(true);

        }else{
            addLogEntry("Not Kuki Device", 'received');
            showModalDialog(isNotAKukiDevice, "error");
        }
    }
    return "onBluetoothDataReceived";
  } catch (e) {
    console.error('Error parsing device info:', e);
  }
}

function clearLog() {
  const logContainer = document.getElementById('log-container');
  // Keep just the first welcome message
  while (logContainer.childNodes.length > 1) {
      logContainer.removeChild(logContainer.lastChild);
  }
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
