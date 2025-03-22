

let port;
let writer;
let textDecoder;
let readableStreamClosed;
let reader;
let isConnected = false;
var IsKuki = false;
var iskukichecked = false;
var connectionType = "Serial";
var on_running_code = false;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function connectSerial() {
if (navigator.serial) {
    try 
    {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        writer = port.writable.getWriter();
        textDecoder = new TextDecoderStream();
        readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();
        let buffer = '';

        ConnectedSerialPort();
        setTimeout(sendCheckCommand, 3000);
        setTimeout(IsKukiDevice, 4000);
        // setTimeout(checkMicropythonVersion, 2500);
        // setTimeout(ShowOttoFilesCommand, 3000);
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                // Allow the serial port to be closed later.
                reader.releaseLock();
                break;
            }
            try
            {     
                buffer += value; // Gelen veriyi buffer'a ekle
                let endIndex;
                var fullMessage = "";

                while ((endIndex = buffer.indexOf('\n')) >= 0) {
                    fullMessage = buffer.substring(0, endIndex).trim(); // Sonlandırıcıya kadar olan kısmı al
                    //console.log('Full Message:', fullMessage);
                    buffer = buffer.substring(endIndex + 1); // Kalan buffer'ı güncelle
                }

                SerialData(fullMessage);
                console.log(fullMessage);
                var termValue = value;
                // termValue = MessagePrepare(termValue);
                // console.log(termValue);

                // if(window.localStorage.getItem("Page") == "Vertical")
                // term.write(termValue);

                // if(isFileInput == false && fullMessage != undefined)
                // {
                //     if((fullMessage.toUpperCase().indexOf("ERROR") >= 0) && fullMessage.indexOf("_boot.py") < 0)
                //     {
                //         console.log(fullMessage);
                //         //showModalDialog(ErrorText + "\n" + fullMessage, "error");
                //     }
                // }

                if(fullMessage.includes("Kuki") && iskukichecked == false)
                {
                    IsKuki = true;
                    iskukichecked = true;
                }
        
            }
            catch(err)
            {
                console.log(err.message);
            }
        }
        
    } catch (err) {
        console.log("SerialPortErrorText");
    //   showModalDialog(SerialPortErrorText, "error");
        DisconnectedSerialPort();
    }

    } else {
    console.log("WebApiNotSupportedText");
    // showModalDialog(WebApiNotSupportedText, "error");
    }
}

async function disConnectSerial() {
    try
        {
        // $("#modalConfirm").modal('hide');
    
        await writeSerial("04");
        reader.cancel();
        reader.releaseLock();
        await readableStreamClosed.catch(() => {  });
    
        writer.releaseLock();
        await port.close();
    
        DisconnectedSerialPort();
    }
    catch(err)
    {
    //console.log(err);
    }
}

async function sendCommand(code)
  {
    try
    {
        let blocks = code.split("-");
        for (let i = 0; i < blocks.length; i++) {
            if(blocks[i] != "\n" && blocks[i] != ""){
                await sendCommandData(blocks[i]);
            }            
        }
        on_running_code = false;
    //   await enter_row_repl();
   
    //   await exec_raw_no_follow(pythoncode);
      
    //   await writeSerial("02");
      
    //   hideProgressPanel();
    }
    catch(err)
    {
      on_running_code = false;
      console.log("Error: " + err.message)
    }
}

async function sendCommandData(hexString) {
    try {
        const hexToUint8Array = (hex) =>
        new Uint8Array(
            hex
                .replace(/\s+/g, "") // Remove spaces
                .match(/.{1,2}/g) // Split hex into pairs
                .map((byte) => parseInt(byte, 16))
        );
        const dataPacket = hexToUint8Array(hexString);
        console.log(`Sending: ${hexString.toUpperCase()}`);
        await writer.write(dataPacket);
    } catch (error) {
        console.error("Error sending data:", error);
    }
}

