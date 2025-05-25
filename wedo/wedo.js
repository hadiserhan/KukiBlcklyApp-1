import { WEDOConnection } from '../Wedo/WedoConnection.js';



/**
 * A maximum number of BLE message sends per second, to be enforced by the rate limiter.
 * @type {number}
 */
const BLESendRateMax = 20;
/**
 * Enum for WeDo 2.0 sensor and output types.
 * @readonly
 * @enum {number}
 */
const WeDo2Device = {
    MOTOR: 1,
    PIEZO: 22,
    LED: 23,
    TILT: 34,
    DISTANCE: 35
};

/**
 * Enum for modes for input sensors on the WeDo 2.0.
 * @enum {number}
 */
const WeDo2Mode = {
    TILT: 0, // angle
    DISTANCE: 0, // detect
    LED: 1 // RGB
};
/**
 * Enum for units for input sensors on the WeDo 2.0.
 *
 * 0 = raw
 * 1 = percent
 *
 * @enum {number}
 */
const WeDo2Unit = {
    TILT: 0,
    DISTANCE: 1,
    LED: 0
};

/**
 * Enum for connection/port ids assigned to internal WeDo 2.0 output devices.
 * @readonly
 * @enum {number}
 */
// TODO: Check for these more accurately at startup?
const WeDo2ConnectID = {
    LED: 6,
    PIEZO: 5
};

/**
 * Enum for ids for various output commands on the WeDo 2.0.
 * @readonly
 * @enum {number}
 */
const WeDo2Command = {
    MOTOR_POWER: 1,
    PLAY_TONE: 2,
    STOP_TONE: 3,
    WRITE_RGB: 4,
    SET_VOLUME: 255
};

/**
 * Enum for tilt sensor direction.
 * @readonly
 * @enum {string}
 */
const WeDo2TiltDirection = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    ANY: 'any'
};
/**
 * Manage communication with a WeDo 2.0 peripheral over a Bluetooth Low Energy client socket.
 */
export class WeDo2 {

    constructor (runtime, extensionId) {

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * A list of the ids of the motors or sensors in ports 1 and 2.
         * @type {string[]}
         * @private
         */
        this._ports = ['none', 'none'];

        /**
         * The motors which this WeDo 2.0 could possibly have.
         * @type {WeDo2Motor[]}
         * @private
         */
        this._motors = [null, null];

        /**
         * The most recently received value for each sensor.
         * @type {Object.<string, number>}
         * @private
         */
        this._sensors = {
            tiltX: 0,
            tiltY: 0,
            distance: 0
        };

        /**
         * The Bluetooth connection socket for reading/writing peripheral data.
         * @type {BLE}
         * @private
         */

        this._ble = new WEDOConnection("BLE");

        /**
         * A rate limiter utility, to help limit the rate at which we send BLE messages
         * over the socket to Scratch Link to a maximum number of sends per second.
         * @type {RateLimiter}
         * @private
         */
        this._rateLimiter = new RateLimiter(BLESendRateMax);

        /**
         * An interval id for the battery check interval.
         * @type {number}
         * @private
         */
        this._batteryLevelIntervalId = null;

        this.reset = this.reset.bind(this);
        this._ble.on("_onConnect", () => this._onConnect(this));
        this._ble.on("_onMessage", (event) => this._onMessage(this , event));
        this._checkBatteryLevel = this._checkBatteryLevel.bind(this);
    }

    /**
     * @return {number} - the latest value received for the tilt sensor's tilt about the X axis.
     */
    get tiltX () {
        return this._sensors.tiltX;
    }

    /**
     * @return {number} - the latest value received for the tilt sensor's tilt about the Y axis.
     */
    get tiltY () {
        return this._sensors.tiltY;
    }

    /**
     * @return {number} - the latest value received from the distance sensor.
     */
    get distance () {
        return this._sensors.distance;
    }

    /**
     * Access a particular motor on this peripheral.
     * @param {int} index - the zero-based index of the desired motor.
     * @return {WeDo2Motor} - the WeDo2Motor instance, if any, at that index.
     */
    motor (index) {
        return this._motors[index];
    }

    /**
     * Stop all the motors that are currently running.
     */
    stopAllMotors () {
        this._motors.forEach(motor => {
            if (motor) {
                // Send the motor off command without using the rate limiter.
                // This allows the stop button to stop motors even if we are
                // otherwise flooded with commands.
                motor.turnOff(false);
            }
        });
    }

