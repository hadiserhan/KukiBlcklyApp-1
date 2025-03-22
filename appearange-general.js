function OpenConnectionForm()
{
  if(isConnected)
    showConfirmDialog();
  else
    connectSerial();  
}

function ConnectedSerialPort()
{
  isConnected = true;
  connectionType = "Serial";
  // $("#btConnect").removeClass("notConnectedButton");
  // $("#btConnect").addClass("connectedButton");
}

function DisconnectedSerialPort()
{
  isConnected = false;
  // $("#btConnect").removeClass("connectedButton");
  // $("#btConnect").addClass("notConnectedButton");
}

function showConfirmDialog()
{
    // swal({
    //       //title: "Are you sure?",
    //       text: ModalConfirmDialogText,
    //       icon: "info",
    //       buttons: [CancelText, OkeyText],
    //       dangerMode: false,
    // }).then((willClose) => {
    //     if (willClose) {
    //         disConnect()
    //     }
    // });
    disConnect()
}

function disConnect()
{
    if(connectionType == "Serial")
    {
      disConnectSerial();
    }
    else if(connectionType == "WebRepl")
    {
      disConnectWebRepl();
    }
    else if(connectionType == "BLE")
    {
      disConnectBLE();
    }
}


// bluetooth
function OpenBLEForm()
{
  if(isConnected)
    showConfirmDialog();
  else
    connectToBle();  
}


function sendPostMessage(){
  window.postMessage("OpenBluetooth", "*");
}