async function writeSerial(send) {
    let data;
    if (send == "00") data = new Uint8Array([0x00]);
    if (send == "01") data = new Uint8Array([0x01]);
    if (send == "02") data = new Uint8Array([0x02]);
    if (send == "03") data = new Uint8Array([0x03]);
    if (send == "04") data = new Uint8Array([0x04]);
    if (send == "05") data = new Uint8Array([0x05]);
    if (send == "06") data = new Uint8Array([0x06]);
    if (send == "07") data = new Uint8Array([0x07]);
    if (send == "08") data = new Uint8Array([0x08]);
    if (send == "09") data = new Uint8Array([0x09]);
    if (send == "0A") data = new Uint8Array([0x0A]);
    if (send == "0B") data = new Uint8Array([0x0B]);
    if (send == "0C") data = new Uint8Array([0x0C]);
    if (send == "0D") data = new Uint8Array([0x0D]);
    if (send == "0E") data = new Uint8Array([0x0E]);
    if (send == "0F") data = new Uint8Array([0x0F]);
    if (send == "10") data = new Uint8Array([0x10]);
    if (send == "11") data = new Uint8Array([0x11]);
    if (send == "12") data = new Uint8Array([0x12]);
    if (send == "13") data = new Uint8Array([0x13]);
    if (send == "14") data = new Uint8Array([0x14]);
    if (send == "15") data = new Uint8Array([0x15]);
    if (send == "16") data = new Uint8Array([0x16]);
    if (send == "17") data = new Uint8Array([0x17]);
    if (send == "18") data = new Uint8Array([0x18]);
    if (send == "19") data = new Uint8Array([0x19]);
    if (send == "1A") data = new Uint8Array([0x1A]);
    if (send == "1B") data = new Uint8Array([0x1B]);
    if (send == "1C") data = new Uint8Array([0x1C]);
    if (send == "1D") data = new Uint8Array([0x1D]);
    if (send == "1E") data = new Uint8Array([0x1E]);
    if (send == "1F") data = new Uint8Array([0x1F]);
    if (send == "20") data = new Uint8Array([0x20]);
    if (send == "21") data = new Uint8Array([0x21]);
    if (send == "22") data = new Uint8Array([0x22]);
    if (send == "23") data = new Uint8Array([0x23]);
    if (send == "24") data = new Uint8Array([0x24]);
    if (send == "25") data = new Uint8Array([0x25]);
    if (send == "26") data = new Uint8Array([0x26]);
    if (send == "27") data = new Uint8Array([0x27]);
    if (send == "28") data = new Uint8Array([0x28]);
    if (send == "29") data = new Uint8Array([0x29]);
    if (send == "2A") data = new Uint8Array([0x2A]);
    if (send == "2B") data = new Uint8Array([0x2B]);
    if (send == "2C") data = new Uint8Array([0x2C]);
    if (send == "2D") data = new Uint8Array([0x2D]);
    if (send == "2E") data = new Uint8Array([0x2E]);
    if (send == "2F") data = new Uint8Array([0x2F]);
    if (send == "30") data = new Uint8Array([0x30]);
    if (send == "31") data = new Uint8Array([0x31]);
    if (send == "32") data = new Uint8Array([0x32]);
    if (send == "33") data = new Uint8Array([0x33]);
    if (send == "34") data = new Uint8Array([0x34]);
    if (send == "35") data = new Uint8Array([0x35]);
    if (send == "36") data = new Uint8Array([0x36]);
    if (send == "37") data = new Uint8Array([0x37]);
    if (send == "38") data = new Uint8Array([0x38]);
    if (send == "39") data = new Uint8Array([0x39]);
    if (send == "3A") data = new Uint8Array([0x3A]);
    if (send == "3B") data = new Uint8Array([0x3B]);
    if (send == "3C") data = new Uint8Array([0x3C]);
    if (send == "3D") data = new Uint8Array([0x3D]);
    if (send == "3E") data = new Uint8Array([0x3E]);
    if (send == "3F") data = new Uint8Array([0x3F]);
    if (send == "40") data = new Uint8Array([0x40]);
    if (send == "41") data = new Uint8Array([0x41]);
    if (send == "42") data = new Uint8Array([0x42]);
    if (send == "43") data = new Uint8Array([0x43]);
    if (send == "44") data = new Uint8Array([0x44]);
    if (send == "45") data = new Uint8Array([0x45]);
    if (send == "46") data = new Uint8Array([0x46]);
    if (send == "47") data = new Uint8Array([0x47]);
    if (send == "48") data = new Uint8Array([0x48]);
    if (send == "49") data = new Uint8Array([0x49]);
    if (send == "4A") data = new Uint8Array([0x4A]);
    if (send == "4B") data = new Uint8Array([0x4B]);
    if (send == "4C") data = new Uint8Array([0x4C]);
    if (send == "4D") data = new Uint8Array([0x4D]);
    if (send == "4E") data = new Uint8Array([0x4E]);
    if (send == "4F") data = new Uint8Array([0x4F]);
    if (send == "50") data = new Uint8Array([0x50]);
    if (send == "51") data = new Uint8Array([0x51]);
    if (send == "52") data = new Uint8Array([0x52]);
    if (send == "53") data = new Uint8Array([0x53]);
    if (send == "54") data = new Uint8Array([0x54]);
    if (send == "55") data = new Uint8Array([0x55]);
    if (send == "56") data = new Uint8Array([0x56]);
    if (send == "57") data = new Uint8Array([0x57]);
    if (send == "58") data = new Uint8Array([0x58]);
    if (send == "59") data = new Uint8Array([0x59]);
    if (send == "5A") data = new Uint8Array([0x5A]);
    if (send == "5B") data = new Uint8Array([0x5B]);
    if (send == "5C") data = new Uint8Array([0x5C]);
    if (send == "5D") data = new Uint8Array([0x5D]);
    if (send == "5E") data = new Uint8Array([0x5E]);
    if (send == "5F") data = new Uint8Array([0x5F]);
    if (send == "60") data = new Uint8Array([0x60]);
    if (send == "61") data = new Uint8Array([0x61]);
    if (send == "62") data = new Uint8Array([0x62]);
    if (send == "63") data = new Uint8Array([0x63]);
    if (send == "64") data = new Uint8Array([0x64]);
    if (send == "65") data = new Uint8Array([0x65]);
    if (send == "66") data = new Uint8Array([0x66]);
    if (send == "67") data = new Uint8Array([0x67]);
    if (send == "68") data = new Uint8Array([0x68]);
    if (send == "69") data = new Uint8Array([0x69]);
    if (send == "6A") data = new Uint8Array([0x6A]);
    if (send == "6B") data = new Uint8Array([0x6B]);
    if (send == "6C") data = new Uint8Array([0x6C]);
    if (send == "6D") data = new Uint8Array([0x6D]);
    if (send == "6E") data = new Uint8Array([0x6E]);
    if (send == "6F") data = new Uint8Array([0x6F]);
    if (send == "70") data = new Uint8Array([0x70]);
    if (send == "71") data = new Uint8Array([0x71]);
    if (send == "72") data = new Uint8Array([0x72]);
    if (send == "73") data = new Uint8Array([0x73]);
    if (send == "74") data = new Uint8Array([0x74]);
    if (send == "75") data = new Uint8Array([0x75]);
    if (send == "76") data = new Uint8Array([0x76]);
    if (send == "77") data = new Uint8Array([0x77]);
    if (send == "78") data = new Uint8Array([0x78]);
    if (send == "79") data = new Uint8Array([0x79]);
    if (send == "7A") data = new Uint8Array([0x7A]);
    if (send == "7B") data = new Uint8Array([0x7B]);
    if (send == "7C") data = new Uint8Array([0x7C]);
    if (send == "7D") data = new Uint8Array([0x7D]);
    if (send == "7E") data = new Uint8Array([0x7E]);
    if (send == "7F") data = new Uint8Array([0x7F]);
    if (send == "80") data = new Uint8Array([0x80]);
    if (send == "81") data = new Uint8Array([0x81]);
    if (send == "82") data = new Uint8Array([0x82]);
    if (send == "83") data = new Uint8Array([0x83]);
    if (send == "84") data = new Uint8Array([0x84]);
    if (send == "85") data = new Uint8Array([0x85]);
    if (send == "86") data = new Uint8Array([0x86]);
    if (send == "87") data = new Uint8Array([0x87]);
    if (send == "88") data = new Uint8Array([0x88]);
    if (send == "89") data = new Uint8Array([0x89]);
    if (send == "8A") data = new Uint8Array([0x8A]);
    if (send == "8B") data = new Uint8Array([0x8B]);
    if (send == "8C") data = new Uint8Array([0x8C]);
    if (send == "8D") data = new Uint8Array([0x8D]);
    if (send == "8E") data = new Uint8Array([0x8E]);
    if (send == "8F") data = new Uint8Array([0x8F]);
    if (send == "90") data = new Uint8Array([0x90]);
    if (send == "91") data = new Uint8Array([0x91]);
    if (send == "92") data = new Uint8Array([0x92]);
    if (send == "93") data = new Uint8Array([0x93]);
    if (send == "94") data = new Uint8Array([0x94]);
    if (send == "95") data = new Uint8Array([0x95]);
    if (send == "96") data = new Uint8Array([0x96]);
    if (send == "97") data = new Uint8Array([0x97]);
    if (send == "98") data = new Uint8Array([0x98]);
    if (send == "99") data = new Uint8Array([0x99]);
    if (send == "9A") data = new Uint8Array([0x9A]);
    if (send == "9B") data = new Uint8Array([0x9B]);
    if (send == "9C") data = new Uint8Array([0x9C]);
    if (send == "9D") data = new Uint8Array([0x9D]);
    if (send == "9E") data = new Uint8Array([0x9E]);
    if (send == "9F") data = new Uint8Array([0x9F]);
    if (send == "A0") data = new Uint8Array([0xA0]);
    if (send == "A1") data = new Uint8Array([0xA1]);
    if (send == "A2") data = new Uint8Array([0xA2]);
    if (send == "A3") data = new Uint8Array([0xA3]);
    if (send == "A4") data = new Uint8Array([0xA4]);
    if (send == "A5") data = new Uint8Array([0xA5]);
    if (send == "A6") data = new Uint8Array([0xA6]);
    if (send == "A7") data = new Uint8Array([0xA7]);
    if (send == "A8") data = new Uint8Array([0xA8]);
    if (send == "A9") data = new Uint8Array([0xA9]);
    if (send == "AA") data = new Uint8Array([0xAA]);
    if (send == "AB") data = new Uint8Array([0xAB]);
    if (send == "AC") data = new Uint8Array([0xAC]);
    if (send == "AD") data = new Uint8Array([0xAD]);
    if (send == "AE") data = new Uint8Array([0xAE]);
    if (send == "AF") data = new Uint8Array([0xAF]);
    if (send == "B0") data = new Uint8Array([0xB0]);
    if (send == "B1") data = new Uint8Array([0xB1]);
    if (send == "B2") data = new Uint8Array([0xB2]);
    if (send == "B3") data = new Uint8Array([0xB3]);
    if (send == "B4") data = new Uint8Array([0xB4]);
    if (send == "B5") data = new Uint8Array([0xB5]);
    if (send == "B6") data = new Uint8Array([0xB6]);
    if (send == "B7") data = new Uint8Array([0xB7]);
    if (send == "B8") data = new Uint8Array([0xB8]);
    if (send == "B9") data = new Uint8Array([0xB9]);
    if (send == "BA") data = new Uint8Array([0xBA]);
    if (send == "BB") data = new Uint8Array([0xBB]);
    if (send == "BC") data = new Uint8Array([0xBC]);
    if (send == "BD") data = new Uint8Array([0xBD]);
    if (send == "BE") data = new Uint8Array([0xBE]);
    if (send == "BF") data = new Uint8Array([0xBF]);
    if (send == "C0") data = new Uint8Array([0xC0]);
    if (send == "C1") data = new Uint8Array([0xC1]);
    if (send == "C2") data = new Uint8Array([0xC2]);
    if (send == "C3") data = new Uint8Array([0xC3]);
    if (send == "C4") data = new Uint8Array([0xC4]);
    if (send == "C5") data = new Uint8Array([0xC5]);
    if (send == "C6") data = new Uint8Array([0xC6]);
    if (send == "C7") data = new Uint8Array([0xC7]);
    if (send == "C8") data = new Uint8Array([0xC8]);
    if (send == "C9") data = new Uint8Array([0xC9]);
    if (send == "CA") data = new Uint8Array([0xCA]);
    if (send == "CB") data = new Uint8Array([0xCB]);
    if (send == "CC") data = new Uint8Array([0xCC]);
    if (send == "CD") data = new Uint8Array([0xCD]);
    if (send == "CE") data = new Uint8Array([0xCE]);
    if (send == "CF") data = new Uint8Array([0xCF]);
    if (send == "D0") data = new Uint8Array([0xD0]);
    if (send == "D1") data = new Uint8Array([0xD1]);
    if (send == "D2") data = new Uint8Array([0xD2]);
    if (send == "D3") data = new Uint8Array([0xD3]);
    if (send == "D4") data = new Uint8Array([0xD4]);
    if (send == "D5") data = new Uint8Array([0xD5]);
    if (send == "D6") data = new Uint8Array([0xD6]);
    if (send == "D7") data = new Uint8Array([0xD7]);
    if (send == "D8") data = new Uint8Array([0xD8]);
    if (send == "D9") data = new Uint8Array([0xD9]);
    if (send == "DA") data = new Uint8Array([0xDA]);
    if (send == "DB") data = new Uint8Array([0xDB]);
    if (send == "DC") data = new Uint8Array([0xDC]);
    if (send == "DD") data = new Uint8Array([0xDD]);
    if (send == "DE") data = new Uint8Array([0xDE]);
    if (send == "DF") data = new Uint8Array([0xDF]);
    if (send == "E0") data = new Uint8Array([0xE0]);
    if (send == "E1") data = new Uint8Array([0xE1]);
    if (send == "E2") data = new Uint8Array([0xE2]);
    if (send == "E3") data = new Uint8Array([0xE3]);
    if (send == "E4") data = new Uint8Array([0xE4]);
    if (send == "E5") data = new Uint8Array([0xE5]);
    if (send == "E6") data = new Uint8Array([0xE6]);
    if (send == "E7") data = new Uint8Array([0xE7]);
    if (send == "E8") data = new Uint8Array([0xE8]);
    if (send == "E9") data = new Uint8Array([0xE9]);
    if (send == "EA") data = new Uint8Array([0xEA]);
    if (send == "EB") data = new Uint8Array([0xEB]);
    if (send == "EC") data = new Uint8Array([0xEC]);
    if (send == "ED") data = new Uint8Array([0xED]);
    if (send == "EE") data = new Uint8Array([0xEE]);
    if (send == "EF") data = new Uint8Array([0xEF]);
    if (send == "F0") data = new Uint8Array([0xF0]);
    if (send == "F1") data = new Uint8Array([0xF1]);
    if (send == "F2") data = new Uint8Array([0xF2]);
    if (send == "F3") data = new Uint8Array([0xF3]);
    if (send == "F4") data = new Uint8Array([0xF4]);
    if (send == "F5") data = new Uint8Array([0xF5]);
    if (send == "F6") data = new Uint8Array([0xF6]);
    if (send == "F7") data = new Uint8Array([0xF7]);
    if (send == "F8") data = new Uint8Array([0xF8]);
    if (send == "F9") data = new Uint8Array([0xF9]);
    if (send == "FA") data = new Uint8Array([0xFA]);
    if (send == "FB") data = new Uint8Array([0xFB]);
    if (send == "FC") data = new Uint8Array([0xFC]);
    if (send == "FD") data = new Uint8Array([0xFD]);
    if (send == "FE") data = new Uint8Array([0xFE]);
    if (send == "FF") data = new Uint8Array([0xFF]);
// ... Continue this pattern all the way to "FF"
    console.log(send);
    await writer.write(data);
    await wait(10);
}

