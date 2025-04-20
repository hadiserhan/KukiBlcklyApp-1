'use strict';

const RELESE_VENDOR_ID = 0x16D0;
const RELESE_PRODUCT_ID = 0x1207;

const EV3_WEBUSB_HEADER                   = 0x58;
const EV3_WEBUSB_CMD_GET_FIRMWARE_VERSION = 0x10;
const EV3_WEBUSB_CMD_GET_SERIAL_NUMBER    = 0x11;
const EV3_WEBUSB_CMD_RESET                = 0x12;
const EV3_WEBUSB_CMD_PUT_APP_FIRMWARE     = 0x13;
const EV3_WEBUSB_CMD_PUT_USER_PROGRAM     = 0x14;
const EV3_WEBUSB_CMD_RUN_USER_PROGRAM     = 0x15;
const EV3_WEBUSB_CMD_STOP_USER_PROGRAM    = 0x16;
const EV3_WEBUSB_CMD_USER_DATA_OUT        = 0x17;
const EV3_WEBUSB_CMD_USER_DATA_IN         = 0x18;
const EV3_WEBUSB_CMD_CHANGED_STATE        = 0x19;
const EV3_WEBUSB_CMD_RUN_DRIVE_CALIBRATION = 0x1a;
const EV3_WEBUSB_CMD_ACTIVATE_BUILTIN_PROGRAM = 0x1b;
const EV3_WEBUSB_CMD_GET_CALIBRATION_DATA = 0x1c;
const EV3_WEBUSB_CMD_GET_PERSISTENT_DATA  = 0x1c;
const EV3_WEBUSB_CMD_INVALID              = 0xff;
const EV3_VARIANT_CODE_BOOTLOADER         = 0;
const EV3_VARIANT_CODE_APPLICATION_FACTORY = 1;
const EV3_VARIANT_CODE_APPLICATION_USER   = 2;

const EV3_STATE_CHANGE_NONE = 0;
const EV3_STATE_CHANGE_DRIVE_CALIBRATION_COMPLETE = 1;
const EV3_STATE_CHANGE_OBSTACLE_CALIBRATION_COMPLETE = 2;
const EV3_STATE_CHANGE_USER_PROGRAM_COMPLETE = 3;

const EV3_STATE_CHANGE_ARG_USER_PROGRAM_COMPLETE_SUCCESS = 0;
const EV3_STATE_CHANGE_ARG_USER_PROGRAM_COMPLETE_NO_FILE = 1;
const EV3_STATE_CHANGE_ARG_USER_PROGRAM_COMPLETE_USER_ABORT = 2;
const EV3_STATE_CHANGE_ARG_USER_PROGRAM_COMPLETE_EXCEPTION = 3;

const EV3_WEBUSB_CMD_PUT_PERSISTENT_DATA  = 0x1f;

const usage_statistics_strings = [
    "turn_on_count",
    "usb_connect_count",
    "program_user_data_count",
    "button_triangle_press_count",
    "button_square_press_count",
    "button_round_press_count",
    "motor_tick_count_left_forward",
    "motor_tick_count_left_backward",
    "motor_tick_count_right_forward",
    "motor_tick_count_right_backward",
    "battery_empty_count",
    "battery_full_count",
    "battery_charging_time_range0",
    "battery_charging_time_range1",
    "battery_charging_time_range2",
    "battery_charging_time_range3",
    "battery_charging_time_range4",
    "battery_charging_time_range5",
    "battery_charged_time",
    "battery_use_time",
];

let webUSBDevice;
let webUSBPendingInData;
let webUSBPendingInResolve;
let webUSBUserData = [];

let dataBox;


function setDataBox(elementID){
  //dataBox = elementID;//"fromUSBdata"
  dataBox = document.getElementById(elementID);
  //console.log(dataBox);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// https://stackoverflow.com/questions/30008114/how-do-i-promisify-native-xhr
// if successful, resolves to an arraybuffer
function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.responseType = "arraybuffer";
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}




