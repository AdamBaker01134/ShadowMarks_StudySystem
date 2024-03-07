/* Application Video Object */
"use strict";

function Video(images) {
    this.images = images;
    this.index = 0;
    this.aspectRatio = this.images[0].width / this.images[0].height;
    this.width = width / 10;
    this.height = this.width / this.aspectRatio;
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

Video.prototype.setWidth = function(width) {
    if (width >= 0) this.width = width;
}

Video.prototype.setHeight = function(height) {
    if (height >= 0) this.height = height;
}