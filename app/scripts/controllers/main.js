'use strict';

/**
 * @ngdoc function
 * @name notezApp.controller:NotesController
 * @description
 * # NotezController
 * Controller of the notezApp
 */
angular.module('notezApp')
    .controller('NotesController', ['$timeout', function($timeout) {
            this.showAlert = false;
            this.alertMessage = "";
            this.title = "";
            this.content = "";
            var db = new Dexie("notez");
            db.version(1).stores({
                notez : 'id,title,content,timestamp',
            });
            db.open().catch(function(error){
                console.error('IndexedDB support not present',error);
            });
            this.notesList = [];
            db.notez.each(function(note){
                $timeout.apply(this.notesList.push(note));
            }.bind(this));
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
                var newNote = {
                    'title': this.title,
                    'content': this.content,
                    'timestamp': currentTime,
                    'id': hashCode(this.title + currentTime)
                };
                this.notesList.push(newNote);
                db.notez.add(newNote);
                this.alert("Created " + this.title + " successfully");
                this.title = "";
                this.content = "";
            };
            this.removeNote = function(id) {
                for (var i = 0; i < this.notesList.length; i++) {
                    if (this.notesList[i].id === id) {
                        if (i > -1) {
                            var removedItem = this.notesList.splice(i, 1);
                            db.notez.delete(removedItem[0].id);
                            this.alert("Deleted " + removedItem[0].title + " successfully");
                            break;
                        }
                    }
                }
            };
            this.alert = function(msg) {
                this.alertMessage = msg;
                this.showAlert = true;
                $timeout(function() {
                    this.showAlert = false;
                }.bind(this), 3000);
            };
        }
    ])
    .controller("HeaderController", function($scope, $location) {
        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };
    });