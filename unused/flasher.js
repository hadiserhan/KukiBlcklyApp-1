/*

Screen flasher code for EV3.

Interface:

    Requires a canvas HTML element called "canvas" to which the screen flashing
    data is drawn.

    Requires a textarea HTML element called "importExport" from which the Python
    code to flash is retrieved.

    flasherInit()
        Automatically called when this file is executed
        to initialise the screen flasher code.

    flasherProgram(flash_hz, num_levels)
        Outputs screen flashing data on the canvas, using the given flash Hz and
        number of levels.

            flash_hz: 30 or 60
            num_levels: 2 or 4

    flasherStop()
        Stops any ongoing screen flashing.

*/

const output = document.getElementById('output');
let progressBar = document.getElementById('flashProgressBar');
const btnFlasherRun = document.getElementById('btnFlasherRun');
const btnFlasherStop = document.getElementById('btnFlasherStop');
let blnRunning = false;

const PROGRESS_HEIGHT = 20;
const PROGRESS_BACKGROUND = "rgb(255, 255, 255)";
const PROGRESS_FOREGROUND = "rgb(120, 200, 120)";

// This key is xor'd with each byte of the outgoing data stream.
const OBFUSCATION_KEY = 0x56;

// Grey scale.
const SHADE_A = "rgb(0,0,0)"; // black/dark
const SHADE_B = "rgb(140,140,140)"; // semi-dark
const SHADE_B_FROM_A = "rgb(150,150,150)"; // slightly brighter
const SHADE_B_FROM_D = "rgb(130,130,130)"; // slightly darker
const SHADE_C = "rgb(220,220,220)"; // semi-bright
const SHADE_C_FROM_A = "rgb(230,230,230)"; // slightly brighter
const SHADE_C_FROM_D = "rgb(210,210,210)"; // slightly darker
const SHADE_D = "rgb(255,255,255)"; // white/bright

// Colour (black, orange, orange, white).
const COL_SHADE_A = "rgb(0,0,0)"; // black
const COL_SHADE_B = "rgb(190,90,0)"; // semi-dark
const COL_SHADE_B_FROM_A = "rgb(195,110,0)"; // slightly brighter
const COL_SHADE_B_FROM_D = "rgb(180,70,0)"; // slightly darker
const COL_SHADE_C = "rgb(255,190,0)"; // semi-bright
const COL_SHADE_C_FROM_A = "rgb(255,205,0)"; // slightly brighter
const COL_SHADE_C_FROM_D = "rgb(255,170,0)"; // slightly darker
const COL_SHADE_D = "rgb(255,255,255)"; // white

const chunk_pre_2_levels = [
    SHADE_A,
    SHADE_A,
    SHADE_A,
    SHADE_D,
    SHADE_D,
    SHADE_A,
    SHADE_A,
    SHADE_D,
    SHADE_A, // initial edge to sync edge of frame
    SHADE_A, // indicate 2 levels
];

const chunk_pre_4_levels = [
    SHADE_A,
    SHADE_A,
    SHADE_A,
    SHADE_D,
    SHADE_D,
    SHADE_A,
    SHADE_A,
    SHADE_D,
    SHADE_A, // initial edge to sync edge of frame
    SHADE_D, // indicate 4 levels
];

const shade_table_2_levels = [
    SHADE_A,
    SHADE_D,
];

const shade_table_4_levels = [
    SHADE_A,
    SHADE_B,
    SHADE_C,
    SHADE_D,
];

var flasher_data = [];
let frame = 0;
var last_time = 0;
let status_line = "";
const PAD = 0;
const SIZE = 400;
const BYTES_PER_TIME_SYNC = 4;

// This function implements CRC-16 with polynomial x^16+x^15+x^2+1.
function crc16(data) {
    const BITS_PER_BYTE = 8;
    const POLY = 0x8005;
    const MSBIT = 0x80;

    crc = 0xffff;
    for (let i = 0; i < data.length; ++i) {
        let cur_byte = data[i];
        for (let j = 0; j < BITS_PER_BYTE; ++j) {
            if (((crc >> BITS_PER_BYTE) ^ cur_byte) & MSBIT) {
                crc = (crc << 1) ^ POLY;
            } else {
                crc <<= 1;
            }
            cur_byte <<= 1;
        }
        crc = crc & 0xffff; // force crc to be 16-bit
    }

    return crc;
}

