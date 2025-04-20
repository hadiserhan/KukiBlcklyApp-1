function NewProject()
{
  if(block)
  {
      if(xmlText != undefined)
        showNewProjectConfirm();
  }
  else
  { 
      if(editorPython.getValue() != "")
        showNewProjectConfirm();
  }
}

function showNewProjectConfirm()
{
    Swal.fire({
        //title: "Are you sure?",
        text: ModalNewProjectConfirmDialogText,
        icon: "info",
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText:CancelText,
        confirmButtonText:YesText,
        dangerMode: false,
    }).then((result) => {
        if (result.isConfirmed) {
            NewProjectConfirm()
        }
    });
}

function NewProjectConfirm()
{
  if(block)
  {
      workspace.clear();
      LoadWorkspaceCode(start_block);
        
    //   if(window.localStorage.getItem("Page") == "Vertical")
    //       editorBlockPython.setValue(""); 
  }
  else
  { 
    //   editorPython.setValue(""); 
  }
}

function LoadCode(code)
{
  xmlText = code;
  workspace.clear();
  var dom = Blockly.Xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(workspace, dom);
  
  if(window.localStorage.getItem("Page") == "Vertical")
      loadCode();
}

function loadCode() {
    latestCode = Blockly.Python.workspaceToCode(workspace);
    editorBlockPython.setValue(latestCode);  
}

function SaveProjectConfirm(){
    Swal.fire({
        title: "Save Project",
        input: "text",
        inputLabel: 'Enter file name',
        inputValue: 'Untitled Program',
        showCancelButton: true,
        showCancelButton: true,
        confirmButtonText: SaveText,
        inputValidator: (value) => {
            if (!value) {
              return 'File name is required!';
            }
        }
      }).then((result) => {
        if (result.isConfirmed) {
            const strFilename = result.value;
            Swal.fire({
                title: 'Preparing Download...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                    SaveProject(strFilename);
                    jQuery('#saveButton').prop('disabled', false);
                    setTimeout(() => {
                        Swal.close();
                      }, 500);
                }
            });
        }
      });
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

function getBlocksForDownload() {
    var xml = Blockly.Xml.workspaceToDom(workspace);
    return b64EncodeUnicode(Blockly.Xml.domToPrettyText(xml));
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

function SaveProject(strProgramName)
{
    strProgramName = fileNameClean(strProgramName);
    var strContent = getBlocksForDownload();
    var isValidResult = fileNameIsValid(strProgramName);
    if ( isValidResult ) {
 
    } else {
       jQuery('#saveButton').prop('disabled', true);
       var strFilename = strProgramName;
       var isIOS = false;
       if ( isIOS ) {
          // HANDLE iOS SAVES HERE
          setTimeout(function() {
 
             console.log ( 'Do iOS save...' );
             // var strProgramName = jQuery("#modalSaveLocal #txtProgramName").val();
 
             console.log(strProgramName);
          
             strProgramName = fileNameClean(strProgramName);
             strProgramName = strProgramName + ".edblocks";
             console.log(strProgramName);
          
             var strContent = getBlocksForDownload();
          
             // confirm("Press OK to confirm...");
          
             // Create a Blob from the content
             var blob = new Blob([strContent], { type: 'application/octet-stream' });
             
             // Create a link element
             var link = document.createElement('a');
             
             // Create a URL for the Blob and set it as the href of the link
             link.href = window.URL.createObjectURL(blob);
             
             // Set the download attribute with the desired file name
             link.download = strProgramName;
             
             // Append the link to the document
             document.body.appendChild(link);
             
             // Trigger the download
             link.click();
             
             // Remove the link from the document after download
             document.body.removeChild(link);
 
             jQuery("#modalSaveLocal").modal('hide');
             jQuery('#btnSaveLocal').prop('disabled', false);
 
          }, 2500);
       } else {
          // HANDLE ALL OTHER SAVES HERE
            const fileName = strFilename + ".kIB";
            const blob = new Blob([strContent], { type: "text/plain" });
            // Trigger download
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
       }
    }

}

function loadProject1(){
    Swal.fire({
        title: 'Load .kIB File',
        input: 'file',
        inputAttributes: {
          accept: '.kIB',
          'aria-label': 'Upload your .kIB file',
        },
        showCancelButton: true,
        confirmButtonText: 'Load Blocks',
        cancelButtonText: 'Cancel',
        preConfirm: (file) => {
          return new Promise((resolve, reject) => {
            if (!file) {
              reject('No file selected!');
              return;
            }
    
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject('Failed to read file!');
            reader.readAsText(file);
          });
        }
      }).then((result) => {
        if (result.isConfirmed) {
          try {
            const base64Content = result.value;
    
            // Decode base64 back to original XML text
            const decoded = decodeURIComponent(atob(base64Content).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
    
            // Parse XML and load into workspace
            const xml = Blockly.Xml.textToDom(decoded);
            Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
    
            Swal.fire('Success!', 'Blocks loaded into workspace.', 'success');
          } catch (err) {
            Swal.fire('Error', 'Invalid file format or corrupt .kIB content.', 'error');
            console.error(err);
          }
        }
      });
}

function loadProject(){
        Swal.fire({
          title: 'Load .kIB File',
          html: `
            <label for="kibInput" style="display:block;margin-bottom:10px;font-weight:bold;">Select your .kIB file</label>
            <input type="file" id="kibInput" accept=".kIB" style="display:none" />
            <button id="selectFileBtn" class="swal2-confirm swal2-styled" style="background-color:#3085d6;">
              Select File
            </button>
            <div id="fileName" style="margin-top:10px; color: #555;"></div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Load Blocks',
          didOpen: () => {
            const fileInput = document.getElementById('kibInput');
            const selectFileBtn = document.getElementById('selectFileBtn');
            const fileNameDisplay = document.getElementById('fileName');
      
            let selectedFile = null;
      
            selectFileBtn.addEventListener('click', () => {
              fileInput.click();
            });
      
            fileInput.addEventListener('change', () => {
              if (fileInput.files.length > 0) {
                selectedFile = fileInput.files[0];
                fileNameDisplay.textContent = 'Selected: ' + selectedFile.name;
              }
            });
      
            // Store selected file for use in preConfirm
            Swal.setInputValue = () => selectedFile;
          },
          preConfirm: () => {
            const fileInput = document.getElementById('kibInput');
            const file = fileInput.files[0];
      
            return new Promise((resolve, reject) => {
              if (!file) {
                reject('Please select a .kIB file!');
                return;
              }
      
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject('Failed to read file.');
              reader.readAsText(file);
            });
          }
        }).then((result) => {
          if (result.isConfirmed) {
            try {
              const base64Content = result.value;
      
              const decoded = decodeURIComponent(atob(base64Content).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
      
              const xml = Blockly.Xml.textToDom(decoded);
              Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
      
              Swal.fire('Success!', 'Your blocks have been loaded.', 'success');
            } catch (err) {
              Swal.fire('Error', 'Invalid or corrupted .kIB file.', 'error');
              console.error(err);
            }
          }
        });     
}