
import { WEDOConnection } from '../Wedo/WedoConnection.js';
var kuki_device = null;

const ArgumentType = {
    /**
     * Numeric value with angle picker
     */
    ANGLE: 'angle',

    /**
     * Boolean value with hexagonal placeholder
     */
    BOOLEAN: 'Boolean',

    /**
     * Numeric value with color picker
     */
    COLOR: 'color',

    /**
     * Numeric value with text field
     */
    NUMBER: 'number',

    /**
     * String value with text field
     */
    STRING: 'string',

    /**
     * String value with matrix field
     */
    MATRIX: 'matrix',

    /**
     * MIDI note number with note picker (piano) field
     */
    NOTE: 'note',

    /**
     * Inline image on block (as part of the label)
     */
    IMAGE: 'image'
};
/**
 * Types of block
 * @enum {string}
 */
const BlockType = {
    /**
     * Boolean reporter with hexagonal shape
     */
    BOOLEAN: 'Boolean',

    /**
     * A button (not an actual block) for some special action, like making a variable
     */
    BUTTON: 'button',

    /**
     * Command block
     */
    COMMAND: 'command',

    /**
     * Specialized command block which may or may not run a child branch
     * The thread continues with the next block whether or not a child branch ran.
     */
    CONDITIONAL: 'conditional',

    /**
     * Specialized hat block with no implementation function
     * This stack only runs if the corresponding event is emitted by other code.
     */
    EVENT: 'event',

    /**
     * Hat block which conditionally starts a block stack
     */
    HAT: 'hat',

    /**
     * Specialized command block which may or may not run a child branch
     * If a child branch runs, the thread evaluates the loop block again.
     */
    LOOP: 'loop',

    /**
     * General reporter with numeric or string value
     */
    REPORTER: 'reporter'
};

class Cast {
    /**
     * Scratch cast to number.
     * Treats NaN as 0.
     * In Scratch 2.0, this is captured by `interp.numArg.`
     * @param {*} value Value to cast to number.
     * @return {number} The Scratch-casted number value.
     */
    static toNumber (value) {
        // If value is already a number we don't need to coerce it with
        // Number().
        if (typeof value === 'number') {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            if (Number.isNaN(value)) {
                return 0;
            }
            return value;
        }
        const n = Number(value);
        if (Number.isNaN(n)) {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            return 0;
        }
        return n;
    }

    /**
     * Scratch cast to boolean.
     * In Scratch 2.0, this is captured by `interp.boolArg.`
     * Treats some string values differently from JavaScript.
     * @param {*} value Value to cast to boolean.
     * @return {boolean} The Scratch-casted boolean value.
     */
    static toBoolean (value) {
        // Already a boolean?
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            // These specific strings are treated as false in Scratch.
            if ((value === '') ||
                (value === '0') ||
                (value.toLowerCase() === 'false')) {
                return false;
            }
            // All other strings treated as true.
            return true;
        }
        // Coerce other values and numbers.
        return Boolean(value);
    }

    /**
     * Scratch cast to string.
     * @param {*} value Value to cast to string.
     * @return {string} The Scratch-casted string value.
     */
    static toString (value) {
        return String(value);
    }

    /**
     * Cast any Scratch argument to an RGB color array to be used for the renderer.
     * @param {*} value Value to convert to RGB color array.
     * @return {Array.<number>} [r,g,b], values between 0-255.
     */
    static toRgbColorList (value) {
        const color = Cast.toRgbColorObject(value);
        return [color.r, color.g, color.b];
    }

    /**
     * Cast any Scratch argument to an RGB color object to be used for the renderer.
     * @param {*} value Value to convert to RGB color object.
     * @return {RGBOject} [r,g,b], values between 0-255.
     */
    static toRgbColorObject (value) {
        let color;
        if (typeof value === 'string' && value.substring(0, 1) === '#') {
            color = Color.hexToRgb(value);

            // If the color wasn't *actually* a hex color, cast to black
            if (!color) color = {r: 0, g: 0, b: 0, a: 255};
        } else {
            color = Color.decimalToRgb(Cast.toNumber(value));
        }
        return color;
    }

    /**
     * Determine if a Scratch argument is a white space string (or null / empty).
     * @param {*} val value to check.
     * @return {boolean} True if the argument is all white spaces or null / empty.
     */
    static isWhiteSpace (val) {
        return val === null || (typeof val === 'string' && val.trim().length === 0);
    }

    /**
     * Compare two values, using Scratch cast, case-insensitive string compare, etc.
     * In Scratch 2.0, this is captured by `interp.compare.`
     * @param {*} v1 First value to compare.
     * @param {*} v2 Second value to compare.
     * @returns {number} Negative number if v1 < v2; 0 if equal; positive otherwise.
     */
    static compare (v1, v2) {
        let n1 = Number(v1);
        let n2 = Number(v2);
        if (n1 === 0 && Cast.isWhiteSpace(v1)) {
            n1 = NaN;
        } else if (n2 === 0 && Cast.isWhiteSpace(v2)) {
            n2 = NaN;
        }
        if (isNaN(n1) || isNaN(n2)) {
            // At least one argument can't be converted to a number.
            // Scratch compares strings as case insensitive.
            const s1 = String(v1).toLowerCase();
            const s2 = String(v2).toLowerCase();
            if (s1 < s2) {
                return -1;
            } else if (s1 > s2) {
                return 1;
            }
            return 0;
        }
        // Handle the special case of Infinity
        if (
            (n1 === Infinity && n2 === Infinity) ||
            (n1 === -Infinity && n2 === -Infinity)
        ) {
            return 0;
        }
        // Compare as numbers.
        return n1 - n2;
    }

    /**
     * Determine if a Scratch argument number represents a round integer.
     * @param {*} val Value to check.
     * @return {boolean} True if number looks like an integer.
     */
    static isInt (val) {
        // Values that are already numbers.
        if (typeof val === 'number') {
            if (isNaN(val)) { // NaN is considered an integer.
                return true;
            }
            // True if it's "round" (e.g., 2.0 and 2).
            return val === parseInt(val, 10);
        } else if (typeof val === 'boolean') {
            // `True` and `false` always represent integer after Scratch cast.
            return true;
        } else if (typeof val === 'string') {
            // If it contains a decimal point, don't consider it an int.
            return val.indexOf('.') < 0;
        }
        return false;
    }

    static get LIST_INVALID () {
        return 'INVALID';
    }

    static get LIST_ALL () {
        return 'ALL';
    }

    /**
     * Compute a 1-based index into a list, based on a Scratch argument.
     * Two special cases may be returned:
     * LIST_ALL: if the block is referring to all of the items in the list.
     * LIST_INVALID: if the index was invalid in any way.
     * @param {*} index Scratch arg, including 1-based numbers or special cases.
     * @param {number} length Length of the list.
     * @param {boolean} acceptAll Whether it should accept "all" or not.
     * @return {(number|string)} 1-based index for list, LIST_ALL, or LIST_INVALID.
     */
    static toListIndex (index, length, acceptAll) {
        if (typeof index !== 'number') {
            if (index === 'all') {
                return acceptAll ? Cast.LIST_ALL : Cast.LIST_INVALID;
            }
            if (index === 'last') {
                if (length > 0) {
                    return length;
                }
                return Cast.LIST_INVALID;
            } else if (index === 'random' || index === 'any') {
                if (length > 0) {
                    return 1 + Math.floor(Math.random() * length);
                }
                return Cast.LIST_INVALID;
            }
        }
        index = Math.floor(Cast.toNumber(index));
        if (index < 1 || index > length) {
            return Cast.LIST_INVALID;
        }
        return index;
    }
}
class Color {
    /**
     * @typedef {object} RGBObject - An object representing a color in RGB format.
     * @property {number} r - the red component, in the range [0, 255].
     * @property {number} g - the green component, in the range [0, 255].
     * @property {number} b - the blue component, in the range [0, 255].
     */