function IsKukiDevice() 
{ 
   if(IsKuki == false){
    //   showConfirmFirmware();
    console.log("Not Kuki Device");
   }else{
    console.log("IS Kuki Device");
   }
}

async function sendCheckCommand() 
{ 
    console.log("Send command");
    await writeSerial('DE');
    await wait(10);
}

function SerialData(value) 
{
    try 
    {
        if (value == null || value == undefined)
            return;

        // Check if the value contains version information
        // if (value.includes("MicroPython") && !initialVersionCheckDone) {
        //     const versionMatch = value.match(/MicroPython v([\d.]+)/);
        //     if (versionMatch) {
        //         const version = versionMatch[1];
        //         localStorage.setItem("micropythonVersion", version);

        //         // Compare versions
        //         const currentVersion = version.split('.').map(Number);
        //         const targetVersion = '1.22.2'.split('.').map(Number);

        //         // Check if version is exactly 1.22.2
        //         const isTargetVersion = currentVersion[0] === targetVersion[0] && 
        //                               currentVersion[1] === targetVersion[1] && 
        //                               currentVersion[2] === targetVersion[2];

        //         if (!isFiles && !initialVersionCheckDone) {
        //             if (!isTargetVersion) {
        //                 // swal({
        //                 //     title: "⚠️ MicroPython Update Required",
        //                 //     content: {
        //                 //         element: "div",
        //                 //         attributes: {
        //                 //             innerHTML: `Your version: v${version}<br><br>` +
        //                 //                 `Required version: v1.22.2<br><br>` +
        //                 //                 `Please update your firmware at:<br>` +
        //                 //                 `<a href="https://hprobots.com/otto-code/webcode/pythonuploader/pythonuploader.html" target="_blank">Update Firmware</a>`
        //                 //         },
        //                 //     },
        //                 //     icon: "warning",
        //                 //     buttons: {
        //                 //         later: {
        //                 //             text: "Later",
        //                 //             value: null,
        //                 //             visible: true,
        //                 //         },
        //                 //         update: {
        //                 //             text: "Update Now",
        //                 //             value: true,
        //                 //             className: "swal-button--update"
        //                 //         }
        //                 //     },
        //                 //     className: "text-center"
        //                 // })
        //                 // .then((willUpdate) => {
        //                 //     if (willUpdate) {
        //                 //         window.open("https://hprobots.com/otto-code/webcode/pythonuploader/pythonuploader.html", "_blank");
        //                 //     }
        //                 // });
        //             } else {
        //                 // swal({
        //                 //     title: "Connected! 🔌",
        //                 //     text: `MicroPython v${version} ✅\nYou are on the correct version.`,
        //                 //     icon: "success",
        //                 //     button: "OK",
        //                 //     className: "text-center"
        //                 // });
        //             }
        //             initialVersionCheckDone = true;
        //         }
        //         return;
        //     }
        // }

        // if (isCheckFilesCorrect) {
        //     const missingLibraries = compareArrays(files.split("\r\n"), ottoLibraryFiles);
        //     if (missingLibraries && !initialVersionCheckDone) {
        //         showModalDialog("There are missing library files:\n" + missingLibraries, "info");
        //     }
        //     // isCheckFilesCorrect = false;
        // }

        // if (value.indexOf("BA") == 0)
        //     localStorage.setItem("Microbit", "BA");
        // else if (value.indexOf("BB") == 0)
        //     localStorage.setItem("Microbit", "BB");
        // else if (value.indexOf("A") == 0)
        //     localStorage.setItem("Microbit", value);
        // else
        //     localStorage.setItem("Microbit", "");
    }
    catch(err) 
    {
        console.log("Error: " + err.message);
    }
}
