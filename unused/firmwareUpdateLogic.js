"use strict";

// User firmware: file ending in "-app-user.enc"
// Example: "ev3-v1.1.0-app-user.enc"
const urlUpdateFirmware = updateBaseURL + updateFirmwareVersion + '/' + 'ev3-' + updateFirmwareVersion + '-app-user.enc';

// The boot loader: file ending in "-bl-updater.enc"
// Example: "ev3-v1.1.0-bl-updater.enc"
const urlUpdateBootloader = updateBaseURL + updateBootloaderVersion + '/' + 'ev3-' + updateBootloaderVersion + '-bl-updater.enc';

// console.log ( 'latest firware: ' + urlUpdateFirmware );
// console.log ( 'latest bootLoader: ' + urlUpdateBootloader );


async function prepareKukiAndSendFirmware() {

  var version = await getEV3FirmwareVersion();

  var bootOnly = false;
  var inFirmwareMode = true;

  console.log(version);

  if (version[0] == EV3_VARIANT_CODE_BOOTLOADER) {
    inFirmwareMode = false;
    //already in boot, why?
    if (version[2].startsWith("ÿ")||!(version[2].startsWith("v"))) {
      //firmware version is not a valid number
      console.log("Kuki only has bootloader mode");
      bootOnly = true;
    }

  }

  //check bootloader number first
  // if(version[1].startsWith("v0.") || version[1].startsWith("v1.0.0")) {
  if ( !version[1].startsWith(updateBootloaderVersion)) {

    //old bootloader needs updating - more complex modal
    console.log('download boot');
    if(inFirmwareMode){
      await webUSBCommandReset(1);
    }


    var bootloader;

    //download boot loader
    getFileFromServer(urlUpdateBootloader).then(async fileContent => {

      if (fileContent) {

        console.log('Bootloader update downloaded from server.');
                
        fuFeebackCardAppend('A two step firmware update is starting...', 'info');

        bootloader = new Uint8Array( fileContent );

        if (await programEV3Firmware(bootloader, true)) {

          //reconnect to Kuki
          //***************************************************
          //******code needed here to allow a user to click a reconnect button
          //****** that button should call this function again
          await webUSBCommandReset(1);

          // maybe add a pause and some feedback to user...
          fuFeebackCardAppend('Bootloader update complete.', 'success');

          // maybe add a pause and some feedback to user...
          fuFeebackCardAppend('Please click <strong>Reconnect Kuki</strong>.', 'prompt');

          // Add button to UI with link to recall this function - prepareKukiAndSendFirmware()
          jQuery("#btnFUHubConnect").hide();
          jQuery("#btnFUHubReconnect").show();
          jQuery("#btnFUHubReconnect").prop("disabled", false);


        } else {

          fuFeebackCardAppend('Issue loading firmware', 'info');

        }


      } else {

        console.log('Failed to download file.');

      }

    });


  } else {

    //no bootloader update needed, check for a firmware version
    if (bootOnly) {

      var firmware;

      //no firmware download it
      console.log('download firmware boot only');

      //download firmware
      getFileFromServer(urlUpdateFirmware).then(async fileContent => {

        if (fileContent) {

          console.log('Firmware update downloaded from server.');

          firmware = new Uint8Array( fileContent );
          console.log(firmware);

          fuFeebackCardAppend('A firmware update is starting...', 'info');

          if (await programEV3Firmware(firmware, true)) {

            // Switch back to application.
            await webUSBCommandReset(1);

          } else {

            fuFeebackCardAppend('Error: Issue loading firmware.', 'error');
  
          }

          fuFeebackCardAppend('Firmware update complete.', 'success');

          // if () {

            setTimeout(function() {
              console.log('Waited for 2 seconds...');
              fuButtonStatus('start');
            }, 2000);            

          // }



        } else {

          console.log('Failed to download file.');
          fuFeebackCardAppend('Error: Issue downloading firmware.', 'error');

        }
      });

    } else {

      if ( version[2].startsWith(updateFirmwareVersion)) {

        //Up to date firmware, no need to do an update
        console.log('No UPDATE NEEDED');
        fuFeebackCardAppend('No update required: the firmware on your Kuki is up to date.', 'success');
        //await webUSBCommandReset(1);

      } else {

        if (inFirmwareMode) {
          await webUSBCommandReset(1);
        }

        // need a download
        console.log('download firmware');
        // fuFeebackCardAppend('Update needed...', 'info');

        //download firmware
        getFileFromServer(urlUpdateFirmware).then(async fileContent => {

          if (fileContent) {

            console.log('Firmware update downloaded from server.');

            firmware = new Uint8Array( fileContent );
            // console.log(firmware);

            fuFeebackCardAppend('A firmware update is starting...', 'info');

            if (await programEV3Firmware(firmware, true)) {

              // Switch back to application.
              await webUSBCommandReset(1);

              fuFeebackCardAppend('Firmware update complete.', 'success');

            } else {

              fuFeebackCardAppend('Error: Issue loading firmware.', 'error');

            }

          } else {

            console.log('Failed to download file.');
            fuFeebackCardAppend('Error: Issue downloading firmware.', 'error');

          }
        });

      }
    }
  }
}


function getFileFromServer( url ) {
  return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = "arraybuffer";
      xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
              resolve(xhr.response);
          } else {
              reject({
                  status: this.status,
                  statusText: xhr.statusText
              });
          }
      };
      xhr.onerror = function () {
          reject({
              status: this.status,
              statusText: xhr.statusText
          });
      };
      xhr.send();
  });
}