    /**
     * @typedef {object} HSVObject - An object representing a color in HSV format.
     * @property {number} h - hue, in the range [0-359).
     * @property {number} s - saturation, in the range [0,1].
     * @property {number} v - value, in the range [0,1].
     */

    /** @type {RGBObject} */
    static get RGB_BLACK () {
        return {r: 0, g: 0, b: 0};
    }

    /** @type {RGBObject} */
    static get RGB_WHITE () {
        return {r: 255, g: 255, b: 255};
    }

    /**
     * Convert a Scratch decimal color to a hex string, #RRGGBB.
     * @param {number} decimal RGB color as a decimal.
     * @return {string} RGB color as #RRGGBB hex string.
     */
    static decimalToHex (decimal) {
        if (decimal < 0) {
            decimal += 0xFFFFFF + 1;
        }
        let hex = Number(decimal).toString(16);
        hex = `#${'000000'.substr(0, 6 - hex.length)}${hex}`;
        return hex;
    }

    /**
     * Convert a Scratch decimal color to an RGB color object.
     * @param {number} decimal RGB color as decimal.
     * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static decimalToRgb (decimal) {
        const a = (decimal >> 24) & 0xFF;
        const r = (decimal >> 16) & 0xFF;
        const g = (decimal >> 8) & 0xFF;
        const b = decimal & 0xFF;
        return {r: r, g: g, b: b, a: a > 0 ? a : 255};
    }

    /**
     * Convert a hex color (e.g., F00, #03F, #0033FF) to an RGB color object.
     * CC-BY-SA Tim Down:
     * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * @param {!string} hex Hex representation of the color.
     * @return {RGBObject} null on failure, or rgb: {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static hexToRgb (hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert an RGB color object to a hex color.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {!string} Hex representation of the color.
     */
    static rgbToHex (rgb) {
        return Color.decimalToHex(Color.rgbToDecimal(rgb));
    }

    /**
     * Convert an RGB color object to a Scratch decimal color.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {!number} Number representing the color.
     */
    static rgbToDecimal (rgb) {
        return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
    }

    /**
    * Convert a hex color (e.g., F00, #03F, #0033FF) to a decimal color number.
    * @param {!string} hex Hex representation of the color.
    * @return {!number} Number representing the color.
    */
    static hexToDecimal (hex) {
        return Color.rgbToDecimal(Color.hexToRgb(hex));
    }

    /**
     * Convert an HSV color to RGB format.
     * @param {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
     * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static hsvToRgb (hsv) {
        let h = hsv.h % 360;
        if (h < 0) h += 360;
        const s = Math.max(0, Math.min(hsv.s, 1));
        const v = Math.max(0, Math.min(hsv.v, 1));

        const i = Math.floor(h / 60);
        const f = (h / 60) - i;
        const p = v * (1 - s);
        const q = v * (1 - (s * f));
        const t = v * (1 - (s * (1 - f)));

        let r;
        let g;
        let b;

        switch (i) {
        default:
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
        }

        return {
            r: Math.floor(r * 255),
            g: Math.floor(g * 255),
            b: Math.floor(b * 255)
        };
    }

    /**
     * Convert an RGB color to HSV format.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
     */
    static rgbToHsv (rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const x = Math.min(Math.min(r, g), b);
        const v = Math.max(Math.max(r, g), b);

        // For grays, hue will be arbitrarily reported as zero. Otherwise, calculate
        let h = 0;
        let s = 0;
        if (x !== v) {
            const f = (r === x) ? g - b : ((g === x) ? b - r : r - g);
            const i = (r === x) ? 3 : ((g === x) ? 5 : 1);
            h = ((i - (f / (v - x))) * 60) % 360;
            s = (v - x) / v;
        }

        return {h: h, s: s, v: v};
    }

    /**
     * Linear interpolation between rgb0 and rgb1.
     * @param {RGBObject} rgb0 - the color corresponding to fraction1 <= 0.
     * @param {RGBObject} rgb1 - the color corresponding to fraction1 >= 1.
     * @param {number} fraction1 - the interpolation parameter. If this is 0.5, for example, mix the two colors equally.
     * @return {RGBObject} the interpolated color.
     */
    static mixRgb (rgb0, rgb1, fraction1) {
        if (fraction1 <= 0) return rgb0;
        if (fraction1 >= 1) return rgb1;
        const fraction0 = 1 - fraction1;
        return {
            r: (fraction0 * rgb0.r) + (fraction1 * rgb1.r),
            g: (fraction0 * rgb0.g) + (fraction1 * rgb1.g),
            b: (fraction0 * rgb0.b) + (fraction1 * rgb1.b)
        };
    }
}
class JSONRPC {
    constructor () {
        this._requestID = 0;
        this._openRequests = {};
    }

    /**
     * Make an RPC request and retrieve the result.
     * @param {string} method - the remote method to call.
     * @param {object} params - the parameters to pass to the remote method.
     * @returns {Promise} - a promise for the result of the call.
     */
    sendRemoteRequest (method, params) {
        const requestID = this._requestID++;

        const promise = new Promise((resolve, reject) => {
            this._openRequests[requestID] = {resolve, reject};
        });

        this._sendRequest(method, params, requestID);

        return promise;
    }

