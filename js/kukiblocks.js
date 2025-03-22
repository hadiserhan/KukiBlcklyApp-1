"use strict";

let port;
let writer;
let reader;
let textDecoder;
let readableStreamClosed;
let writableStreamClosed;
let isConnected = false;
var readValue = "";
var files = "";
var fileInput = "";
var isFiles = false;
var isFileInput = false;
var webreplActive = true;
var isMicropython = false;
var isCheckFilesCorrect = false;
var connectionType = "Serial";

var strUniqueID;

var blnDeviceCheck, browserInfo, isIOS, inputFile;

// Get the slider element
const slider = document.getElementById('rngFlasherSpeed');

// Set the tick values where the slider should snap
const snapValues = [1, 2, 3, 4];
let snappedValue = 1;

// Function to find the closest snap value
function findClosestSnap(value) {
   return snapValues.reduce((prev, curr) => {
      return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
   });
}

// Event listener for slider input
slider.addEventListener('input', function() {
   snappedValue = findClosestSnap(parseInt(this.value));
   localStorage.setItem( 'mbaFS', snappedValue );
});


jQuery(document).ready(function() {

   blnDeviceCheck = true;

   navFlash = document.getElementById('navProgramFlash');
   navUSB = document.getElementById('navProgram');
   // navPopUSB = document.getElementById('navPopUSB');
   navPopFirmwareUpdate = document.getElementById('navPopFirmwareUpdate');
   divFirmwareCheck = document.getElementById('divFirmwareCheck');
   spanProgrammingMethodLabel = document.getElementById('programmingMethodLabel');

   inputFile = document.getElementById('modalLoadLocalFiles');
   inputFile.addEventListener('change', handleFileSelect, false);   
   document.getElementById('fuLatestFirmware').innerHTML = updateFirmwareVersion.substring(1);
   if ( localStorage.getItem("esFS") ) {
      slider.value = localStorage.getItem("esFS");
   }

   browserInfo = edBrowserInfo.getBrowserDetails();
   isIOS = edBrowserInfo.isIOS();
   console.log('edBrowserInfo...');
   console.log('Browser Details:', browserInfo);
   console.log('isIOS:', isIOS);

   if ( (browserInfo.name != 'Chromium') && (browserInfo.name != 'Google Chrome') && (browserInfo.name != 'Microsoft Edge') && (browserInfo.name != 'Firefox') && (browserInfo.name != 'Safari') ) {  
      doUISetup('USB');
      blnDeviceCheck = false;
   }

   if ( (browserInfo.name == 'Google Chrome') || (browserInfo.name == 'Chromium') ) { 
      if ( isIOS ) {
         doUISetup('FLASH');
      } else {
         doUISetup('USB');
      }
   }

   if ( browserInfo.name == 'Microsoft Edge' ) { 
      if ( isIOS ) {
         doUISetup('FLASH');
      } else {
         doUISetup('USB');
      }
   }

   if ( browserInfo.name == 'Firefox' ) { 
      if ( isIOS ) {
         doUISetup('FLASH');
      } else {
         doUISetup('USB');
         blnDeviceCheck = false;
      }
   }

   if ( browserInfo.name == 'Safari' ) { 
      if ( isIOS ) {
         doUISetup('FLASH');
      } else {      
         doUISetup('USB');   
         blnDeviceCheck = false;
      }
   }

   if (blnDeviceCheck) {
      
      if ( localStorage.getItem('eb3ProgrammingMedthod') ) {
         console.log('ui pref found in storage...');         
         if ( localStorage.getItem('eb3ProgrammingMedthod') == 'FLASH' ) {
            doUISetup('FLASH');
         } else {
            doUISetup('USB');
         }         
      }

      jQuery('#modalLoading').modal('show');
      setTimeout(doLoadFromStorage, 1500);
      setInterval(function() {
         saveToStorage();
      }, 5000);

   } else {

      jQuery('.modal').modal('hide');
      jQuery('#modalBrowserCheck .exBrowserDetected').html(browserInfo.name);
      jQuery('#modalBrowserCheck').modal();

   }

   if ( localStorage.getItem("mbaFS") ) {
      slider.value = localStorage.getItem("mbaFS");
   }


});

// LOAD FROM STORAGE
function doLoadFromStorage() {
   loadFromStorage();
   jQuery('.modal').modal('hide');
}

// TRY CATCH PAGE RELOAD AND SAVE LOCALY
window.onbeforeunload = function() {
   saveToStorage();
};


// LOAD FROM STORAGE
function loadFromStorage() {

   console.log('loadFromStorage...');

   if (localStorage.getItem("mbaPN")) {

      var strProgramName = localStorage.getItem("mbaPN");
      var strProgramString = localStorage.getItem("mbaPS");

      strProgramString = b64DecodeUnicode( strProgramString );

      // console.log ( strProgramString );

      jQuery(".mba-program-title").html(strProgramName);

      if ( workspace ) {

         var xml = Blockly.Xml.textToDom( strProgramString );
         deleteWorkspace();
         Blockly.Xml.domToWorkspace(xml, workspace);
         workspace.clearUndo();
         return true;

      } else {

         console.log ( 'No workspace' );
         return false;

      }

   }

}