function flasherAddData(sync_count, num_levels, data, key) {
    for (let i = 0; i < data.length; ++i) {
        // Make sure there is a strong edge at least every BYTES_PER_TIME_SYNC bytes.
        if (sync_count % BYTES_PER_TIME_SYNC == 0) {
            const prev = flasher_data[flasher_data.length - 1];
            if (prev == SHADE_A || prev == SHADE_B) {
                flasher_data.push(SHADE_D);
            } else {
                flasher_data.push(SHADE_A);
            }
        }
        if (num_levels == 4) {
            for (let j = 0; j < 4; ++j) {
                const bits = ((data[i] ^ key) >> (j * 2)) & 3;
                flasher_data.push(shade_table_4_levels[bits]);
            }
        } else {
            for (let j = 0; j < 8; ++j) {
                const bit = ((data[i] ^ key) >> j) & 1;
                flasher_data.push(shade_table_2_levels[bit]);
            }
        }
        sync_count += 1;
    }
    return sync_count;
}

function flasherStartRunning(flash_hz, num_levels, data) {
    const checksum = crc16(data);

    console.log("data", data);
    console.log("checksum", checksum);

    frame = 0;
    flasher_data = [];

    // Add the flashing prefix to the frame list.
    let chunk_pre = chunk_pre_2_levels;
    if (num_levels == 4) {
        chunk_pre = chunk_pre_4_levels;
    }
    for (let i = 0; i < chunk_pre.length; ++i) {
        flasher_data.push(chunk_pre[i]);
    }

    // Add the data to the frame list.
    // Obfuscate the data and checksum, but not the length prefix.  This allows
    // EV3 to always know how much data to expect (regardless off the key) and
    // have a CRC error if the key is wrong.  If the data length were obfuscated
    // then it would be easy to determine the value of the key.
    let sync_count = 0;
    sync_count = flasherAddData(sync_count, num_levels, [data.length & 0xff, (data.length >> 8) & 0xff], 0);
    sync_count = flasherAddData(sync_count, num_levels, data, OBFUSCATION_KEY);
    sync_count = flasherAddData(sync_count, num_levels, [checksum & 0xff, (checksum >> 8) & 0xff], OBFUSCATION_KEY);

    // Make sure it ends in a bright frame.
    flasher_data.push(SHADE_D);

    // Log the frames to the console.
    //console.log(flasher_data);

    // Store the current time, and compute the status line.
    last_time = (new Date()).getTime();
    //status_line = data.length + " bytes, " + flasher_data.length + " frames, " + ((flasher_data.length * 10 / flash_hz | 0) / 10) + " seconds";

    status_line = data.length + " bytes in " + ((flasher_data.length * 10 / flash_hz | 0) / 10) + " seconds";

    // Update the status line.
    output.innerHTML = status_line;

    // Adjust shades to account for slow display response at 60Hz.
    if (flash_hz == 60) {
        for (let i = 1; i < flasher_data.length; ++i) {
            if (flasher_data[i - 1] == SHADE_A && flasher_data[i] == SHADE_B) {
                flasher_data[i] = SHADE_B_FROM_A;
            } else if (flasher_data[i - 1] == SHADE_D && flasher_data[i] == SHADE_B) {
                flasher_data[i] = SHADE_B_FROM_D;
            } else if (flasher_data[i - 1] == SHADE_A && flasher_data[i] == SHADE_C) {
                flasher_data[i] = SHADE_C_FROM_A;
            } else if (flasher_data[i - 1] == SHADE_D && flasher_data[i] == SHADE_C) {
                flasher_data[i] = SHADE_C_FROM_D;
            }
        }
    }

    // Change to colour if desired.
    if (document.getElementById("colour-option").checked) {
        for (let i = 0; i < flasher_data.length; ++i) {
            if (flasher_data[i] == SHADE_A) {
                flasher_data[i] = COL_SHADE_A;
            } else if (flasher_data[i] == SHADE_B) {
                flasher_data[i] = COL_SHADE_B;
            } else if (flasher_data[i] == SHADE_B_FROM_A) {
                flasher_data[i] = COL_SHADE_B_FROM_A;
            } else if (flasher_data[i] == SHADE_B_FROM_D) {
                flasher_data[i] = COL_SHADE_B_FROM_D;
            } else if (flasher_data[i] == SHADE_C) {
                flasher_data[i] = COL_SHADE_C;
            } else if (flasher_data[i] == SHADE_C_FROM_A) {
                flasher_data[i] = COL_SHADE_C_FROM_A;
            } else if (flasher_data[i] == SHADE_C_FROM_D) {
                flasher_data[i] = COL_SHADE_C_FROM_D;
            } else if (flasher_data[i] == SHADE_D) {
                flasher_data[i] = COL_SHADE_D;
            }
        }
    }

    // Duplicate each frame for 30Hz flashing.
    if (flash_hz == 30) {
        let d = [];
        for (let i = 0; i < flasher_data.length; ++i) {
            d.push(flasher_data[i]);
            d.push(flasher_data[i]);
        }
        flasher_data = d;
    }

    // Insert 750ms worth of blank frames (0.75s*60Hz = 45 frames) at the start
    // to account for the 750ms delay of the EV3 after pressing ROUND.
    for (let i = 0; i < 45; ++i) {
        flasher_data.unshift(flasher_data[0]);
    }    

    window.requestAnimationFrame(flasherDrawFrame);
}