    /**
     * Make an RPC notification with no expectation of a result or callback.
     * @param {string} method - the remote method to call.
     * @param {object} params - the parameters to pass to the remote method.
     */
    sendRemoteNotification (method, params) {
        this._sendRequest(method, params);
    }

    /**
     * Handle an RPC request from remote, should return a result or Promise for result, if appropriate.
     * @param {string} method - the method requested by the remote caller.
     * @param {object} params - the parameters sent with the remote caller's request.
     */
    didReceiveCall (/* method , params */) {
        throw new Error('Must override didReceiveCall');
    }

    _sendMessage (/* jsonMessageObject */) {
        throw new Error('Must override _sendMessage');
    }

    _sendRequest (method, params, id) {
        const request = {
            jsonrpc: '2.0',
            method,
            params
        };

        if (id !== null) {
            request.id = id;
        }

        this._sendMessage(request);
    }

    _handleMessage (json) {
        if (json.jsonrpc !== '2.0') {
            throw new Error(`Bad or missing JSON-RPC version in message: ${json}`);
        }
        if (Object.prototype.hasOwnProperty.call(json, 'method')) {
            this._handleRequest(json);
        } else {
            this._handleResponse(json);
        }
    }

    _sendResponse (id, result, error) {
        const response = {
            jsonrpc: '2.0',
            id
        };
        if (error) {
            response.error = error;
        } else {
            response.result = result || null;
        }
        this._sendMessage(response);
    }

    _handleResponse (json) {
        const {result, error, id} = json;
        const openRequest = this._openRequests[id];
        delete this._openRequests[id];
        if (openRequest) {
            if (error) {
                openRequest.reject(error);
            } else {
                openRequest.resolve(result);
            }
        }
    }

    _handleRequest (json) {
        const {method, params, id} = json;
        const rawResult = this.didReceiveCall(method, params);
        if (id !== null && typeof id !== 'undefined') {
            Promise.resolve(rawResult).then(
                result => {
                    this._sendResponse(id, result);
                },
                error => {
                    this._sendResponse(id, null, error);
                }
            );
        }
    }
}
// class BLE extends JSONRPC {

//     /**
//      * A BLE peripheral socket object.  It handles connecting, over web sockets, to
//      * BLE peripherals, and reading and writing data to them.
//      * @param {Runtime} runtime - the Runtime for sending/receiving GUI update events.
//      * @param {string} extensionId - the id of the extension using this socket.
//      * @param {object} peripheralOptions - the list of options for peripheral discovery.
//      * @param {object} connectCallback - a callback for connection.
//      * @param {object} resetCallback - a callback for resetting extension state.
//      */
//     constructor (runtime, extensionId, peripheralOptions, connectCallback, resetCallback = null) {
//         super();

//         this._socket = runtime.getScratchLinkSocket('BLE');
//         this._socket.setOnOpen(this.requestPeripheral.bind(this));
//         this._socket.setOnClose(this.handleDisconnectError.bind(this));
//         this._socket.setOnError(this._handleRequestError.bind(this));
//         this._socket.setHandleMessage(this._handleMessage.bind(this));

//         this._sendMessage = this._socket.sendMessage.bind(this._socket);

//         this._availablePeripherals = {};
//         this._connectCallback = connectCallback;
//         this._connected = false;
//         this._characteristicDidChangeCallback = null;
//         this._resetCallback = resetCallback;
//         this._discoverTimeoutID = null;
//         this._extensionId = extensionId;
//         this._peripheralOptions = peripheralOptions;
//         this._runtime = runtime;

//         this._socket.open();
//     }

//     /**
//      * Request connection to the peripheral.
//      * If the web socket is not yet open, request when the socket promise resolves.
//      */
//     requestPeripheral () {
//         this._availablePeripherals = {};
//         if (this._discoverTimeoutID) {
//             window.clearTimeout(this._discoverTimeoutID);
//         }
//         this._discoverTimeoutID = window.setTimeout(this._handleDiscoverTimeout.bind(this), 15000);
//         this.sendRemoteRequest('discover', this._peripheralOptions)
//             .catch(e => {
//                 this._handleRequestError(e);
//             });
//     }

//     /**
//      * Try connecting to the input peripheral id, and then call the connect
//      * callback if connection is successful.
//      * @param {number} id - the id of the peripheral to connect to
//      */
//     connectPeripheral (id) {
//         this.sendRemoteRequest('connect', {peripheralId: id})
//             .then(() => {
//                 this._connected = true;
//                 this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
//                 this._connectCallback();
//             })
//             .catch(e => {
//                 this._handleRequestError(e);
//             });
//     }

//     /**
//      * Close the websocket.
//      */
//     disconnect () {
//         if (this._connected) {
//             this._connected = false;
//         }

//         if (this._socket.isOpen()) {
//             this._socket.close();
//         }

//         if (this._discoverTimeoutID) {
//             window.clearTimeout(this._discoverTimeoutID);
//         }

//         // Sets connection status icon to orange
//         this._runtime.emit(this._runtime.constructor.PERIPHERAL_DISCONNECTED);
//     }

//     /**
//      * @return {bool} whether the peripheral is connected.
//      */
//     isConnected () {
//         return this._connected;
//     }

//     /**
//      * Start receiving notifications from the specified ble service.
//      * @param {number} serviceId - the ble service to read.
//      * @param {number} characteristicId - the ble characteristic to get notifications from.
//      * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
//      * @return {Promise} - a promise from the remote startNotifications request.
//      */
//     startNotifications (serviceId, characteristicId, onCharacteristicChanged = null) {
//         const params = {
//             serviceId,
//             characteristicId
//         };
//         this._characteristicDidChangeCallback = onCharacteristicChanged;
//         return this.sendRemoteRequest('startNotifications', params)
//             .catch(e => {
//                 this.handleDisconnectError(e);
//             });
//     }

//     /**
//      * Read from the specified ble service.
//      * @param {number} serviceId - the ble service to read.
//      * @param {number} characteristicId - the ble characteristic to read.
//      * @param {boolean} optStartNotifications - whether to start receiving characteristic change notifications.
//      * @param {object} onCharacteristicChanged - callback for characteristic change notifications.
//      * @return {Promise} - a promise from the remote read request.
//      */
//     read (serviceId, characteristicId, optStartNotifications = false, onCharacteristicChanged = null) {
//         const params = {
//             serviceId,
//             characteristicId
//         };
//         if (optStartNotifications) {
//             params.startNotifications = true;
//         }
//         if (onCharacteristicChanged) {
//             this._characteristicDidChangeCallback = onCharacteristicChanged;
//         }
//         return this.sendRemoteRequest('read', params)
//             .catch(e => {
//                 this.handleDisconnectError(e);
//             });
//     }

