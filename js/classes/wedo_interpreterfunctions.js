// Assume getGesture and runJSSound are already defined in JS
// HTML should include an element to trigger run()

// ==== INTERPRETER INIT ====
function initGlobal(interpreter, globalObject) {
    // Wrap native getGesture
    interpreter.setProperty(globalObject, 'getGesture',
      interpreter.createNativeFunction(function(id) {
        return getGesture(id); // You must define getGesture externally
      })
    );
  
    // Wrap native runJSSound
    interpreter.setProperty(globalObject, 'runJSSound',
      interpreter.createNativeFunction(function(id) {
        runJSSound(id); // You must define runJSSound externally
      })
    );
  
    
    var wrapper = function(){
        return startCameraBlock();
    }
    interpreter.setProperty(globalObject, 'startCameraBlock',
        interpreter.createNativeFunction(wrapper)
    );

    var wrapper = function(boolDetection){
        return showHideHandDetection(boolDetection);
    }
    interpreter.setProperty(globalObject, 'showHideHandDetection',
        interpreter.createNativeFunction(wrapper)
    );

    // Custom setTimeout-like behavior using threads
    interpreter.setProperty(globalObject, 'mySetTimeout',
      interpreter.createNativeFunction(function(funcname, delay) {
        setTimeout(function() {
            // funcname.properties.name+"();"
            interpreter.appendCode(funcname.properties.name+"();");
            threads.push(interpreter.getStateStack());
        }, delay);
      })
    );
  
    // Expose isProgramRunning
    interpreter.setProperty(globalObject, 'isProgramRunning',
      interpreter.createNativeFunction(function() {
        return true; // Replace with real logic if needed
      })
    );
  }
  
  var globalInterpreter = new Interpreter('', initGlobal);
  var threads = [];
  
  function nextStep() {
    if (globalInterpreter.step()) {
      window.setTimeout(nextStep, 50);
    } else {
      threads.pop();
      if (threads.length > 0) {
        globalInterpreter.setStateStack(threads[threads.length - 1]);
        window.setTimeout(nextStep, 50);
      }else{
        window.setTimeout(nextStep, 500);
      }
    }
  }
  
  function createAndActivateThread(code) {
    var interpreter = new Interpreter('', initGlobal);
    interpreter.getStateStack()[0].scope = globalInterpreter.getGlobalScope();
    interpreter.appendCode(code);
    threads.push(interpreter.getStateStack());
    globalInterpreter.setStateStack(threads[threads.length - 1]);
    if (threads.length === 1) {
      nextStep();
    }
  }
  
  // ==== GESTURE DETECTION CODE ====
  function runGestureDetection(id , gestureId , sound) {
    var gestureCode = `
      function gestureLoop_${id}() {
        if (!isProgramRunning()) return;
        if (getGesture('${gestureId}')) {
          runJSSound(${sound});
        }
        mySetTimeout(gestureLoop_${id}, 200);
      }
      gestureLoop_${id}();
    `;
    createAndActivateThread(gestureCode);
  }

    // ==== GESTURE DETECTION CODE ====
    function runnormal() {
        var gestureCode = `
            startCameraBlock();
            showHideHandDetection("1");
        `;
        createAndActivateThread(gestureCode);
    }