function flasherInit() {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.fillStyle = SHADE_A;
    ctx.fillRect(0, 0, SIZE, SIZE); // clear canvas
    ctx.fillStyle = PROGRESS_BACKGROUND;
    ctx.fillRect(0, 0, SIZE, PROGRESS_HEIGHT);
    ctx.fillStyle = SHADE_D;
    ctx.fillRect(PAD, PAD + PROGRESS_HEIGHT / 2, SIZE - 2 * PAD, SIZE - 2 * PAD); // clear canvas
}

function flasherDrawFrame() {

    blnRunning = true;

    if (frame % 4 == 3) {

        // Update the status line with the measured frame rate.
        const t = (new Date()).getTime();
        const rate_hz = (4000 / (t - last_time)) | 0;
        last_time = t;
        
        output.innerHTML = status_line + ' - ' + rate_hz + ' Hz';

    }

    const ctx = document.getElementById('canvas').getContext('2d');

    ctx.fillStyle = flasher_data[frame];
    ctx.fillRect(PAD, PAD + PROGRESS_HEIGHT / 2, SIZE - 2 * PAD, SIZE - 2 * PAD); // clear canvas
    frame += 1;

    // ctx.fillStyle = PROGRESS_BACKGROUND;
    // ctx.fillRect(0, 0, SIZE, PROGRESS_HEIGHT);
    // ctx.fillStyle = PROGRESS_FOREGROUND;
    // ctx.fillRect(0, 0, SIZE * frame / flasher_data.length, PROGRESS_HEIGHT - 5);

    doProgressBar ( frame, flasher_data.length );

    if ( frame < flasher_data.length ) {
        window.requestAnimationFrame(flasherDrawFrame);
    } else {
        blnRunning = false;
    }

    if ( blnRunning ) {

        doDisplayRunning();

    } else {

        doDisplayStopped();

    }

}


async function flasherProgram(flash_hz, num_levels) {

    console.log ('flasherProgram: ' + flash_hz + ' / ' +  num_levels );

    // get code
    // const pythonCode = document.getElementById('importExport').value;
    // SK Mods
    const pythonCode = Blockly.Python.workspaceToCode(workspace);
    console.log ( 'pythonCode...' );
    console.log ( pythonCode );

    // compile the python into a Uint8Array
    // const userProgData = compileV3Python(pythonCode, true);
    // SK Mods

    let flashSpeed = flash_hz + ' / ' +  num_levels;

    let userProgData = await APIcall_FLASH( pythonCode, flashSpeed );
    console.log ( 'userProgData...' );
    console.log ( userProgData );

    userProgData = JSON.parse( userProgData );
    userProgData = processAPIHexString( userProgData['hex'] );

    if (userProgData) {
        flasherStartRunning(flash_hz, num_levels, userProgData);
    }

}

function flasherStop() {
    
    if (flasher_data.length > 0) {
        frame = flasher_data.length - 1;
    }

    output.innerHTML = '';
    progressBar.style.width = '0px';

}

flasherInit();


function doProgressBar ( frame, datalength ) {

    let frameWidth = 100 / datalength;
    let width = frame * frameWidth;
    progressBar.style.width = `${width}%`;

}


function doDisplayRunning() {

    btnFlasherRun.innerHTML = "Downloading...";
    btnFlasherRun.disabled = true;

    btnFlasherStop.style.display = "block";
    btnFlasherStop.style.opacity = 1.0;

    // jQuery( btnFlasherStop ).fadeIn(200);
    // setTimeout( function() { 
    //     btnFlasherStop.style.display = "block";
    //     jQuery( btnFlasherStop ).fadeIn(200);
    //   }, 500);

}

function doDisplayStopped() {

    btnFlasherRun.innerHTML = "Complete";
    btnFlasherStop.style.display = "none";
    setTimeout( function() {
        btnFlasherRun.innerHTML = "Download program";
        btnFlasherRun.disabled = false;
    }, 1500);

}


function APIcall_FLASH (pythonCode, flashSpeed) {

    var urlAPI = "https://api.Kukirobotics.net/ep/compile/flash";     
    urlAPI = urlAPI + "?flashSpeed=" + flashSpeed;

    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.open('POST', urlAPI, true);

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`HTTP request failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = function () {
            // Network errors
            reject(new Error('Network error'));
        };

        xhr.send( pythonCode );

    });

}