//     /**
//      * Write data to the specified ble service.
//      * @param {number} serviceId - the ble service to write.
//      * @param {number} characteristicId - the ble characteristic to write.
//      * @param {string} message - the message to send.
//      * @param {string} encoding - the message encoding type.
//      * @param {boolean} withResponse - if true, resolve after peripheral's response.
//      * @return {Promise} - a promise from the remote send request.
//      */
//     write (serviceId, characteristicId, message, encoding = null, withResponse = null) {
//         const params = {serviceId, characteristicId, message};
//         if (encoding) {
//             params.encoding = encoding;
//         }
//         if (withResponse !== null) {
//             params.withResponse = withResponse;
//         }
//         return this.sendRemoteRequest('write', params)
//             .catch(e => {
//                 this.handleDisconnectError(e);
//             });
//     }

//     /**
//      * Handle a received call from the socket.
//      * @param {string} method - a received method label.
//      * @param {object} params - a received list of parameters.
//      * @return {object} - optional return value.
//      */
//     didReceiveCall (method, params) {
//         switch (method) {
//         case 'didDiscoverPeripheral':
//             this._availablePeripherals[params.peripheralId] = params;
//             this._runtime.emit(
//                 this._runtime.constructor.PERIPHERAL_LIST_UPDATE,
//                 this._availablePeripherals
//             );
//             if (this._discoverTimeoutID) {
//                 window.clearTimeout(this._discoverTimeoutID);
//             }
//             break;
//         case 'userDidPickPeripheral':
//             this._availablePeripherals[params.peripheralId] = params;
//             this._runtime.emit(
//                 this._runtime.constructor.USER_PICKED_PERIPHERAL,
//                 this._availablePeripherals
//             );
//             if (this._discoverTimeoutID) {
//                 window.clearTimeout(this._discoverTimeoutID);
//             }
//             break;
//         case 'userDidNotPickPeripheral':
//             this._runtime.emit(
//                 this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT
//             );
//             if (this._discoverTimeoutID) {
//                 window.clearTimeout(this._discoverTimeoutID);
//             }
//             break;
//         case 'characteristicDidChange':
//             if (this._characteristicDidChangeCallback) {
//                 this._characteristicDidChangeCallback(params.message);
//             }
//             break;
//         case 'ping':
//             return 42;
//         }
//     }

//     /**
//      * Handle an error resulting from losing connection to a peripheral.
//      *
//      * This could be due to:
//      * - battery depletion
//      * - going out of bluetooth range
//      * - being powered down
//      *
//      * Disconnect the socket, and if the extension using this socket has a
//      * reset callback, call it. Finally, emit an error to the runtime.
//      */
//     handleDisconnectError (/* e */) {
//         // log.error(`BLE error: ${JSON.stringify(e)}`);

//         if (!this._connected) return;

//         this.disconnect();

//         if (this._resetCallback) {
//             this._resetCallback();
//         }

//         this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
//             message: `Scratch lost connection to`,
//             extensionId: this._extensionId
//         });
//     }

//     _handleRequestError (/* e */) {
//         // log.error(`BLE error: ${JSON.stringify(e)}`);

//         this._runtime.emit(this._runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
//             message: `Scratch lost connection to`,
//             extensionId: this._extensionId
//         });
//     }

//     _handleDiscoverTimeout () {
//         if (this._discoverTimeoutID) {
//             window.clearTimeout(this._discoverTimeoutID);
//         }
//         this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
//     }
// }

const atob = window.atob;
const btoa = window.btoa;

class Base64Util {

    /**
     * Convert a base64 encoded string to a Uint8Array.
     * @param {string} base64 - a base64 encoded string.
     * @return {Uint8Array} - a decoded Uint8Array.
     */
    static base64ToUint8Array (base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const array = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            array[i] = binaryString.charCodeAt(i);
        }
        return array;
    }

    /**
     * Convert a Uint8Array to a base64 encoded string.
     * @param {Uint8Array} array - the array to convert.
     * @return {string} - the base64 encoded string.
     */
    static uint8ArrayToBase64 (array) {
        const base64 = btoa(String.fromCharCode.apply(null, array));
        return base64;
    }

    /**
    * Convert an array buffer to a base64 encoded string.
    * @param {array} buffer - an array buffer to convert.
    * @return {string} - the base64 encoded string.
    */
    static arrayBufferToBase64 (buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[ i ]);
        }
        return btoa(binary);
    }

}
class MathUtil {
    /**
     * Convert a value from degrees to radians.
     * @param {!number} deg Value in degrees.
     * @return {!number} Equivalent value in radians.
     */
    static degToRad (deg) {
        return deg * Math.PI / 180;
    }

    /**
     * Convert a value from radians to degrees.
     * @param {!number} rad Value in radians.
     * @return {!number} Equivalent value in degrees.
     */
    static radToDeg (rad) {
        return rad * 180 / Math.PI;
    }

    /**
     * Clamp a number between two limits.
     * If n < min, return min. If n > max, return max. Else, return n.
     * @param {!number} n Number to clamp.
     * @param {!number} min Minimum limit.
     * @param {!number} max Maximum limit.
     * @return {!number} Value of n clamped to min and max.
     */
    static clamp (n, min, max) {
        return Math.min(Math.max(n, min), max);
    }

    /**
     * Keep a number between two limits, wrapping "extra" into the range.
     * e.g., wrapClamp(7, 1, 5) == 2
     * wrapClamp(0, 1, 5) == 5
     * wrapClamp(-11, -10, 6) == 6, etc.
     * @param {!number} n Number to wrap.
     * @param {!number} min Minimum limit.
     * @param {!number} max Maximum limit.
     * @return {!number} Value of n wrapped between min and max.
     */
    static wrapClamp (n, min, max) {
        const range = (max - min) + 1;
        return n - (Math.floor((n - min) / range) * range);
    }


    /**
     * Convert a value from tan function in degrees.
     * @param {!number} angle in degrees
     * @return {!number} Correct tan value
     */
    static tan (angle) {
        angle = angle % 360;
        switch (angle) {
        case -270:
        case 90:
            return Infinity;
        case -90:
        case 270:
            return -Infinity;
        default:
            return parseFloat(Math.tan((Math.PI * angle) / 180).toFixed(10));
        }
    }

