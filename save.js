var localStorage=true;
var remoteStorage=false;
var IndexedDbSupport=true;

function setBasicConfig(localStorageState,remoteStorageState,noteDefaultId){
	var localStorage=localStorageState;
	var remoteStorage=remoteStorageState;
	var noteId=noteDefaultId;
}

function checkSupport(){
	if("indexedDB" in window) {
		console.log("IndexedDbSupport is Present in the Browser")
	}
	else 
	{
		console.log("IndexedDbSupport is Absent in the Browser");
		alert("IndexedDbSupport is Absent in the Browser");
		IndexedDbSupport=false;
	}
}

var notes4All = {};
window.indexedDB = window.indexedDB || window.webkitIndexedDB ||
window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
	window.IDBTransaction = window.webkitIDBTransaction;
	window.IDBKeyRange = window.webkitIDBKeyRange;
}

notes4All.indexedDB = {};
notes4All.indexedDB.db = null;

notes4All.indexedDB.onerror = function(e) {
	console.log(e);
};

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

        var store = db.createObjectStore("todo",
        	{keyPath: "timeStamp"});
    };

    request.onsuccess = function(e) {
    	notes4All.indexedDB.db = e.target.result;
    	notes4All.indexedDB.getAllTodoItems();
    };

    request.onerror = notes4All.indexedDB.onerror;
};

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

notes4All.indexedDB.getAllTodoItems = function() {
	var todos = document.getElementById("todoItems");
	todos.innerHTML = "";

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

  function renderTodo(row) {
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
  }

  function addTodo() {
  	var todo = document.getElementById("todo");
  	notes4All.indexedDB.addTodo(todo.value);
  	todo.value = "";
  }

  function init() {
  	notes4All.indexedDB.open();
  }
  setBasicConfig()
  checkSupport()
  if(IndexedDbSupport)
  	window.addEventListener("DOMContentLoaded", init, false);
