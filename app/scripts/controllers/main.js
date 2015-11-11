'use strict';

/**
 * @ngdoc function
 * @name notezApp.controller:NotesController
 * @description
 * # NotezController
 * Controller of the notezApp
 */
angular.module('notezApp')
    .controller('NotesController', ['$timeout', 'modal', '$window',
        function($timeout, modal, $window) {
            this.emptySelectedContent = function(){
                this.selectedNoteContent = '';
                this.selectedNoteTitle = '';
            };
            this.showAlert = false;
            this.alertMessage = "";
            this.emptySelectedContent();
            this.emptyNotes = true;
            this.modal = modal;
            this.searchText = "";
            this.db = new $window.Dexie("notez");
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
                this.emptySelectedContent();
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
                                this.emptySelectedContent();
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
    .factory('modal', ['$window', function($window) {
        var modalId = '#myModal';
        var modalTitle = "Title";
        var actionButtonTitle = "Do Task";
        var action = function() {
            console.log("Hello User");
        };
        var setModalData = function(title, buttonTitle, newAction) {
            modalTitle = title;
            actionButtonTitle = buttonTitle;
            action = newAction;
            toggleModal();
        };
        var getModalTitle = function() {
            return modalTitle;
        };
        var toggleModal = function(){
            $window.jQuery(modalId).modal('toggle');
        };
        var getActionButtonTitle = function() {
            return actionButtonTitle;
        };
        var getAction = function() {
            return function(){
                action();
                toggleModal();
            };
        };
        return {
            'getModalTitle': getModalTitle,
            'getActionButtonTitle': getActionButtonTitle,
            'setModalData': setModalData,
            'action': action,
            'getAction': getAction,
            'toggleModal': toggleModal
        };
    }])
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
            if (reverse){
                filtered.reverse();
            }
            return filtered;
        };
    })
    .filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value){
                return '';
            }
            max = parseInt(max, 10);
            if (!max){
                return value;
            }
            if (value.length <= max){
                return value;
            }
            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace !== -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    });