    /**
     * Given an array of unique numbers,
     * returns a reduced array such that each element of the reduced array
     * represents the position of that element in a sorted version of the
     * original array.
     * E.g. [5, 19. 13, 1] => [1, 3, 2, 0]
     * @param {Array<number>} elts The elements to sort and reduce
     * @return {Array<number>} The array of reduced orderings
     */
    static reducedSortOrdering (elts) {
        const sorted = elts.slice(0).sort((a, b) => a - b);
        return elts.map(e => sorted.indexOf(e));
    }

    /**
     * Return a random number given an inclusive range and a number in that
     * range that should be excluded.
     *
     * For instance, (1, 5, 3) will only pick 1, 2, 4, or 5 (with equal
     * probability)
     *
     * @param {number} lower - The lower bound (inlcusive)
     * @param {number} upper - The upper bound (inclusive), such that lower <= upper
     * @param {number} excluded - The number to exclude (MUST be in the range)
     * @return {number} A random integer in the range [lower, upper] that is not "excluded"
     */
    static inclusiveRandIntWithout (lower, upper, excluded) {
        // Note that subtraction is the number of items in the
        // inclusive range [lower, upper] minus 1 already
        // (e.g. in the set {3, 4, 5}, 5 - 3 = 2).
        const possibleOptions = upper - lower;

        const randInt = lower + Math.floor(Math.random() * possibleOptions);
        if (randInt >= excluded) {
            return randInt + 1;
        }

        return randInt;
    }
 
    /**
     * Scales a number from one range to another.
     * @param {number} i number to be scaled
     * @param {number} iMin input range minimum
     * @param {number} iMax input range maximum
     * @param {number} oMin output range minimum
     * @param {number} oMax output range maximum
     * @return {number} scaled number
     */
    static scale (i, iMin, iMax, oMin, oMax) {
        const p = (i - iMin) / (iMax - iMin);
        return (p * (oMax - oMin)) + oMin;
    }
}



const iconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAABYlAAAWJQFJUiTwAAAF8klEQVR4Ae2cbWxTVRjH/7ctbVc2tyEMNpWBk0VIkLcEjSAQgglTE5HEaKqJi1E/mbCP/dJA0kQbvzgTQ0Ki2T7V6AeYGoEPLJmGKPiyzZDwEpYJCHSbQIcbdLvres1zOa13Xbvdu2eTDp9fst329Lnn5XfPPfece7tphmFAmDkuccdDBDIRgUxEIBMRyEQEMhGBTEQgExHIRAQyEYFMRCATEchEBDIRgUxEIBMRyEQEMhGBTEQgExHIxMPNIByNVQBoBUDb7kgo2KTS9wBoUmFNkVCwW6U3A1gP4JJKHwxHY/S+WcW2RkLBVhV7AMAOAIMAGlWstbyOSCh4QMU2Uoy1PBVL+a7IqZu1vOZIKNg20/azBarGvKxebw9HY22RULADwBFLTBcATQnZl4lVEimN4ssteXQrQfstebQpmW1q30xshyqvxRLbofYnYW9ZYgeV8C5LLOWlzbTxM3ouHI7GPgSwWx3Z0syBSBku6IYnlTbM+uQenJQaMnKHDaqAFnDrcCFbl3G1defEjas0a4N/Vz10OybyvapfrSX1sjpo+WIz0ME7QL3djgtHPTAcjb2mepw/b2ZaGh5NL5RnofR8R99dIC5fHusK5JsrCUpm7TSx21XvbcwTNwnbAsPR2GcA3qaG+H0LsHlDPZ7fca/ujZ+cRW9/Em5vCXzlNVhQUjFpf/3OTSRvXkKJz43Xt1bh1S1LUeq/5+njQ9/iVmLIfL1ieRU2b1iFtavztXNu6TrTi8PfnYI67WdPoOp5przV9Y8iuHdb9rOW9uumPI+vDIElddBckztPOqVn5X36Xj1WVQeynx1sOWbK83jc2PviM/dFXIYNax9H55leXLoyYHsfWwI14JCRRx7x5ckBU1oheYQ+1G9u39lVM0Hej7+cR7w/Yb7e9+5LqChfaLvixcK088BwNNZkAOV02ubK6+odwt3RcfOULSSPGEveG48bNj08If3kqXPmdtO6unkpDzYn0u/TLxrzcumJJ80Ut79sygzoFF6/siw75mUYupOEpmnY0/A0pw33FTsCa+hX5oJhZXgkZb5zub2O20CnL7EwkPeCPm+wI7CEBvi5wuOZ36tJW7X3uGXJXAgxk8P4eNpRPEvgskqfuR0Z/BNGejxvDM3/5gs0pboWv+motqybCc+tqUCzz43kaBJ/X+2eMjZ3ClNsjIzo5ioknXZ2b4AlkKYltLJoaY9jOJm/B0KJbtg4c4F/XOmH3+dF9dLKbBo1OD6QQGV56YQ55ODtO0jcHkZ1VSX8/n9nB9S7RkZ1rFy+NG8ZR9s70TeQQKDEh7vJUdt1Y9/OopXFB2/WcbMpyOexE9mlFS21aLlHMmKHfzBl0QT/hV2bzM9oLXv0xG8YGR0zpdLEn6RT2k+/XjDzoLX2G3u3TZBLUyral/Z5qCyAK1f/sl2/or+IWNel1Eji3MWrpjyCZHWqdNrSe6ieSHFERl4mP+q5GehgHGvvRGal5XI5uzU47f3A/R99YTgdF2wXrmkolr9ToZ5NvTjT4yOhoC2T057CJM/r9WDxoqmXa07R9THcuDVcMO8bt4ag6ynULKvkFjWBTLl0ugZKvNlyqLeSQKfYGgOpgXt2b5zVhlzrS+Dr451YvKg0b95txztxvS8xZ+VuXFuLJ5+oNgV+9c3PuHDxGs6cu+w4v//9RJo6x5bN9UgbBo4cPY1U6j+cSD8orFvzGFYuX4KxsRQGbth6FCICc9m5dY05HtN46AQRqPB5PWjY+ZT5RnMwkxGBFh5ZVmle9Z3MrGbjwfqccrC1vajrV7QCaVCfS6qrJj96nQlFK5CujPRT7MgYyEQEMhGBTGwJpAW4kJ9pBbo0zbx70X7y7AOv8HxP3LyB4YTpb2cZBt2iqL3QEwf9zDbX+waLca439QMeC7a+YBmOxugLiM/OTt2yaOoMoO+H6LOcNwf6xusrthsh/7mIh1yFmYhAJiKQiQhkIgKZiEAmIpCJCGQiApmIQCYikIkIZCICmYhAJiKQiQhkIgKZiEAmIpCJCGQiAjkA+AeOwQKMcWZqHgAAAABJRU5ErkJggg==';