// SAVE TO STORAGE
function saveToStorage() {

   console.log('saveToStorage...');
   localStorage.setItem("mbaPN", jQuery(".mba-program-title").text());
   localStorage.setItem("mbaPS", getBlocksForDownload());

}




// CLEAR REMOTE CODES
jQuery('#doClearRemoteCodes').click(async function() {

   console.log('doClearRemoteCodes');   

   jQuery('#doClearRemoteCodes').prop('disabled', true);
   
   const result = await webUSBCommandPutPersistentData(88, new Uint8Array(64));

   console.log ( result);

   let strResult = '';

   if ( result == 'OK') {
      // strResult = '<mark class="alert alert-warning"><span class="oi oi-warning"></span>Remote codes have been cleared.</mark>';
      strResult = '<span style="color:#28a745; margin-left: 15px;"><span class="oi oi-check"></span> Remote codes have been cleared.</span>';
   } else {
      strResult = '<span style="color:#dc3545; margin-left: 15px;"><span class="oi oi-alert"></span> An error has occurred.</span>';
      jQuery('#doClearRemoteCodes').prop('disabled', false);
   }

   jQuery('#divClearRemoteCodesOutput').html(strResult).fadeIn(400, function() {

       setTimeout(function() {
           jQuery('#divClearRemoteCodesOutput').fadeOut(400);
           jQuery('#doClearRemoteCodes').prop('disabled', false);
       }, 5000);

   });

});

jQuery('#modalHelp').on('hidden.bs.modal', function (e) {

   jQuery('#doClearRemoteCodes').prop('disabled', false);

});



// POP FLASH PROGRAMMING
jQuery('#navProgramFlash').click(function() {
 
   jQuery('.modal').modal('hide');
   jQuery("#modalFlasher").modal();

});

jQuery('#modalFlasher').on('hidden.bs.modal', function (e) {

   console.log ('closed...');
   flasherStop();

 });






// RUN FLASH PROGRAMMING
jQuery('#btnFlasherRun').click(function() {

   console.log('start flash...');

   let flasherSpeed = 0;
   let flasherLevel = 0;

   switch ( snappedValue ) {

      case 1:
         flasherSpeed = 30;
         flasherLevel = 2;
        break;
      case 2:
         flasherSpeed = 30;
         flasherLevel = 4;
         break;
      case 3:
         flasherSpeed = 60;
         flasherLevel = 2;
         break;
      case 4:
         flasherSpeed = 60;
         flasherLevel = 4;
         break;
            
   }

   flasherProgram( flasherSpeed, flasherLevel )

});




// RUN PROGRAMMING
jQuery('#navProgram').click(async function() {

   await connectSerial();
   // if ( doBrowserCheck() ) {

   //    await testForUIDCheck();
   //    compileAndSendUserCode();

   // } else {

   //    jQuery('.modal').modal('hide');
   //    jQuery('#modalBrowserCheck .exBrowserDetected').html(browserInfo.name);
   //    jQuery('#modalBrowserCheck').modal();

   // }

});

async function connectSerial() {

   if (navigator.serial) {
     
       try 
       {
         port = await navigator.serial.requestPort();
         await port.open({ baudRate: 115200 });
         writer = port.writable.getWriter();
         textDecoder = new TextDecoderStream();
         readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
         reader = textDecoder.readable.getReader();
         let buffer = '';
 
         ConnectedSerialPort();
         sendCommand('print("isMicropython")');
         
         // setTimeout(IsMicropython, 2000);
         // setTimeout(checkMicropythonVersion, 2500);
         // setTimeout(ShowOttoFilesCommand, 3000);
 
         try
         {
           //ShowOttoFileInput("boot.py");
         }
         catch
         {
 
         }
         
         while (true) {
           const { value, done } = await reader.read();
           if (done) {
             // Allow the serial port to be closed later.
             reader.releaseLock();
             break;
           }
           
           try
           {     
             buffer += value; // Gelen veriyi buffer'a ekle
             let endIndex;
             var fullMessage;
 
             while ((endIndex = buffer.indexOf('\n')) >= 0) {
               fullMessage = buffer.substring(0, endIndex).trim(); // Sonlandırıcıya kadar olan kısmı al
               //console.log('Full Message:', fullMessage);
               buffer = buffer.substring(endIndex + 1); // Kalan buffer'ı güncelle
             }
 
             SerialData(fullMessage);
 
             var termValue = value;
             termValue = MessagePrepare(termValue);
             console.log(termValue);
 
             if(window.localStorage.getItem("Page") == "Vertical")
               term.write(termValue);
 
              /*
             if(window.localStorage.getItem("Page") == "Horizontal")
             {
               if(fullMessage.indexOf("#") > 0)
               {
                 var dist = fullMessage.replace("D#", "").replace("$", "");
                 dist = dist.substring(0, 5);
                 $("#lbDistance").text(dist);
               }
             }
             */
 
             if(isFileInput == false && fullMessage != undefined)
             {
               if((fullMessage.toUpperCase().indexOf("ERROR") >= 0) && fullMessage.indexOf("_boot.py") < 0)
               {
                 //console.log(fullMessage);
                 //showModalDialog(ErrorText + "\n" + fullMessage, "error");
               }
             }
 
             if(fullMessage.indexOf("Micropython"))
             {
               isMicropython = true;
             }
           
             //WifiMessages();
           }
           catch(err)
           {
             console.log(err.message);
           }
         }
         
       } catch (err) {
         showModalDialog(SerialPortErrorText, "error");
         DisconnectedSerialPort();
       }
 
     } else {
       showModalDialog(WebApiNotSupportedText, "error");
     }
 }