    /**
     * Set the WeDo 2.0 peripheral's LED to a specific color.
     * @param {int} inputRGB - a 24-bit RGB color in 0xRRGGBB format.
     * @return {Promise} - a promise of the completion of the set led send operation.
     */
    setLED (inputRGB) {
        const rgb = [
            (inputRGB >> 16) & 0x000000FF,
            (inputRGB >> 8) & 0x000000FF,
            (inputRGB) & 0x000000FF
        ];

        const cmd = this.generateOutputCommand(
            WeDo2ConnectID.LED,
            WeDo2Command.WRITE_RGB,
            rgb
        );

        return this._ble.sendCommand(this._ble.BLECharacteristic.OUTPUT_COMMAND, cmd);
    }

    /**
     * Sets the input mode of the LED to RGB.
     * @return {Promise} - a promise returned by the send operation.
     */
    setLEDMode () {
        const cmd = this.generateInputCommand(
            WeDo2ConnectID.LED,
            WeDo2Device.LED,
            WeDo2Mode.LED,
            0,
            WeDo2Unit.LED,
            false
        );

        return this._ble.sendCommand(this._ble.BLECharacteristic.INPUT_COMMAND, cmd);
    }

    /**
     * Switch off the LED on the WeDo 2.0.
     * @return {Promise} - a promise of the completion of the stop led send operation.
     */
    stopLED () {
        const cmd = this.generateOutputCommand(
            WeDo2ConnectID.LED,
            WeDo2Command.WRITE_RGB,
            [0, 0, 0]
        );

        return this._ble.sendCommand(this._ble.BLECharacteristic.OUTPUT_COMMAND, cmd);
    }

    /**
     * Play a tone from the WeDo 2.0 peripheral for a specific amount of time.
     * @param {int} tone - the pitch of the tone, in Hz.
     * @param {int} milliseconds - the duration of the note, in milliseconds.
     * @return {Promise} - a promise of the completion of the play tone send operation.
     */
    playTone (tone, milliseconds) {
        const cmd = this.generateOutputCommand(
            WeDo2ConnectID.PIEZO,
            WeDo2Command.PLAY_TONE,
            [
                tone,
                tone >> 8,
                milliseconds,
                milliseconds >> 8
            ]
        );

        return this._ble.sendCommand(this._ble.BLECharacteristic.OUTPUT_COMMAND, cmd);
    }

    /**
     * Stop the tone playing from the WeDo 2.0 peripheral, if any.
     * @return {Promise} - a promise that the command sent.
     */
    stopTone () {
        const cmd = this.generateOutputCommand(
            WeDo2ConnectID.PIEZO,
            WeDo2Command.STOP_TONE
        );

        // Send this command without using the rate limiter, because it is
        // only triggered by the stop button.
        return this._ble.sendCommand(this._ble.BLECharacteristic.OUTPUT_COMMAND, cmd);
    }

    /**
     * Stop the tone playing and motors on the WeDo 2.0 peripheral.
     */
    stopAll () {
        if (!this.isConnected()) return;
        this.stopTone();
        this.stopAllMotors();
    }

    /**
     * Called by the runtime when user wants to scan for a WeDo 2.0 peripheral.
     */
    scan () {
        if (this._ble) {
            this._ble.disconnect();
        }
        this._ble.connect();
    }