const BLEService = {
    DEVICE_SERVICE: '00001523-1212-efde-1523-785feabcd123',
    IO_SERVICE: '00004f0e-1212-efde-1523-785feabcd123'
};

const BLECharacteristic = {
    ATTACHED_IO: '00001527-1212-efde-1523-785feabcd123',
    LOW_VOLTAGE_ALERT: '00001528-1212-efde-1523-785feabcd123',
    INPUT_VALUES: '00001560-1212-efde-1523-785feabcd123',
    INPUT_COMMAND: '00001563-1212-efde-1523-785feabcd123',
    OUTPUT_COMMAND: '00001565-1212-efde-1523-785feabcd123'
};

/**
 * A time interval to wait (in milliseconds) in between battery check calls.
 * @type {number}
 */
const BLEBatteryCheckInterval = 5000;

/**
 * A time interval to wait (in milliseconds) while a block that sends a BLE message is running.
 * @type {number}
 */
const BLESendInterval = 100;









/**
 * Enum for motor specification.
 * @readonly
 * @enum {string}
 */
const WeDo2MotorLabel = {
    DEFAULT: 'motor',
    A: 'motor A',
    B: 'motor B',
    ALL: 'all motors'
};

/**
 * Enum for motor direction specification.
 * @readonly
 * @enum {string}
 */
const WeDo2MotorDirection = {
    FORWARD: 'this way',
    BACKWARD: 'that way',
    REVERSE: 'reverse'
};



/**
 * Scratch 3.0 blocks to interact with a LEGO WeDo 2.0 peripheral.
 */
