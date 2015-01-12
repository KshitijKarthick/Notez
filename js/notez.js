// Insert Card into row Class with Title and Body Seperately
function insertCard(row){
  var parse=row.text.split(" [Body]");
  var title = parse[0];
  var data = parse[1];
  var a = document.createElement("a");
  a.addEventListener("click", function() {
   	notes4All.indexedDB.deleteTodo(row.timeStamp);
  }, false);
  a.href = "#";
  a.textContent = " [Delete]";
  $("<j-card>")
    .append($("<j-card-title>").text(title))
	.append($("<j-card-body>").text(data)
	.append(a))
	.attr("class","post-it")
	.prependTo("#row");
}

// Load Data onto the Element which manages Storing the Data onto the Local IndexedDB Storage and onto the Screen [ Row Class ]
function loadData(title,body){
  todo.value=title+" [Body]"+body;
  addTodo()
}

// Encapsulates the Entire Note Functionality of Displaying, Retrieval of Data from the Modal for Creation a Note.
function note(){
  
  function closeDialog() {
    $('#createNote').modal('toggle')
  };

  function okClicked() {
    var title=$('#titleInput').val();
    var body=$('#bodyInput').val();
    loadData(title,body);
    $('#titleInput').val('');
    $('#bodyInput').val('');
    closeDialog();
  };

  okClicked();
}