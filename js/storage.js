// All Declarations and Initializations
var localStorage=true;
var remoteStorage=false;
var IndexedDbSupport=true;
var firstLoad=false;
var notes4All = {};
notes4All.indexedDB = {};
notes4All.indexedDB.db = null;

// Set new Configuration if Specified.
function setConfig (localStorageStatus, remoteStorageStatus, noteIdStatus, firstLoadStatus) {
  localStorage = localStorageStatus;
  remoteStorage = remoteStorageStatus;
  noteId = noteIdStatus;
  firstLoad = firstLoadStatus;
}

// Checks Support for IndexedDb Storage in the Local Machine and Executes only then.
function checkSupport(){
  if ("indexedDB" in window) {
    console.log("IndexedDbSupport is Present in the Browser")
  }
  else {
    console.log("IndexedDbSupport is Absent in the Browser");
    alert("IndexedDbSupport is Absent in the Browser");
    IndexedDbSupport=false;
  }
}

window.indexedDB = window.indexedDB || window.webkitIndexedDB ||
window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.IDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange;
}

// Any Error is Displayed in the Console and an Alert.
notes4All.indexedDB.onerror = function(e) {
	console.log(e);
  alert(e);
};

// Opens Connection to the IndexedDb.
notes4All.indexedDB.open = function() {
  var version = 1;
  var request = indexedDB.open("todos", version);

  // We can only create Object stores in a versionchange transaction.
  request.onupgradeneeded = function(e) {
    var db = e.target.result;

    // A versionchange transaction is started automatically.
    e.target.transaction.onerror = notes4All.indexedDB.onerror;

    if(db.objectStoreNames.contains("todo")) {
      db.deleteObjectStore("todo");
    }
    var store = db.createObjectStore("todo",{keyPath: "timeStamp"});
  };

  request.onsuccess = function(e) {
    notes4All.indexedDB.db = e.target.result;
    notes4All.indexedDB.getAllTodoItems();
  };

  request.onerror = notes4All.indexedDB.onerror;
};

// Attempts to Store Data in the Store and On incompletion displays Error.
notes4All.indexedDB.addTodo = function(todoText) {
  var db = notes4All.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  var data = {
    "text": todoText,
    "timeStamp": new Date().getTime()
  };

  var request = store.put(data);

  trans.oncomplete = function(e) {
    notes4All.indexedDB.getAllTodoItems();
  };

  request.onerror = function(e) {
    console.log("Error Adding: ", e);
  };
};

// Specified Id of each Note can be Deleted and Rendered with the Updation.
notes4All.indexedDB.deleteTodo = function(id) {
  var db = notes4All.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  var request = store.delete(id);

  trans.oncomplete = function(e) {
    notes4All.indexedDB.getAllTodoItems();
  };

  request.onerror = function(e) {
    console.log("Error Adding: ", e);
  };
};

// Get all the Notes in the Object Store.
notes4All.indexedDB.getAllTodoItems = function() {
  var todos = $("#todoItems");
  todos.empty();
  $('#row').empty();

  var db = notes4All.indexedDB.db;
  var trans = db.transaction(["todo"], "readwrite");
  var store = trans.objectStore("todo");

  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;

    renderTodo(result.value);
    result.continue();
  };

  cursorRequest.onerror = notes4All.indexedDB.onerror;
};

// Renders the new Note in the todoList Item and Inserts a Card. 
function renderTodo(row) {
  $("<li>").text(row.text).appendTo();
  var todos = document.getElementById("todoItems");
  var li = document.createElement("li");
  var a = document.createElement("a");
  var t = document.createTextNode(row.text);

  a.addEventListener("click", function() {
    notes4All.indexedDB.deleteTodo(row.timeStamp);
  }, false);

  a.href = "#";
  a.textContent = " [Delete]";
  li.appendChild(t);
  li.appendChild(a);
  todos.appendChild(li);
  insertCard(row);
}

// Start Function to be called to add a New note.
function addTodo() {
  var todo = document.getElementById("todo");
  notes4All.indexedDB.addTodo(todo.value);
  todo.value = "";
}

// Initializes and Opens Connection to IndexedDb Storage
function init() {
  notes4All.indexedDB.open();
}

//Check Support and run only then.
checkSupport()
if (IndexedDbSupport)
  window.addEventListener("DOMContentLoaded", init, false);
