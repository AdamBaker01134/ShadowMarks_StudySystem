/* Application Controller */
"use strict";

const STATE = {
    READY: "ready",
    NAVIGATING: "navigating",
    PLAYING: "playing",
}

function Controller(model) {
    this.model = model;
    this.currentState = STATE.READY;
    this.savedState = STATE.READY;
    this.timer = null;
}

Controller.prototype.handleMouseMoved = function (event) {
    this.model.setScrollbarHighlighted(this.model.checkScrollbarHit());
}

Controller.prototype.handleMouseDragged = function (event) {
    switch (this.currentState) {
        case STATE.NAVIGATING:
            this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
            break;
        default:
            break;
    }
}

Controller.prototype.handleMousePressed = function (event) {
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            if (this.model.checkScrollbarHit()) {
                this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
                this.savedState = this.currentState;
                this.currentState = STATE.NAVIGATING;
            }
            break;
        default:
            break;
    }
}

Controller.prototype.handleMouseReleased = function (event) {
    switch (this.currentState) {
        case STATE.NAVIGATING:
            this.currentState = this.savedState;
            break;
        default:
            break;
    }
}

Controller.prototype.handleKeyPressed = function (event) {
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            if (event.ctrlKey && keyCode === 187) {
                // Handle ctrl + "+" pressed
                event.preventDefault();
                event.stopPropagation();
                this.model.zoomIn();
            }
            if (event.ctrlKey && keyCode === 189) {
                // Handle ctrl + "-" pressed
                event.preventDefault();
                event.stopPropagation();
                this.model.zoomOut();
            }
            if (keyCode === 32) {
                // Handle spacebar pressed
                event.preventDefault();
                event.stopPropagation();
                if (this.currentState === STATE.PLAYING) {
                    clearInterval(this.timer);
                    this.currentState = STATE.READY;
                } else {
                    if (this.model.index + 1 >= this.model.getScrollbarSegments()) {
                        this.model.setIndex(0);
                    }
                    this.timer = setInterval(() => {
                        switch(this.currentState) {
                            case STATE.READY:
                            case STATE.PLAYING:
                                if (this.model.index + 1 >= this.model.getScrollbarSegments()) {
                                    clearInterval(this.timer);
                                    this.currentState = STATE.READY;
                                } else {
                                    this.model.setIndex(this.model.index + 1);
                                }
                        }
                    }, 50);
                    this.currentState = STATE.PLAYING;
                }
            }
            break;
        default:
            break;
    }
}

Controller.prototype.handleScroll = function() {
    this.model.notifySubscribers();
}

Controller.prototype.handleLoadNorthpole = async function () {
    console.log("Loading northpole dataset...");
    const firstYear = 1992, lastYear = 2022;
    const totalDays = 353;
    for (let year = firstYear; year <= lastYear; year++) {
        let video = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let day = 1; day <= totalDays; day++) {
                video.push(loadImage("img/northpole/" + year + "/" + year + "" + String(day).padStart(4, "0") + ".png",
                    () => { if (++completed >= totalDays) resolve() },
                    (err) => { if (++completed >= totalDays) reject(err) }));
            }
        });
        this.model.addVideo(video);
        this.model.setPercentLoaded(Math.floor((firstYear - year) / (firstYear - lastYear) * 100));
    }
}

Controller.prototype.handleLoadSouthpole = async function () {
    console.log("Loading southpole dataset...");
    const firstYear = 1992, lastYear = 2022;
    const totalDays = 353;
    for (let year = firstYear; year <= lastYear; year++) {
        let video = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let day = 1; day <= totalDays; day++) {
                video.push(loadImage("img/southpole/" + year + "/" + year + "" + String(day).padStart(4, "0") + ".png",
                    () => { if (++completed >= totalDays) resolve() },
                    (err) => { if (++completed >= totalDays) reject(err) }));
            }
        });
        this.model.addVideo(video);
        this.model.setPercentLoaded(Math.floor((firstYear - year) / (firstYear - lastYear) * 100));
    }
}