function doBrowserCheck() {

   const excludedBrowsers = ['Chrome', 'Edg', 'OPR'];
   const userAgent = navigator.userAgent;

   for (let i = 0; i < excludedBrowsers.length; i++) {
       if (userAgent.includes(excludedBrowsers[i])) {
           return true; // User is using an excluded browser
       }
   }

   return false; // User is not using an excluded browser

}


async function testForUIDCheck () {
   
   strUniqueID = await getEdisonV3UID();

   if ( strUniqueID != '' ) {

      // // checkUID( strUniqueID );
      
      // // if ( sessionStorage.getItem( 'esSentData' ) != 'true' ) {
         
      //    // console.log ('Data not sent so sending for this session...');

      //    let strFirmwareVersion = await getEV3FirmwareVersion();
      //    // console.log ( strFirmwareVersion );
   
      //    let versionBootloader = strFirmwareVersion[1]
      //    let versionFirmware = strFirmwareVersion[2];

      //    let strUsage = await getPersistentData();
		// 	console.log ( "strUsage" );
		// 	console.log ( strUsage );
	
		// 	logUsageData( strUniqueID, versionBootloader, versionFirmware, strUsage );


      // }

   }

}





// POP FIRMWARE UPDATE MODAL
function gotoFirmwareUpdate() {

   jQuery('.modal').modal('hide');
   fuButtonStatus("start");
   jQuery('#modalFirmwareUpdate').modal();

};


// SAVE LOCAL
jQuery("#btnSaveLocal").on("click", function(e) {

   console.log('SAVE LOCAL');

   var strProgramName = jQuery("#modalSaveLocal #txtProgramName").val();

   console.log(strProgramName);

   strProgramName = fileNameClean(strProgramName);

   console.log(strProgramName);

   var strContent = getBlocksForDownload();

   var isValidResult = fileNameIsValid(strProgramName);

   if ( isValidResult ) {

      var displayDiv = "#modalSaveLocal #divProgramNameMessageLocal";
      nameDisplayMessage (displayDiv, isValidResult, "alert-warning", "show");

   } else {

      jQuery('#btnSaveLocal').prop('disabled', true);
      jQuery(".mba-program-title").html(strProgramName);

      //localStorage.setItem("ebPN", strProgramName);

      var displayDiv = "#modalSaveLocal #divProgramNameMessageLocal";
      nameDisplayMessage (displayDiv, "OK! Your program is being saved. The download of your program should begin soon.", "alert-success", "show");

      setTimeout(function(){

         var strFilename = strProgramName;

         var form = document.createElement("form");
         form.setAttribute("method", "post");
         form.setAttribute("action", "_download.php");
         form.style.display = 'none';

         var filenameField = document.createElement("input");
         filenameField.setAttribute("name", "fn");
         filenameField.setAttribute("value", strFilename);
         form.appendChild(filenameField);

         var contentField = document.createElement("input");
         contentField.setAttribute("name", "content");
         contentField.setAttribute("value", strContent);
         form.appendChild(contentField);

         form.setAttribute("target", "_blank");

         document.body.appendChild(form);    // Not entirely sure if this is necessary
         form.submit();
         // console.log (form);

         jQuery("#modalSaveLocal").modal('hide');
         jQuery('#btnSaveLocal').prop('disabled', false);

      }, 2500);

      saveToStorage();

      // window.dataLayer.push({
      //    'event': 'analyticsEvent',
      //    'analyticsCategory': 'Program',
      //    'analyticsAction': 'Click',
      //    'analyticsLabel': 'Save - Local',
      //    'analyticsValue': 1
      // });

   }

});



// HANDLER RETURN
jQuery(document).on("keypress",function(e) {

   if (e.which == 13) {

      event.preventDefault();
      var elemFocus = document.activeElement.id;

      if (elemFocus==="txtCreateVarsName") {
         jQuery( "#btnCreateVar" ).trigger( "click" );
      }

      if (elemFocus==="txtProgramName") {
         jQuery( "#btnSaveLocal" ).trigger( "click" );
      }

   }

});


// POP LOAD LOCAL
jQuery('#navPopLoadLocal').click(function() {

   jQuery('.modal').modal('hide');
   jQuery("#modalLoadLocalFiles").val('');
   Blockly.loadDOMhold="";
   jQuery("#modalLoadLocalWarning").html("");
   jQuery("#modalLoadLocal").modal();

});