    /**
     * Called by the runtime when user wants to connect to a certain WeDo 2.0 peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect (id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    /**
     * Disconnects from the current BLE socket.
     */
    disconnect () {
        if (this._ble) {
            this._ble.disconnect();
        }

        this.reset();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    reset () {
        this._ports = ['none', 'none'];
        this._motors = [null, null];
        this._sensors = {
            tiltX: 0,
            tiltY: 0,
            distance: 0
        };

        if (this._batteryLevelIntervalId) {
            window.clearInterval(this._batteryLevelIntervalId);
            this._batteryLevelIntervalId = null;
        }
    }

    /**
     * Called by the runtime to detect whether the WeDo 2.0 peripheral is connected.
     * @return {boolean} - the connected state.
     */
    isConnected () {
        let connected = false;
        if (this._ble) {
            connected = this._ble._isConnected;
        }
        return connected;
    }

    /**
     * Write a message to the WeDo 2.0 peripheral BLE socket.
     * @param {number} uuid - the UUID of the characteristic to write to
     * @param {Array} message - the message to write.
     * @param {boolean} [useLimiter=true] - if true, use the rate limiter
     * @return {Promise} - a promise result of the write operation
     */
    send (uuid, message, useLimiter = true) {
        if (!this.isConnected()) return Promise.resolve();

        if (useLimiter) {
            if (!this._rateLimiter.okayToSend()) return Promise.resolve();
        }

        return this._ble.write(
            BLEService.IO_SERVICE,
            uuid,
            Base64Util.uint8ArrayToBase64(message),
            'base64'
        );
    }

    /**
     * Generate a WeDo 2.0 'Output Command' in the byte array format
     * (CONNECT ID, COMMAND ID, NUMBER OF BYTES, VALUES ...).
     *
     * This sends a command to the WeDo 2.0 to actuate the specified outputs.
     *
     * @param  {number} connectID - the port (Connect ID) to send a command to.
     * @param  {number} commandID - the id of the byte command.
     * @param  {array}  values    - the list of values to write to the command.
     * @return {array}            - a generated output command.
     */
    generateOutputCommand (connectID, commandID, values = null) {
        let command = [connectID, commandID];
        if (values) {
            command = command.concat(
                values.length
            ).concat(
                values
            );
        }
        return command;
    }

    /**
     * Generate a WeDo 2.0 'Input Command' in the byte array format
     * (COMMAND ID, COMMAND TYPE, CONNECT ID, TYPE ID, MODE, DELTA INTERVAL (4 BYTES),
     * UNIT, NOTIFICATIONS ENABLED).
     *
     * This sends a command to the WeDo 2.0 that sets that input format
     * of the specified inputs and sets value change notifications.
     *
     * @param  {number}  connectID           - the port (Connect ID) to send a command to.
     * @param  {number}  type                - the type of input sensor.
     * @param  {number}  mode                - the mode of the input sensor.
     * @param  {number}  delta               - the delta change needed to trigger notification.
     * @param  {array}   units               - the unit of the input sensor value.
     * @param  {boolean} enableNotifications - whether to enable notifications.
     * @return {array}                       - a generated input command.
     */
    generateInputCommand (connectID, type, mode, delta, units, enableNotifications) {
        const command = [
            1, // Command ID = 1 = "Sensor Format"
            2, // Command Type = 2 = "Write"
            connectID,
            type,
            mode,
            delta,
            0, // Delta Interval Byte 2
            0, // Delta Interval Byte 3
            0, // Delta Interval Byte 4
            units,
            enableNotifications ? 1 : 0
        ];

        return command;
    }

    /**
     * Sets LED mode and initial color and starts reading data from peripheral after BLE has connected.
     * @private
     */
    _onConnect () {
        this.setLEDMode();
        this.setLED(0x00FF00);
        // this._ble.startNotifications(
        //     BLEService.DEVICE_SERVICE,
        //     BLECharacteristic.ATTACHED_IO,
        //     this._onMessage
        // );
        // this._batteryLevelIntervalId = window.setInterval(this._checkBatteryLevel, BLEBatteryCheckInterval);
    }

    /**
     * Process the sensor data from the incoming BLE characteristic.
     * @param {object} data - the incoming BLE data.
     * @private
     */
    _onMessage (self , data) {
        /**
         * If first byte of data is '1' or '2', then either clear the
         * sensor present in ports 1 or 2 or set their format.
         *
         * If first byte of data is anything else, read incoming sensor value.
         */
        data = data.detail;
        switch (data[0]) {
        case 1:
        case 2: {
            const connectID = data[0];
            if (data[1] === 0) {
                // clear sensor or motor
                self._clearPort(connectID);
            } else {
                // register sensor or motor
                self._registerSensorOrMotor(connectID, data[3]);
            }
            break;
        }
        default: {
            // read incoming sensor value
            const connectID = data[1];
            const type = self._ports[connectID - 1];
            if (type === WeDo2Device.DISTANCE) {
                self._sensors.distance = data[2];
            }
            if (type === WeDo2Device.TILT) {
                self._sensors.tiltX = data[2];
                self._sensors.tiltY = data[3];
            }
            break;
        }
        }
    }

    /**
     * Check the battery level on the WeDo 2.0. If the WeDo 2.0 has disconnected
     * for some reason, the BLE socket will get an error back and automatically
     * close the socket.
     */
    _checkBatteryLevel () {
        this._ble.read(
            BLEService.DEVICE_SERVICE,
            BLECharacteristic.LOW_VOLTAGE_ALERT,
            false
        );
    }

    /**
     * Register a new sensor or motor connected at a port.  Store the type of
     * sensor or motor internally, and then register for notifications on input
     * values if it is a sensor.
     * @param {number} connectID - the port to register a sensor or motor on.
     * @param {number} type - the type ID of the sensor or motor
     * @private
     */
    _registerSensorOrMotor (connectID, type) {
        // Record which port is connected to what type of device
        this._ports[connectID - 1] = type;

        // Record motor port
        if (type === WeDo2Device.MOTOR) {
            this._motors[connectID - 1] = new WeDo2Motor(this, connectID - 1);
        } else {
            // Set input format for tilt or distance sensor
            const typeString = type === WeDo2Device.DISTANCE ? 'DISTANCE' : 'TILT';
            const cmd = this.generateInputCommand(
                connectID,
                type,
                WeDo2Mode[typeString],
                1,
                WeDo2Unit[typeString],
                true
            );

            this._ble.sendCommand(this._ble.BLECharacteristic.INPUT_COMMAND, cmd);
            this._ble._startNotifications(this , this._onMessage)
            // this._ble.startNotifications(
            //     BLEService.IO_SERVICE,
            //     BLECharacteristic.INPUT_VALUES,
            //     this._onMessage
            // );
        }
    }

    /**
     * Clear the sensor or motor present at port 1 or 2.
     * @param {number} connectID - the port to clear.
     * @private
     */
    _clearPort (connectID) {
        const type = this._ports[connectID - 1];
        if (type === WeDo2Device.TILT) {
            this._sensors.tiltX = this._sensors.tiltY = 0;
        }
        if (type === WeDo2Device.DISTANCE) {
            this._sensors.distance = 0;
        }
        this._ports[connectID - 1] = 'none';
        this._motors[connectID - 1] = null;
    }

    _getTiltAngle (direction) {
        switch (direction) {
        case WeDo2TiltDirection.UP:
            return this.tiltY > 45 ? 256 - this.tiltY : -this.tiltY;
        case WeDo2TiltDirection.DOWN:
            return this.tiltY > 45 ? this.tiltY - 256 : this.tiltY;
        case WeDo2TiltDirection.LEFT:
            return this.tiltX > 45 ? 256 - this.tiltX : -this.tiltX;
        case WeDo2TiltDirection.RIGHT:
            return this.tiltX > 45 ? this.tiltX - 256 : this.tiltX;
        default:
            log.warn(`Unknown tilt direction in _getTiltAngle: ${direction}`);
        }
    }
}

/**
 * Manage power, direction, and timers for one WeDo 2.0 motor.
 */
class WeDo2Motor {
    /**
     * Construct a WeDo 2.0 Motor instance.
     * @param {WeDo2} parent - the WeDo 2.0 peripheral which owns this motor.
     * @param {int} index - the zero-based index of this motor on its parent peripheral.
     */
    constructor (parent, index) {
        /**
         * The WeDo 2.0 peripheral which owns this motor.
         * @type {WeDo2}
         * @private
         */
        this._parent = parent;

        /**
         * The zero-based index of this motor on its parent peripheral.
         * @type {int}
         * @private
         */
        this._index = index;

        /**
         * This motor's current direction: 1 for "this way" or -1 for "that way"
         * @type {number}
         * @private
         */
        this._direction = 1;

        /**
         * This motor's current power level, in the range [0,100].
         * @type {number}
         * @private
         */
        this._power = 100;

        /**
         * Is this motor currently moving?
         * @type {boolean}
         * @private
         */
        this._isOn = false;

        /**
         * If the motor has been turned on or is actively braking for a specific duration, this is the timeout ID for
         * the end-of-action handler. Cancel this when changing plans.
         * @type {Object}
         * @private
         */
        this._pendingTimeoutId = null;

        /**
         * The starting time for the pending timeout.
         * @type {Object}
         * @private
         */
        this._pendingTimeoutStartTime = null;

        /**
         * The delay/duration of the pending timeout.
         * @type {Object}
         * @private
         */
        this._pendingTimeoutDelay = null;

        this.startBraking = this.startBraking.bind(this);
        this.turnOff = this.turnOff.bind(this);
    }

