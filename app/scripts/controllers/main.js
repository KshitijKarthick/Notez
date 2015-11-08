'use strict';

/**
 * @ngdoc function
 * @name notezApp.controller:NotesController
 * @description
 * # NotezController
 * Controller of the notezApp
 */
angular.module('notezApp')
    .controller('NotesController', ['$timeout',
        function($timeout) {
        	this.showAlert = false;
        	this.alertMessage = "";
        	this.title = "";
        	this.content = "";
            this.notesList = [{
                'title': 'Note 1',
                'content': 'Contents of Note 1',
                'id': 1,
                'timestamp': (new Date()).getTime()
            }, {
                'title': 'Note 2',
                'content': 'Contents of Note 1',
                'id': 2,
                'timestamp': (new Date()).getTime()
            }, {
                'title': 'Note 3',
                'content': 'Contents of Note 1',
                'id': 3,
                'timestamp': (new Date()).getTime()
            }, {
                'title': 'Note 4',
                'content': 'Contents of Note 1',
                'id': 4,
                'timestamp': (new Date()).getTime()
            }];
            this.addNote = function() {
                function hashCode(str) {
                    var hash = 5381;
    				for (var i = 0; i < str.length; i++) {
        				var char = str.charCodeAt(i);
        				hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
    				}
    				return hash;
                }
                var currentTime = (new Date()).getTime();
                this.notesList.push({
                    'title': this.title,
                    'content': this.content,
                    'timestamp': currentTime,
                    'id': hashCode(this.title + currentTime)
                });
                this.alert("Created " + this.title + " successfully");
                this.title = "";
                this.content = "";
            };
            this.removeNote = function(id) {
            	for(var i=0;i<this.notesList.length;i++){
            		if(this.notesList[i].id === id){
            			if(i > -1) {
    						var removedItem = this.notesList.splice(i, 1);
    						this.alert("Deleted " + removedItem[0].title + " successfully");
    						break;
						}
            		}
            	}
            };
            this.alert = function(msg){
            	this.alertMessage = msg;
            	this.showAlert = true;
            	$timeout(function(){
            		this.showAlert = false;
            	}.bind(this), 3000);
            };
        }
    ])
    .controller("HeaderController", function($scope, $location){ 
        $scope.isActive = function (viewLocation) { 
            return viewLocation === $location.path();
        };
    });