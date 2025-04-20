"use strict";

function getBlocksForDownload() {
	//var output = document.getElementById('importExport');
	var xml = Blockly.Xml.workspaceToDom(workspace);

	return b64EncodeUnicode(Blockly.Xml.domToPrettyText(xml));

}

function b64EncodeUnicode(str) {
// first we use encodeURIComponent to get percent-encoded UTF-8,
// then we convert the percent encodings into raw bytes which
// can be fed into btoa.
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
		function toSolidBytes(match, p1) {
			return String.fromCharCode('0x' + p1);
	}));
}



function b64DecodeUnicode(str) {
	// Going backwards: from bytestream, to percent-encoding, to original string.
	return decodeURIComponent(atob(str).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
}



function handleFileSelect(evt) {
	
	var files = evt.target.files;

	var Modalerror = document.getElementById("modalLoadLocalWarning");
	var ButtonUpload = document.getElementById("btnLoadLocal");
		
	for (var i = 0, f; f = files[i]; i++) {

	  var reader = new FileReader();

	  reader.onload = (function(theFile) {

		return function(e) {
		var title = theFile.name;
		title = title.split(".");

		if (title[title.length-1]=="edblocks") {

			var noError = true;

			try {
				
				var xml2 = Blockly.Xml.textToDom(b64DecodeUnicode(e.target.result));
				
			} catch(error) {

				Modalerror.innerHTML = "<mark class='alert alert-danger' >Uh-oh. You've uploaded an incorrect file type.<br>Please upload an EdBlocks save file. [All EdBlocks save files are file type (.ees).]</mark>";
				noError = false;
				/*var xml_text='<xml xmlns="http://www.w3.org/1999/xhtml"><variables></variables><block type="event_Start" id="}A_v`14$6amsK;Jm!`00" x="336" y="108" deletable="false" movable="false"></block></xml>'
				var xml = Blockly.Xml.textToDom(xml_text);
				Blockly.Xml.domToWorkspace(xml, workspace);
				workspace.clearUndo();*/
				
				ButtonUpload.disabled = true;

			} finally {

				if (noError) {
					
					ButtonUpload.disabled = false;
					Modalerror.innerHTML = "<mark class='alert alert-success'><strong>Ready to load program:</strong> " + title[0] + "</mark>";
					Blockly.loadDOMhold=xml2;

				} else {

					console.log ( 'Error: file upload issue.' );

				}
			}
			
		} else {

			Modalerror.innerHTML = "<mark class='alert alert-danger' >Uh-oh. You've uploaded an incorrect file type.<br>Please upload an EdBlocks save file. [All EdBlocks save files are file type (.edblocks).]</mark>";			
			ButtonUpload.disabled = true;

		}
		
		
		};
	  })(f);

	  reader.readAsText(f);
	}
}





function modalLoadLocalBtnPress() {
	
	var inputFile = document.getElementById("modalLoadLocalFiles");
	var Modalerror = document.getElementById("modalLoadLocalWarning");
	
	console.log( inputFile );
	
	if(Blockly.loadDOMhold=="") {

		console.log("Please select a file before attempting to load it");
		Modalerror.innerHTML = "<mark class='alert alert-danger' >You haven't selected a file yet. Please first select an EdBlocks save file from your computer, then load the file. [All EdBlocks save files are file type (.edblocks).]</mark>";
		
	} else {
		
		var xmlHold = Blockly.Xml.workspaceToDom(workspace);
		try {

			console.log(Blockly.loadDOMhold);
			Blockly.mainWorkspace.clear();
			Blockly.Xml.domToWorkspace(Blockly.loadDOMhold, workspace);
			workspace.clearUndo();
			return inputFile.value;
			
		} catch(error){

			Modalerror.innerHTML = "<mark class='alert alert-danger' >Uh-oh. There's a problem with the data in that file.<br>Please upload a different EdBlocks save file. [All EdBlocks save files are file type (.edblocks).]</mark>";
			var xml = xmlHold;
			Blockly.Xml.domToWorkspace(xml, workspace);
			workspace.clearUndo();
			
			return false;
			
		}
	}
}

