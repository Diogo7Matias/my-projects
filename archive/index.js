let folders = {};
const foldersDiv = document.getElementById("foldersDiv");
const filesDiv = document.getElementById("filesDiv");
const filesListDiv = document.getElementById("filesListDiv");
const fileDisplay = document.getElementById("fileDisplay");
const newFolderButton = document.getElementById("newFolderButton");
const newFileButton = document.getElementById("newFileButton");
const removeButton = document.getElementById("removeButton");

let currentFolder = "";
storageKey = "folders";

// load when the page is started
document.addEventListener("DOMContentLoaded", load);

function save(){
    const foldersString = JSON.stringify(folders);
    localStorage.setItem(storageKey, foldersString);
}

function load(){
    const foldersString = localStorage.getItem(storageKey);
    if (foldersString) 
        folders = JSON.parse(foldersString);
    renderFolders();
}

// Helper function to convert Base64 string to Blob
function base64ToBlob(base64, mimeType) {
    const parts = base64.split(",");
    const byteChars = atob(parts[1]); // Decode Base64 data portion
    const byteNumbers = new Array(byteChars.length).fill(0).map((_, i) => byteChars.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray], { type: mimeType });
}

// Folder Input
document.getElementById("folderInput").addEventListener("keydown", function(event) {
    if (event.key != "Enter")
        return;
    
    const folderName = this.value;
    this.value = ""; // reset the value
    
    if (folderName.includes(" "))
        alert("Invalid Folder Name. Avoid space characters");
    else if (folderName != "")
        createFolder(folderName);
});

// File Input
document.getElementById('fileInput').addEventListener('change', function() {
    const newFile = this.files[0];
    createFile(newFile);
});

function createFolder(folderName) {
    const container = document.createElement("div");
    container.textContent = folderName;
    foldersDiv.appendChild(container);
    
    if (!folders[folderName])
        folders[folderName] = [];
    renderFolders();
    save();
}

function removeFolder(folder){
    delete folders[folder];
    renderFolders();
    displayDeleteButtons();
    save();
}

function createFile(file){
    const container = document.createElement("div");
    container.textContent = file.name;
    filesListDiv.appendChild(container);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function(event) {
        const base64File = event.target.result; // Base64-encoded file content

        // Create a File-like object with name, type, and content
        const fileData = {
            name: file.name,
            type: file.type,
            content: base64File
        };

        // Save the file-like object in the folder array
        folders[currentFolder].push(fileData);
        openFolder(currentFolder);
        save();
    };
}

function removeFile(index){
    folders[currentFolder].splice(index, 1);
    openFolder(currentFolder);
    displayDeleteButtons();
    save();
}

function renderFolders(){
    foldersDiv.innerHTML = "";
    foldersDiv.style.display = "initial";
    filesDiv.style.display = "none";
    newFileButton.disabled = true;
    
    if (!Object.keys(folders).length){
        const noFoldersText = document.createElement("p");
        noFoldersText.textContent = "[ currently there are no folders ]";
        noFoldersText.className = "noContentAvailable";
        foldersDiv.appendChild(noFoldersText);
    }

    for (const folder in folders){
        const container = document.createElement("div");
        
        const text = document.createElement("p");
        text.addEventListener("click", () => openFolder(folder));
        text.textContent = "📁 " + folder;
        text.style.display = "inline";
        text.className = "folder";
        
        const button = document.createElement("button");
        button.textContent = "Delete";
        button.className = "deleteButton";
        button.onclick = () => removeFolder(folder);
        
        container.appendChild(text);
        container.appendChild(button);
        foldersDiv.appendChild(container);
    }
    hideDeleteButtons();
}

function openFolder(folder){
    filesListDiv.innerHTML = "";
    foldersDiv.style.display = "none";
    filesDiv.style.display = "block";
    newFolderButton.disabled = true;
    newFileButton.disabled = false;
    currentFolder = folder;

    if (!folders[folder].length){
        const noFilesText = document.createElement("p");
        noFilesText.textContent = "[ this folder is empty ]";
        noFilesText.className = "noContentAvailable";
        filesListDiv.appendChild(noFilesText);
    }
    
    document.getElementById("folderTitle").textContent = folder;
    
    for (const [index, file] of Object.entries(folders[folder])){
        const container = document.createElement("div");
        
        const text = document.createElement("p");
        text.addEventListener("click", () => openFile(file));
        text.textContent = "📄 " + file.name;
        text.style.display = "inline";
        text.className = "file";
        
        const button = document.createElement("button");
        button.textContent = "Delete";
        button.className = "deleteButton";
        button.onclick = () => removeFile(index);
        
        container.appendChild(text);
        container.appendChild(button);
        filesListDiv.appendChild(container);
    }
    hideDeleteButtons();
}

function openFile(file){
    const fileContent = document.getElementById("fileContent");
    const fileTitle = document.getElementById("fileTitle");
    const blob = base64ToBlob(file.content, file.type);
    const reader = new FileReader();

    fileContent.innerHTML = "";
    fileTitle.textContent = file.name;
    filesDiv.style.display = "none";
    fileDisplay.style.display = "block";
    newFolderButton.disabled = true;
    newFileButton.disabled = true;
    removeButton.disabled = true;

    reader.readAsText(blob);
    reader.onload = function(event){
        fileContent.textContent = event.target.result;
    }
}

function backToFolders(){
    foldersDiv.style.display = "initial";
    filesDiv.style.display = "none";
    newFolderButton.disabled = false;
    newFileButton.disabled = true;
    hideDeleteButtons();
}

function backToFiles(){
    filesDiv.style.display = "block";
    fileDisplay.style.display = "none";
    newFileButton.disabled = false;
    removeButton.disabled = false;
    hideDeleteButtons();
}

function displayFolderInput(){
    input = document.getElementById("folderInput");
    
    if (input.style.display != "none"){
        input.style.display = "none";
        input.value = "";
    } else {
        // show input box
        input.style.display = "initial";
        input.placeholder = "Folder Name";
        input.focus();
    }
}

function displayDeleteButtons(){
    buttons = document.getElementsByClassName("deleteButton");
    for (const b of buttons){
        b.style.display = "initial";
    }
}

function hideDeleteButtons(){
    buttons = document.getElementsByClassName("deleteButton");
    for (const b of buttons){
        b.style.display = "none";
    }
}

function toggleDeleteButtons(){
    buttons = document.getElementsByClassName("deleteButton");

    if (!buttons.length)
        return;
    if (buttons[0].style.display != "none"){
        hideDeleteButtons();
    } else {
        displayDeleteButtons();
    }
}