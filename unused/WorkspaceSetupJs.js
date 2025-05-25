// 'use strict';
// var startCode = false;
// var fakeDragStack = [];
// var workspace = null;

// // function start() {
// //   // var soundsEnabled = null;
// //   // if (sessionStorage) {
// //   //   // Restore sounds state.
// //   //   soundsEnabled = sessionStorage.getItem('soundsEnabled');
// //   //   if (soundsEnabled === null) {
// //   //     soundsEnabled = true;
// //   //   } else {
// //   //     soundsEnabled = (soundsEnabled === 'true');
// //   //   }
// //   // } else {
// //   //   soundsEnabled = true;
// //   // }
// //   // setSoundsEnabled(soundsEnabled);

// //   // Setup blocks
// //   // Parse the URL arguments.
// //   var match = location.search.match(/dir=([^&]+)/);
// //   var rtl = match && match[1] == 'rtl';
// //   //document.forms.options.elements.dir.selectedIndex = Number(rtl);
// //   // var toolbox = getToolboxElement();
// //   //document.forms.options.elements.toolbox.selectedIndex =
// //     //toolbox ? 1: 0;

// //   //match = location.search.match(/side=([^&]+)/);

// // //  var side = match ? match[1] : 'start';

// //   //document.forms.options.elements.side.value = side;
// //   var availWidth = window.screen.availWidth;
// //   var myStartScale = 1 + ((availWidth - 1000) / 300) * 0.1;

// //   var height = innerHeight * 0.9;

// //   // $("#appContent").height(height);
// //   // $("#blocklyDiv").height("100%");

// //   var toolbox = document.getElementById("toolbox");
// //   workspace = Blockly.inject('blocklyDiv', {
// //     comments: true,
// //     disable: true,
// //     collapse: false,
// //     media: 'media/',
// //     readOnly: false,
// //     // scrollbars: false,  
// //     // toolbox: false,
// //     trashcan: true,
// //     horizontalLayout: true,
// //     oneBasedIndex : true,  
// //     maxBlocks: 2,
// //     css : true, 
// //     toolboxPosition: 'end',  
// //     // rtl: rtl,
// //     //horizontalLayout: side == 'top' || side == 'bottom',
// //     //toolboxPosition: side == 'top' || side == 'start' ? 'start' : 'end',
// //     toolbox: toolbox,
// //     toolboxOptions: {
// //       color: true,
// //       inverted: true
// //     },
// //     maxInstances: {
// //       new_event_start: 1
// //     },
// //     sounds: soundsEnabled,
// //     move: {
// //       scrollbars: true,
// //       drag: true,
// //       wheel: true,
// //     },
// //     zoom: {
// //       controls: true,
// //       wheel: true,
// //       startScale: myStartScale,
// //       maxScale: 4,
// //       minScale: 0.75,
// //       scaleSpeed: 1.1
// //     },
// //     colours: {
// //       fieldShadow: 'rgba(255, 255, 255, 0.3)',
// //       dragShadowOpacity: 0.6
// //       // workspace: '#e5e5e5',
// //       // flyout: '#F2f2f2',
// //       // scrollbar: '#bbbbbb',
// //       // scrollbarHover: '#0C111A',
// //       // insertionMarker: '#FFFFFF',
// //       // insertionMarkerOpacity: 0.3,
// //       // fieldShadow: 'rgba(255, 255, 255, 0.3)',
// //       // dragShadowOpacity: 0.6
// //     },
// //     scrollbars: {
// //       horizontal: false,
// //       vertical: true,
// //     },
// //     grid:
// //     {
// //         spacing: 20,
// //         length: 2,
// //         colour: '#ccc',
// //         snap: true
// //     },
// //   });

// //   // workspace.addChangeListener(change);
// //   let startCode = '<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="new_event_start" maxInstances="1" id="}^Xg:jW-h7O?ksLFb:ke" x="290" y="270" deletable="false"></block></xml>';
// //   var dom = Blockly.Xml.textToDom(startCode);
// //   Blockly.Xml.domToWorkspace(workspace, dom);