class Scratch3WeDo2Blocks {

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'wedo2';
    }

    /**
     * @return {number} - the tilt sensor counts as "tilted" if its tilt angle meets or exceeds this threshold.
     */
    static get TILT_THRESHOLD () {
        return 15;
    }

    /**
     * Construct a set of WeDo 2.0 blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new WeDo 2.0 peripheral instance
        this._peripheral = new WeDo2(this.runtime, Scratch3WeDo2Blocks.EXTENSION_ID);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: Scratch3WeDo2Blocks.EXTENSION_ID,
            name: 'WeDo 2.0',
            blockIconURI: iconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'motorOnFor',
                    text: formatMessage({
                        id: 'wedo2.motorOnFor',
                        default: 'turn [MOTOR_ID] on for [DURATION] seconds',
                        description: 'turn a motor on for some time'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MOTOR_ID: {
                            type: ArgumentType.STRING,
                            menu: 'MOTOR_ID',
                            defaultValue: WeDo2MotorLabel.DEFAULT
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'motorOn',
                    text: formatMessage({
                        id: 'wedo2.motorOn',
                        default: 'turn [MOTOR_ID] on',
                        description: 'turn a motor on indefinitely'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MOTOR_ID: {
                            type: ArgumentType.STRING,
                            menu: 'MOTOR_ID',
                            defaultValue: WeDo2MotorLabel.DEFAULT
                        }
                    }
                },
                {
                    opcode: 'motorOff',
                    text: formatMessage({
                        id: 'wedo2.motorOff',
                        default: 'turn [MOTOR_ID] off',
                        description: 'turn a motor off'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MOTOR_ID: {
                            type: ArgumentType.STRING,
                            menu: 'MOTOR_ID',
                            defaultValue: WeDo2MotorLabel.DEFAULT
                        }
                    }
                },
                {
                    opcode: 'startMotorPower',
                    text: formatMessage({
                        id: 'wedo2.startMotorPower',
                        default: 'set [MOTOR_ID] power to [POWER]',
                        description: 'set the motor\'s power and turn it on'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MOTOR_ID: {
                            type: ArgumentType.STRING,
                            menu: 'MOTOR_ID',
                            defaultValue: WeDo2MotorLabel.DEFAULT
                        },
                        POWER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'setMotorDirection',
                    text: formatMessage({
                        id: 'wedo2.setMotorDirection',
                        default: 'set [MOTOR_ID] direction to [MOTOR_DIRECTION]',
                        description: 'set the motor\'s turn direction'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MOTOR_ID: {
                            type: ArgumentType.STRING,
                            menu: 'MOTOR_ID',
                            defaultValue: WeDo2MotorLabel.DEFAULT
                        },
                        MOTOR_DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'MOTOR_DIRECTION',
                            defaultValue: WeDo2MotorDirection.FORWARD
                        }
                    }
                },
                {
                    opcode: 'setLightHue',
                    text: formatMessage({
                        id: 'wedo2.setLightHue',
                        default: 'set light color to [HUE]',
                        description: 'set the LED color'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        HUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'playNoteFor',
                    text: formatMessage({
                        id: 'wedo2.playNoteFor',
                        default: 'play note [NOTE] for [DURATION] seconds',
                        description: 'play a certain note for some time'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NOTE: {
                            type: ArgumentType.NUMBER, // TODO: ArgumentType.MIDI_NOTE?
                            defaultValue: 60
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'whenDistance',
                    text: formatMessage({
                        id: 'wedo2.whenDistance',
                        default: 'when distance [OP] [REFERENCE]',
                        description: 'check for when distance is < or > than reference'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        OP: {
                            type: ArgumentType.STRING,
                            menu: 'OP',
                            defaultValue: '<'
                        },
                        REFERENCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'whenTilted',
                    text: formatMessage({
                        id: 'wedo2.whenTilted',
                        default: 'when tilted [TILT_DIRECTION_ANY]',
                        description: 'check when tilted in a certain direction'
                    }),
                    func: 'isTilted',
                    blockType: BlockType.HAT,
                    arguments: {
                        TILT_DIRECTION_ANY: {
                            type: ArgumentType.STRING,
                            menu: 'TILT_DIRECTION_ANY',
                            defaultValue: WeDo2TiltDirection.ANY
                        }
                    }
                },
                {
                    opcode: 'getDistance',
                    text: formatMessage({
                        id: 'wedo2.getDistance',
                        default: 'distance',
                        description: 'the value returned by the distance sensor'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'isTilted',
                    text: formatMessage({
                        id: 'wedo2.isTilted',
                        default: 'tilted [TILT_DIRECTION_ANY]?',
                        description: 'whether the tilt sensor is tilted'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        TILT_DIRECTION_ANY: {
                            type: ArgumentType.STRING,
                            menu: 'TILT_DIRECTION_ANY',
                            defaultValue: WeDo2TiltDirection.ANY
                        }
                    }
                },
                {
                    opcode: 'getTiltAngle',
                    text: formatMessage({
                        id: 'wedo2.getTiltAngle',
                        default: 'tilt angle [TILT_DIRECTION]',
                        description: 'the angle returned by the tilt sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TILT_DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'TILT_DIRECTION',
                            defaultValue: WeDo2TiltDirection.UP
                        }
                    }
                }
            ],
            menus: {
                MOTOR_ID: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'wedo2.motorId.default',
                                default: 'motor',
                                description: 'label for motor element in motor menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2MotorLabel.DEFAULT
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.motorId.a',
                                default: 'motor A',
                                description: 'label for motor A element in motor menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2MotorLabel.A
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.motorId.b',
                                default: 'motor B',
                                description: 'label for motor B element in motor menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2MotorLabel.B
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.motorId.all',
                                default: 'all motors',
                                description: 'label for all motors element in motor menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2MotorLabel.ALL
                        }
                    ]
                },
                MOTOR_DIRECTION: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'wedo2.motorDirection.forward',
                                default: 'this way',
                                description:
                                    'label for forward element in motor direction menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2MotorDirection.FORWARD
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.motorDirection.backward',
                                default: 'that way',
                                description:
                                    'label for backward element in motor direction menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2MotorDirection.BACKWARD
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.motorDirection.reverse',
                                default: 'reverse',
                                description:
                                    'label for reverse element in motor direction menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2MotorDirection.REVERSE
                        }
                    ]
                },
                TILT_DIRECTION: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.up',
                                default: 'up',
                                description: 'label for up element in tilt direction menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2TiltDirection.UP
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.down',
                                default: 'down',
                                description: 'label for down element in tilt direction menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2TiltDirection.DOWN
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.left',
                                default: 'left',
                                description: 'label for left element in tilt direction menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2TiltDirection.LEFT
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.right',
                                default: 'right',
                                description: 'label for right element in tilt direction menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2TiltDirection.RIGHT
                        }
                    ]
                },
                TILT_DIRECTION_ANY: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.up',
                                default: 'up'
                            }),
                            value: WeDo2TiltDirection.UP
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.down',
                                default: 'down'
                            }),
                            value: WeDo2TiltDirection.DOWN
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.left',
                                default: 'left'
                            }),
                            value: WeDo2TiltDirection.LEFT
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.right',
                                default: 'right'
                            }),
                            value: WeDo2TiltDirection.RIGHT
                        },
                        {
                            text: formatMessage({
                                id: 'wedo2.tiltDirection.any',
                                default: 'any',
                                description: 'label for any element in tilt direction menu for LEGO WeDo 2 extension'
                            }),
                            value: WeDo2TiltDirection.ANY
                        }
                    ]
                },
                OP: {
                    acceptReporters: true,
                    items: ['<', '>']
                }
            }
        };
    }

    /**
     * Turn specified motor(s) on for a specified duration.
     * @param {object} args - the block's arguments.
     * @property {MotorID} MOTOR_ID - the motor(s) to activate.
     * @property {int} DURATION - the amount of time to run the motors.
     * @return {Promise} - a promise which will resolve at the end of the duration.
     */
    motorOnFor (args) {
        // TODO: cast args.MOTOR_ID?
        let durationMS = Cast.toNumber(args.DURATION) * 1000;
        durationMS = MathUtil.clamp(durationMS, 0, 15000);
        return new Promise(resolve => {
            this._forEachMotor(args.MOTOR_ID, motorIndex => {
                const motor = this._peripheral.motor(motorIndex);
                if (motor) {
                    motor.turnOnFor(durationMS);
                }
            });

            // Run for some time even when no motor is connected
            setTimeout(resolve, durationMS);
        });
    }

    /**
     * Turn specified motor(s) on indefinitely.
     * @param {object} args - the block's arguments.
     * @property {MotorID} MOTOR_ID - the motor(s) to activate.
     * @return {Promise} - a Promise that resolves after some delay.
     */
    motorOn (args) {
        // TODO: cast args.MOTOR_ID?
        this._forEachMotor(args.MOTOR_ID, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                motor.turnOn();
            }
        });

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Turn specified motor(s) off.
     * @param {object} args - the block's arguments.
     * @property {MotorID} MOTOR_ID - the motor(s) to deactivate.
     * @return {Promise} - a Promise that resolves after some delay.
     */
    motorOff (args) {
        // TODO: cast args.MOTOR_ID?
        this._forEachMotor(args.MOTOR_ID, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                motor.turnOff();
            }
        });

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Turn specified motor(s) off.
     * @param {object} args - the block's arguments.
     * @property {MotorID} MOTOR_ID - the motor(s) to be affected.
     * @property {int} POWER - the new power level for the motor(s).
     * @return {Promise} - a Promise that resolves after some delay.
     */
    startMotorPower (args) {
        // TODO: cast args.MOTOR_ID?
        this._forEachMotor(args.MOTOR_ID, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                motor.power = MathUtil.clamp(Cast.toNumber(args.POWER), 0, 100);
                motor.turnOn();
            }
        });

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Set the direction of rotation for specified motor(s).
     * If the direction is 'reverse' the motor(s) will be reversed individually.
     * @param {object} args - the block's arguments.
     * @property {MotorID} MOTOR_ID - the motor(s) to be affected.
     * @property {MotorDirection} MOTOR_DIRECTION - the new direction for the motor(s).
     * @return {Promise} - a Promise that resolves after some delay.
     */
    setMotorDirection (args) {
        // TODO: cast args.MOTOR_ID?
        this._forEachMotor(args.MOTOR_ID, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                switch (args.MOTOR_DIRECTION) {
                case WeDo2MotorDirection.FORWARD:
                    motor.direction = 1;
                    break;
                case WeDo2MotorDirection.BACKWARD:
                    motor.direction = -1;
                    break;
                case WeDo2MotorDirection.REVERSE:
                    motor.direction = -motor.direction;
                    break;
                default:
                    log.warn(`Unknown motor direction in setMotorDirection: ${args.DIRECTION}`);
                    break;
                }
                // keep the motor on if it's running, and update the pending timeout if needed
                if (motor.isOn) {
                    if (motor.pendingTimeoutDelay) {
                        motor.turnOnFor(motor.pendingTimeoutStartTime + motor.pendingTimeoutDelay - Date.now());
                    } else {
                        motor.turnOn();
                    }
                }
            }
        });

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Set the LED's hue.
     * @param {object} args - the block's arguments.
     * @property {number} HUE - the hue to set, in the range [0,100].
     * @return {Promise} - a Promise that resolves after some delay.
     */
    setLightHue (args) {
        // Convert from [0,100] to [0,360]
        let inputHue = Cast.toNumber(args.HUE);
        inputHue = MathUtil.wrapClamp(inputHue, 0, 100);
        const hue = inputHue * 360 / 100;

        const rgbObject = color.hsvToRgb({h: hue, s: 1, v: 1});

        const rgbDecimal = color.rgbToDecimal(rgbObject);

        this._peripheral.setLED(rgbDecimal);

        return new Promise(resolve => {
            window.setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }

    /**
     * Make the WeDo 2.0 peripheral play a MIDI note for the specified duration.
     * @param {object} args - the block's arguments.
     * @property {number} NOTE - the MIDI note to play.
     * @property {number} DURATION - the duration of the note, in seconds.
     * @return {Promise} - a promise which will resolve at the end of the duration.
     */
    playNoteFor (args) {
        let durationMS = Cast.toNumber(args.DURATION) * 1000;
        durationMS = MathUtil.clamp(durationMS, 0, 3000);
        const note = MathUtil.clamp(Cast.toNumber(args.NOTE), 25, 125); // valid WeDo 2.0 sounds
        if (durationMS === 0) return; // WeDo 2.0 plays duration '0' forever
        return new Promise(resolve => {
            const tone = this._noteToTone(note);
            this._peripheral.playTone(tone, durationMS);

            // Run for some time even when no piezo is connected
            setTimeout(resolve, durationMS);
        });
    }

    /**
     * Compare the distance sensor's value to a reference.
     * @param {object} args - the block's arguments.
     * @property {string} OP - the comparison operation: '<' or '>'.
     * @property {number} REFERENCE - the value to compare against.
     * @return {boolean} - the result of the comparison, or false on error.
     */
    whenDistance (args) {
        switch (args.OP) {
        case '<':
            return this._peripheral.distance < Cast.toNumber(args.REFERENCE);
        case '>':
            return this._peripheral.distance > Cast.toNumber(args.REFERENCE);
        default:
            log.warn(`Unknown comparison operator in whenDistance: ${args.OP}`);
            return false;
        }
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {object} args - the block's arguments.
     * @property {TiltDirection} TILT_DIRECTION_ANY - the tilt direction to test (up, down, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     */
    whenTilted (args) {
        return this._isTilted(args.TILT_DIRECTION_ANY);
    }

    /**
     * @return {number} - the distance sensor's value, scaled to the [0,100] range.
     */
    getDistance () {
        return this._peripheral.distance;
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {object} args - the block's arguments.
     * @property {TiltDirection} TILT_DIRECTION_ANY - the tilt direction to test (up, down, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     */
    isTilted (args) {
        return this._isTilted(args.TILT_DIRECTION_ANY);
    }

    /**
     * @param {object} args - the block's arguments.
     * @property {TiltDirection} TILT_DIRECTION - the direction (up, down, left, right) to check.
     * @return {number} - the tilt sensor's angle in the specified direction.
     * Note that getTiltAngle(up) = -getTiltAngle(down) and getTiltAngle(left) = -getTiltAngle(right).
     */
    getTiltAngle (args) {
        return this._getTiltAngle(args.TILT_DIRECTION);
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {TiltDirection} direction - the tilt direction to test (up, down, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     * @private
     */
    _isTilted (direction) {
        switch (direction) {
        case WeDo2TiltDirection.ANY:
            return this._getTiltAngle(WeDo2TiltDirection.UP) >= Scratch3WeDo2Blocks.TILT_THRESHOLD ||
                this._getTiltAngle(WeDo2TiltDirection.DOWN) >= Scratch3WeDo2Blocks.TILT_THRESHOLD ||
                this._getTiltAngle(WeDo2TiltDirection.LEFT) >= Scratch3WeDo2Blocks.TILT_THRESHOLD ||
                this._getTiltAngle(WeDo2TiltDirection.RIGHT) >= Scratch3WeDo2Blocks.TILT_THRESHOLD;
        default:
            return this._getTiltAngle(direction) >= Scratch3WeDo2Blocks.TILT_THRESHOLD;
        }
    }

    /**
     * @param {TiltDirection} direction - the direction (up, down, left, right) to check.
     * @return {number} - the tilt sensor's angle in the specified direction.
     * Note that getTiltAngle(up) = -getTiltAngle(down) and getTiltAngle(left) = -getTiltAngle(right).
     * @private
     */
    _getTiltAngle (direction) {
        switch (direction) {
        case WeDo2TiltDirection.UP:
            return this._peripheral.tiltY > 45 ? 256 - this._peripheral.tiltY : -this._peripheral.tiltY;
        case WeDo2TiltDirection.DOWN:
            return this._peripheral.tiltY > 45 ? this._peripheral.tiltY - 256 : this._peripheral.tiltY;
        case WeDo2TiltDirection.LEFT:
            return this._peripheral.tiltX > 45 ? 256 - this._peripheral.tiltX : -this._peripheral.tiltX;
        case WeDo2TiltDirection.RIGHT:
            return this._peripheral.tiltX > 45 ? this._peripheral.tiltX - 256 : this._peripheral.tiltX;
        default:
            log.warn(`Unknown tilt direction in _getTiltAngle: ${direction}`);
        }
    }

    /**
     * Call a callback for each motor indexed by the provided motor ID.
     * @param {MotorID} motorID - the ID specifier.
     * @param {Function} callback - the function to call with the numeric motor index for each motor.
     * @private
     */
    _forEachMotor (motorID, callback) {
        let motors;
        switch (motorID) {
        case WeDo2MotorLabel.A:
            motors = [0];
            break;
        case WeDo2MotorLabel.B:
            motors = [1];
            break;
        case WeDo2MotorLabel.ALL:
        case WeDo2MotorLabel.DEFAULT:
            motors = [0, 1];
            break;
        default:
            log.warn(`Invalid motor ID: ${motorID}`);
            motors = [];
            break;
        }
        for (const index of motors) {
            callback(index);
        }
    }

    /**
     * @param {number} midiNote - the MIDI note value to convert.
     * @return {number} - the frequency, in Hz, corresponding to that MIDI note value.
     * @private
     */
    _noteToTone (midiNote) {
        // Note that MIDI note 69 is A4, 440 Hz
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
}


function OpenConnectionFormBluetooth()
{
    const wedo = new WeDo2();
    return wedo;
};

window.wedo = OpenConnectionFormBluetooth();