/* Application Model */
"use strict";

const SHAPES = {
    CROSSHAIR: "crosshair",
    CROSS: "cross",
    SQUARE: "square",
    CIRCLE: "circle",
    FREEFORM: "freeform",
}

function Model() {
    this.subscribers = [];
    this.percentLoaded = 0;
    this.videos = [];

    this.shadowMarks = [];
    this.shadowMarkShape = SHAPES.SQUARE;
    this.shadowMarkColour = { r: 255, g: 0, b: 0 };
    this.freeformPath = [];

    this.index = 0;
    this.scrollbarHighlighted = false;
}

Model.prototype.updateVideoLocations = function () {
    let x = 0;
    let y = 0;
    this.videos.forEach(video => {
        video.setX(x);
        video.setY(y);
        x += video.width;
        if (x + video.width > width) {
            x = 0;
            y += video.height;
        }
    });
    this.notifySubscribers();
}

Model.prototype.setPercentLoaded = function (percent) {
    this.percentLoaded = percent;
    this.notifySubscribers();
}

Model.prototype.addVideo = function (video, name) {
    let x = 0;
    let y = 0;
    this.videos.forEach(video => {
        x += video.width;
        if (x + video.width > width) {
            x = 0;
            y += video.height;
        }
    });
    this.videos.push(new Video(video, name, x, y));
    this.notifySubscribers();
}

Model.prototype.checkVideoHit = function () {
    for (let i = 0; i < this.videos.length; i++) {
        if (this.videos[i].checkHit(mouseX, mouseY)) return this.videos[i];
    }
    return null;
}

Model.prototype.zoomIn = function () {
    this.videos.forEach(video => {
        const vWidth = video.width;
        const vHeight = video.height;
        const aspectRatio = vWidth / vHeight;
        video.setWidth(vWidth + 20 * aspectRatio);
        video.setHeight(vHeight + 20);
    });
    this.notifySubscribers();
}

Model.prototype.zoomOut = function () {
    this.videos.forEach(video => {
        const vWidth = video.width;
        const vHeight = video.height;
        const aspectRatio = vWidth / vHeight;
        video.setWidth(vWidth - 20 * aspectRatio);
        video.setHeight(vHeight - 20);
    });
    this.notifySubscribers();
}

Model.prototype.getScrollbarSegments = function () {
    if (this.videos.length > 0) {
        // Assuming all loaded videos have the same number of frames.
        return this.videos[0].images.length;
    }
    return 0;
}

Model.prototype.getScrollbarX = function () {
    return 100;
}

Model.prototype.getScrollbarY = function () {
    return height+scrollY-50-20;
}

Model.prototype.getScrollbarWidth = function () {
    return width-200;
}

Model.prototype.getScrollbarHeight = function () {
    return 20;
}

// Slightly larger hitbox.
Model.prototype.checkScrollbarHit = function () {
    return mouseX > 100 && mouseX < width-100 &&
        mouseY > height+scrollY-100 && mouseY < height+scrollY-50;
}

Model.prototype.setIndex = function (index) {
    this.index = index;
    this.notifySubscribers();
}

Model.prototype.setScrollbarHighlighted = function (highlighted) {
    if (this.scrollbarHighlighted != highlighted) {
        this.scrollbarHighlighted = highlighted;
        this.notifySubscribers();
    }
}

Model.prototype.getIndexFromMouse = function (x, mx, segments, width) {
    let idx = (int)(map(
        mx,                 // value to map
        x,                  // min value of mx
        x + width,          // max value of mx
        0,                  // min value of desired index
        segments            // max value of desired index
    ));

    if (idx >= segments) {
        idx = segments - 1;
    } else if (idx < 0) {
        idx = 0;
    }
    return idx;
}

Model.prototype.addShadowMark = function (widthRatio, heightRatio) {
    this.shadowMarks.push({
        widthRatio: widthRatio,
        heightRatio: heightRatio,
        shape: this.shadowMarkShape,
    });
    this.notifySubscribers();
}

Model.prototype.addToFreeformPath = function (widthRatio, heightRatio) {
    this.freeformPath.push({
        widthRatio: widthRatio,
        heightRatio: heightRatio,
    });
    this.notifySubscribers();
}

Model.prototype.addFreeformPathToShadowMarks = function () {
    this.shadowMarks.push({
        path: this.freeformPath,
        shape: this.shadowMarkShape,
    });
    this.freeformPath = [];
    this.notifySubscribers();
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
    this.notifySubscribers();
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged());
}