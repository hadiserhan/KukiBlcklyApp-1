export  class WEDOConnection extends EventTarget {

  constructor(mode = "BLE", autoReconnect = false, reconnectInterval = 3000) {
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
    this.BLEService = {
      DEVICE_SERVICE: '00001523-1212-efde-1523-785feabcd123',
      IO_SERVICE: '00004f0e-1212-efde-1523-785feabcd123'
    };
    this.BLECharacteristic = {
        ATTACHED_IO: '00001527-1212-efde-1523-785feabcd123',
        LOW_VOLTAGE_ALERT: '00001528-1212-efde-1523-785feabcd123',
        INPUT_VALUES: '00001560-1212-efde-1523-785feabcd123',
        INPUT_COMMAND: '00001563-1212-efde-1523-785feabcd123',
        OUTPUT_COMMAND: '00001565-1212-efde-1523-785feabcd123'
    };
  }

  setMode(mode) {
    this.mode = mode;
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.outputCommandChar = null;
    this.lowVoltageChar = null;
    this.attachedIOChar = null;
    this.inputValuesChar = null;
    this.inputCommandChar = null;
    this._log(`Mode set to: ${mode}`);
  }

  connect() {
    this.disconnect().then(() => {
      this._shouldReconnect = true;
      navigator.bluetooth.requestDevice({
        filters: [{
          services: [this.BLEService.DEVICE_SERVICE]
        }],
        optionalServices: [this.BLEService.IO_SERVICE]
      }).then(device => {
        this.device = device;
        this.device.addEventListener("gattserverdisconnected", () => {
          this._isConnected = false;
          this.dispatchEvent(new Event("disconnected"));
        });
        return device.gatt.connect();
      }).then(server => {
        this.server = server;
        return Promise.all([
          server.getPrimaryService(this.BLEService.DEVICE_SERVICE),
          server.getPrimaryService(this.BLEService.IO_SERVICE)
        ]);
      }).then(([deviceService, ioService]) => {
        return Promise.all([
          ioService.getCharacteristic(this.BLECharacteristic.OUTPUT_COMMAND),   // WRITE ONLY
          deviceService.getCharacteristic(this.BLECharacteristic.LOW_VOLTAGE_ALERT),// NOTIFY
          deviceService.getCharacteristic(this.BLECharacteristic.ATTACHED_IO),          // NOTIFY
          ioService.getCharacteristic(this.BLECharacteristic.INPUT_VALUES),         // NOTIFY
          ioService.getCharacteristic(this.BLECharacteristic.INPUT_COMMAND)         // WRITE ONLY
        ]);
      }).then(([outputCommandChar, lowVoltageChar, attachedIOChar, inputValuesChar, inputCommandChar]) => {
        this.outputCommandChar = outputCommandChar;
        this.lowVoltageChar = lowVoltageChar;
        this.attachedIOChar = attachedIOChar;
        this.inputValuesChar = inputValuesChar;
        this.inputCommandChar = inputCommandChar;
    
        // Only start notifications on NOTIFY characteristics
        const handleNotification = (charName) => (event) => {
          const value = event.target.value;
          switch (charName) {
            case "AttachedIO":
              this.dispatchEvent(new CustomEvent("_onMessage" ,{detail : new Uint8Array(value.buffer)}));
              break;
              case "InputValues":
                this.dispatchEvent(new CustomEvent("_onMessage" ,{detail : new Uint8Array(value.buffer)}));
                break;
            default:
              break;
          }
          console.log(`${charName} notification`, new Uint8Array(value.buffer));
        };
    
        return Promise.all([
          lowVoltageChar.startNotifications().then(() => {
            lowVoltageChar.addEventListener("characteristicvaluechanged", handleNotification("LowVoltage"));
          }),
          attachedIOChar.startNotifications().then(() => {
            attachedIOChar.addEventListener("characteristicvaluechanged", handleNotification("AttachedIO"));
          })
        ]);
      }).then(() => {
        this._isConnected = true;
        this.dispatchEvent(new Event("_onConnect"));
      }).catch((error) => {
        console.error('Connection failed', error);
        this._scheduleReconnect();
      });
    });   
  }


  _startNotifications(self , func) {
    this.inputValuesChar.startNotifications()
        .then(() => {
            // Adding the event listener to handle characteristic changes
            this.inputValuesChar.addEventListener("characteristicvaluechanged", (event) => {
                // Extract the value from the event (e.g., converting it to text or bytes)
                const value = event.target.value; 
                func(self , {detail : new Uint8Array(value.buffer)});
            });
        })
        .catch(error => {
            console.error('Error starting notifications:', error);
        });
}

  disconnect() {
    this._shouldReconnect = false;
    this._isConnected = false;
    this._isKuki = false;
    clearTimeout(this._reconnectTimer);
    this._stopPing();
    const p4 = this.mode === "BLE" && this.characteristic  && this.device?.gatt?.connected
      ? this.characteristic.stopNotifications().then(() => {
          if (this._onBluetoothReceive)
            this.characteristic.removeEventListener("characteristicvaluechanged", this._onBluetoothReceive);
        }).catch(err => {
          console.warn("⚠️ stopNotifications failed:", err.message);
        })
      : Promise.resolve();
    const p5 = this.mode === "BLE" && this.device?.gatt?.connected
      ? Promise.resolve(this.device.gatt.disconnect())
      : Promise.resolve();

    return Promise.all([p4, p5]).then(() => {
      this.buffer = [];
      this.dispatchEvent(new Event("disconnected"));
    });
  }

  startNotifications(){

  }

  send(bytes) {
    const data = new Uint8Array(bytes);
    if (this.mode === "BLE" && this.characteristic) {
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

  sendCommand(BLECharacteristic , bytes) {
    const data = new Uint8Array(bytes);

    if (this.mode === "BLE"){
      switch (BLECharacteristic) {
        case this.BLECharacteristic.OUTPUT_COMMAND:
            if (this.outputCommandChar) {
                // Chain the next write onto the lock
                this._writeLock = this._writeLock.then(() =>
                this.outputCommandChar.writeValue(data)
              ).catch(err => {
                console.error("Write failed:", err);
              });
              return this._writeLock;
            }
          break;
          case this.BLECharacteristic.INPUT_COMMAND:
            if (this.inputCommandChar) {
                // Chain the next write onto the lock
                this._writeLock = this._writeLock.then(() =>
                this.inputCommandChar.writeValue(data)
              ).catch(err => {
                console.error("Write failed:", err);
              });
              return this._writeLock;
            }
          break;
        default:
          break;
      }
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

  _scheduleReconnect() {
    if (this.autoReconnect && this._shouldReconnect) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  _processBuffer() {
    
    if (this.buffer.length === 0) return;

    if (this.buffer.length >= 3) {
      if (this.buffer[0] === 0xFF && this.buffer[1] == 0x44) {
        //! check firmware received.
        // Try to match "Kuki_" + version + "\n"
        const str = this.buffer.slice(2).map(b => String.fromCharCode(b)).join('');
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
          this.buffer.splice(0, 2 + firmwareVersion.length);
          return;
        }
      }else if (this.buffer[0] === 0xFF && this.buffer[1] === 0x55) {
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
      }else if (this.buffer[0] === 0xFF && this.buffer[1] === 0x66) {
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