// //   // workspace.registerToolboxCategoryCallback('EVENTSFLYOUT', Blockly.EventsFlyOut.flyoutCategory);
// //   // workspace.registerToolboxCategoryCallback('DRIVEFLYOUT', Blockly.DriveFlyOut.flyoutCategory);
// //   // workspace.registerToolboxCategoryCallback('WAITFLYOUT', Blockly.WaitFlyOut.flyoutCategory);
// //   // workspace.registerToolboxCategoryCallback('CONTROLFLYOUT', Blockly.ControlFlyOut.flyoutCategory);

// //   // workspace.toolbox_.refreshSelection();
// //   // workspace.addChangeListener(checkErrors);
// //   // workspace.addChangeListener(checkStart);


// //   if (sessionStorage) {
// //     // Restore previously displayed text.
// //     var text = sessionStorage.getItem('textarea');
// //     if (text) {
// //       document.getElementById('importExport').value = text;
// //     }
// //     taChange();

// //     // Restore event logging state.
// //     var state = sessionStorage.getItem('logEvents');
// //     //logEvents(Boolean(state));

// //     // Restore flyout event logging state.
// //     state = sessionStorage.getItem('logFlyoutEvents');
// //     //logFlyoutEvents(Boolean(state));
// //   }
// //   //Blockly['python']= new Blockly.Generator('Python');
// //   // clearBlocks();
// //   // setDataBox("USBbox");
// // }



// // function checkStart(event){
// //   if (event.type === Blockly.Events.BLOCK_CREATE) {
// //     var new_block = workspace.getBlockById(event.blockId);
// //     const existingBlocks = workspace.getAllBlocks();
// //     if (existingBlocks.length > 1) {
// //       for (var c = 0; c < existingBlocks.length; c++){
// //         if(existingBlocks[c].type == new_block.type){
// //           Blockly.getMainWorkspace().getBlockById(event.blockId).dispose();
// //           // alert("Only one 'Start' block is allowed!");
// //         }
// //       }
// //     }
// //   }
// // }
// // function change(event) {
// //   var output = document.getElementById('importExport');
// //   var xmlDom = Blockly.Xml.workspaceToDom(workspace);
// //   xmlText = Blockly.Xml.domToText(xmlDom);

// //   if(event.type == "ui")
// //   {
// //     var id = event.blockId;

// //     var block = workspace.getBlockById(event.blockId);
    
// //     if (block != null && block.type == "event_whenplayclicked") {
// //       // Bloğun üzerine tıklandığında yapılacak işlemler buraya gelecek
// //       RunCode();
// //     }

// //     if(id != null && workspace.getBlockById(id) != null)
// //     {
// //       var block = workspace.getBlockById(id);

// //       if(block.childBlocks_ != null && block.type == "event_whenplayclicked")
// //       {
// //           StartBlockId = id;
// //       }
// //     }
// //   }
// //   else
// //   {
// //     var id = StartBlockId;

// //     if(id == null || id == "")
// //     {
// //       id = ottoStartclickedID(xmlText);
// //     }

// //     if(id != null && workspace.getBlockById(id) != null)
// //     {
// //       var block = workspace.getBlockById(id);

// //       if(block.childBlocks_ != null && block.type == "event_whenplayclicked")
// //       {
// //           startCode = Blockly.Python.blockToCode(block.childBlocks_[0]);
// //       }
// //     }
// //   }

// //   if (startXmlText != xmlText) {
// //       latestCode = Blockly.Python.workspaceToCode(workspace);
// //   }
// // }

// // function checkErrors(event){
// //   //if(event.type == Blockly.Events.CREATE){
// //     var topBlocks = workspace.getTopBlocks();

// //     var startPlace=[];
// //     for (var j = 0; j < topBlocks.length; j++){
// //      if (topBlocks[j].type == "new_event_start"){
// //        //console.log("found start");
// //        startPlace.push(j);
// //      }

// //     }
// //     //console.log(startPlace);
// //     if(startPlace.length>1){
// //       var numStarts = startPlace.length;
// //       //console.log("too many starts");
// //       for (var i = 0; i < startPlace.length; i++){
// //         var startBlock = topBlocks[startPlace[i]];
// //         var nextBlock = startBlock.getNextBlock();
// //       	if (nextBlock == null){
// //       			//an empty start check if its the only one left
// //             if(numStarts>1){
// //               //there are many starts still, remove this
// //               startBlock.setDeletable(true);
// //               startBlock.dispose();
// //               numStarts--;
// //             }