function webUSBTransferInReady(result) {
    console.log("webUSBTransferInReady", result);

    if (result.status == "ok") {
        if (result.data.byteLength == 6
            && result.data.getUint8(0) == EV3_WEBUSB_HEADER
            && result.data.getUint8(1) == EV3_WEBUSB_CMD_USER_DATA_IN) {
            let value = result.data.getUint8(2)
                | result.data.getUint8(3) << 8
                | result.data.getUint8(4) << 16
                | result.data.getUint8(5) << 24;
            writeToUSBDataBox("" + value);
        } else if (result.data.byteLength == 4
            && result.data.getUint8(0) == EV3_WEBUSB_HEADER
            && result.data.getUint8(1) == EV3_WEBUSB_CMD_CHANGED_STATE) {
            const state = result.data.getUint8(2);
            const state_arg = result.data.getUint8(3);
            let state_msg = "state change: " + state + " " + state_arg;
            if (state == EV3_STATE_CHANGE_DRIVE_CALIBRATION_COMPLETE) {
                if (state_arg == 3) {
                    state_msg = "state change: drive calibration completed successfully";
                } else {
                    state_msg = "state change: drive calibration failed: speed=" + (state_arg >> 4);
                    if (state_arg & 4) {
                        state_msg += ", left failed to achieve target speed";
                    }
                    if (state_arg & 8) {
                        state_msg += ", right failed to achieve target speed";
                    }
                }
            } else if (state == EV3_STATE_CHANGE_OBSTACLE_CALIBRATION_COMPLETE) {
                state_msg = "state change: obstacle calibration complete";
            } else if (state == EV3_STATE_CHANGE_USER_PROGRAM_COMPLETE) {
                if (state_arg == EV3_STATE_CHANGE_ARG_USER_PROGRAM_COMPLETE_SUCCESS) {
                    state_msg = "state change: user program finished successfully";
                } else if (state_arg == EV3_STATE_CHANGE_ARG_USER_PROGRAM_COMPLETE_NO_FILE) {
                    state_msg = "state change: user program doesn't exist";
                } else if (state_arg == EV3_STATE_CHANGE_ARG_USER_PROGRAM_COMPLETE_USER_ABORT) {
                    state_msg = "state change: user program stopped by square button";
                } else if (state_arg == EV3_STATE_CHANGE_ARG_USER_PROGRAM_COMPLETE_EXCEPTION) {
                    state_msg = "state change: user program had an exception";
                }
            }
            console.log(state_msg);
        } else {
            if (webUSBPendingInResolve !== null) {
                webUSBPendingInResolve(result);
                webUSBPendingInResolve = null;
            } else {
                webUSBPendingInData = result;
            }
        }
    }

    webUSBDevice.transferIn(1, 64).then(webUSBTransferInReady);
}

function webUSBIsConnected() {
    //const statusText = document.getElementById("statusText");
    // check if variable has a type
    if (typeof webUSBDevice == 'undefined') {
        //statusText.innerHTML = "disconnected";
        return false;
    } else {
        // check if the webUSB connection has been established
        if (webUSBDevice.opened) {
            //const statusText = document.getElementById("statusText");
            //statusText.innerHTML = "connected";
            return true;
        } else {
            //statusText.innerHTML = "disconnected";
            return false;
        }
    }
}

async function webUSBOpenConnection() {
    console.log("webUSBOpenConnection");

    webUSBDevice = await navigator.usb.requestDevice({
        filters: [{vendorId: RELESE_VENDOR_ID, productId: RELESE_PRODUCT_ID}]
    });

    try {
      await webUSBDevice.open();
      await webUSBDevice.selectConfiguration(1);
      await webUSBDevice.claimInterface(0);

      webUSBPendingInData = null;
      webUSBPendingInResolve = null;
      webUSBDevice.transferIn(1, 64).then(webUSBTransferInReady);

      // update statusText
      webUSBIsConnected();
    } catch (e) {

      if(e.message=="Failed to execute 'claimInterface' on 'USBDevice': Unable to claim interface."){
        webUSBDevice = undefined;
        alert("Kuki is connected to a different tab, please referesh that tab to break the connection then retry");
      }else {

      }
      throw e;

    }
}

async function webUSBEnsureConnected() {
    if (!webUSBIsConnected()) {
        await webUSBOpenConnection();
    }
}

async function webUSBTransferOut(data) {
    console.log("webUSBTransferOut", data);
    await webUSBDevice.transferOut(1, data);
}

async function webUSBTransferIn(len) {
    let prom;
    if (webUSBPendingInData !== null) {
        prom = new Promise(function(resolve, reject) {
            let x = webUSBPendingInData;
            webUSBPendingInData = null;
            resolve(x);
        });
    } else {
        prom = new Promise(function(resolve, reject) {
            webUSBPendingInResolve = resolve;
        });
    }

    let result = await prom;

    console.log("webUSBTransferIn resolved", len, result.data);
    // TODO: check: ret.data.byteLength == len

    return result;
}