// LOAD LOCAL UPLOAD
jQuery( "#btnLoadLocal" ).on( "click", function (e) {

   //e.preventDefault();

   console.log ('#btnLoadLocal...');

   var txtFile =  modalLoadLocalBtnPress();
   console.log ('txtFile:' + txtFile);

   if ( txtFile ) {

      txtFile = txtFile.replace(/^.*[\\\/]/, "");
      txtFile = txtFile.replace(".edblocks", "");

      jQuery(".mba-program-title").html(txtFile);
      localStorage.setItem("ebPS", "");
      localStorage.setItem("ebPN", txtFile);

      jQuery("#modalLoadLocal").modal('hide');

      // window.dataLayer.push({
      //    'event': 'analyticsEvent',
      //    'analyticsCategory': 'Program',
      //    'analyticsAction': 'Click',
      //    'analyticsLabel': 'Load Saved - Local',
      //    'analyticsValue': 1
      // });

   }

});



// POP SAVE
jQuery('#navPopLoadSave, #navPopLoadSaveAlt').click(function() {
   jQuery('.modal').modal('hide');
   jQuery("#modalSaveLocal #txtProgramName").val(jQuery(".mba-program-title").text());
   jQuery('#modalSaveLocal').modal();
   jQuery('#modalSaveLocal').on('shown.bs.modal', function () {
      jQuery('#txtProgramName').focus();
   });
});



jQuery('#navNew').click(function() {
   clearBlocks();
   jQuery(".mba-program-title").html('Untitled Program');
   localStorage.setItem("ebPN", 'Untitled Program');
   localStorage.setItem("ebPS", '');
});




// POP DEMO PROGRAM MODAL AND LIST
jQuery('#navPopLoadDemo').click(function() {

   jQuery('.modal').modal('hide');

   var htmlList = '<div class="container h-100">';

   jQuery.each( Blockly.demoProgramsArray, function( key, value ) {

      htmlList = htmlList + '<div class="row align-items-center h-100 divDemoProgramHolder"  data-id="' + key + '" data-name="' + get_program_title (value[0]) + '" >';
      htmlList = htmlList + '<div class="col-7">';
      htmlList = htmlList + '<div class="divDemoProgram"><span class="spanDemoProgramName">' + get_program_title (value[0]) + '</span><span class="spanDemoProgramDesc">' + get_program_description(value[2]) + '</span></div>';
      htmlList = htmlList + '</div>';
      htmlList = htmlList + '<div class="col-5">';
      htmlList = htmlList + '<button type="button" class="btn btn-primary btn-sm btnDemoProgramLoad" >Load program</button>';
      htmlList = htmlList + '</div>';
      htmlList = htmlList + '</div>';

   });

   htmlList = htmlList + '</div>';
   jQuery('#demo-program-list').html(htmlList);

   jQuery('#modalLoadDemo').modal();

});


// GET PROGRAM TITLE FROM ARRAY
function get_program_title (str) {

   if (str === undefined) {
      str = 'Undefined';
   }

   return str;

}

// GET PROGRAM DESCRIPTION FROM ARRAY
function get_program_description (str) {

   var str = str + '';
   var res = str.split(',');
   var res = res[2];

   return str;

}


// LOAD DEMO PROGRAM BY INDEX
jQuery( '#demo-program-list' ).on( 'click', '.spanDemoProgramName, .spanDemoProgramLoad, .btnDemoProgramLoad', function () {

   var demoIndex = jQuery(this).closest('.divDemoProgramHolder').data('id');
   var demoTitle = jQuery(this).closest('.divDemoProgramHolder').data('name');
   loadDemo( demoIndex );
   jQuery('.mba-program-title').html(demoTitle);
   jQuery('.modal').modal('hide');

});




jQuery('#navPopAbout').click(function() {
   jQuery('#modalAbout').modal();
});


// HELP
jQuery('#navPopHelp, #lnkPopHelp').click(function() {
   jQuery('.modal').modal('hide');
   jQuery('#modalHelp').modal();
});


// CONNECTION
jQuery('#navPopHelpConnection').click(function() {
   jQuery('.modal').modal('hide');
   jQuery('#modalConnection').modal();
   findAPI();
});




// PROGRAMMING TYPE
jQuery('#navPopProgrammingMethod').click(function() {

   jQuery('.modal').modal('hide');
   jQuery('#modalProgrammingMethod').modal();

});


// PROGRAMMING TYPE - CHANGE - USB
$('#btnChangeUSBMethod').on("click", function(e) {

   console.log ('btnChangeUSBMethod');
   localStorage.setItem('eb3ProgrammingMedthod', 'USB');

   doUISetup('USB');
   
});


// PROGRAMMING TYPE - CHANGE - FLASH
$('#btnChangeFlashMethod').on("click", function(e) {

   console.log ('btnChangeFlashMethod');
   localStorage.setItem('eb3ProgrammingMedthod', 'FLASH');

   doUISetup('FLASH');

});





// HUB STATUS
jQuery('#navPopHelpGetStatus').click(function() {

   jQuery('.modal').modal('hide');
   jQuery('#modalStatus').modal();

   jQuery("#hubStatusConnectionStatus").html("not connected");

   jQuery("#hubStatusFirmwareVersion").html("");
   jQuery("#hubStatusFirmwareVersionHolder").hide();

   // jQuery("#hubStatusUniqueID").html("");
   // jQuery("#hubStatusUniqueIDHolder").hide();

   if ( webUSBIsConnected ()) {
      // alert('alreday connected...');
   }

});

