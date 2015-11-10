'use strict';

/**
 * @ngdoc function
 * @name notezApp.controller:NotesController
 * @description
 * # NotezController
 * Controller of the notezApp
 */
angular.module('notezApp')
    .controller('NotesController', ['$timeout', 'modal',
        function($timeout, modal) {
            this.showAlert = false;
            this.alertMessage = "";
            this.selectedNoteTitle = "";
            this.selectedNoteContent = "";
            this.emptyNotes = true;
            this.modal = modal;
            this.db = new Dexie("notez");
            this.db.version(1).stores({
                notez: 'id,title,content,timestamp',
            });
            this.db.open().catch(function(error) {
                console.error('IndexedDB support not present', error);
            });
            this.notesList = [];
            this.db.notez.each(function(note) {
                this.emptyNotes = false;
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
                this.emptyNotes = false;
                var currentTime = (new Date()).getTime();
                var newNote = {
                    'title': this.selectedNoteTitle,
                    'content': this.selectedNoteContent,
                    'timestamp': currentTime,
                    'id': hashCode(this.selectedNoteTitle + currentTime)
                };
                this.notesList.push(newNote);
                this.db.notez.add(newNote);
                this.alert("Created " + this.selectedNoteTitle + " successfully");
                this.selectedNoteTitle = "";
                this.selectedNoteContent = "";
            };
            this.removeNote = function(id) {
                for (var i = 0; i < this.notesList.length; i++) {
                    if (this.notesList[i].id === id) {
                        if (i > -1) {
                            var removedItem = this.notesList.splice(i, 1);
                            this.db.notez.delete(removedItem[0].id);
                            this.alert("Deleted " + removedItem[0].title + " successfully");
                            break;
                        }
                    }
                }
                if(this.notesList.length === 0){
                    this.emptyNotes = true;
                }
            };
            this.editNote = function(id) {
                for (var i = 0; i < this.notesList.length; i++) {
                    if (this.notesList[i].id === id) {
                        if (i > -1) {
                            this.selectedNoteTitle = this.notesList[i].title;
                            this.selectedNoteContent = this.notesList[i].content;
                            this.modal.setModalData('Edit a Note', 'Save a Note', function() {
                                this.notesList[i].title = this.selectedNoteTitle;
                                this.notesList[i].content = this.selectedNoteContent;
                                this.notesList[i].timestamp = (new Date()).getTime();
                                this.db.notez.update(this.notesList[i].id, this.notesList[i]);
                                this.selectedNoteTitle = "";
                                this.selectedNoteContent = "";
                            }.bind(this));
                            break;
                        }
                    }
                }
            };
            this.invokeCreationofNote = function() {
                this.modal.setModalData('Create a Note', 'Create Note', function() {
                    this.addNote();
                }.bind(this));
            }
            this.alert = function(msg) {
                this.alertMessage = msg;
                this.showAlert = true;
                $timeout(function() {
                    this.showAlert = false;
                }.bind(this), 3000);
            };
        }
    ])
    .factory('modal', function() {
        var modalId = '#myModal';
        var modalTitle = "Title";
        var actionButtonTitle = "Do Task";
        var action = function() {
            console.log("Hello User");
        }
        var setModalData = function(title, buttonTitle, newAction) {
            modalTitle = title;
            actionButtonTitle = buttonTitle;
            action = newAction;
            $(modalId).modal('show');
        }
        var getModalTitle = function() {
            return modalTitle;
        }
        var getActionButtonTitle = function() {
            return actionButtonTitle;
        }
        var getAction = function() {
            return function(){
                action();
                $(modalId).modal('hide');
            };
        }
        return {
            'getModalTitle': getModalTitle,
            'getActionButtonTitle': getActionButtonTitle,
            'setModalData': setModalData,
            'action': action,
            'getAction': getAction
        };
    })
    .controller("HeaderController", function($scope, $location) {
        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };
    })
    .filter('orderObjectBy', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function(a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    });