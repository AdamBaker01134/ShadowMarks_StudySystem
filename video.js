/* Application Video Object */
"use strict";

function Video(images) {
    this.images = images;
    this.index = 0;
    this.width = this.images[0].width;
    this.height = this.images[0].height;
}

Video.prototype.setIndex = function(index) {
    this.index = index;
}

Video.prototype.getWidth = function() {
    return this.width;
}

Video.prototype.getHeight = function() {
    return this.height;
}