// HUB STATUS - CLOSE
jQuery('#modalStatus').on('hidden.bs.modal', function (e) {

   jQuery('#hubStatusConnectionStatus').html('not connected');
   jQuery('#hubStatusConnectionStatus').removeClass('isConnected');
   jQuery('#hubStatusConnectionStatus').addClass('notConnected');
   jQuery('#hubStatusFirmwareVersion').html('');
   jQuery('#hubStatusFirmwareVersionHolder').hide();

   // jQuery('#hubStatusUniqueID').html('');
   // jQuery('#hubStatusUniqueIDHolder').hide();

})


// HUB STATUS - CONNECTION
jQuery("#btnStatusHubConnect").on("click", async function(e) {

   OpenConnectionForm();
   // await webUSBEnsureConnected();

   // var strFirmwareVersion;
   // // var strUniqueID;

   // console.log ( webUSBIsConnected() );

   // if ( webUSBIsConnected() ) {

   //    jQuery("#hubStatusConnectionStatus").html("connected");
   //    jQuery("#hubStatusConnectionStatus").addClass( "isConnected" );
   //    jQuery("#hubStatusConnectionStatus").removeClass( "notConnected" );

   //    strFirmwareVersion = await getEV3FirmwareVersion();

   //    console.log ( strFirmwareVersion );

   //    let variant_str = "?";
   //    if (strFirmwareVersion[0] == EV3_VARIANT_CODE_BOOTLOADER) {
   //       variant_str = "bootloader mode";
   //    } else if (strFirmwareVersion[0] == EV3_VARIANT_CODE_APPLICATION_FACTORY) {
   //       variant_str = "factory application mode";
   //    } else if (strFirmwareVersion[0] == EV3_VARIANT_CODE_APPLICATION_USER) {
   //       variant_str = "user application mode";
   //    }

   //    var strHTML = variant_str + '<br>' + 'firmware = ' + strFirmwareVersion[2] + '<br>' + 'boot = ' + strFirmwareVersion[1];

	// 	strHTML += '<br></br>';

	// 	var blnUpdateAvailable = false;

	// 	if ( updateFirmwareVersion != strFirmwareVersion[2] ) {
	// 		strHTML += 'A firmware update (' + updateFirmwareVersion + ') is available.<br>';
	// 		blnUpdateAvailable = true;
	// 	}

	// 	if ( updateBootloaderVersion != strFirmwareVersion[1] ) {
	// 		strHTML += 'A boot update (' + updateBootloaderVersion + ') is available.<br>';
	// 		blnUpdateAvailable = true;
	// 	}

	// 	if ( blnUpdateAvailable ) {
	// 		strHTML += '<div style="padding-top:10px;"><button  id="btnPopFirmwareUpdate" type="button" class="btn btn-primary btn-sm">Update Firmware</button></div>';
	// 	} else {
	// 		strHTML += 'Your Edison is up to date.';
	// 	}
 
   //    jQuery("#hubStatusFirmwareVersion").html( strHTML );
   //    jQuery("#hubStatusFirmwareVersionHolder").fadeIn(500);


   // }

});






// CONNECTION - REFRESH
jQuery("#apiStatusRefresh").on("click", function(e) {
   findAPI();
});



function findAPI() {

   jQuery("#apiStatusOutput").html( "" );
   jQuery("<div id='divServerResult'></span>Server: <span id='spanServerResultLocation'></span></div>").hide().appendTo("#apiStatusOutput").fadeIn(500);
   jQuery("#spanServerResultLocation").Loadingdotdotdot({
      "speed": 150,
      "maxDots": 3,
      "word": "searching"
   });

   jQuery.ajax({
      url: apiBaseURL,
      type: "post",
      dataType: "html",
      success: function (data) {
         setTimeout(
            function() {
               jQuery("#spanServerResultLocation").Loadingdotdotdot("Stop");
               jQuery( "#spanServerResultLocation" ).addClass("spanServerResultLocationSuccess");
               jQuery("#spanServerResultLocation").html(data);
               setTimeout(
                  function() {
                     testAPI();
                  }, 1000);
               }, 1000);
      },
      error: function (data) {
         jQuery("#spanServerResultLocation").Loadingdotdotdot("Stop");
         jQuery( "#spanServerResultLocation" ).addClass("spanServerResultLocationError");
         jQuery("#spanServerResultLocation").html("NO SERVER FOUND");
      }
   });
}