    /**
     * @return {number} - the duration of active braking after a call to startBraking(). Afterward, turn the motor off.
     * @constructor
     */
    static get BRAKE_TIME_MS () {
        return 1000;
    }

    /**
     * @return {int} - this motor's current direction: 1 for "this way" or -1 for "that way"
     */
    get direction () {
        return this._direction;
    }

    /**
     * @param {int} value - this motor's new direction: 1 for "this way" or -1 for "that way"
     */
    set direction (value) {
        if (value < 0) {
            this._direction = -1;
        } else {
            this._direction = 1;
        }
    }

    /**
     * @return {int} - this motor's current power level, in the range [0,100].
     */
    get power () {
        return this._power;
    }

    /**
     * @param {int} value - this motor's new power level, in the range [0,100].
     */
    set power (value) {
        const p = Math.max(0, Math.min(value, 100));
        // Lego Wedo 2.0 hub only turns motors at power range [30 - 100], so
        // map value from [0 - 100] to [30 - 100].
        if (p === 0) {
            this._power = 0;
        } else {
            const delta = 100 / p;
            this._power = 30 + (70 / delta);
        }
    }

    /**
     * @return {boolean} - true if this motor is currently moving, false if this motor is off or braking.
     */
    get isOn () {
        return this._isOn;
    }