// //       		}
// //       }
// //     }

// //   //}
// // }


// // function clearBlocks() {
// //   deleteWorkspace();
// //   var initHeight = workspace.cachedParentSvg_.cachedHeight_;
// //   initHeight= initHeight/1.5; //adjust for scaling
// //   initHeight= initHeight/3; //move start down the screen
// //   var xml_text='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="new_event_start" maxInstances="1" id="vPEah;f,5Vq@@LR1BgJI" x="18" y="'+150+'" deletable="false" movable="false"></block></xml>'
// // 		var xml = Blockly.Xml.textToDom(xml_text);
// //     //console.log(xml);
// // 		Blockly.Xml.domToWorkspace(xml, workspace);
// //     workspace.clearUndo();
// //     workspace.toolbox_.clearSelection();

// // }

// // function deleteWorkspace(){
// //   workspace.clear();
// //   Blockly.mainWorkspace.clear();
// // }

// // function getToolboxElement() {
// //   var match = location.search.match(/toolbox=([^&]+)/);
// //   return document.getElementById('toolbox-' + (match ? match[1] : 'categories'));
// // }

// // function toXml() {
// //   var output = document.getElementById('importExport');
// //   var xml = Blockly.Xml.workspaceToDom(workspace);
// //   output.value = Blockly.Xml.domToPrettyText(xml);
// //   output.focus();
// //   output.select();
// //   taChange();
// // }

// // function fromXml() {
// //   var input = document.getElementById('importExport');
// //   var xml = Blockly.Xml.textToDom(input.value);
// //   Blockly.Xml.domToWorkspace(workspace, xml);
// //   taChange();
// // }

// // function toPython(){
// //       var output = document.getElementById('importExport');
// //       //output.value = Blockly['python'].workspaceToCode(workspace);
// //       output.value = Blockly.Python.workspaceToCode(workspace);
// // }

// // function pythontoAPI(){
// //   var pythonOfBlocks = Blockly.Python.workspaceToCode(workspace);
// //   console.log(pythonOfBlocks);
// //   APIcall(pythonOfBlocks);
// // }

// // async function compileAndSendUserCode(){
// //   await webUSBEnsureConnected();
// //   var version = await getEV3FirmwareVersion();
// //   //if (version[0] != EV3_VARIANT_CODE_BOOTLOADER && (version[2].startsWith("v0.1.0") || version[2].startsWith("v0.2.0") || version[1].startsWith("v0.3.0"))) {
// //   if (version[0] != EV3_VARIANT_CODE_BOOTLOADER ) {
// //       //correct version
// //       pythontoAPI();
// //       //console.log(compiledCode);

// //   } else {

// //       // alert("fimrware version error");
// //       programOutput('Lorem: fimrware version error', 'append', 'error');
// //       jQuery('#modalProgramming').modal();

// //   }
// // }


// // async function compileAndSendUserCode() {

// //   await webUSBEnsureConnected();

// //   var version = await getEV3FirmwareVersion();
// //   if (version[0] != EV3_VARIANT_CODE_BOOTLOADER ) {

// //     //correct version
// //     if ( version[2].startsWith(updateFirmwareVersion)) {
// //       //stop a current program if there is one
// //       await webUSBCommandStopUserProgram();
// //       pythontoAPI();
// //       // console.log(compiledCode);

// //     } else {

// //       // incorrent fimrware version error - link to modal

// //       if (!version[1].startsWith(updateBootloaderVersion)) {

// //         // bootLoader error
// //         console.log("bootLoader out of date, need to link to FW modal...");

// //         var strUpdateRequired = '<p>To program your Kuki you will need to update the firmware to the latest version: '  + updateFirmwareVersion + '.</p><button type="button" onclick="gotoFirmwareUpdate();" class="btn btn-primary btn-sm">Update firmware</button>';

