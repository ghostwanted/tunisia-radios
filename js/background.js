var radios = [];
var currentRadio = "";
var audio = new Audio();
var stalledAudio = false;

/**
 * [Load a JSON file in the radio-list <div>]
 */
$.getJSON({url: "../js/radios.json", async: true}, function(data) {
  radios = data;
  currentRadio = radios[0];
  audio.volume = 1;
});

function getRadios() {
  return radios;
}
function setRadios(radios) {
  this.radios = radios;
}

function getCurrentRadio() {
  return currentRadio;
}
function setCurrentRadio(currentRadio) {
  this.currentRadio = currentRadio;
}

function getAudio() {
  return audio;
}
function setAudio(audio) {
  this.audio = audio;
}

function isStalledAudio() {
  return stalledAudio;
}

function setStalledAudio(stalledAudio) {
  this.stalledAudio = stalledAudio;
}






// A generic onclick callback function.
function genericOnClick(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
}

// Create one test item for each context type.
var contexts = ["page","selection","link","editable","image","video",
    "audio"];
for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Test '" + context + "' menu item";
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
        "onclick": genericOnClick});
    console.log("'" + context + "' item:" + id);
}


// Create a parent item and two children.
var parent = chrome.contextMenus.create({"title": "Test parent item"});
var child1 = chrome.contextMenus.create(
    {"title": "Child 1", "parentId": parent, "onclick": genericOnClick});

// Create some checkbox items.
function checkboxOnClick(info, tab) {
    console.log(JSON.stringify(info));
    console.log("checkbox item " + info.menuItemId +
        " was clicked, state is now: " + info.checked +
        "(previous state was " + info.wasChecked + ")");

}
var checkbox1 = chrome.contextMenus.create(
    {"title": "Menu keyboard", "type": "checkbox", "onclick":checkboxOnClick});


// Intentionally create an invalid item, to show off error checking in the
// create callback.
console.log("About to try creating an invalid item - an error about " +
    "item 999 should show up");
chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
    if (chrome.extension.lastError) {
        console.log("Got expected error: " + chrome.extension.lastError.message);
    }
});