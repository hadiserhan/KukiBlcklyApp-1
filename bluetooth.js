// globals
let blueToothCharacteristic;
let connectedDevice; 
let buffer = "";
let isConnectedBLE = false;

function connectToBle() {
    navigator.bluetooth.requestDevice({
        acceptAllDevices:true,
        optionalServices: ["generic_access", "generic_attribute"], // Basic services
        // filters: [{ name: ['Otto'] }], 
        // //acceptAllDevices: true,
        // optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
      })
        .then(device => {
            connectedDevice = device; // Bağlanmış cihazı sakla
            return device.gatt.connect();
        })
        .then(server => server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e"))
        .then(service => service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e"))
        .then(characteristic => {
            blueToothCharacteristic = characteristic;
            return startNotifications(); // Bildirimleri başlat
        })
        .then(() => {
            isConnectedBLE = true;
            connectionType = "BLE";
            ConnectedBLE();
        })
        .catch(error => { 
            console.log(error.message); 
        });
}
