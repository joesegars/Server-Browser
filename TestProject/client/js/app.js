/* global ko, ML, $, DirectoryContentsViewModel */

"use strict";

// create global app object
window.ML = window.ML || {};

// This can be configured to any valid path on the server
// URL can be an absolute path such as "C:\\Windows\\Temp"
// or a relative path to the web server such as "\\AppServer"
// Default is "."
var SERVER_HOME_DIRECTORY = ".";
//var SERVER_HOME_DIRECTORY = "C:\\Temp";

// Tells the apps deep url linking whether or not to ignore a particular change
ML.ignoreHashChange = false;

// Create view model and apply initial bindings
var viewModel = new DirectoryContentsViewModel();
ko.applyBindings(viewModel);

// Document ready handler
$(document).ready(function () {
    initAddFolderDialog();
    initDeleteItemDialog();
    initRightClickContextMenu();
    initUrlDeepLinking();
    startApp();

    function initAddFolderDialog() {
        $(".add-folder-dialog").dialog({
            autoOpen: false
        });
    }

    function initDeleteItemDialog() {
        $(".delete-item-confirmation").dialog({
            autoOpen: false
        });
    }

    function initRightClickContextMenu() {
        $("#contextMenu").menu();

        // set up right click context menu handler for table
        $("table").on("contextmenu", "tr", function (event) {
            event.preventDefault();
            clearUiErrors();
            addInvisibleOverlay(); 
            addSelectedStyleToClickedRow(event);

            var isFile = $(event.currentTarget).data("role") === "file";
            var fileName = getSelectedItemName(event);
            addSelectedItemToViewModel(fileName, isFile);

            showContextMenu(event);
            return false;
        });
    }

    function initUrlDeepLinking() {
        $(window).on("hashchange", function () {
            if (ML.ignoreHashChange) {
                ML.ignoreHashChange = false;
                return;
            }

            navigateToDirectoryFromHash();
        });
    }

    function startApp() {
        window.location.hash !== "" ? navigateToDirectoryFromHash() : navigateToHomeDirectory();
    }

    function navigateToDirectoryFromHash() {
        viewModel.clearErrors();
        var hash = window.location.hash;

        if (hash !== "") {
            var path = hash.substring(3, hash.length);
            ML.Services.getDirectoryContents(path, onGetDirectoryContentsSuccess, onGetDirectoryContentsError);
        }
        else {
            navigateToHomeDirectory();
        }
    }

    function navigateToHomeDirectory () {
        ML.Services.getDirectoryContents(SERVER_HOME_DIRECTORY, onGetDirectoryContentsSuccess, onGetDirectoryContentsError);
    }

    function onGetDirectoryContentsSuccess(result) {
        console.log("success", JSON.stringify(result));
        ML.Path.currentPath = result.FullPath;
        viewModel.init(result);
        viewModel.searchQuery.subscribe(viewModel.search);
    }

    function onGetDirectoryContentsError(result) {
        console.log("failure", JSON.stringify(result));
        viewModel.isError(true);
        viewModel.errorMessage(result.responseJSON);
    }

    function clearUiErrors() {
        viewModel.clearErrors();
    }

    // the overlay allows app to catch when user clicks outside
    // the context menu so we can hide it and clear selected row
    function addInvisibleOverlay() {
        // add overlay to DOM
        if ($("div.overlay").length === 0) {
            $("body").append("<div class='overlay'></div>");
        }

        // when overlay is clicked...
        $("div.overlay").on("click", function () {
            $("#contextMenu").hide();
            $("table tr").removeClass("selected");
            $(this).remove();
            viewModel.selectedItem.removeAll();
        });
    }

    function showContextMenu(clickEvent) {
        $("#contextMenu").show().css({
            top: clickEvent.pageY + "px",
            left: clickEvent.pageX + 20 + "px"
        });
    }

    function addSelectedStyleToClickedRow(clickEvent) {
        $(clickEvent.currentTarget).addClass("selected");
    }

    function getSelectedItemName(clickEvent) {
        var el = $(clickEvent.currentTarget).find("span.file-name")[0];
        return $(el).text();
    }

    // enables the view model to act on folders/files selected from the table
    function addSelectedItemToViewModel(fileName, isFile) {
        var selectedItem = {
            Name: fileName,
            IsFile: isFile
        };

        viewModel.selectedItem.push(selectedItem);

        // enable download for files only
        viewModel.downloadEnabled(isFile);
    }
});

// Since we have two tbody in our table we can't use conventional
// alternate row striping via tr:nth-child(). Instead we have to
// dynamically color them as files/folders are updated.
// Also, we add a delay so we don't update on every single change immediately
viewModel.directories.subscribe(function () {
    $("table tr").removeClass("odd");
    $("table tr:odd").addClass("odd");
});

viewModel.directories.extend({ rateLimit: 50 });

viewModel.files.subscribe(function () {
    $("table tr").removeClass("odd");
    $("table tr:odd").addClass("odd");
});

viewModel.files.extend({ rateLimit: 50 });