function writeToUSBDataBox(data) {
    //const fromUSBdata = document.getElementById(dataBox);
    //console.log(fromUSBdata);
    const fromUSBdata = dataBox;
    if (webUSBUserData.length >= 10000) {
        webUSBUserData.shift();
    }
    webUSBUserData.push(data)
    fromUSBdata.value = webUSBUserData.join("\r\n");
    fromUSBdata.scrollTop = fromUSBdata.scrollHeight;
}

async function downloadUserProgram(){
    await webUSBEnsureConnected();
    var version = await getEV3FirmwareVersion();
    if (version[0] != EV3_VARIANT_CODE_BOOTLOADER
        && (version[2].startsWith("v0.1.0") || version[2].startsWith("v0.2.0") || version[1].startsWith("v0.3.0"))) {
        //correct version
        compileAndSend();
    } else {
        alert("fimrware version error");
    }
}

async function pushFirmwareVersionToBox(){
    const version = await getEV3FirmwareVersion();
    let variant_str = "?";
    if (version[0] == EV3_VARIANT_CODE_BOOTLOADER) {
        variant_str = "bootloader mode";
    } else if (version[0] == EV3_VARIANT_CODE_APPLICATION_FACTORY) {
        variant_str = "factory application mode";
    } else if (version[0] == EV3_VARIANT_CODE_APPLICATION_USER) {
        variant_str = "user application mode";
    }
    writeToUSBDataBox(variant_str + "; bl=" + version[1] + " app=" + version[2]);
}

// user function to get UID
async function pushUIDtoBox(){
    // const uidNumber = await getKukiV3UID();
    // writeToUSBDataBox("UID: " + uidNumber);
}

async function pushUsageStatisticsToBox() {
    const data = await webUSBCommandGetCalibrationData();
    let offset = 156;
    for (let i = 0; i < 20; ++i) {
        let value = 0;
        for (let j = 0; j < 4; ++j) {
            value |= data[offset + i * 4 + j] << (8 * j);
        }
        writeToUSBDataBox(usage_statistics_strings[i] + ": " + value);
    }
}

async function webUSBCommandPutUserProgram(userProgram){
    var size = userProgram.length;
    console.log("Send userProgram via USB");
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_PUT_USER_PROGRAM, 0, 0, 0, 0, 0, 0]);
    data[2] = size;
    data[3] = size>>8;
    var lowerByte = true;
    var checkSum = 0;
    for (var i = 0; i < userProgram.length; i++) {
        if(lowerByte){
            checkSum = checkSum^userProgram[i];
            lowerByte = false;
        }else{
            checkSum = checkSum^(userProgram[i]<<8);
            lowerByte = true;
        }
    }
    data[5] = checkSum;
    data[6] = checkSum>>8;

    //const statusText = document.getElementById("statusText");
    //statusText.innerHTML = "downloading...";

    console.log("send header:", data);
    await webUSBTransferOut(data);

    let result = await webUSBTransferIn(8);
    if (result.status == "ok"
        && result.data.getUint8(0) == EV3_WEBUSB_HEADER
        && result.data.getUint8(1) == EV3_WEBUSB_CMD_PUT_USER_PROGRAM) {
        // can start programming
    } else {
        alert("download failed");
        return;
    }

    console.log("send program:", userProgram);
    await webUSBTransferOut(userProgram);

    result = await webUSBTransferIn(8);

    // update statusText
    webUSBIsConnected();

    if (result.status == "ok"
        && result.data.getUint8(0) == EV3_WEBUSB_HEADER
        && result.data.getUint8(1) == EV3_WEBUSB_CMD_PUT_USER_PROGRAM
        && result.data.getUint8(2) == 1) {
        // download succeeded
    } else {
        alert("download failed");
    }
}

