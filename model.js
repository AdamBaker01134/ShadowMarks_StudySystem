/* Application Model */
"use strict";

function Model() {
    this.subscribers = [];
    this.percentLoaded = 0;
    this.videos = [];
}

Model.prototype.setPercentLoaded = function (percent) {
    this.percentLoaded = percent;
    this.notifySubscribers();
}

Model.prototype.addVideo = function (video) {
    this.videos.push(new Video(video));
    this.notifySubscribers();
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
    this.notifySubscribers();
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged());
}