function testAPI() {

   var mbc = [

      '#-------------Setup----------------',
      'import Ed',
      'Ed.EdisonVersion = Ed.V3',
      'Ed.DistanceUnits = Ed.CM',
      'Ed.Tempo = Ed.TEMPO_MEDIUM',
      '#--------Your code below-----------',
      '# Test 11: Beep',
      'Ed.PlayBeep()',
      'Ed.TimeWait(1000, Ed.TIME_MILLISECONDS)',
      ''

   ].join('\n');

   jQuery("<div id='divCompileResult'></span>Compile Test: <span id='spanCompileResultDetails'></span></div>").hide().appendTo("#apiStatusOutput").fadeIn(500);

   jQuery("#spanCompileResultDetails").Loadingdotdotdot({
      "speed": 150,
      "maxDots": 3,
      "word": "working"
   });

   var timeStart = new Date().getTime();
   var timeEnd = 0;
   var timeTotal =  0;

   var request = new XMLHttpRequest();

   request.onload = function(e) {

      try {

         var response = JSON.parse(this.responseText);

         console.log (response);

         if (response.error) {

            jQuery("#spanCompileResultDetails").Loadingdotdotdot("Stop");
            jQuery( "#spanCompileResultDetails" ).addClass("spanServerResultLocationError");
            jQuery("#spanCompileResultDetails").html("compile error<br>");
            jQuery("#spanCompileResultDetails").append(this.responseText);


         } else {

            timeEnd = new Date().getTime();
            timeTotal = timeEnd - timeStart;
            jQuery("#spanCompileResultDetails").Loadingdotdotdot("Stop");
            jQuery( "#spanCompileResultDetails" ).addClass("spanServerResultLocationSuccess");
            jQuery("#spanCompileResultDetails").html("compile complete in " + timeTotal + "ms");

         }

      } catch(e) {

         console.log ('in catch...');
         console.log (e);

         jQuery("#spanCompileResultDetails").Loadingdotdotdot("Stop");
         jQuery( "#spanCompileResultDetails" ).addClass("spanServerResultLocationError");
         jQuery("#spanCompileResultDetails").html("compile error<br>");
         jQuery("#spanCompileResultDetails").append(this.responseText);

      }
   };

   request.onerror = function() {

      jQuery("#spanCompileResultDetails").Loadingdotdotdot("Stop");
      jQuery( "#spanCompileResultDetails" ).addClass("spanServerResultLocationError");
      jQuery("#spanCompileResultDetails").html("compile error<br>");
      jQuery("#spanCompileResultDetails").append(this.responseText);

   };

   // var gaClientId = '';
   //var ga = window[window['GoogleAnalyticsObject'] || 'ga'];
   //if (ga) {
   //   ga(function() {
   //      gaClientId = ga.getAll()[0].get('clientId');
   //      console.log (gaClientId);
   //   });
   //}

   //request.open("POST", testURL + "ie/compile?v=1&mcid=" + gaClientId, true);
   // request.open("POST", apiBaseURL + "ep/compile/usb", true);
   // request.send(mbc);

   var urlAPI = '';
   urlAPI = apiBaseURL + 'ep/compile/usb';    
	if (strCompiler) {
		urlAPI = urlAPI + '?strCompiler=' + strCompiler;
	}

   request.open("POST", urlAPI, true);
   // request.open("POST", apiBaseURL + "ep/compile/usb", true);

   request.send(mbc);


}



function fileNameClean(strInFileName) {
   var strProgramName = strInFileName.replace(/(<([^>]+)>)/ig,"");
   strProgramName = strProgramName.trim();
   strProgramName = strProgramName.replace(/^\.+/g, '');
   return strProgramName;
}


function fileNameIsValid (strFN) {
   var strReturn = null;
    strFN = strFN.trim();
   if (strFN == "" ) {
        strReturn = "Please enter a name for your program. You need to name the program in order to save it.";
   } else if (strFN.length > 254) {
      strReturn = "Whoops. There's a problem with that program name. Program names can be a maximum of 255 characters long.";
   }
   return strReturn;
}



function nameDisplayMessage (displayDiv, displayMessage, displayType, displayBehaviour) {

   jQuery(displayDiv).hide();
   jQuery(displayDiv).html(displayMessage);
   jQuery(displayDiv).removeClass( "alert-warning alert-success" ).addClass( displayType );
    jQuery(displayDiv).slideDown(200);
   if (displayBehaviour == 'hide') {
      setTimeout(function() {
         jQuery(displayDiv).slideUp(200)
      }, 3000);
   }
}


jQuery('#modalSaveLocal').on('hidden.bs.modal', function (e) {

   jQuery('#modalSaveLocal #divProgramNameMessageLocal').hide();
   saveToStorage();

})





function toggleDropdown (e) {
   const _d = jQuery(e.target).closest('.dropdown'),
   _m = jQuery('.dropdown-menu', _d);
   setTimeout(function() {
      const shouldOpen = e.type !== 'click' && _d.is(':hover');
      _m.toggleClass('show', shouldOpen);
      _d.toggleClass('show', shouldOpen);
      jQuery('[data-toggle="dropdown"]', _d).attr('aria-expanded', shouldOpen);
   }, e.type === 'mouseleave' ? 300 : 0);
}
jQuery('body').on('mouseenter mouseleave','.dropdown',toggleDropdown).on('click', '.dropdown-menu a', toggleDropdown);


jQuery('.modal.draggable>.modal-dialog').draggable({
    cursor: 'move',
    handle: '.modal-header'
});
jQuery('.modal.draggable>.modal-dialog>.modal-content>.modal-header').css('cursor', 'move');


