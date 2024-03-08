/* Application Video Object */
"use strict";

function Video(images, name, x, y) {
    this.images = images;
    this.name = name;
    this.x = x;
    this.y = y;
    this.aspectRatio = this.images[0].width / this.images[0].height;
    this.width = width / 10;
    this.height = this.width / this.aspectRatio;
}

Video.prototype.setWidth = function(width) {
    if (width >= 0) this.width = width;
}

Video.prototype.setHeight = function(height) {
    if (height >= 0) this.height = height;
}

Video.prototype.setX = function(x) {
    if (x >= 0) this.x = x;
}

Video.prototype.setY = function(y) {
    if (y >= 0) this.y = y;
}