var StartBlockId = "";
var startXmlText;
var is_connected = false;
var connection_type = "";
var is_kuki = false;
var is_arduino_start = false;

var should_open_camera = false;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

let currentAudio = null;
const soundPaths = {
    0: '../media/music/cat.mp3',
    1: '../media/music/seagull.mp3',
    2: '../media/music/birds.mp3',
    3: '../media/music/cow.mp3',
    4: '../media/music/dog.mp3',
    5: '../media/music/rooster.mp3',

    6: '../media/music/music_1.mp3',
    7: '../media/music/music_2.mp3',
    8: '../media/music/music_3.mp3',
    9: '../media/music/music_4.mp3',
    10: '../media/music/music_5.mp3',
    11: '../media/music/music_6.mp3',
  }

const soundPool = {};

function PageLoad() {
    setAppearance();
    for (const key in soundPaths) {
        soundPool[key] = new Audio(soundPaths[key]);
    }
}

function setAppearance() {
    if(window.location.search){
        const urlParams = new URLSearchParams(window.location.search);
        const fromValue = urlParams.get("from");

        if(fromValue == "app"){
        AppSource = "app";
        $("#btConnectUSB").hide();
        $("#btConnectBLE").show();
        console.log("IS APP ==> :", fromValue);
        }else{
        console.log("From parameter:", fromValue);
        $("#btConnect").show();
        $("#btConnectBLE").hide();
        }
    }else{
        AppSource = "web";
        $("#btConnect").show();
        // $("#btConnectBLE").hide();
    }


var availWidth = window.screen.availWidth;
var myStartScale = 0.8 + ((availWidth - 1000) / 300) * 0.3;

var height = innerHeight * 0.90;

$("#BlocksPannel").height(height);
$("#blocklyDiv").height(height);

var toolbox = document.getElementById("toolbox");

workspace = Blockly.inject('blocklyDiv', {
    comments: false,
    disable: false,
    collapse: false,
    media: '../media/',
    readOnly: false,
    // scrollbars: false,  
    // toolbox: false,
    trashcan: true,
    horizontalLayout: true,
    oneBasedIndex : true,  
    css : true, 
    toolboxPosition: 'end',  
    // rtl: rtl,
    //horizontalLayout: side == 'top' || side == 'bottom',
    //toolboxPosition: side == 'top' || side == 'start' ? 'start' : 'end',
    toolbox: toolbox,
    toolboxOptions: {
    color: false,
    inverted: false
    },
    sounds: true,
    move: {
    scrollbars: true,
    drag: true,
    wheel: true,
    },
    zoom: {
    controls: true,
    wheel: true,
    startScale: myStartScale,
    maxScale: 4,
    minScale: 0,
    scaleSpeed: 1.1
    },
    colours: {
    fieldShadow: 'rgba(255, 255, 255, 0.3)',
    dragShadowOpacity: 0.6
    // workspace: '#e5e5e5',
    // flyout: '#F2f2f2',
    // scrollbar: '#bbbbbb',
    // scrollbarHover: '#0C111A',
    // insertionMarker: '#FFFFFF',
    // insertionMarkerOpacity: 0.3,
    // fieldShadow: 'rgba(255, 255, 255, 0.3)',
    // dragShadowOpacity: 0.6
    },
    scrollbars: {
    horizontal: false,
    vertical: true,
    },
    grid:
    {
        spacing: 20,
        length: 2,
        colour: '#ccc',
        snap: true
    },
});


workspace.addChangeListener(change);

let startCode = '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="new_event_start" maxInstances="1" id="}^Xg:jW-h7O?ksLFb:ke" x="290" y="270" deletable="false"></block></xml>';
var dom = Blockly.Xml.textToDom(startCode);
Blockly.Xml.domToWorkspace(workspace, dom);
}
let currentStream = null;
let video = document.getElementById('camera-video');
let canvasElement = document.getElementById('hand-canvas');
let canvasCtx = canvasElement.getContext('2d');
let camera = null;
let IS_hand_Detection = false;
// Load Mediapipe Hands
const hands = new Hands({
  locateFile: (file) => `../wedo/camera/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

const { drawConnectors, drawLandmarks } = window;

hands.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && IS_hand_Detection) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 });
      drawLandmarks(canvasCtx, landmarks, { color: 'red', lineWidth: 0.1 });
      const gesture = detectGestureByAngle(landmarks);
      // const gesture = detectGesture(landmarks);
      console.log("Detected Gesture:", gesture);

      // Optional: You can trigger actions based on gestures
      if (gesture) {
        // console.log("🖐️ Open hand detected!");
        setGesture(gesture);
        // Start a specific action or event here
      }else{
        setGesture("");
      }
    }
  }else{
    setGesture("");
  }

  canvasCtx.restore();
});

// Count how many fingers are up
function countFingers(landmarks) {
  let fingersUp = 0;

  // Thumb: Check if tip is right/left of base (x-axis)
  if (landmarks[4].y < landmarks[3].y) {  // Thumb extended upwards
    fingersUp++;
  }

  // Other fingers: Check tip above lower joint (y-axis)
  if (landmarks[8].y < landmarks[6].y) fingersUp++;   // Index
  if (landmarks[12].y < landmarks[10].y) fingersUp++;  // Middle
  if (landmarks[16].y < landmarks[14].y) fingersUp++;  // Ring
  if (landmarks[20].y < landmarks[18].y) fingersUp++;  // Pinky

  return fingersUp;
}
function getAngle(A, B, C) {
  const AB = { x: B.x - A.x, y: B.y - A.y };
  const CB = { x: B.x - C.x, y: B.y - C.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
  const magCB = Math.sqrt(CB.x ** 2 + CB.y ** 2);
  const angle = Math.acos(dot / (magAB * magCB));
  return angle * (180 / Math.PI); // in degrees
}
function isFingerOpen(landmarks, tipIdx, pipIdx, mcpIdx) {
  const angle = getAngle(landmarks[tipIdx], landmarks[pipIdx], landmarks[mcpIdx]);
  return angle > 160; // Open if angle is wide
}
function detectGestureByAngle(landmarks) {
  const thumbOpen = isFingerOpen(landmarks, 4, 3, 2);
  const indexOpen = isFingerOpen(landmarks, 8, 7, 5);
  const middleOpen = isFingerOpen(landmarks, 12, 11, 9);
  const ringOpen = isFingerOpen(landmarks, 16, 15, 13);
  const pinkyOpen = isFingerOpen(landmarks, 20, 19, 17);

  const allOpen = thumbOpen && indexOpen && middleOpen && ringOpen && pinkyOpen;
  const allClosed = !thumbOpen && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen;

  const victory = indexOpen && middleOpen && !ringOpen && !pinkyOpen;
  const peace = victory && thumbOpen;

  if (allOpen) return "ALL_OPEN";
  if (allClosed) return "ALL_CLOSED";
  if (peace) return "VICTORY";
  if (victory) return "VICTORY";//"Victory ✌️";
  if (thumbOpen && !indexOpen && !middleOpen) return "THUMBS_UP";
  if (!thumbOpen && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return "Fist ✊";

  return "Unknown";
}

function detectGesture(landmarks) {
  const thumbUp = landmarks[4].y < landmarks[3].y  &&  landmarks[3].y < landmarks[2].y ; // Thumb is up
  const thumbDown = landmarks[4].y > landmarks[3].y; // Thumb is down
  
  const indexUp = landmarks[8].y < landmarks[6].y; // Index finger extended
  const middleUp = landmarks[12].y < landmarks[10].y; // Middle finger extended
  
  const allOpen = indexUp && middleUp && thumbUp &&
    landmarks[16].y < landmarks[14].y && // Ring finger extended
    landmarks[20].y < landmarks[18].y; // Pinky extended
  
  const allClosed = !indexUp && !middleUp && !thumbUp &&
    landmarks[16].y > landmarks[14].y && // Ring finger closed
    landmarks[20].y > landmarks[18].y; // Pinky closed

  const victory = indexUp && middleUp && !thumbUp &&
    landmarks[16].y > landmarks[14].y && // Ring finger closed
    landmarks[20].y > landmarks[18].y; // Pinky closed

  const peace = indexUp && middleUp && !thumbUp &&
    landmarks[16].y > landmarks[14].y && // Ring finger closed
    landmarks[20].y > landmarks[18].y; // Pinky closed

  if (allOpen) {
    return "All Open";
  } else if (allClosed) {
    return "All Closed";
  } else if (thumbUp) {
    return "Thumb Up";
  } else if (thumbDown) {
    return "Thumb Down";
  } else if (victory) {
    return "Victory";
  } else if (peace) {
    return "Peace";
  }

  return "No Gesture";
}


// Start camera stream
async function startCamera() {
  const container = document.getElementById('camera-container');
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    // video.srcObject = currentStream;

    camera = new Camera(video, {
      onFrame: async () => {
        setGesture("");
        await hands.send({ image: video });
      },
      width: 640,
      height: 480
    });
    camera.start();
    container.style.display = 'block';
  } catch (err) {
    console.error('Camera error:', err);
    alert('Unable to access the camera.');
  }
}

function closeCamera() {
  const video = document.getElementById('camera-video');
  const container = document.getElementById('camera-container');

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    camera.stop();
    currentStream = null;
  }

  container.style.display = 'none';
}

function resizeCamera(size) {
  const container = document.getElementById('camera-container');
  const sizes = {
    small: { width: '180px', height: '120px' },
    medium: { width: '300px', height: '220px' },
    large: { width: '500px', height: '350px' },
  };
  const s = sizes[size] || sizes.medium;
  container.style.width = s.width;
  container.style.height = s.height;
}

function change(event) {
    var output = document.getElementById('importExport');
    var xmlDom = Blockly.Xml.workspaceToDom(workspace);
    xmlText = Blockly.Xml.domToText(xmlDom);
    if(event.type == "create"){
        var id = event.blockId;
        var block = workspace.getBlockById(event.blockId);
        if (block != null && block.type == "control_stop") {
            should_open_camera = true;
        }    
    }
    if(event.type == "endDrag"){
        var id = event.blockId;
        var block = workspace.getBlockById(event.blockId);
        if (block != null && block.type == "event_camera" && !event.isOutside && should_open_camera) {
            startCamera();
        }    
    }

    if(event.type == "ui")
    {
      var id = event.blockId;
  
      var block = workspace.getBlockById(event.blockId);
      
      if (block != null && block.type == "new_event_start") {
        // Bloğun üzerine tıklandığında yapılacak işlemler buraya gelecek
        if (event.element == "click")
        {
          runCode();
        }
      }
  
      if(id != null && workspace.getBlockById(id) != null)
      {
        var block = workspace.getBlockById(id);
  
        if(block.childBlocks_ != null && block.type == "new_event_start")
        {
            StartBlockId = id;
        }
      }
    }
    else if(event.type == "endDrag"){

    }
    else
    {
      var id = StartBlockId;
  
      if(id == null || id == "")
      {
        id = ottoStartclickedID(xmlText);
      }
  
      if(id != null && workspace.getBlockById(id) != null)
      {
        var block = workspace.getBlockById(id);
  
        if(block.childBlocks_ != null && block.type == "new_event_start")
        {
            // startCode = Blockly.Python.blockToCode(block.childBlocks_[0]);
            startCode = Blockly.wedoLive.blockToCode(block.childBlocks_[0]);
        }
      }
    }
  
    if (startXmlText != xmlText) {
        latestCode = Blockly.wedoLive.workspaceToCode(workspace);
        // latestCode = Blockly.Python.workspaceToCode(workspace);
    }
}

function ottoStartclickedID(xml) {

    var startIndex = xml.indexOf('<block type="new_event_start" id="');
    startIndex = startIndex + 29;
  
    var tmp = xml.substring(startIndex);
  
    var endIndex = tmp.indexOf('"');
  
    var id = tmp.substring(0, endIndex);
  
    return id;
}
const interpreters = {};
let isRunCode = false;
function runCode(){
  
  if(latestCode && isRunCode == false)
  {
    // latestCode = RemoveHighLight(latestCode);
    //console.log(latestCode);
    isRunCode = true;
    for (const [blockId, data] of Object.entries(latestCode)) {
      // const myInterpreter = new Interpreter(data.code, initApi); // your initApi function
      // const myInterpreter  = CreateInterpreter(data.code);
      // interpreters[blockId] = {
      //   interpreter: myInterpreter,
      //   block: data.block,
      //   hasMoreCode:false,
      //   highlightPause:false
      // };
      createAndActivateThread(data.code);
    }
    // $("#btRunCode").prop('disabled', true);
    // $("#btStopCode").prop('disabled', false);

    // clear();

    // CreateInterpreter();
    // StepCode();

    // setTimeout(function() {
    //   StepCode();
    // }, 50);
  }
}
function isProgramRunning()
{
    return isRunCode;
}

function StopCode(){
    if(is_arduino_start & is_connected & is_kuki){
        sendStopParse();
    }
    return;
}


// Connection Functions
// open Connection Form

function OpenConnectionFormBluetooth(){
    if(is_connected){
        showConnectConfirmDialog();
    }else{
        connectToBluetooth();
    }
}

function OpenConnectionFormUSB()
{
  if(is_connected)
    showConnectConfirmDialog();
  else
    connectToSerial(); 
}

// UI INTERFACE
function updateUIInterface(){
    if(is_connected){
        if(connection_type == "serial"){
            $("#btConnectUSB").removeClass("notConnectedButton");
            $("#btConnectUSB").addClass("connectedButton");
        }else if(connection_type == "bluetooth"){
            $("#btConnectBLE").removeClass("notConnectedButton");
            $("#btConnectBLE").addClass("connectedButton");
        }
    }else{
        if(connection_type == "serial"){
            $("#btConnectUSB").removeClass("connectedButton");
            $("#btConnectUSB").addClass("notConnectedButton");
        }else if(connection_type == "bluetooth"){
            $("#btConnectBLE").removeClass("connectedButton");
            $("#btConnectBLE").addClass("notConnectedButton");
        }        
        enableRunButton(false);
        enableStopButton(false);
    }

    if (is_connected && !is_kuki) {
        enableRunButton(false);
        enableStopButton(false);
        return;
    }

    if (is_connected && is_kuki && is_arduino_start) {
        enableRunButton(false);
        enableStopButton(true);
        return;
    }

    if (is_connected && is_kuki && !is_arduino_start) {
        enableRunButton(true);
        enableStopButton(false);
        return;
    }
}

function enableRunButton(en_flag){
    if(en_flag){
      $("#runButton").removeClass("notConnectedButton");
      $("#runButton").addClass("connectedButton");
      $("#runButton").prop("disabled",false);
    }else{
      $("#runButton").removeClass("connectedButton");
      $("#runButton").addClass("notConnectedButton");
      $("#runButton").prop("disabled",true);
    }
}
  
function enableStopButton(en_flag){
    if(en_flag){
        $("#stopButton").removeClass("notConnectedButton");
        $("#stopButton").addClass("connectedButton");
        $("#stopButton").prop("disabled",false);
    }else{
        $("#stopButton").removeClass("connectedButton");
        $("#stopButton").addClass("notConnectedButton");
        $("#stopButton").prop("disabled",true);
    }
}

// UI INTERFACE -----------------------

function showsidepanel(){
    if($("#log_container_div").hasClass("open")){
      $("#log_container_div").removeClass("open");
    }else{
      $("#log_container_div").addClass("open");
    }
}

function clearLog() {
    const logContainer = document.getElementById('log-container');
    // Keep just the first welcome message
    while (logContainer.childNodes.length > 1) {
        logContainer.removeChild(logContainer.lastChild);
    }
}  

// Helper function to add log entries
function addLogEntry(message, type = 'system') {
    const logContainer = document.getElementById('log-container');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
    
    // Auto-scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}


// SWEET ALERT JS
function showConnectConfirmDialog()
{
  Swal.fire({
    text: "Do you want to disconnect?",
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: OkText,
    cancelButtonText: CancelText,
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
        disconnectFromBluetooth();
    }
  });
}

// Dialog Modal
function showModalDialog(message, icon)
{
  Swal.fire({
    text: message,
    icon: icon, 
    confirmButtonText: OkText
  });
}


// EXPORT
function exportBlocklyBlocksAsSVG() {
    const workspace = Blockly.getMainWorkspace();
    const canvas = workspace.getCanvas(); // blocklyBlockCanvas
    const clone = canvas.cloneNode(true);

    const bbox = canvas.getBBox();
    const padding = 20;

    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.setAttribute("width", bbox.width + padding * 2);
    svgEl.setAttribute("height", bbox.height + padding * 2);
    svgEl.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
    svgEl.setAttribute("fill", "#fff");

    clone.setAttribute("transform", `translate(${padding}, ${padding})`);
    svgEl.appendChild(clone);

    const style = document.querySelector("style[blockly-style]");
    if (style) {
        svgEl.appendChild(style.cloneNode(true));
    }

    // Find all <image> tags in the clone and inline them
    const images = svgEl.querySelectorAll("image");
    const promises = Array.from(images).map(img => {
        return new Promise(resolve => {
            const href = img.getAttribute("href") || img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
            if (!href || href.startsWith("data:")) return resolve();

            const image = new Image();
            image.crossOrigin = "anonymous";
            image.src = href;
            image.onload = () => {
                const canvasImg = document.createElement("canvas");
                canvasImg.width = image.width;
                canvasImg.height = image.height;
                const ctx = canvasImg.getContext("2d");
                ctx.drawImage(image, 0, 0);
                const dataURL = canvasImg.toDataURL("image/png");
                img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", dataURL);
                resolve();
            };
            image.onerror = () => resolve(); // Ignore failed image loads
        });
    });

    Promise.all(promises).then(() => {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgEl);
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "blockly_blocks_with_icons.svg";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });
}

function exportBlocklyAsPNG() {
    const workspace = Blockly.getMainWorkspace();

    // Force rendering
    Blockly.svgResize(workspace);

    // Create hidden DIV for rendering complete block SVG
    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.position = "absolute";
    hiddenDiv.style.left = "-10000px";
    hiddenDiv.style.top = "-10000px";
    hiddenDiv.style.width = "1000px";
    hiddenDiv.style.height = "1000px";
    document.body.appendChild(hiddenDiv);

    const svg = workspace.getParentSvg().cloneNode(true);
    hiddenDiv.appendChild(svg);

    // Force styles (to make sure text/icons render)
    const style = document.querySelector("style[blockly-style]");
    if (style) {
        svg.insertBefore(style.cloneNode(true), svg.firstChild);
    }

    // Wait a bit for browser to layout
    requestAnimationFrame(() => {
        const bbox = svg.getBBox();
        const padding = 20;
        const width = bbox.width + padding * 2;
        const height = bbox.height + padding * 2;

        const finalSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        finalSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        finalSvg.setAttribute("width", width);
        finalSvg.setAttribute("height", height);
        finalSvg.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
        finalSvg.appendChild(svg.querySelector('.blocklyBlockCanvas').cloneNode(true));

        // Inline style again
        if (style) {
            finalSvg.insertBefore(style.cloneNode(true), finalSvg.firstChild);
        }

        const images = finalSvg.querySelectorAll("image");
        const promises = Array.from(images).map(img => {
            return new Promise(resolve => {
                const href = img.getAttribute("href") || img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
                if (!href || href.startsWith("data:")) return resolve();

                const image = new Image();
                image.crossOrigin = "anonymous";
                image.src = href;
                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0);
                    const dataURL = canvas.toDataURL("image/png");
                    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", dataURL);
                    resolve();
                };
                image.onerror = () => {
                    console.warn("Could not load image", href);
                    resolve();
                };
            });
        });

        Promise.all(promises).then(() => {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(finalSvg);
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);
        
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
        
                canvas.toBlob(blob => {
                    const a = document.createElement("a");
                    a.download = "blockly_export_with_icons.png";
                    a.href = URL.createObjectURL(blob);
                    a.click();
                    document.body.removeChild(hiddenDiv);
                }, "image/png");
            };
            img.src = url;
        });
    });    
}

