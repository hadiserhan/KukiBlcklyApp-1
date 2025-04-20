export  class ArduinoConnection extends EventTarget {

  constructor(mode = "serial", autoReconnect = true, reconnectInterval = 3000) {
    super();
    this.setMode(mode);
    this.autoReconnect = autoReconnect;
    this.reconnectInterval = reconnectInterval;
    this._shouldReconnect = false;
    this._reconnectTimer = null;
    this._onBluetoothReceive = null;
    this.buffer = [];
    this.parserInterval = setInterval(() => this._processBuffer(), 100);
    this._pingInterval = null;
    this._expectedFirmware = "KUKI";
    this._firmwareChecked = false;
    this._firmwareTimeout = null;
    this._isKuki = false;
    this._isConnected = false;
    this._writeLock = Promise.resolve(); // Queue start point
  }

  setMode(mode) {
    this.mode = mode;
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this._log(`Mode set to: ${mode}`);
  }

  connect() {
    this.disconnect().then(() => {
      this._shouldReconnect = true;
      if (this.mode === "serial") {
        navigator.serial.requestPort().then(port => {
          this.port = port;
          return port.open({ baudRate: 9600 });
        }).then(() => {

          // Listen for disconnect event (e.g., USB unplugged)  
          this.port.addEventListener("disconnect", () => {
            this._isConnected = false;
            this.dispatchEvent(new Event("disconnected"));
            this._scheduleReconnect();
          });
          this.writer = this.port.writable.getWriter();
          this.reader = this.port.readable.getReader();
          this._readSerial();
          this._isConnected = true;
          this.dispatchEvent(new Event("connected"));
          this._verifyFirmware();   // <- Add this
        }).catch(() => this._scheduleReconnect());
      } else {
        navigator.bluetooth.requestDevice({
          filters: [{ namePrefix: ['KUKI'] }],
          optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb', '0000ffe1-0000-1000-8000-00805f9b34fb']
        }).then(device => {
          this.device = device;
          this.device.addEventListener("gattserverdisconnected", () => {
            this._isConnected = false;
            this.dispatchEvent(new Event("disconnected"));
            this._scheduleReconnect();
          });
          return device.gatt.connect();
        }).then(server => {
          this.server = server;
          return server.getPrimaryService("0000ffe0-0000-1000-8000-00805f9b34fb");
        }).then(service => {
          return service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");
        }).then(characteristic => {
          this.characteristic = characteristic;
          this._onBluetoothReceive = (event) => {
            const value = event.target.value;
            for (let i = 0; i < value.byteLength; i++) {
              this.buffer.push(value.getUint8(i));
            }
          };
          return characteristic.startNotifications().then(() => {
            characteristic.addEventListener("characteristicvaluechanged", this._onBluetoothReceive);
            this._isConnected = true;
            this.dispatchEvent(new Event("connected"));
            this._startPing();
            this._verifyFirmware(); 
          });
        }).catch(() => this._scheduleReconnect());
      }
    });
  }

  disconnect() {
    this._shouldReconnect = false;
    this._isConnected = false;
    this._isKuki = false;
    clearTimeout(this._reconnectTimer);
    this._stopPing();
    const p1 = this.mode === "serial" && this.reader ? this.reader.releaseLock() : Promise.resolve();
    const p2 = this.mode === "serial" && this.writer ? this.writer.releaseLock() : Promise.resolve();
    const p3 = this.mode === "serial" && this.port ? this.port.close() : Promise.resolve();
    const p4 = this.mode === "bluetooth" && this.characteristic  && this.device?.gatt?.connected
      ? this.characteristic.stopNotifications().then(() => {
          if (this._onBluetoothReceive)
            this.characteristic.removeEventListener("characteristicvaluechanged", this._onBluetoothReceive);
        }).catch(err => {
          console.warn("⚠️ stopNotifications failed:", err.message);
        })
      : Promise.resolve();
    const p5 = this.mode === "bluetooth" && this.device?.gatt?.connected
      ? Promise.resolve(this.device.gatt.disconnect())
      : Promise.resolve();

    return Promise.all([p1, p2, p3, p4, p5]).then(() => {
      this.buffer = [];
      this.dispatchEvent(new Event("disconnected"));
    });
  }

  send(bytes) {
    const data = new Uint8Array(bytes);
    if (this.mode === "serial" && this.writer) {
      return this.writer.write(data);
    } else if (this.mode === "bluetooth" && this.characteristic) {
        // Chain the next write onto the lock
        this._writeLock = this._writeLock.then(() =>
        this.characteristic.writeValue(data)
      ).catch(err => {
        console.error("Write failed:", err);
      });
      return this._writeLock;
      // return this.characteristic.writeValue(data);
    }
    return Promise.resolve();
  }

  on(event, cb) {
    this.addEventListener(event, cb);
  }

  destroy() {
    clearInterval(this.parserInterval);
    clearTimeout(this._reconnectTimer);
    this.disconnect();
  }

  _readSerial() {
    const readLoop = () => {
      if (!this.reader) return;
      this.reader.read().then(({ value, done }) => {
        if (done) {
          this._isConnected = false;
          this.dispatchEvent(new Event("disconnected"));
          this._scheduleReconnect();
          return;
        }
        if(!value){
          console.log("No data received, but keeping connection open.");
          return;  // Just return and keep the connection alive
        }
        value.forEach(b => this.buffer.push(b));
        // console.log(value);
        readLoop();
      }).catch(() => {
        this._isConnected = false;
        this.dispatchEvent(new Event("disconnected"));
        this._scheduleReconnect();
      });
    };
    readLoop();
  }

  _scheduleReconnect() {
    if (this.autoReconnect && this._shouldReconnect) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  _processBuffer() {
    
    if (this.buffer.length === 0) return;

    if (this.buffer[0] === 0xFF && this.buffer[1] !== 0x55) {
      // Try to match "Kuki_" + version + "\n"
      const str = this.buffer.slice(1).map(b => String.fromCharCode(b)).join('');
      const versionMatch = str.match(/^Kuki_[\d\.]+\n?/);
  
      if (versionMatch) {
        const firmwareVersion = versionMatch[0].trim();
        this.dispatchEvent(new CustomEvent("firmwareVersion", { detail: firmwareVersion }));
        this._firmwareChecked = true;
        if (firmwareVersion.toUpperCase().includes(this._expectedFirmware)) {
          this.dispatchEvent(new CustomEvent("firmwareValid",{ detail: firmwareVersion }));
        } else {
          this.dispatchEvent(new Event("firmwareMismatch"));
        }
  
        // Remove matched bytes from buffer
        this.buffer.splice(0, 1 + firmwareVersion.length);
        return;
      }
    }

    if (this.buffer.length >= 3) {
      if (this.buffer[0] === 0xFF && this.buffer[1] === 0x55) {
        const cmd_two = this.buffer[2];
        switch (cmd_two) {
          case 0xEE:
            this.dispatchEvent(new Event("codeStarted")); break;
          case 0xDD:
            this.dispatchEvent(new Event("codeStopped")); break;
          default:
            this.dispatchEvent(new CustomEvent("receiveData" , { detail: this.buffer}));
            // this._log("Unknown command: " + cmd_two);
          }
        this.buffer = [];
      } else {
        this.buffer.shift();
      }
    }
  }

  _verifyFirmware(maxRetries = 3, timeout = 10000) {
    return new Promise((resolve) => {
      this._firmwareChecked = false;
      let attempt = 0;

      const onVersion  = (e) => {
        const version = e.detail;
        this.removeEventListener("firmwareVersion", onVersion);
        clearTimeout(this._firmwareTimeout);

        if (version.toUpperCase().includes(this._expectedFirmware)) {
          this._isKuki = true;
          resolve(version);
        } else {
          this._isKuki = false;
         resolve(null);  // Mi
        }
      };
  
      const sendFirmwareCheck = () => {
        if (attempt >= maxRetries || (this._isConnected == false)) {
          this._log("❌ Firmware check failed after multiple attempts");
          resolve(null);  // Give up after maxRetries
          return;
        }
  
        attempt++;
        console.log(`Attempt ${attempt} to check firmware...`);

        this.addEventListener("firmwareVersion", onVersion);

        // Timeout if no response
        this._firmwareTimeout = setTimeout(() => {
          this.removeEventListener("firmwareVersion", onVersion);
          if (!this._firmwareChecked) {
            this._log("❌ Firmware check timeout");
            // Retry after the retryDelay
            sendFirmwareCheck();
          }
        }, timeout);

        // Send firmware check command
        this.send([0xDE]);
      };

    // Start the first attempt
    sendFirmwareCheck();
    });
  }
  

  _startPing() {
    this._pingInterval = setInterval(() => {
      if (!this.device || !this.device.gatt.connected) {
        this._handleDisconnect();
      }
    }, 20000); // every 3 seconds
  }

  _stopPing() {
    if (this._pingInterval) clearInterval(this._pingInterval);
  }

  _handleDisconnect() {
    this._isConnected = false;
    console.warn("🔌 Disconnected from device!");
    this._stopPing();
    this.dispatchEvent(new Event("disconnected"));
  }

  _log(msg) {
    console.log(`[${this.mode.toUpperCase()}] ${msg}`);
  }
}