    /**
     * @return {boolean} - time, in milliseconds, of when the pending timeout began.
     */
    get pendingTimeoutStartTime () {
        return this._pendingTimeoutStartTime;
    }

    /**
     * @return {boolean} - delay, in milliseconds, of the pending timeout.
     */
    get pendingTimeoutDelay () {
        return this._pendingTimeoutDelay;
    }

    /**
     * Turn this motor on indefinitely.
     */
    turnOn () {
        if (this._power === 0) return;

        const cmd = this._parent.generateOutputCommand(
            this._index + 1,
            WeDo2Command.MOTOR_POWER,
            [this._power * this._direction] // power in range 0-100
        );

        this._parent._ble.sendCommand(this._parent._ble.BLECharacteristic.OUTPUT_COMMAND, cmd);

        this._isOn = true;
        this._clearTimeout();
    }

    /**
     * Turn this motor on for a specific duration.
     * @param {number} milliseconds - run the motor for this long.
     */
    turnOnFor (milliseconds) {
        if (this._power === 0) return;

        milliseconds = Math.max(0, milliseconds);
        this.turnOn();
        this._setNewTimeout(this.startBraking, milliseconds);
    }

    /**
     * Start active braking on this motor. After a short time, the motor will turn off.
     */
    startBraking () {
        if (this._power === 0) return;

        const cmd = this._parent.generateOutputCommand(
            this._index + 1,
            WeDo2Command.MOTOR_POWER,
            [127] // 127 = break
        );

        this._parent._ble.sendCommand( this._parent._ble.BLECharacteristic.OUTPUT_COMMAND, cmd);

        this._isOn = false;
        this._setNewTimeout(this.turnOff, WeDo2Motor.BRAKE_TIME_MS);
    }

    /**
     * Turn this motor off.
     * @param {boolean} [useLimiter=true] - if true, use the rate limiter
     */
    turnOff (useLimiter = true) {
        if (this._power === 0) return;

        const cmd = this._parent.generateOutputCommand(
            this._index + 1,
            WeDo2Command.MOTOR_POWER,
            [0] // 0 = stop
        );
        this._parent._ble.sendCommand( this._parent._ble.BLECharacteristic.OUTPUT_COMMAND, cmd);
        // this._parent.send(BLECharacteristic.OUTPUT_COMMAND, cmd, useLimiter);

        this._isOn = false;
    }

    /**
     * Clear the motor action timeout, if any. Safe to call even when there is no pending timeout.
     * @private
     */
    _clearTimeout () {
        if (this._pendingTimeoutId !== null) {
            clearTimeout(this._pendingTimeoutId);
            this._pendingTimeoutId = null;
            this._pendingTimeoutStartTime = null;
            this._pendingTimeoutDelay = null;
        }
    }