function programOutput (strIn, strMode, strType) {

   if (strMode == 'clear') {
      jQuery('#divProgrammingMessage').html('');
   }

   var strOut = '<div class="' + strType + '">' + strIn + '</div>';

   jQuery(strOut).hide().appendTo("#divProgrammingMessage").fadeIn(1000);

   jQuery(strOut).Loadingdotdotdot({
      'speed': 150,
      'maxDots': 3,
      'word': strOut
   });

   setTimeout(function () {

      jQuery(strOut).Loadingdotdotdot("Stop");

   }, 5000);

   //console.log( strOut );
   //jQuery("<div id='divServerResult'></span>Server: <span id='spanServerResultLocation'></span></div>").hide().appendTo("#apiStatusOutput").fadeIn(500);
   //.appendTo("#apiStatusOutput").fadeIn(500)

}


// CLOSE PROGRAM MODAL
jQuery("#modalProgramming").on("hidden.bs.modal", function (e) {
   programOutput('','clear','');
})






// FIRMWARE
// ----------------------------------------------------------

// POP FIRMWARE UPDATE MODAL
jQuery("#navPopFirmwareUpdate").on("click", function(e) {

   jQuery('.modal').modal('hide');
   fuButtonStatus("start");
   jQuery('#modalFirmwareUpdate').modal();

});

jQuery(document).on('click', '#btnPopFirmwareUpdate', function() {

   jQuery('.modal').modal('hide');
   fuButtonStatus("start");
   jQuery('#modalFirmwareUpdate').modal();
		
});






// CLOSE FIRMWARE UPDATE MODAL
jQuery("#modalFirmwareUpdate").on("hidden.bs.modal", function (e) {

   fuFeebackCardClear();
   // fuButtonStatus("start");

});

// RUN FIRMWARE UPDATE
jQuery('#btnFUHubConnect').click(function() {

   prepareEdisonAndSendFirmware();

});


// RE-RUN FIRMWARE UPDATE
jQuery('#btnFUHubReconnect').click(function() {

   prepareEdisonAndSendFirmware();

});

function fuFeebackCardPrepend( strLineEntry, strType ) {

   jQuery('#fuStatusHolder div.card-body').prepend( '<div class="card-body-line card-body-line-' + strType + '">' + strLineEntry + '</div>' );
   jQuery('#fuStatusHolder div.card-body div.card-body-line').css('opacity', '0.6');
   jQuery('div.card-body div.card-body-line:first-of-type').css('opacity', '1');

}


function fuFeebackCardAppend( strLineEntry, strType ) {

   jQuery('#fuStatusHolder div.card-body').append( '<div class="card-body-line card-body-line-' + strType + '">' + strLineEntry + '</div>' );
   jQuery('#fuStatusHolder div.card-body div.card-body-line').css('opacity', '0.6');
   jQuery('div.card-body div.card-body-line:last-of-type').css('opacity', '1');

}

function fuFeebackCardClear() {
   jQuery( "#fuStatusHolder div.card-body" ).html("");
}

function fuButtonStatus(strStatus) {

   console.log('fuButtonStatus:' + strStatus);

   var arrIconClasses = [ 'rotate', 'oi-chevron-right', 'oi-cog', 'oi-check' ];

   switch(strStatus) {

      case "start":

         fuFeebackCardClear();
         fuFeebackCardAppend('Ready...', 'prompt');

         jQuery("#btnFUHubConnect").show();
         jQuery("#btnFUHubConnect").prop("disabled", false);
         // jQuery("#btnFUHubConnect span.oi").removeClass(arrIconClasses).addClass("oi-chevron-right");
         jQuery("#btnFUHubConnect span.oi").removeClass(arrIconClasses).addClass("oi-chevron-right");

         // jQuery("#btnFUHubReconnect").prop("disabled", true);
         jQuery("#btnFUHubReconnect").hide();
         //jQuery("#btnFUHubReconnect span.oi").removeClass(arrIconClasses).addClass("oi-chevron-right");
         jQuery("#btnFUHubReconnect span.oi").removeClass(arrIconClasses).addClass("oi-chevron-right");

         break;

      // case "connecting":
      //    jQuery("#btnFUHubConnect").prop("disabled", true);
      //    jQuery("#btnFUHubConnect span.oi").removeClass(arrIconClasses).addClass("oi-cog").addClass("rotate");
      //    jQuery("#btnFUDownload").prop("disabled", true);
      //    jQuery("#btnFUHubReconnect").prop("disabled", true);
      //    break;

      // case "connecting-done":
      //    jQuery("#btnFUHubConnect").prop("disabled", true);
      //    jQuery("#btnFUHubConnect").addClass("btn-success");
      //    jQuery("#btnFUHubConnect span.oi").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUDownload").prop("disabled", false);
      //    jQuery("#btnFUHubReconnect").prop("disabled", true);
      //    break;

      // case "downloading":
      //    jQuery("#btnFUHubConnect").prop("disabled", true);
      //    jQuery("#btnFUHubConnect span.oi").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUHubConnect").addClass("btn-success");
      //    jQuery("#btnFUDownload span.oi").removeClass(arrIconClasses).addClass("oi-cog").addClass("rotate");
      //    jQuery("#btnFUDownload span.downloadStatus").html("Downloading...");
      //    jQuery("#btnFUDownload").prop("disabled", true);
      //    jQuery("#btnFUHubReconnect").prop("disabled", true);
      //    break;

      // case "downloading-done":
      //    jQuery("#btnFUHubConnect").prop("disabled", true);
      //    jQuery("#btnFUHubConnect span.oi").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUHubConnect").addClass("btn-success");
      //    jQuery("#btnFUDownload").prop("disabled", true);
      //    jQuery("#btnFUDownload span.oi").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUDownload span.downloadStatus").html("Downloaded");
      //    jQuery("#btnFUDownload").addClass("btn-success");
      //    jQuery("#btnFUHubReconnect").prop("disabled", false);
      //    break;

      // case "reconnecting":
      //    jQuery("#btnFUHubConnect").prop("disabled", true);
      //    jQuery("#btnFUHubConnect span.oi").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUHubConnect").addClass("btn-success");
      //    jQuery("#btnFUDownload").prop("disabled", true);
      //    jQuery("#btnFUDownload span.oi").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUDownload").addClass("btn-success");
      //    jQuery("#btnFUHubReconnect span.oi").removeClass(arrIconClasses).addClass("oi-cog").addClass("rotate");
      //    jQuery("#btnFUHubReconnect").prop("disabled", false);
      //    break;

      // case "reconnecting-done":
      //    jQuery("#btnFUHubConnect").prop("disabled", true);
      //    jQuery("#btnFUHubConnect span.oi").removeClass("rotate").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUHubConnect").addClass("btn-success");
      //    jQuery("#btnFUDownload").prop("disabled", true);
      //    jQuery("#btnFUDownload span.oi").removeClass("rotate").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUDownload").addClass("btn-success");
      //    jQuery("#btnFUHubReconnect span.oi").removeClass(arrIconClasses).addClass("oi-check");
      //    jQuery("#btnFUHubReconnect").prop("disabled", true);
      //    jQuery("#btnFUHubReconnect").addClass("btn-success");
      //    break;

      default:
         // code block

   }

}