async function getEV3FirmwareVersion(){
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_GET_FIRMWARE_VERSION, 0, 0, 0, 0, 0, 0]);
    console.log("get firmware version");

    await webUSBEnsureConnected();
    await webUSBTransferOut(data);
    let result = await webUSBTransferIn(64);
    console.log("got result", result);
    if (result.status =="ok") {
        if (result.data.getUint8(0) != EV3_WEBUSB_HEADER || result.data.getUint8(1) != EV3_WEBUSB_CMD_GET_FIRMWARE_VERSION) {
            // data back is invalid
            console.log("Fail", result.data);
            return [-1, "invalid"];
        }
        const variantCode = result.data.getUint8(2);
        const numBytes = result.data.getUint8(3);
        let versionBootloader = "";
        for (let i = 0; i < numBytes; i++) {
            const c = result.data.getUint8(4 + i);
            if (c == 0) {
                break;
            }
            versionBootloader += String.fromCodePoint(c);
        }
        let versionApplication = "";
        for (let i = 0; i < numBytes; i++) {
            const c = result.data.getUint8(4 + numBytes + i);
            if (c == 0) {
                break;
            }
            versionApplication += String.fromCodePoint(c);
        }
        console.log(versionBootloader, versionApplication);
        return [variantCode, versionBootloader, versionApplication];
    } else {
        console.log("Fail");
        console.log("Fail", result.status);
        return [-1, "invalid"];
    }
}

async function getKukiV3UID(){
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_GET_SERIAL_NUMBER, 0, 0, 0, 0, 0, 0]);

    await webUSBEnsureConnected();
    await webUSBTransferOut(data);
    let result = await webUSBTransferIn(32);
    console.log(result);
    if (result.status =="ok") {
        const numBytes = result.data.getUint8(3);
        let serial = "";
        for (let i = 0; i < numBytes; i++) {
            serial += String.fromCodePoint(result.data.getUint8(4 + i));
        }
        console.log(serial);
        return serial;
    } else {
        console.log("Fail:", result.status);
        return false;
    }
}

async function webUSBCommandReset(arg) {
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_RESET, arg, 0, 0, 0, 0, 0]);
    await webUSBEnsureConnected();
    await webUSBTransferOut(data);
    let result = await webUSBTransferIn(8);
}

async function programSelectedEV3Firmware() {
    const selectedFirmwareName = document.getElementById("firmware");
    console.log(selectedFirmwareName.value);
    const firmware = new Uint8Array(await makeRequest("GET", selectedFirmwareName.value));
    var version = await getEV3FirmwareVersion();
    if (version[0] != EV3_VARIANT_CODE_BOOTLOADER) {
        // Switch to bootloader.
        await webUSBCommandReset(1);
    }
    if (await programEV3Firmware(firmware, true)) {
        // Switch back to application.
        await webUSBCommandReset(1);
    }
}


async function updateEV3Firmware() {
    //const selectedFirmwareName = document.getElementById("firmware");
    //console.log(selectedFirmwareName.value);
    const firmware = new Uint8Array(await makeRequest("GET", "GD32F350-UFW.bin"));
    var version = await getEV3FirmwareVersion();
    if(!(version[2].startsWith("v0.1.0") || version[2].startsWith("v0.2.0") || version[1].startsWith("v0.3.0"))){
      console.log("Version error");
      return;
    }

    //stop a current program if there is one
    await webUSBCommandStopUserProgram();

    if (version[0] != EV3_VARIANT_CODE_BOOTLOADER) {
        // Switch to bootloader.
        await webUSBCommandReset(1);
    }
    if (await programEV3Firmware(firmware, true)) {
        // Switch back to application.
        await webUSBCommandReset(1);
    }
}

async function eraseEV3Firmware(firmwareName) {
    const firmware = new Uint8Array(await makeRequest("GET", firmwareName));
    var version = await getEV3FirmwareVersion();
    if (version[0] != EV3_VARIANT_CODE_BOOTLOADER) {
        // Switch to bootloader.
        await webUSBCommandReset(1);
    }
    await programEV3Firmware(firmware, false);
}

async function programEV3Firmware(firmware, checkValidReturn) {
  console.log("start fimrware prog");
    //var version = await getEV3FirmwareVersion();
    /*if (!(version[0] == EV3_VARIANT_CODE_BOOTLOADER
        && (version[1].startsWith("v0.1.0") || version[1].startsWith("v0.2.0") || version[1].startsWith("v0.3.0")))) {
        alert("fimrware version error");
        return false;
    }*/
    console.log("return await");
    return await webUSBCommandPutAppFirmware(firmware, checkValidReturn);
}

async function sleepSec(seconds) {
return new Promise((resolve) =>setTimeout(resolve, seconds * 1000));
}

