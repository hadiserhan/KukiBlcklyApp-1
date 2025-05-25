import { WeDo2 } from '../WeDO/wedo.js'
var wedo_device = null;

// Bluetooth
function connectToBluetooth() {
    wedo_device = new WeDo2("","121");
    // Connect
    wedo_device.scan();
}
function getWEDO(){
    return wedo_device;
}
function disconnectFromBluetooth(){
    kuki_device.disconnect();
}

function onBluetoothConnected(){
    is_connected = kuki_device._isConnected;
    updateUIInterface();
    addLogEntry(`System: IS CONNECTED'`, 'system');
}

function onBluetoothDisConnected(){
    is_connected = kuki_device._isConnected;
    is_arduino_start = false;
    is_kuki = false;
    updateUIInterface();
    addLogEntry(`System: IS DISCONNECTED`, 'system');
}

function onBluetoothReady(){
    console.log("Device Disconnected")
}

function onBluetoothReceiveData(e){
    runJSFunction(e);

    // disable if do you want display code blocks function name
    // displayAllCode(e)
}

function onBluetoothFirmwareValid(e){
    is_kuki = kuki_device._isKuki;
    updateUIInterface();
    addLogEntry(`System: firmware valid' ${e.detail.toUpperCase()}`, 'system');
}

function onBluetoothFirmwareInValid(e){
    updateUIInterface();
    addLogEntry(`System: firmware InValid'`, 'system');
}

function onBluetoothArduinoStartParsing(){
    is_arduino_start = true;
    updateUIInterface();
    addLogEntry(`System: Arduino Ready'`, 'system');
}

function onBluetoothArduinoENDSTOPParsing(){
    is_arduino_start = false;
    updateUIInterface();
    addLogEntry(`System: Arduino Stop Parse Data'`, 'system');
}
// ----end event listener

function sendBluetoothCode(code){
    kuki_device.send(code);
}

function sendStopParse(){
    kuki_device.send([0xAA]);
}

function displayAllCode(e){
    if (e.detail[0] === 0xFF && e.detail[1] === 0x55) {
        const cmd_two = e.detail[2];
        const cmd_three = e.detail[3];
        switch (cmd_two) {
            case 0x01:
                switch (cmd_three) {
                    case 0x00:
                        addLogEntry(`wait_event_ms ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;      
                    case 0x01:
                        addLogEntry(`wait_button ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x02:
                        addLogEntry(`for_count_loop ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x03:
                        addLogEntry(`for_ever_loop ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                }
            break;
            case 0x02:
                switch (cmd_three) {
                    case 0x00:
                        addLogEntry(`turn_LED_OFF ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x01:
                        addLogEntry(`turn_LED_ON ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;  
                    case 0x02:
                        addLogEntry(`toogle_LED ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x08:
                        addLogEntry(`beep ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                }
            break;
            case 0x03:
                addLogEntry(`LEDMATRIX_TEXT ${e.detail[3]}-${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
            break;
            case 0x04:
                addLogEntry(`LEDMATRIX_BITMAP ${e.detail[3]}-${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
            break;
            case 0x05:
                addLogEntry(`Play Sound ${e.detail[3]}-${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
            break;
            case 0x06:
                switch (cmd_three) {
                    case 0x00:
                        addLogEntry(`set_rgb_off ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x01:
                        addLogEntry(`set_rgb_RGB ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x02:
                        addLogEntry(`set_rgb_RANDOM ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                }
            break;
            case 0x07:
                switch (cmd_three) {
                    case 0x00:
                        addLogEntry(`pendown ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x01:
                        addLogEntry(`penup ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x02:
                        addLogEntry(`pentoggle ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                }
            break;
            case 0x08:
                switch (cmd_three) {
                    case 0x01:
                        addLogEntry(`forward ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x02:
                        addLogEntry(`backward ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x03:
                        addLogEntry(`right ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                    case 0x04:
                        addLogEntry(`left ${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
                    break;
                }
            break;
            default:
                addLogEntry(`unkown command ${e.detail[2]}-${e.detail[3]}-${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
            break;
        }
    }
}

// -------- Bluetooth ----------------

function runJSFunction(e){
    if (e.detail[0] === 0xFF && e.detail[1] === 0x66) {
        const cmd_two = e.detail[2];
        switch (cmd_two) {
            case 0x05:
                runJSSound(e.detail[3]);
                addLogEntry(`Play Sound ${e.detail[3]}-${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
            break;
            default:
                addLogEntry(`unkown JS Function command ${e.detail[2]}-${e.detail[3]}-${e.detail[4]}-${e.detail[5]}-${e.detail[6]}`, 'block');
            break;
        }
    }
}

function runJSSound(data){
    const audio = soundPool[data];
    if (audio) {
      // Stop previous audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
  
      // Clone and play new audio
      const clone = audio.cloneNode();
      currentAudio = clone;
      clone.play().catch(e => console.warn("Audio play error:", e));
    } else {
      console.warn(`Sound with key ${data} not found`);
    }
    // const audio = soundPool[data];
    // if (audio) {
    //   const clone = audio.cloneNode(); // allows overlapping play
    //   clone.play().catch(e => console.warn("Audio play error:", e));
    // } else {
    //   console.warn(`Sound with key ${data} not found`);
    // }
}

// --------- END SOUNDS

window.connectToBluetooth = connectToBluetooth;
window.disconnectFromBluetooth = disconnectFromBluetooth;
window.sendBluetoothCode = sendBluetoothCode;
window.sendStopParse = sendStopParse;
window.getWEDO = getWEDO;

window.runJSSound = runJSSound;


