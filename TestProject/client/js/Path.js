"use strict";

window.ML = window.ML || {}

// Tracks the current path and exposes some helper functions for path related logic
ML.Path = {
    currentPath: "",

    // returns the parent directory of current path
    getParentDirectory: function () {
        var pathArr = this.currentPath.split("\\");

        // if we're at the root, we can't go up any further
        var alreadyAtRootDirectory = pathArr.length === 2 && pathArr[1] === "";
        if (alreadyAtRootDirectory) {
            return this.currentPath;
        }

        // pop the current folder
        pathArr.pop();

        // if we are now at the root, we need to add trailing slashes removed by split
        var onlyRootDirectoryRemains = pathArr.length === 1;
        if (onlyRootDirectoryRemains) {
            return pathArr[0] + "\\";
        }

        // return parent path
        return pathArr.join("\\");
    },

    // returns current path + sub directory
    getSubDirectory: function (subDirectory) {
        return this.currentPath + "\\" + subDirectory;
    },

    // returns the directory path to a given folder
    getDirectoryByName: function (directoryName) {
        var directoryIndex = this.currentPath.indexOf(directoryName);

        var rootDirectoryRequested = directoryIndex === 0;
        if (rootDirectoryRequested) {
            return directoryName + "\\";
        }

        return this.currentPath.substring(0, (directoryIndex + directoryName.length));
    }
}