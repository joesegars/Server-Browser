/* global ko, ML, $ */

"use strict";

// View model for the app
function DirectoryContentsViewModel() {
    var self = this;
    var PARENT_DIRECTORY = "..";

    var unfilteredDirectories, unfilteredFiles;

    self.directories = ko.observableArray();
    self.files = ko.observableArray();
    self.path = ko.observableArray();

    self.directoryCount = ko.observable(0);
    self.directoryCountText = ko.computed(function () {
        return "Folders: " + (self.directoryCount());
    }, self);

    self.fileCount = ko.observable(0);
    self.fileCountText = ko.computed(function () {
        return "Files: " + self.fileCount();
    }, self);

    self.totalFileSizeInBytes = ko.observable(0);
    self.totalFileSizeText = ko.computed(function () {
        return "Total File Size: " + ((Math.ceil(self.totalFileSizeInBytes() / 1024) + " KB").replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    }, self);

    self.onBreadcrumbClicked = function (selectedDirectory, event) {
        self.clearErrors();
        var path = ML.Path.getDirectoryByName(selectedDirectory);
        ML.Services.getDirectoryContents(path, onGetContentsSuccess, onGetContentsError);
    };

    self.newFolderName = ko.observable("");

    self.showAddFolderDialog = function () {
        self.clearErrors();
        hideContextMenu();
        $(".add-folder-dialog").dialog("open");
    };

    self.closeCreateFolderDialog = function () {
        self.newFolderName("");
        $(".add-folder-dialog").dialog("close");
    };

    self.showDeleteItemConfirmation = function () {
        self.clearErrors();
        hideContextMenu();
        $(".delete-item-confirmation").dialog("open");
    };

    self.closeDeleteItemConfirmation = function () {
        $(".delete-item-confirmation").dialog("close");
        removeInvisibleOverlay();
    };

    self.downloadEnabled = ko.observable(true);

    self.downloadFile = function () {
        var selectedItem = self.selectedItem()[0];
        var fileName = selectedItem.Name;
        var filePath = ML.Path.currentPath + "\\" + fileName;

        // add form to DOM the submit it
        var $downloadForm = $("<form method='POST'>")
		                    .attr("action", "api/directory/downloadfile/" + filePath)
                            .attr("target", "_blank")
                            .css('display', 'none');
		
        $("body").append($downloadForm);
        $downloadForm.submit();
        $downloadForm.remove();
        removeInvisibleOverlay();
    };

    self.selectedItem = ko.observableArray();

    self.refreshFolder = function (data, event) {
        self.clearErrors();
        var path = ML.Path.currentPath;
        ML.Services.getDirectoryContents(path, onGetContentsSuccess, onGetContentsError);
    };

    self.browseFolder = function (data, event) {
        self.clearErrors();
        var path = "";

        var parentDirectoryWasSelected = data.Name === PARENT_DIRECTORY;
        if (parentDirectoryWasSelected) {
            path = ML.Path.getParentDirectory();
        }
        else {
            path = ML.Path.getSubDirectory(data.Name);
        }

        ML.Services.getDirectoryContents(path, onGetContentsSuccess, onGetContentsError);
    };

    self.createFolder = function () {
        var path = ML.Path.currentPath + "\\" + self.newFolderName();

        var onCreateSuccess = function (result) {
            console.log("success", JSON.stringify(result));

            var newDirectory = { Name: self.newFolderName() };

            // update view model with new info
            unfilteredDirectories.push(newDirectory);
            self.directoryCount(self.directoryCount() + 1);
            self.directories.push(newDirectory);
            self.directories.sort(function (left, right) {
                return left.Name.toLowerCase() === right.Name.toLowerCase ? 0 : (left.Name.toLowerCase() < right.Name.toLowerCase() ? -1 : 1);
            });

            self.closeCreateFolderDialog();
        };

        var onCreateError = function (result) {
            console.log("failure", JSON.stringify(result));

            self.closeCreateFolderDialog();
            self.isError(true);
            self.errorMessage(result.responseJSON.Message);
        };

        ML.Services.createFolder(path, onCreateSuccess, onCreateError);
    };

    self.deleteItem = function () {
        var selectedItem = self.selectedItem()[0];
        var name = selectedItem.Name;

        if (selectedItem.IsFile) {
            deleteFile(name);
        }
        else {
            deleteFolder(name);
        }

        self.closeDeleteItemConfirmation();
    };

    self.searchQuery = ko.observable("");
    self.search = function (value) {
        self.clearErrors();
        self.directories.removeAll();
        self.files.removeAll();

        // filter folders
        for (var d in unfilteredDirectories) {
            if (unfilteredDirectories[d].Name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.directories.push(unfilteredDirectories[d]);
            }
        }
        addParentFolderToDirectoryList();

        // filter files
        for (var f in unfilteredFiles) {
            if (unfilteredFiles[f].Name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.files.push(unfilteredFiles[f]);
            }
        }
    };

    self.isError = ko.observable(false);
    self.errorMessage = ko.observable("");

    self.clearErrors = function () {
        self.isError(false);
        self.errorMessage("");
    };

    self.init = function (data) {
        self.directories(data.Directories);
        self.files(data.Files);
        self.directoryCount(data.Directories.length);
        self.fileCount(data.Files.length);
        self.totalFileSizeInBytes(data.FileSizeInBytes);
        self.path(data.FullPath.split("\\").filter(Boolean));

        unfilteredDirectories = data.Directories.slice(0);
        unfilteredFiles = data.Files.slice(0);
        addParentFolderToDirectoryList();
    };

    /* Private function */
    function onGetContentsSuccess(result) {
        console.log("success", JSON.stringify(result));

        ML.Path.currentPath = result.FullPath;
        self.init(result);

        ML.ignoreHashChange = true;
        window.location.hash = "!/" + result.FullPath;
    }

    /* Private function */
    function onGetContentsError(result) {
        console.log("failure", JSON.stringify(result));
        self.isError(true);
        self.errorMessage(result.responseJSON);
    }

    /* Private function */
    function addParentFolderToDirectoryList() {
        self.directories.splice(0, 0, { Name: PARENT_DIRECTORY });
    }

    /* Private function */
    function deleteFolder(folderName) {
        var path = ML.Path.currentPath + "\\" + folderName;

        var onSuccess = function (result) {
            console.log("success", JSON.stringify(result));

            // not an observeablearray so we can't use remove()
            unfilteredDirectories = unfilteredDirectories.filter(function (item) {
                return item.Name !== folderName;
            });

            self.directoryCount(self.directoryCount() - 1);

            self.directories.remove(function (item) {
                return item.Name === folderName;
            });
        };

        var onError = function (result) {
            console.log("failure", JSON.stringify(result));
            self.isError(true);
            self.errorMessage(result);
        };

        ML.Services.deleteFolder(path, onSuccess, onError);
    }

    /* Private function */
    function deleteFile(fileName) {
        var path = ML.Path.currentPath + "\\" + fileName;

        var onSuccess = function (result) {
            console.log("success", JSON.stringify(result));

            // not an observeablearray so we can't use remove()
            unfilteredFiles = unfilteredFiles.filter(function (item) {
                return item.Name !== fileName;
            });

            self.fileCount(self.fileCount() - 1);

            var removedFile = self.files.remove(function (item) {
                return item.Name === fileName;
            });

            var sizeInBytes = self.totalFileSizeInBytes();
            var newSize = sizeInBytes - removedFile[0].SizeInBytes;
            self.totalFileSizeInBytes(newSize);
        };

        var onError = function (result) {
            console.log("failure", JSON.stringify(result));
            self.isError(true);
            self.errorMessage(result);
        };

        ML.Services.deleteFile(path, onSuccess, onError);
    }

    /* Private function */
    function hideContextMenu() {
        $("#contextMenu").hide();
    }

    /* Private function */
    function removeInvisibleOverlay() {
        $("div.overlay").click();
    }
}