    /**
     * Set a new motor action timeout, after clearing an existing one if necessary.
     * @param {Function} callback - to be called at the end of the timeout.
     * @param {int} delay - wait this many milliseconds before calling the callback.
     * @private
     */
    _setNewTimeout (callback, delay) {
        this._clearTimeout();
        const timeoutID = setTimeout(() => {
            if (this._pendingTimeoutId === timeoutID) {
                this._pendingTimeoutId = null;
                this._pendingTimeoutStartTime = null;
                this._pendingTimeoutDelay = null;
            }
            callback();
        }, delay);
        this._pendingTimeoutId = timeoutID;
        this._pendingTimeoutStartTime = Date.now();
        this._pendingTimeoutDelay = delay;
    }
}

class RateLimiter {
    /**
     * A utility for limiting the rate of repetitive send operations, such as
     * bluetooth messages being sent to hardware devices. It uses the token bucket
     * strategy: a counter accumulates tokens at a steady rate, and each send costs
     * a token. If no tokens remain, it's not okay to send.
     * @param {number} maxRate the maximum number of sends allowed per second
     * @constructor
     */
    constructor (maxRate) {
        /**
         * The maximum number of tokens.
         * @type {number}
         */
        this._maxTokens = maxRate;

        /**
         * The interval in milliseconds for refilling one token. It is calculated
         * so that the tokens will be filled to maximum in one second.
         * @type {number}
         */
        this._refillInterval = 1000 / maxRate;

        /**
         * The current number of tokens in the bucket.
         * @type {number}
         */
        this._count = this._maxTokens;

        this._timer = new Timer();
        this._timer.start();

        /**
         * The last time in milliseconds when the token count was updated.
         * @type {number}
         */
        this._lastUpdateTime = this._timer.timeElapsed();
    }

    /**
     * Check if it is okay to send a message, by updating the token count,
     * taking a token and then checking if we are still under the rate limit.
     * @return {boolean} true if we are under the rate limit
     */
    okayToSend () {
        // Calculate the number of tokens to refill the bucket with, based on the
        // amount of time since the last refill.
        const now = this._timer.timeElapsed();
        const timeSinceRefill = now - this._lastUpdateTime;
        const refillCount = Math.floor(timeSinceRefill / this._refillInterval);

        // If we're adding at least one token, reset _lastUpdateTime to now.
        // Otherwise, don't reset it so that we can continue measuring time until
        // the next refill.
        if (refillCount > 0) {
            this._lastUpdateTime = now;
        }

        // Refill the tokens up to the maximum
        this._count = Math.min(this._maxTokens, this._count + refillCount);

        // If we have at least one token, use one, and it's okay to send.
        if (this._count > 0) {
            this._count--;
            return true;
        }
        return false;
    }
}

class Timer {
    constructor (nowObj = Timer.nowObj) {
        /**
         * Used to store the start time of a timer action.
         * Updated when calling `timer.start`.
         */
        this.startTime = 0;

        /**
         * Used to pass custom logic for determining the value for "now",
         * which is sometimes useful for compatibility with Scratch 2
         */
        this.nowObj = nowObj;
    }

    /**
     * Disable use of self.performance for now as it results in lower performance
     * However, instancing it like below (caching the self.performance to a local variable) negates most of the issues.
     * @type {boolean}
     */
    static get USE_PERFORMANCE () {
        return false;
    }

    /**
     * Legacy object to allow for us to call now to get the old style date time (for backwards compatibility)
     * @deprecated This is only called via the nowObj.now() if no other means is possible...
     */
    static get legacyDateCode () {
        return {
            now: function () {
                return new Date().getTime();
            }
        };
    }

    /**
     * Use this object to route all time functions through single access points.
     */
    static get nowObj () {
        if (Timer.USE_PERFORMANCE && typeof self !== 'undefined' && self.performance && 'now' in self.performance) {
            return self.performance;
        } else if (Date.now) {
            return Date;
        }
        return Timer.legacyDateCode;
    }

    /**
     * Return the currently known absolute time, in ms precision.
     * @returns {number} ms elapsed since 1 January 1970 00:00:00 UTC.
     */
    time () {
        return this.nowObj.now();
    }

    /**
     * Start a timer for measuring elapsed time,
     * at the most accurate precision possible.
     */
    start () {
        this.startTime = this.nowObj.now();
    }

    timeElapsed () {
        return this.nowObj.now() - this.startTime;
    }

    /**
     * Call a handler function after a specified amount of time has elapsed.
     * @param {function} handler - function to call after the timeout
     * @param {number} timeout - number of milliseconds to delay before calling the handler
     * @returns {number} - the ID of the new timeout
     */
    setTimeout (handler, timeout) {
        return global.setTimeout(handler, timeout);
    }

    /**
     * Clear a timeout from the pending timeout pool.
     * @param {number} timeoutId - the ID returned by `setTimeout()`
     * @memberof Timer
     */
    clearTimeout (timeoutId) {
        global.clearTimeout(timeoutId);
    }
}