// //         programOutput( strUpdateRequired, 'clear', 'info' );
// //         jQuery('#modalProgramming').modal();

// //       } else {

// //         //just the firmware is Incorrect, tell the user and start a download
// //         console.log("Firmware needs to be updated, updating now");
// //         programOutput( 'Firmware updated required. Updating now...', 'append', 'info' );
// //         //stop a current program if there is one
// //         await webUSBCommandStopUserProgram();
// //         //Set Kuki to boot
// //         await webUSBCommandReset(1);

// //         //download firmware file
// //         var firmware;

// //         getFileFromServer(urlUpdateFirmware).then(async fileContent => {

// //           if (fileContent) {

// //             console.log('Firmware downloaded.');

// //             firmware = new Uint8Array( fileContent );
// //             console.log(firmware);

// //             console.log('starting firmware download');

// //             if (await programEV3Firmware(firmware, true)) {
// //               // Switch back to application.
// //               await webUSBCommandReset(1);
// //             }

// //             console.log('firmware download complete, downloading program');
// //             programOutput( 'Firmware updated.', 'append', 'info' );
// //             pythontoAPI();

// //           } else {

// //             console.log('Failed to download file.');

// //           }
// //         });
// //       }
// //     }

// //   } else {

// //     programOutput('<p>To program your Kuki you will need to update the firmware to the latest version: '  + updateFirmwareVersion + '.</p><button type="button" onclick="gotoFirmwareUpdate();" class="btn btn-primary btn-sm">Update firmware</button>', 'clear', 'info' );

// //     jQuery('#modalProgramming').modal();

// //     programOutput('Incomplete firmware update.', 'clear', 'error' );
// //     jQuery('#modalProgramming').modal();

// //   }

// // }



// function saveToText(){
//   var code = getBlocksForDownload();
//   var output = document.getElementById('importExport');
//   //output.value = Blockly['python'].workspaceToCode(workspace);
//   output.value = code;
// }


// function APIcall(pythonCode) {

//   jQuery('.modal').modal('hide');
//   jQuery('#modalProgramming').modal();

//   var URL = "https://api.Kukirobotics.net/ep/compile/usb";
//   console.log(URL);

//   var request = new XMLHttpRequest();

//   request.onload = function(e) {
//     try {

//       var response = JSON.parse(this.responseText);

//       if (response.error == false) {

//         console.log(response);
//         var hexString = response.hex;
//         console.log(hexString);
//         //var userProgString = hexString.substring(122880);
//         var sendData = processAPIHexString(hexString);
//         //sendProgramViaUSB(userProgData);
//         //return sendData;
//         webUSBCommandPutUserProgram(sendData);

//         programOutput('OK! The program has loaded to your Kuki.', 'append', 'success');

//         setTimeout( function() {
//           jQuery('#modalProgramming').modal('hide');
//         }, 3000);


//       } else {

//         // alert("fail");
//         // alert(response.message);

//         programOutput( response.message, 'clear', 'error' );
//         jQuery('#modalProgramming').modal();

//       }
//     } catch(e) {

//       programOutput( "Response is not JSON!", 'clear', 'error' );
//       jQuery('#modalProgramming').modal();

//       console.log("Response is not JSON!");
//       console.log(e);
//       console.log(this.responseText);
//     }
//   };

//   request.onerror = function() {

//     programOutput( "Unknown Error!", 'clear', 'error' );
//     jQuery('#modalProgramming').modal();

//     console.log("Unknown Error!");
//     console.log(this.responseText);

//   };



//   var urlAPI = '';
//   urlAPI = apiBaseURL + 'ep/compile/usb';	
//   if (strCompiler) {
//     urlAPI = urlAPI + '?strCompiler=' + strCompiler;
//   }

//   request.open("POST", urlAPI, true);
//   // request.open("POST", apiBaseURL + "ep/compile/usb", true);

//   request.send(pythonCode);


// }


// function processAPIHexString(inputHexStr) {
//   var progSize = inputHexStr.length/2;
//   var userProgData = new Uint8Array(progSize);
//   var i,j;
//   j=0;
//   //console.log("here");
//   for ( i = 0; i < inputHexStr.length; i=i+2) {
//       var numString = "0x"+inputHexStr.substring(i,i+2);
//       //console.log("numString");
//       var numData = parseInt(numString);
//       userProgData[j] = numData;
//       j++;
//   }
//   console.log(userProgData);
//   if(progSize>2048) {

