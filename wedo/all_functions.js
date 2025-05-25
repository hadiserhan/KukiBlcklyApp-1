var gesture = "";

  function getGesture(gestureName) {
    return (gesture == gestureName);
  }

  function setGesture(gestureName){
    gesture = gestureName;
  }

function startCameraBlock(){
    startCamera();
}

function showHideHandDetection(booHandDetection){
    IS_hand_Detection = (booHandDetection == "1" ? true : false);
}

function mySetTimeout(callback, delay) {
    setTimeout(callback, delay);
}