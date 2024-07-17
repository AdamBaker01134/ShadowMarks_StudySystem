/* Application Video Object */
"use strict";

function Video(images, labels, name, x, y) {
    this.images = images;
    this.labels = labels;
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = this.images[0].width;
    this.height = this.images[0].height;
    this.aspectRatio = this.width / this.height;
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

Video.prototype.checkHit = function (mx, my) {
    return mx > this.x && mx < this.x + this.width && my > this.y && my < this.y + this.height;
}