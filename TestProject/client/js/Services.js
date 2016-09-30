/* global ML, $ */

"use strict";

window.ML = window.ML || {};

function makeAjaxRequest(url, type, onSuccess, onError) {
    $.ajax({
        type: type,
        url: url,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: onSuccess || function (result) { console.log("success", JSON.stringify(result)); },
        error: onError || function (error) { console.log("failure", JSON.stringify(error)); }
    });
}

// API Services
ML.Services = {

    // Gets the contents of the given directory
    getDirectoryContents: function(path, onSuccess, onError) {
        var url = "api/directory/getdirectorycontents/" + path;
        console.log("requesting contents of '" + path + "'");
        makeAjaxRequest(url, "GET", onSuccess, onError);
    },

    // Creates a folder
    createFolder: function (path, onSuccess, onError) {
        var url = "api/directory/createdirectory/" + path;
        console.log("creating directory '" + path + "'");
        makeAjaxRequest(url, "POST", onSuccess, onError);
    },

    // Removes a folder
    deleteFolder: function (path, onSuccess, onError) {
        var url = "api/directory/deletedirectory/" + path;
        console.log("recursively deleting folder '" + path + "'");
        makeAjaxRequest(url, "DELETE", onSuccess, onError);
    },

    // Removes a file
    deleteFile: function (path, onSuccess, onError) {
        var url = "api/directory/deletefile/" + path;
        console.log("deleting file '" + path + "'");
        makeAjaxRequest(url, "DELETE", onSuccess, onError);
    }
};