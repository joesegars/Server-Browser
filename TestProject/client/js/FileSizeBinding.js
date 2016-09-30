/* global ko, $ */

"use strict";

if (ko) {

    // converts a file size in bytes to kilobytes and formats it with commas
    ko.bindingHandlers.fileSize = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var valAccessor = valueAccessor();
            var value = ko.unwrap(valAccessor);

            var sizeText = (Math.ceil(value / 1024) + " KB").replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            $(element).text(sizeText);
        }
    };
}