//     // alert("CODE TO BIG");
//     programOutput('Lorem: CODE TO BIG', 'append', 'error');

//     jQuery('#modalProgramming').modal();

//     return;

//   }
//   return userProgData;
// }

// // Disable the "Import from XML" button if the XML is invalid.
// // Preserve text between page reloads.
// function taChange() {
//   var textarea = document.getElementById('importExport');
//   if (sessionStorage) {
//     sessionStorage.setItem('textarea', textarea.value);
//   }
//   var valid = true;
//   try {
//     Blockly.Xml.textToDom(textarea.value);
//   } catch (e) {
//     valid = false;
//   }
//   //document.getElementById('import').disabled = !valid;
// }

// function setSoundsEnabled(state) {

// }
// /*function logEvents(state) {
//   var checkbox = document.getElementById('logCheck');
//   checkbox.checked = state;
//   if (sessionStorage) {
//     sessionStorage.setItem('logEvents', state ? 'checked' : '');
//   }
//   if (state) {
//     workspace.addChangeListener(logger);
//   } else {
//     workspace.removeChangeListener(logger);
//   }
// }

// function logFlyoutEvents(state) {
//   var checkbox = document.getElementById('logFlyoutCheck');
//   checkbox.checked = state;
//   if (sessionStorage) {
//     sessionStorage.setItem('logFlyoutEvents', state ? 'checked' : '');
//   }
//   var flyoutWorkspace = (workspace.flyout_) ? workspace.flyout_.workspace_ :
//     workspace.toolbox_.flyout_.workspace_;
//   if (state) {
//     flyoutWorkspace.addChangeListener(logger);
//   } else {
//     flyoutWorkspace.removeChangeListener(logger);
//   }
// }

// function logger(e) {
//   console.log(e);
// }

// function glowBlock() {
//   if (Blockly.selected) {
//     workspace.glowBlock(Blockly.selected.id, true);
//   }
// }

// function unglowBlock() {
//   if (Blockly.selected) {
//     workspace.glowBlock(Blockly.selected.id, false);
//   }
// }

// function glowStack() {
//   if (Blockly.selected) {
//     workspace.glowStack(Blockly.selected.id, true);
//   }
// }

// function unglowStack() {
//   if (Blockly.selected) {
//     workspace.glowStack(Blockly.selected.id, false);
//   }
// }

// function sprinkles(n) {
// }

// function spaghetti(n) {
// }

// var spaghettiXml = [
//   '  <block type="control_repeat">',
//   '    <value name="TIMES">',
//   '      <shadow type="math_whole_number">',
//   '        <field name="NUM">10</field>',
//   '      </shadow>',
//   '    </value>',
//   '    <statement name="SUBSTACK"></statement>',
//   '    <next></next>',
//   '  </block>'
// ].join('\n');


// function fakeDrag(id, dx, dy, opt_workspace) {
// };

// function fakeDragWrapper() {
// }

// function fakeManyDrags() {
// }*/



// function loadXml(savedXml) {
//   Blockly.LoadingCode = true;
//   Blockly.mainWorkspace.clear();
//   //need delete here
//   deleteWorkspace();
//   //var input = document.getElementById('importExport');
//   var xml = Blockly.Xml.textToDom(savedXml);
//   Blockly.Xml.domToWorkspace(xml, workspace);
//   workspace.toolbox_.setSelectedItem(workspace.toolbox_.categoryMenu_.categories_[0]);
//   taChange();
// }

// function loadDemo(demoNumber) {
//   if(demoNumber<Blockly.demoProgramsArray.length){
//     console.log("good size")
//     console.log(Blockly.demoProgramsArray[demoNumber][0]);

//     loadXml(b64DecodeUnicode(Blockly.demoProgramsArray[demoNumber][1]));
//     workspace.toolbox_.setSelectedItem(workspace.toolbox_.categoryMenu_.categories_[0]);
//   }
// }