async function webUSBCommandPutAppFirmware(firmware, checkValidReturn) {
    console.log("preparing firmware to download");
    console.log("firmware length:", firmware.length);
    console.log("firmware:", firmware);

    var size = firmware.length;
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_PUT_APP_FIRMWARE, 0, 0,0,0,0,0]);
    data[2] = size;
    data[3] = size>>8;
    console.log(data);
    var lowerByte = true;
    var checkSum = 0;
    for (var i = 0; i < firmware.length; i++) {
        if(lowerByte){
            checkSum = checkSum^firmware[i];
            lowerByte = false;
        }else{
            checkSum = checkSum^(firmware[i]<<8);
            lowerByte = true;
        }
    }
    data[5] = checkSum;
    data[6] = checkSum>>8;

    //const statusText = document.getElementById("statusText");
    //statusText.innerHTML = "downloading firmware...";
    await sleepSec(0.3);
    await webUSBTransferOut(data);
    await sleepSec(0.3);
    let result = await webUSBTransferIn(8);
    if (result.status == "ok"
        && result.data.getUint8(0) == EV3_WEBUSB_HEADER
        && result.data.getUint8(1) == EV3_WEBUSB_CMD_PUT_APP_FIRMWARE) {
        // can start programming
    } else {
        alert("download failed");
        return false;
    }

    console.log("start firmware download");
    await webUSBTransferOut(firmware);
    console.log("end firmware download");
    result = await webUSBTransferIn(8);
    console.log("firmware download result:", result);

    // update statusText
    webUSBIsConnected();

    if (result.status == "ok"
        && result.data.getUint8(0) == EV3_WEBUSB_HEADER
        && result.data.getUint8(1) == EV3_WEBUSB_CMD_PUT_APP_FIRMWARE) {
        if (checkValidReturn) {
            if (result.data.getUint8(2) != 1) {
                alert("firmware did not verify");
                return false;
            }
        }
        // download succeeded
        return true;
    } else {
        alert("download failed");
        return false;
    }
}

async function webUSBCommandRunUserProgram() {
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_RUN_USER_PROGRAM, 0, 0, 0, 0, 0, 0]);
    await webUSBEnsureConnected();
    await webUSBTransferOut(data);
    let result = await webUSBTransferIn(8);
}

async function webUSBCommandStopUserProgram() {
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_STOP_USER_PROGRAM, 0, 0, 0, 0, 0, 0]);
    await webUSBEnsureConnected();
    await webUSBTransferOut(data);
    let result = await webUSBTransferIn(8);
}

async function webUSBCommandUserData(value) {
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_USER_DATA_OUT, 0, 0, 0, 0, 0, 0]);

    // Signed 32-bit value.
    data[2] = value & 0xff;
    data[3] = (value >> 8) & 0xff;
    data[4] = (value >> 16) & 0xff;
    data[5] = (value >> 24) & 0xff;

    await webUSBEnsureConnected();
    await webUSBTransferOut(data);
    let result = await webUSBTransferIn(8);
}

async function webUSBCommandUserDataFrom(elementId) {
    let value = document.getElementById(elementId).value;
    console.log(elementId, value);
    value = parseInt(value);
    if (isNaN(value)) {
        alert("Value must be an integer");
    } else {
        await webUSBCommandUserData(value);
    }
}

async function webUSBCommandRunDriveCalibration() {
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_RUN_DRIVE_CALIBRATION, 0, 0, 0, 0, 0, 0]);
    await webUSBEnsureConnected();
    await webUSBTransferOut(data);
    let result = await webUSBTransferIn(8);
}

async function webUSBCommandActivateBuiltinProgram(program) {
    const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_ACTIVATE_BUILTIN_PROGRAM, program, 0, 0, 0, 0, 0]);
    await webUSBEnsureConnected();
    await webUSBTransferOut(data);
    let result = await webUSBTransferIn(8);
}

