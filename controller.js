/* Application Controller */
"use strict";

const STATE = {
    READY: "ready",
    NAVIGATING: "navigating",
    PLAYING: "playing",
    MARKING: "marking",
    COLOUR_PICKER: "colour_picker",
    SHAPE_PICKER: "shape_picker",
}

function Controller(model) {
    this.model = model;
    this.currentState = STATE.READY;
    this.savedState = STATE.READY;
    this.timer = null;
}

Controller.prototype.handleMouseMoved = function (event) {
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            this.model.setScrollbarHighlighted(this.model.checkScrollbarHit());
            this.model.setShapeButtonHighlighted(this.model.checkShapeButtonHit());
            this.model.setColourButtonHighlighted(this.model.checkColourButtonHit());
            break;
        default:
            break;
    }
}

Controller.prototype.handleMouseDragged = function (event) {
    let hit = null;
    switch (this.currentState) {
        case STATE.NAVIGATING:
            this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
            break;
        case STATE.MARKING:
            if (this.model.shadowMarkShape === SHAPES.FREEFORM && (hit = this.model.checkVideoHit())) {
                this.model.addToFreeformPath((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height);
            }
            break;
        default:
            break;
    }
}

Controller.prototype.handleMousePressed = function (event) {
    let hit = null;
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            if (this.model.checkScrollbarHit()) {
                this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
                this.savedState = this.currentState;
                this.currentState = STATE.NAVIGATING;
            } else if (hit = this.model.checkVideoHit()) {
                if (this.model.shadowMarkShape === SHAPES.FREEFORM) {
                    this.model.addToFreeformPath((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height);
                }
                this.savedState = this.currentState;
                this.currentState = STATE.MARKING;
            } else if (this.model.checkShapeButtonHit()) {
                this.model.setShapeMenuOpen(true);
                this.savedState = this.currentState;
                this.currentState = STATE.SHAPE_PICKER;
            } else if (this.model.checkColourButtonHit()) {
                this.model.setColourMenuOpen(true);
                this.savedState = this.currentState;
                this.currentState = STATE.COLOUR_PICKER;
            }
            break;
        case STATE.SHAPE_PICKER:
            let shape = null;
            if (shape = this.model.checkShapeMenuHit()) {
                this.model.setShape(shape);
            }
            this.model.setShapeMenuOpen(false);
            this.currentState = this.savedState;
        case STATE.COLOUR_PICKER:
            let colour = null;
            if (colour = this.model.checkColourMenuHit()) {
                this.model.setColour(colour);
            }
            this.model.setColourMenuOpen(false);
            this.currentState = this.savedState;
        default:
            break;
    }
}

Controller.prototype.handleMouseReleased = function (event) {
    let hit = null;
    switch (this.currentState) {
        case STATE.NAVIGATING:
            this.currentState = this.savedState;
            break;
        case STATE.MARKING:
            if (hit = this.model.checkVideoHit()) {
                if (this.model.shadowMarkShape === SHAPES.FREEFORM) {
                    this.model.addFreeformPathToShadowMarks();
                } else {
                    this.model.addShadowMark((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height);
                }
            }
            this.currentState = this.savedState;
        default:
            break;
    }
}

Controller.prototype.handleKeyPressed = function (event) {
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            if (event.ctrlKey && keyCode === 90) {
                // Handle ctrl + z pressed
                event.preventDefault();
                event.stopPropagation();
                this.model.popLastShadowMark();
            }
            if (event.ctrlKey && keyCode === 187) {
                // Handle ctrl + "+" pressed
                event.preventDefault();
                event.stopPropagation();
                this.model.zoomIn();
                this.model.updateVideoLocations();
            }
            if (event.ctrlKey && keyCode === 189) {
                // Handle ctrl + "-" pressed
                event.preventDefault();
                event.stopPropagation();
                this.model.zoomOut();
                this.model.updateVideoLocations();
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
                            case STATE.MARKING:
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
        this.model.addVideo(video, year.toString());
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
        this.model.addVideo(video, year.toString());
        this.model.setPercentLoaded(Math.floor((firstYear - year) / (firstYear - lastYear) * 100));
    }
}