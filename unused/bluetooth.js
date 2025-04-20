import EventEmitter from '../js/classes/EventEmitter';




let blueToothCharacteristic;
let connectedDevice; 
let buffer = "";
let isConnectedBLE = false;

function connectToBle() {
    // alert("asdas");
    // navigator.bluetooth.requestDevice({
    //     acceptAllDevices: true,
    //     optionalServices: ['battery_service', 'device_information'] // Start with common services
    //   })
    //   .then(device => device.gatt.connect())
    //   .then(server => server.getPrimaryServices())
    //   .then(services => {
    //     console.log("Available services:");
    //     services.forEach(service => {
    //       console.log(service.uuid);
    //     });
    //   })
    //   .catch(error => console.log("Error:", error));

    // navigator.bluetooth.requestDevice({
    //     // filters: [{ name: ['MLT-BT05'] }],
    //     acceptAllDevices:true,
    //     optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
    //   })
    //   .then(device => device.gatt.connect())
    //   .then(server => server.getPrimaryServices())
    // //   .then(service => service.getCharacteristics())
    //   .then(service => {
    //     service.forEach(c => {
    //       console.log("UUID:", c.uuid);
    //       console.log("isPrimary:", c.isPrimary);
    //       console.log("device:", c.device);

    //       connectedDevice = c.device;
        
    //     });
    //   });

    navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: ['KUKI'] }],
        // filters: [{ name: ['AT-09'] }],
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb', '0000ffe1-0000-1000-8000-00805f9b34fb']
      })
      .then(device => { connectedDevice = device;return device.gatt.connect();})
      .then(server => server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb'))
      .then(service => service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb"))
      .then(characteristic => {
        console.log("UUID:", characteristic.uuid);
        console.log("Writable:", characteristic.properties.write || c.properties.writeWithoutResponse);
        console.log("Notifiable:", characteristic.properties.notify);
        blueToothCharacteristic = characteristic;
        return startNotifications(); // Bildirimleri başlat
        // characteristics.forEach(c => {
        //   console.log("UUID:", c.uuid);
        //   console.log("Writable:", c.properties.write || c.properties.writeWithoutResponse);
        //   console.log("Notifiable:", c.properties.notify);
        // });
      })
      .then(() => {
                isConnectedBLE = true;
                IsKuki = true;
                iskukichecked = true;
                connectionType = "BLE";
                ConnectedBLE();
        })
      .catch(error => { 
                showModalDialog(error.message, "error"); 
        });

    // }
    // navigator.bluetooth.requestDevice({
    //     filters: [{ namePrefix: ['KUKI'] }], 
    //     //acceptAllDevices: true,
    //     optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"]
    //   })
    //     .then(device => {
    //         connectedDevice = device; // Bağlanmış cihazı sakla
    //         return device.gatt.connect();
    //     })
    //     .then(server => server.getPrimaryService("0000ffe0-0000-1000-8000-00805f9b34fb"))
    //     .then(service => service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb"))
    //     .then(characteristic => {
    //         blueToothCharacteristic = characteristic;
    //         return startNotifications(); // Bildirimleri başlat
    //     })
    //     .then(() => {
    //         isConnectedBLE = true;
    //         connectionType = "BLE";
    //         ConnectedBLE();
    //     })
    //     .catch(error => { 
    //         showModalDialog(error.message, "error"); 
    //     });
}

function ConnectedBLE()
{
  isConnected = true;
  connectionType = "BLE";
  $("#btConnectBLE").removeClass("notConnectedButton");
  $("#btConnectBLE").addClass("connectedButton");

  showModalDialog("Connected", "success");
}

function startNotifications() {
    if (blueToothCharacteristic) {
        return blueToothCharacteristic.startNotifications().then(() => {
            blueToothCharacteristic.addEventListener('characteristicvaluechanged', onValueChanged);
        });
    } else {
        return Promise.reject(new Error('Characteristic not found'));
    }
}

function onValueChanged(event) {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    buffer = decoder.decode(value, { stream: true });
    console.log(buffer);
    try
    {     
      var termValue = buffer;
    //   termValue = MessagePrepare(termValue);

    //   if(window.localStorage.getItem("Page") == "Vertical")
    //     term.write(termValue + "\n\r");
      
      /*
      if(window.localStorage.getItem("Page") == "Horizontal")
      {
        if(fullMessage.indexOf("#") > 0)
        {
          var dist = fullMessage.replace("D#", "").replace("$", "");
          dist = dist.substring(0, 5);
          $("#lbDistance").text(dist);
        }
      }
      */

      if((fullMessage.toUpperCase().indexOf("ERROR") >= 0 || fullMessage.toUpperCase().indexOf("LINE") >= 0) && fullMessage.indexOf("_boot.py") < 0)
      {
        showModalDialog(ErrorText + "\n" + fullMessage, "error");
      }

      if(fullMessage.indexOf("Micropython"))
      {
        isMicropython = true;
      }
}
catch(err)
{
  //console.log(err);
}
}

function DisconnectedBLE()
{
  isConnected = false;
  $("#btConnectBLE").removeClass("connectedButton");
  $("#btConnectBLE").addClass("notConnectedButton");
}


function disConnectBLE() {
    if (connectedDevice) { // connectedDevice kontrolü yapılıyor
        connectedDevice.gatt.disconnect(); // Bağlantıyı kesme işlemi yapılıyor
        blueToothCharacteristic = null;
        isConnectedBLE = false;
        connectionType = "";
        DisconnectedBLE();
    } else {
        showModalDialog("No Bluetooth device is connected.", "error"); // Bağlantı kesme işlemi yapılamazsa hata mesajı gösteriliyor
    }
}

async function sendCode(hexString) { 

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
        // await blueToothCharacteristic.writeValue(dataPacket);
        // await wait(10);
        for (var i = 0, s = dataPacket.length; i < s; i += 16) {
            let dataToSend = dataPacket.slice(i, Math.min(i + 16, dataPacket.length));
    
            await blueToothCharacteristic.writeValue(dataToSend);
    
            // width += increment; 
            // if (Math.round(width) <= 100) {
            //     elem.innerHTML = Math.round(width) * 1 + '%';
            //     elem.style.width = Math.round(width) + '%'; 
            // }
    
            await wait(10);
    
            if((s - i) < 50)
            {
                // hideProgressPanel();
                // if(command != "#close#");
                    // BeepSound();
            }
        }
    } catch (error) {
        console.error("Error sending data:", error);
    }
   
    // let encoder = new TextEncoder('utf-8');
    // let command_bytes = encoder.encode(hexString + '\nEoChunk');

    // var elem = document.getElementById("progressBar"); 
    // elem.innerHTML = '0%';
    // elem.style.width = '0%'; 
    // var width = 0;
    // var parts = command.length / 16;
    // var increment = 100 / parts;

  
}

