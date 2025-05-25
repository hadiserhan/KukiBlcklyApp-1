
// function StepCode() { 
//     try
//     {
//        if(myInterpreter)
//        {
//         //   glowStack(highlightblockid);
//         //   unglowStack(exhighlightblockid);
          
//           highlightPause = false;
//           do {
//             try {
//               hasMoreCode = myInterpreter.step();
 
//             } finally {
//               if (!hasMoreCode) {
//                 return;
//               }
//             }
//             // Keep executing until a highlight statement is reached,
//             // or the code completes or errors.
//           } while (hasMoreCode && !highlightPause);
//        }
//     }
//     catch(err)
//     {
//        console.log(err.message);
//     }
//  }
const interpreterTimeoutQueue = [];
function initApi(interpreter, scope) {
 
    var wrapper = function(sound) {
        return runJSSound(sound);
    };
    interpreter.setProperty(scope, 'runJSSound',
        interpreter.createNativeFunction(wrapper)
    );

    var wrapper = function(){
        return startCameraBlock();
    }
    interpreter.setProperty(scope, 'startCameraBlock',
        interpreter.createNativeFunction(wrapper)
    );

    var wrapper = function(boolDetection){
        return showHideHandDetection(boolDetection);
    }
    interpreter.setProperty(scope, 'showHideHandDetection',
        interpreter.createNativeFunction(wrapper)
    );

    var wrapper = function(gestureName) {
        getGesture(gestureName);
    };
    
    interpreter.setProperty(scope,'getGesture',
    interpreter.createNativeFunction(wrapper)
    );

     var wrapper = function(id) {
       return highlightBlock(id);
     };
     interpreter.setProperty(scope, 'highlightBlock',
       interpreter.createNativeFunction(wrapper));
 
    var wrapper = function(callback) {
        // Ensure that loopstep runs properly and invokes the callback
        return loopstepcall(function() {
            callback();
        });
    };
     interpreter.setProperty(scope, 'loopstepcall',
       interpreter.createNativeFunction(wrapper));
 
       var wrapper = function() {
       return loopstep();
    };
     interpreter.setProperty(scope, 'loopstep',
       interpreter.createNativeFunction(wrapper));


       interpreter.setProperty(scope, 'mySetTimeout',
        interpreter.createNativeFunction(function(callback, delay, done) {
          setTimeout(() => {
            interpreterTimeoutQueue.push(callback);
            // done();
          }, delay);
        })
      );
      
    var wrapper = function(e) {
        return my_alert(e);
    };
    interpreter.setProperty(scope, 'alert',
        interpreter.createNativeFunction(wrapper));

     var wrapper = function() {
       return loopend();
     };
     interpreter.setProperty(scope, 'loopend',
       interpreter.createNativeFunction(wrapper));
 
     // Add an API function for isProgramRunning blocks.
     var wrapper = function() {
         return isProgramRunning();
     };
     interpreter.setProperty(scope, 'isProgramRunning',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for OttoStart blocks.
     var wrapper = function() {
         return OttoStart();
     };
     interpreter.setProperty(scope, 'OttoStart',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for clearRGB blocks.
     var wrapper = function() {
         return clearRGB();
     };
     interpreter.setProperty(scope, 'clearRGB',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readLineLeft blocks.
     var wrapper = function() {
         return readLineLeft();
     };
     interpreter.setProperty(scope, 'readLineLeft',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readLineRight blocks.
     var wrapper = function() {
         return readLineRight();
     };
     interpreter.setProperty(scope, 'readLineRight',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readLineLeftanalog  blocks.
     var wrapper = function() {
         return readLineLeftanalog();
     };
     interpreter.setProperty(scope, 'readLineLeftanalog',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readLineRightanalog blocks.
     var wrapper = function() {
         return readLineRightanalog();
     };
     interpreter.setProperty(scope, 'readLineRightanalog',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readultrasonicRGB blocks.
     var wrapper = function(unit) {
         return readultrasonicRGB(unit);
     };
     interpreter.setProperty(scope, 'readultrasonicRGB',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setultrasonicRGBeyes blocks.
     var wrapper = function(red, green, blue) {
         return setultrasonicRGBeyes(red, green, blue);
     };
     interpreter.setProperty(scope, 'setultrasonicRGBeyes',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setultrasonicRGBRigth blocks.
     var wrapper = function(red, green, blue) {
         return setultrasonicRGBRigth(red, green, blue);
     };
     interpreter.setProperty(scope, 'setultrasonicRGBRigth',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setultrasonicRGBLeft blocks.
     var wrapper = function(red, green, blue) {
         return setultrasonicRGBLeft(red, green, blue);
     };
     interpreter.setProperty(scope, 'setultrasonicRGBLeft',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for brightnessultrasonicRGB blocks.
     var wrapper = function(brightness) {
         return brightnessultrasonicRGB(brightness);
     };
     interpreter.setProperty(scope, 'brightnessultrasonicRGB',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setultrasonicRGBled blocks.
     var wrapper = function(lednumber, colour) {
         return setultrasonicRGBled(lednumber, colour);
     };
     interpreter.setProperty(scope, 'setultrasonicRGBled',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setultrasonicRGB blocks.
     var wrapper = function(lednumber, red, green, blue) {
         return setultrasonicRGB(lednumber, red, green, blue);
     };
     interpreter.setProperty(scope, 'setultrasonicRGB',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for clearultrasonicRGB blocks.
     var wrapper = function() {
         return clearultrasonicRGB();
     };
     interpreter.setProperty(scope, 'clearultrasonicRGB',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for prepareWheels blocks.
     var wrapper = function(){
         return  prepareWheels();
     };
     interpreter.setProperty(scope, 'prepareWheels',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for motorControlMove blocks.
     var wrapper = function(rightSpeed, leftSpeed, stepDelay, speed) {
         return motorControlMove(rightSpeed, leftSpeed, stepDelay, speed);
     };
     interpreter.setProperty(scope, 'motorControlMove',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for motorControlMoveLoop blocks.
     var wrapper = function(rightSpeed, leftSpeed, speed) {
         return motorControlMoveLoop(rightSpeed, leftSpeed, speed);
     };
     interpreter.setProperty(scope, 'motorControlMoveLoop',
         interpreter.createNativeFunction(wrapper));
 
 
     // Add an API function for motorControlMoveLeft blocks.
     var wrapper = function(leftSpeed, stepDelay, speed) {
         return motorControlMoveLeft(leftSpeed, stepDelay, speed);
     };
     interpreter.setProperty(scope, 'motorControlMoveLeft',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for motorControlMoveLeftLoop blocks.
     var wrapper = function(leftSpeed, speed) {
         return motorControlMoveLeftLoop(leftSpeed, speed);
     };
     interpreter.setProperty(scope, 'motorControlMoveLeftLoop',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for motorControlMoveRight blocks.
     var wrapper = function(rightSpeed, stepDelay, speed) {
         return motorControlMoveRight(rightSpeed, stepDelay, speed);
     };
     interpreter.setProperty(scope, 'motorControlMoveRight',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for motorControlMoveRightLoop blocks.
     var wrapper = function(rightSpeed, speed) {
         return motorControlMoveRightLoop(rightSpeed, speed);
     };
     interpreter.setProperty(scope, 'motorControlMoveRightLoop',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for motorControlRotate blocks.
     var wrapper = function(rightSpeed, leftSpeed, stepDelay, speed) {
         return motorControlRotate(rightSpeed, leftSpeed, stepDelay, speed);
     };
     interpreter.setProperty(scope, 'motorControlRotate',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for motorControlStop blocks.
     var wrapper = function() {
         return motorControlStop();
     };
     interpreter.setProperty(scope, 'motorControlStop',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for prepareRGB blocks.
     var wrapper = function() {
         return prepareRGB();
     };
     interpreter.setProperty(scope, 'prepareRGB',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for fillAllRGBRing blocks.
     var wrapper = function(colour) {
         return fillAllRGBRing(colour);
     };
     interpreter.setProperty(scope, 'fillAllRGBRing',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for fillAllRing  blocks.
     var wrapper = function(red, green, blue) {
         return fillAllRing(red, green, blue);
     };
     interpreter.setProperty(scope, 'fillAllRing',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setRGBring blocks.
     var wrapper = function(lednumber, colour) {
         return setRGBring(lednumber, colour);
     };
     interpreter.setProperty(scope, 'setRGBring',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setRGBLed blocks.
     var wrapper = function(lednumber, red, green, blue) {
         return setRGBLed(lednumber, red, green, blue);
     };
     interpreter.setProperty(scope, 'setRGBLed',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for RGBrainbow blocks.
     var wrapper = function(speed) {
         return RGBrainbow(speed);
     };
     interpreter.setProperty(scope, 'RGBrainbow',
         interpreter.createNativeFunction(wrapper));
 
         // Add an API function for RGBbounce blocks.
     var wrapper = function(colour, speed) {
         return RGBbounce(colour, speed);
     };
     interpreter.setProperty(scope, 'RGBbounce',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for RGBcycle blocks.
     var wrapper = function(colour, speed) {
         return RGBcycle(colour, speed);
     };
     interpreter.setProperty(scope, 'RGBcycle',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for fillRGBRing blocks.
     var wrapper = function(colour1, colour2, colour3, colour4, colour5, colour6, colour7, colour8, colour9, colour10, colour11, colour12, colour13) {
         return fillRGBRing(colour1, colour2, colour3, colour4, colour5, colour6, colour7, colour8, colour9, colour10, colour11, colour12, colour13);
     };
     interpreter.setProperty(scope, 'fillRGBRing',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for brightnessRGB blocks.
     var wrapper = function(brightness) {
         return  brightnessRGB(brightness);
     };
     interpreter.setProperty(scope, 'brightnessRGB',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for playNote blocks.
     var wrapper = function(note, time){
         return  playNote(note, time);
     };
     interpreter.setProperty(scope, 'playNote',
         interpreter.createNativeFunction(wrapper));
     
     // Add an API function for playMelody blocks.
     var wrapper = function(melody){
         return  playMelody(melody);
     };
     interpreter.setProperty(scope, 'playMelody',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for playMelodyText blocks.
     var wrapper = function(melody){
         return  playMelodyText(melody);
     };
     interpreter.setProperty(scope, 'playMelodyText',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for playNote4 blocks.
     var wrapper = function(note1, note2, note3, note4, time){
         return  playNote4(note1, note2, note3, note4, time);
     };
     interpreter.setProperty(scope, 'playNote4',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for ultrasonicRGB blocks.
     var wrapper = function(colourLeft, colourRight){
         return  ultrasonicRGB(colourLeft, colourRight);
     };
     interpreter.setProperty(scope, 'ultrasonicRGB',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for delaySecond blocks.
     var wrapper = function(time){
         return  delaySecond(time);
     };
     interpreter.setProperty(scope, 'delaySecond',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for playEmoji blocks.
     var wrapper = function(emoji){
         return  playEmoji(emoji);
     };
     interpreter.setProperty(scope, 'playEmoji',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for OttoDotMatrix blocks.
     var wrapper = function(value, hexcolor){
         return  OttoDotMatrix(value, hexcolor);
     };
     interpreter.setProperty(scope, 'OttoDotMatrix',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for matrixdot blocks.
     var wrapper = function(xPos, yPos, value, hexcolor){
         return  matrixdot(xPos, yPos, value, hexcolor);
     };
     interpreter.setProperty(scope, 'matrixdot',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for OttoDotMatrixOff blocks.
     var wrapper = function(){
         return  OttoDotMatrixOff();
     };
     interpreter.setProperty(scope, 'OttoDotMatrixOff',
         interpreter.createNativeFunction(wrapper));
 
 
     // Add an API function for showDotMatrixEyes blocks.
     var wrapper = function(image){
         return  showDotMatrixEyes(image);
     };
     interpreter.setProperty(scope, 'showDotMatrixEyes',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for showDotMatrixMouth blocks.
     var wrapper = function(image){
         return  showDotMatrixMouth(image);
     };
     interpreter.setProperty(scope, 'showDotMatrixMouth',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for writeTextDisplay blocks.
     var wrapper = function(writeValue, xPos, yPos){
         return  writeTextDisplay(writeValue, xPos, yPos);
     };
     interpreter.setProperty(scope, 'writeTextDisplay',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for pixelDisplay blocks.
     var wrapper = function(xPos, yPos){
         return  pixelDisplay(xPos, yPos);
     };
     interpreter.setProperty(scope, 'pixelDisplay',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for lineDisplay blocks.
     var wrapper = function(xPos1, yPos1, xPos2, yPos2){
         return  lineDisplay(xPos1, yPos1, xPos2, yPos2);
     };
     interpreter.setProperty(scope, 'lineDisplay',
         interpreter.createNativeFunction(wrapper));
     
     // Add an API function for squareDisplay blocks.
     var wrapper = function(xPos, yPos, width, height){
         return  squareDisplay(xPos, yPos, width, height);
     };
     interpreter.setProperty(scope, 'squareDisplay',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for ringDisplay blocks.
     var wrapper = function(xPos, yPos, diameter){
         return  ringDisplay(xPos, yPos, diameter);
     };
     interpreter.setProperty(scope, 'ringDisplay',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for circleDisplay blocks.
     var wrapper = function(xPos, yPos, diameter){
         return  circleDisplay(xPos, yPos, diameter);
     };
     interpreter.setProperty(scope, 'circleDisplay',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for showDisplay blocks.
     var wrapper = function(){
         return  showDisplay();
     };
     interpreter.setProperty(scope, 'showDisplay',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for clearDisplay blocks.
     var wrapper = function(){
         return  clearDisplay();
     };
     interpreter.setProperty(scope, 'clearDisplay',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for showEyeImage blocks.
     var wrapper = function(image){
         return  showEyeImage(image);
     };
     interpreter.setProperty(scope, 'showEyeImage',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for showMouthImage blocks.
     var wrapper = function(image){
         return  showMouthImage(image);
     };
     interpreter.setProperty(scope, 'showMouthImage',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for Config_mp3 blocks.
     var wrapper = function() {
         return Config_mp3();
     };
     interpreter.setProperty(scope, 'Config_mp3',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for Servocali blocks.
     var wrapper = function() {
         return Servocali();
     };
     interpreter.setProperty(scope, 'Servocali',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for Mp3_Volume blocks.
     var wrapper = function() {
         return Mp3_Volume();
     };
     interpreter.setProperty(scope, 'Mp3_Volume',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for Play_mp3 blocks.
     var wrapper = function() {
         return Play_mp3();
     };
     interpreter.setProperty(scope, 'Play_mp3',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for Operation_mp3 blocks.
     var wrapper = function() {
         return Operation_mp3();
     };
     interpreter.setProperty(scope, 'Operation_mp3',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for followLine blocks.
     var wrapper = function() {
         return followLine();
     };
     interpreter.setProperty(scope, 'followLine',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for printSerial blocks.
     var wrapper = function(value){
         return  printSerial(value);
     };
     interpreter.setProperty(scope, 'printSerial',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readDigitalSensors blocks.
     var wrapper = function(pin) {
         return readDigitalSensors(pin);
     };
     interpreter.setProperty(scope, 'readDigitalSensors',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readAnalogSensor blocks.
     var wrapper = function(pin) {
         return readAnalogSensor(pin);
     };
     interpreter.setProperty(scope, 'readAnalogSensor',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readTouchPin blocks.
     var wrapper = function(pin) {
         return readTouchPin(pin);
     };
     interpreter.setProperty(scope, 'readTouchPin',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for read_DHT blocks.
     var wrapper = function(pin) {
         return read_DHT(pin);
     };
     interpreter.setProperty(scope, 'read_DHT',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setDigitalPinValue blocks.
     var wrapper = function(pin) {
         return setDigitalPinValue(pin);
     };
     interpreter.setProperty(scope, 'setDigitalPinValue',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readDigitalPinValue blocks.
     var wrapper = function(pin) {
         return readDigitalPinValue(pin);
     };
     interpreter.setProperty(scope, 'readDigitalPinValue',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setAnalogPinValue blocks.
     var wrapper = function(pin) {
         return setAnalogPinValue(pin);
     };
     interpreter.setProperty(scope, 'setAnalogPinValue',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for readAnalogPinValue blocks.
     var wrapper = function(pin) {
         return readAnalogPinValue(pin);
     };
     interpreter.setProperty(scope, 'readAnalogPinValue',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for setLedValue blocks.
     var wrapper = function(value) {
         return setLedValue(value);
     };
     interpreter.setProperty(scope, 'setLedValue',
         interpreter.createNativeFunction(wrapper));
 
     // Add an API function for PlayStop blocks.
     var wrapper = function() {
         return PlayStop();
     };
     interpreter.setProperty(scope, 'PlayStop',
         interpreter.createNativeFunction(wrapper));
 }

 function runButtonClick()
 {
     runCode();
 }
 
 function my_alert(e){
    alert(e);
 }

 function stopButtonClick()
 {
     motorControlStop();
     clearultrasonicRGB();
     clearRGB();
 
     restart();
 }
function StepCode() { 
    try
    {
        for (const id in interpreters) {
            const interpObj = interpreters[id];
            const myInterpreter = interpObj.interpreter;
            if (myInterpreter) {
                interpObj.highlightPause = false;
                do {
                    try {
                        interpObj.hasMoreCode = myInterpreter.step();
                        while (interpreterTimeoutQueue.length > 0) {
                            const cb = interpreterTimeoutQueue.shift();
                            runInterpreterFunction(myInterpreter, cb);
                        }
                    } finally {
                        if (!interpObj.hasMoreCode) {
                            console.log(`Interpreter ${id} finished.`);
                            continue; // Don't exit the loop for others
                        }
                    }
                } while (interpObj.hasMoreCode && !interpObj.highlightPause);
            }
        }
    }
    catch(err)
    {
        console.log("StepCode error:", err.message);
    }
 }
 



  
 function highlightBlock(id) {
     exhighlightblockid = highlightblockid;
     highlightblockid = id;
 
     highlightPause = true;
 }
 
 function generateCodeAndLoadIntoInterpreter() {
     // Generate JavaScript code and parse it.
     Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
     Blockly.JavaScript.addReservedWords('highlightBlock');
     //latestCode = Blockly.JavaScript.workspaceToCode(workspace);
     resetStepUi();
 }
 
 function resetStepUi() {
    //  workspace.highlightBlock(null);
 
    //  unglowStack(highlightblockid);
    //  unglowStack(exhighlightblockid);
   
    //  highlightblockid = "";
    //  exhighlightblockid = "";
    //  highlightPause = false;
 }
 
 function CreateInterpreter(latestCode)
 {
    //  myInterpreter = null;
     resetStepUi();
     return  new Interpreter(latestCode, initApi);
 }
 
 function glowStack(id) {
   try
   {
     workspace.glowBlock(id, true);
   }
   catch
   {
 
   }
 }
 
 function unglowStack(id) {
   try
   {
     workspace.glowBlock(id, false);
   }
   catch
   {
     
   }
 }
 function loopstep() {
    setTimeout(() => {
      StepCode();
    }, 50);
  }


 function loopstepcall(callback) {
    setTimeout(() => {
      StepCode();
      if (typeof callback === 'function') {
        callback();
      } else {
        loopend();  // fallback loop continue
      }
    }, 50);
  }

 function loopend() 
 {
    // for (const id in interpreters) {
    //     const interp = interpreters[id];
    //     if (interp.hasMoreCode && isRunCode) {
    //         setTimeout(() => {
    //             StateControl(id);
    //             StepCode();
    //         }, 50);
    //     }
    // }
 }
 
 function StateControl(id)
 {         
    if (!interpreters[id].hasMoreCode) {
        // Optional: Restart or clean that interpreter
        console.log(`Interpreter ${id} finished.`);
    }
 }

 function runInterpreterFunction(interpreter, func, thisArg) {
    interpreter.stateStack.push({
      node: func.node,
      scope: func.scope,
      thisExpression: thisArg || interpreter.global,
      done: false
    });
}