async function webUSBCommandGetCalibrationData() {
    await webUSBEnsureConnected();
    let total_len = 1024;
    let calibration_data = null;
    for (let offset = 0; offset < total_len;) {
        const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_GET_CALIBRATION_DATA, offset & 0xff, offset >> 8, 0, 0, 0, 0]);
        await webUSBTransferOut(data);
        const result = await webUSBTransferIn(64);
        if (result.data.getUint8(0) != EV3_WEBUSB_HEADER || result.data.getUint8(1) != EV3_WEBUSB_CMD_GET_CALIBRATION_DATA) {
            console.log("webUSBCommandGetCalibrationData failed", result.data);
            return null;
        }
        total_len = result.data.getUint8(2) | result.data.getUint8(3) << 8;
        if (calibration_data === null) {
            calibration_data = new Uint8Array(total_len);
        }
        for (let i = 0; i < 60 && offset + i < total_len; ++i) {
            calibration_data[offset + i] = result.data.getUint8(4 + i);
        }
        offset += 60;
    }
    return calibration_data;
}

/*async function downloadFirm(){
  // NOT WORKING
    var request = new XMLHttpRequest();
    request.open('GET', 'https://microbricqc.com/downloads/edv3-test/GD32F350-FFW.bin', true);
    request.send(null);
    request.onreadystatechange = function () {
      console.log(request);
        if (request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader('Content-Type');
            if (type.indexOf("text") !== 1) {
                console.log(request.responseText) ;
            }
        }
    }
}*/



function getU8(data) {
    const value = data[1][data[0]];
    data[0] += 1;
    return value;
}

function getS8(data) {
    let value = data[1][data[0]];
    data[0] += 1;
    if (value >= 128) {
        value -= 256;
    }
    return value;
}



function getU8Array(data, n) {
    const ar = [];
    for (let i = 0; i < n; ++i) {
        ar.push(data[1][data[0] + i]);
    }
    data[0] += n;
    return ar;
}

function getU16(data) {
    const offset = data[0];
    const buf = data[1];
    const value = buf[offset] | buf[offset + 1] << 8;
    data[0] += 2;
    return value;
}

function getU16Array(data, n) {
    const ar = [];
    for (let i = 0; i < n; ++i) {
        ar.push(getU16(data));
    }
    return ar;
}

function getU32(data) {
    const offset = data[0];
    const buf = data[1];
    const value = buf[offset] | buf[offset + 1] << 8 | buf[offset + 2] << 16 | buf[offset + 3] << 24;
    data[0] += 4;
    return value >>> 0;
}

function getU32Array(data, n) {
    const ar = [];
    for (let i = 0; i < n; ++i) {
        ar.push(getU32(data));
    }
    return ar;
}

async function webUSBCommandGetPersistentData() {
    await webUSBEnsureConnected();
    let total_len = 1024;
    let calibration_data = null;
    for (let offset = 0; offset < total_len;) {
        const data = new Uint8Array([EV3_WEBUSB_HEADER, EV3_WEBUSB_CMD_GET_PERSISTENT_DATA, offset & 0xff, offset >> 8, 0, 0, 0, 0]);
        await webUSBTransferOut(data);
        const result = await webUSBTransferIn(64);
        if (result.data.getUint8(0) != EV3_WEBUSB_HEADER || result.data.getUint8(1) != EV3_WEBUSB_CMD_GET_PERSISTENT_DATA) {
            console.log("webUSBCommandGetPersistentData failed", result.data);
            return null;
        }
        total_len = result.data.getUint8(2) | result.data.getUint8(3) << 8;
        if (calibration_data === null) {
            calibration_data = new Uint8Array(total_len);
        }
        for (let i = 0; i < 60 && offset + i < total_len; ++i) {
            calibration_data[offset + i] = result.data.getUint8(4 + i);
        }
        offset += 60;
    }
    return calibration_data;
}

async function persistantDataTest(){
  console.log(await getPersistentData())
}

function skipBytes(data, n) {
    data[0] += n;
}