// CHECK UID
async function checkUID( uid ) {

   // // console.log('checkUID...');
   // // console.log('uid: ' + uid);

   // const data = {
   //    act: 'check',
   //    uid: uid,
   //    nce: 'KGUs^986itugk)'
   // }

   // // console.log(data);

   // jQuery.ajax({
   //    url: "_ute.php",
   //    type: "post",
   //    data: data,
   //    success: function (response) {
   //       console.log (response);
   //    },
   //    error: function (response) {
   //       console.log (response);
   //    }
   // });

}


// LOG COMPILE
async  function logUsageData( uid, bl, fw, ud ) {

	console.log('logUsageData...');
	console.log( ud );
	console.log('uid: ' + uid);

	const data = {
		act: 'log',
		uid: uid,
		bl: bl,
		fw: fw,
		ud: JSON.stringify(ud), // Convert ud to a JSON string
		note: '',
		nce: 'KGUIFToilygkui8(*^986itugk)'
	};
	
	jQuery.ajax({
		url: "_ute.php",
		type: "POST",
		data: data,
		success: function (response) {
			console.log(response);
			sessionStorage.setItem('ep3SentData', 'true');
		},
		error: function (response) {
			console.log(response);
		}
	});


}



function doUISetup ( layout ) {

   console.log ( 'doUISetup: ' + layout );

   if ( layout == 'FLASH' ) {

      navFlash.style.display = 'block';
      navUSB.style.display = 'none';

      // navPopUSB.style.display = 'none';
      navPopFirmwareUpdate.style.display = 'none';
      divFirmwareCheck.style.display = 'none';

   } 
   
   if ( layout == 'USB' ) {

      navFlash.style.display = 'none';
      navUSB.style.display = 'block';

      // navPopUSB.style.display = 'block';
      navPopFirmwareUpdate.style.display = 'block';
      divFirmwareCheck.style.display = 'block';

   }

   //var strOut = '<div>Detected environment: ' + pgwBrowserGroup + ' running on ' + pgwOSGroup + '</div><div><br>Currently using <strong>' + layout + '</strong> type.</div>';
   var strOut = '<div>Currently using <strong>' + layout + '</strong> method.</div>';
   $('#programmingMethodLabel').empty();   
   $('#programmingMethodLabel').html( strOut ).hide().fadeIn();   

}

function ConnectedSerialPort()
{
  isConnected = true;
  connectionType = "Serial";
//   $("#btConnect").removeClass("notConnectedButton");
//   $("#btConnect").addClass("connectedButton");

//   showModalDialog(SerialPortSuccessText, "success");
}

function DisconnectedSerialPort()
{
  isConnected = false;
//   $("#btConnect").removeClass("connectedButton");
//   $("#btConnect").addClass("notConnectedButton");
}

async function sendCommand(pythoncode)
{
  try
  {
   //  await enter_row_repl();
 
   //  await exec_raw_no_follow(pythoncode);
    
   //  await writeSerial("02");
    
   //  hideProgressPanel();
  }
  catch(err)
  {
    console.log("Error: " + err.message)
  }
}

