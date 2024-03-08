/* Application Model */
"use strict";

function Model() {
    this.subscribers = [];
    this.percentLoaded = 0;
    this.videos = [];

    this.index = 0;
    this.scrollbarHighlighted = false;
}

Model.prototype.setPercentLoaded = function (percent) {
    this.percentLoaded = percent;
    this.notifySubscribers();
}

Model.prototype.addVideo = function (video, name) {
    this.videos.push(new Video(video, name));
    this.notifySubscribers();
}

Model.prototype.zoomIn = function () {
    this.videos.forEach(video => {
        const vWidth = video.getWidth();
        const vHeight = video.getHeight();
        const aspectRatio = vWidth / vHeight;
        video.setWidth(vWidth + 20 * aspectRatio);
        video.setHeight(vHeight + 20);
    });
    this.notifySubscribers();
}

Model.prototype.zoomOut = function () {
    this.videos.forEach(video => {
        const vWidth = video.getWidth();
        const vHeight = video.getHeight();
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

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
    this.notifySubscribers();
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged());
}