async function getPersistentData() {

    const stats = [];
    const data = [0, await webUSBCommandGetPersistentData()];
    const data_version = data[1][0] & 0xf;
    
    // stats.push({ label: "PERSISTENT DATA", value: `(v${data_version})` });
    // stats.push({ label: "data_length", value: data[1].length });

    stats.push({ label: "data_magic", value: "0x" + getU32(data).toString(16) });
    stats.push({ label: "data_checksum", value: "0x" + getU32(data).toString(16) });

    if (data_version >= 3) {
        stats.push({ label: "irc48m_trim", value: getU8(data) });
        skipBytes(data, 1);
        stats.push({ label: "width_trim_cw", value: getS8(data) });
        stats.push({ label: "width_trim_ccw", value: getS8(data) });
    }

    stats.push({ label: "pwm_left_forward", value: getU16Array(data, 10) });
    stats.push({ label: "pwm_left_backward", value: getU16Array(data, 10) });
    stats.push({ label: "pwm_right_forward", value: getU16Array(data, 10) });
    stats.push({ label: "pwm_right_backward", value: getU16Array(data, 10) });
    stats.push({ label: "ir_obstacle_freq", value: getU16Array(data, 2) });

    for (let i = 0; i < 8; ++i) {
        stats.push({ label: `ir_remote_learn[${i}]`, value: getU32Array(data, 2) });
    }

    stats.push({ label: "turn_on_count", value: getU32(data) });
    stats.push({ label: "usb_connect_count", value: getU32(data) });
    stats.push({ label: "program_user_data_count", value: getU32(data) });
    stats.push({ label: "barcode_read_success_count", value: getU16(data) });
    stats.push({ label: "barcode_read_failure_count", value: getU16(data) });
    stats.push({ label: "screen_program_success_count", value: getU16Array(data, 4) });
    stats.push({ label: "screen_program_failure_count", value: getU16Array(data, 4) });
    stats.push({ label: "button_triangle_press_count", value: getU16(data) });
    stats.push({ label: "button_square_press_count", value: getU16(data) });
    stats.push({ label: "button_round_press_count", value: getU16(data) });
    stats.push({ label: "motor_calibration_success_count", value: getU16(data) });
    stats.push({ label: "motor_calibration_failure_count_left", value: getU8Array(data, 20) });
    stats.push({ label: "motor_calibration_failure_count_right", value: getU8Array(data, 20) });
    stats.push({ label: "motor_tick_count_left_forward", value: getU32(data) });
    stats.push({ label: "motor_tick_count_left_backward", value: getU32(data) });
    stats.push({ label: "motor_tick_count_right_forward", value: getU32(data) });
    stats.push({ label: "motor_tick_count_right_backward", value: getU32(data) });
    stats.push({ label: "temperature_above_67c_with_usb_count", value: getU32(data) });
    stats.push({ label: "temperature_above_67c_seconds", value: getU32(data) });
    stats.push({ label: "battery_empty_count", value: getU32(data) });
    stats.push({ label: "battery_full_count", value: getU32(data) });
    stats.push({ label: "battery_charging_seconds", value: getU32Array(data, 6) });
    stats.push({ label: "battery_charged_seconds", value: getU32(data) });
    stats.push({ label: "battery_use_seconds", value: getU32(data) });
    stats.push({ label: "battery_over_charged_seconds", value: getU32(data) });

    // Logging the stats array (Optional)
    console.log(stats);

    // Return the stats array if needed
    return stats;

}




function compileAndSend() {
    //get code
    var progSpace = document.getElementById('importExport');
    var pythonCode = progSpace.value;
    //compile the python into a Uint8Array
    var userProgData = compileV3Python(pythonCode);
    //send to the KUKI
    if (userProgData) {
        webUSBCommandPutUserProgram(userProgData);
    }
}

async function webUSBCommandPutPersistentData(offset, persistent_data) {

    console.log("webUSBCommandPutPersistentData", offset, persistent_data.length);

    try {

        await webUSBEnsureConnected();
        console.log("USB device connected successfully!");

    } catch (error) {

        return error;

    }

    let data_offset = 0;

    while (data_offset < persistent_data.length) {
        let n = persistent_data.length - data_offset;
        let last_packet = 1;
        if (n > 60) {
            n = 60;
            last_packet = 0;
        }
        const data = new Uint8Array(4 + n);
        data[0] = EV3_WEBUSB_HEADER;
        data[1] = EV3_WEBUSB_CMD_PUT_PERSISTENT_DATA;
        data[2] = offset & 0xff;
        data[3] = (offset >> 8) | (last_packet * 0x80);
        for (let i = 0; i < n; ++i) {
            data[4 + i] = persistent_data[data_offset + i];
        }
        await webUSBTransferOut(data);
        const result = await webUSBTransferIn(8);

        if (result.data.getUint8(0) != EV3_WEBUSB_HEADER || result.data.getUint8(1) != EV3_WEBUSB_CMD_PUT_PERSISTENT_DATA) {
            console.log("webUSBCommandPutPersistentData failed", result.data);
            return;
        }
        
        offset += n;
        data_offset += n;

    }

    return 'OK';

}