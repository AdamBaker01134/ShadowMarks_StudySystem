/* Application Controller */
"use strict";

const STATE = {
    READY: "ready",
    NAVIGATING: "navigating",
    PLAYING: "playing",
    MARKING: "marking",
    COLOUR_PICKER: "colour_picker",
    SHAPE_PICKER: "shape_picker",
    HELP: "help",
    NO_INTERACTION: "no_interaction",
}

function Controller(model) {
    this.model = model;
    this.currentState = STATE.READY;
    this.savedState = STATE.READY;
    this.timer = null;
}

Controller.prototype.handleMouseMoved = function (event) {
    switch (this.model.currentStage) {
        case STAGE.TRAINING_BLOCK:
        case STAGE.BLOCK:
            switch (this.currentState) {
                case STATE.READY:
                case STATE.PLAYING:
                    this.model.setScrollbarHighlighted(this.model.checkScrollbarHit());
                    this.model.setShapeButtonHighlighted(this.model.checkShapeButtonHit());
                    this.model.setColourButtonHighlighted(this.model.checkColourButtonHit());
                    this.model.setHelpButtonHighlighted(this.model.checkHelpButtonHit());
                    const hit = this.model.checkVideoHit();
                    this.model.setHoverTarget(hit);
                    if (this.model.gridActive) {
                        this.model.setGridHighlight(hit);
                    }
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
}

Controller.prototype.handleMouseDragged = function (event) {
    switch (this.model.currentStage) {
        case STAGE.TRAINING_BLOCK:
        case STAGE.BLOCK:
            let hit = null;
            switch (this.currentState) {
                case STATE.NAVIGATING:
                    this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
                    break;
                case STATE.MARKING:
                    hit = this.model.checkVideoHit();
                    if (this.model.shadowMarkShape === SHAPES.FREEFORM && hit && hit === this.model.freeformTarget) {
                        this.model.addToFreeformPath((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height);
                    }
                    this.model.setHoverTarget(hit);
                    if (this.model.gridActive) {
                        this.model.setGridHighlight(hit);
                    }
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
}

Controller.prototype.handleMousePressed = function (event) {
    switch (this.model.currentStage) {
        case STAGE.TRAINING_BLOCK:
        case STAGE.BLOCK:
            let hit = null;
            switch (this.currentState) {
                case STATE.READY:
                case STATE.PLAYING:
                    if (this.model.checkScrollbarHit()) {
                        this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
                        this.savedState = this.currentState;
                        this.currentState = STATE.NAVIGATING;
                    } else if (this.model.checkHelpButtonHit()) {
                        this.model.setHelpMenuOpen(true);
                        this.savedState = this.currentState;
                        this.currentState = STATE.HELP;
                    } else if (this.model.shadowMarksEnabled && this.model.checkShapeButtonHit()) {
                        this.model.setShapeMenuOpen(true);
                        this.savedState = this.currentState;
                        this.currentState = STATE.SHAPE_PICKER;
                    } else if (this.model.shadowMarksEnabled && this.model.checkColourButtonHit()) {
                        this.model.setColourMenuOpen(true);
                        this.savedState = this.currentState;
                        this.currentState = STATE.COLOUR_PICKER;
                    } else if (hit = this.model.checkVideoHit()) {
                        if (event.ctrlKey) {
                            this.model.selectVideo(hit);
                            if (this.model.selectedVideo.name === blockDatasets[this.model.blockNum].correct) {
                                const time = new Date().getTime() - this.model.blockStartTime;
                                fetch(`http://${host}:3018/put/data`, {
                                    method: "POST",
                                    body: JSON.stringify({
                                        userId: this.model.id,
                                        shadowMarksEnabled: this.model.shadowMarksEnabled,
                                        block: this.model.blockNum,
                                        time: time,
                                        errors: this.model.blockErrors,
                                    }),
                                    headers: {
                                        "Content-type": "application/json; charset=UTF-8"
                                    }
                                });
                                clearInterval(this.timer);
                                this.currentState = STATE.NO_INTERACTION;
                                setTimeout(() => {
                                    this.model.selectVideo(null);
                                    this.model.clearVideos();
                                    this.model.clearShadowMarks();
                                    this.model.setIndex(0);
                                    this.model.setShape(SHAPES.CROSSHAIR);
                                    this.model.setColour(COLOURS.RED);
                                    this.currentState = STATE.READY;
                                    if (this.model.blockNum === this.model.totalBlocks-1) {
                                        this.model.setStage(STAGE.FINISHED);
                                    } else {
                                        this.model.setStage(STAGE.PRE_BLOCK);
                                        this.model.nextBlock();
                                        this.handleLoadBlock();
                                    }
                                }, 2000)
                            } else {
                                this.model.error();
                            }
                        } else if (this.model.shadowMarksEnabled) {
                            if (this.model.shadowMarkShape === SHAPES.FREEFORM) {
                                this.model.addToFreeformPath((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height);
                                this.model.setFreeformTarget(hit);
                            }
                            this.savedState = this.currentState;
                            this.currentState = STATE.MARKING;
                        }
                    }
                    break;
                case STATE.SHAPE_PICKER:
                    let shape = null;
                    if (shape = this.model.checkShapeMenuHit()) {
                        this.model.setShape(shape);
                    }
                    this.model.setShapeMenuOpen(false);
                    this.currentState = this.savedState;
                    break;
                case STATE.COLOUR_PICKER:
                    let colour = null;
                    if (colour = this.model.checkColourMenuHit()) {
                        this.model.setColour(colour);
                    }
                    this.model.setColourMenuOpen(false);
                    this.currentState = this.savedState;
                    break;
                case STATE.HELP:
                    this.model.setHelpMenuOpen(false);
                    this.currentState = this.savedState;
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
}

Controller.prototype.handleMouseReleased = function (event) {
    switch (this.model.currentStage) {
        case STAGE.TRAINING_BLOCK:
        case STAGE.BLOCK:
            let hit = null;
            switch (this.currentState) {
                case STATE.NAVIGATING:
                    this.currentState = this.savedState;
                    break;
                case STATE.MARKING:
                    if (hit = this.model.checkVideoHit()) {
                        if (this.model.shadowMarkShape === SHAPES.FREEFORM) {
                            this.model.addFreeformPathToShadowMarks();
                            this.model.setFreeformTarget(null);
                        } else {
                            this.model.addShadowMark((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height);
                        }
                    }
                    this.currentState = this.savedState;
                default:
                    break;
            }
        default:
            break;
    }
}

Controller.prototype.handleKeyPressed = function (event) {
    switch (this.model.currentStage) {
        case STAGE.TRAINING_BLOCK:
        case STAGE.BLOCK:
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
                                            if (this.currentState === STATE.MARKING) {
                                                this.savedState = STATE.READY;
                                            } else {
                                                this.currentState = STATE.READY;
                                            }
                                        } else {
                                            this.model.setIndex(this.model.index + 1);
                                        }
                                }
                            }, 50);
                            this.currentState = STATE.PLAYING;
                        }
                    }
                    if (event.ctrlKey && keyCode === 67 && this.model.shadowMarksEnabled) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.model.setShadowing(!this.model.shadowing);
                        this.model.setHoverTarget(this.model.checkVideoHit());
                    }
                    if (event.ctrlKey && keyCode === 71) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.model.setGridActive(!this.model.gridActive);
                        const hit = this.model.checkVideoHit();
                        this.model.setHoverTarget(hit);
                        if (this.model.gridActive) {
                            this.model.setGridHighlight(hit);
                        }
                    }
                    if (keyCode === 37) {
                        // Handle left arrow pressed
                        if (this.model.index > 0) {
                            event.preventDefault();
                            event.stopPropagation();
                            this.model.setIndex(this.model.index - 1);
                        }
                    }
                    if (keyCode === 39) {
                        // Handle right arrow pressed
                        if (this.model.index < this.model.getScrollbarSegments() - 1) {
                            event.preventDefault();
                            event.stopPropagation();
                            this.model.setIndex(this.model.index + 1);
                        }
                    }
                    break;
                default:
                    break;
            }
            break;
        case STAGE.INTRO:
            this.model.setStage(STAGE.PRE_TRAINING_BLOCK);
            break;
        case STAGE.PRE_TRAINING_BLOCK:
            this.model.setStage(STAGE.TRAINING_BLOCK);
            this.model.startBlock();
            break;
        case STAGE.PRE_BLOCK:
            this.model.setStage(STAGE.BLOCK);
            this.model.startBlock();
            break;
        default:
            break;
    }
}

Controller.prototype.handleScroll = function() {
    this.model.notifySubscribers();
}

Controller.prototype.handleLoadBlock = async function () {
    console.log(`Loading block #${this.model.blockNum}`);
    const dataset = blockDatasets[this.model.blockNum];
    const totalFrames = dataset.total;
    const names = dataset.names;
    for (let name = 0; name < names.length; name++) {
        let video = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 1; frame <= totalFrames; frame++) {
                video.push(loadImage(`img/baseball/block${this.model.blockNum}/${names[name]}/img${String(frame).padStart(3,"0")}.jpg`,
                    () => { if (++completed >= totalFrames) resolve() },
                    (err) => { if (++completed >= totalFrames) reject(err) }));
                labels.push("Frame " + frame);
            }
        });
        this.model.addVideo(video, labels, names[name]);
        this.model.setPercentLoaded(Math.floor(name/(names.length-1)*100));
    }
}

Controller.prototype.handleLoadNorthpole = async function () {
    console.log("Loading northpole dataset...");
    const firstYear = 1992, lastYear = 2022;
    const totalDays = 353;
    for (let year = firstYear; year <= lastYear; year++) {
        let video = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let day = 1; day <= totalDays; day++) {
                video.push(loadImage("img/northpole/" + year + "/" + year + "" + String(day).padStart(4, "0") + ".png",
                    () => { if (++completed >= totalDays) resolve() },
                    (err) => { if (++completed >= totalDays) reject(err) }));
                labels.push("Day " + day);
            }
        });
        this.model.addVideo(video, labels, year.toString());
        this.model.setPercentLoaded(Math.floor((firstYear - year) / (firstYear - lastYear) * 100));
    }
}

Controller.prototype.handleLoadSouthpole = async function () {
    console.log("Loading southpole dataset...");
    const firstYear = 1992, lastYear = 2022;
    const totalDays = 353;
    for (let year = firstYear; year <= lastYear; year++) {
        let video = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let day = 1; day <= totalDays; day++) {
                video.push(loadImage("img/southpole/" + year + "/" + year + "" + String(day).padStart(4, "0") + ".png",
                    () => { if (++completed >= totalDays) resolve() },
                    (err) => { if (++completed >= totalDays) reject(err) }));
                labels.push("Day " + day);
            }
        });
        this.model.addVideo(video, labels, year.toString());
        this.model.setPercentLoaded(Math.floor((firstYear - year) / (firstYear - lastYear) * 100));
    }
}


Controller.prototype.handleLoadArabidopsis = async function () {
    console.log("Loading arabidopsis dataset...");
    const firstPlant = 1, lastPlant = 12;
    const totalImages = 396;
    for (let plant = firstPlant; plant <= lastPlant; plant++) {
        let video = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let day = 4;
            let hour = 930;
            let completed = 0;
            for (let img = 0; img < totalImages; img++){
                video.push(loadImage("img/arabidopsis/fov-" + String(plant).padStart(2,"0")+"/2017-02-" + String(day).padStart(2,"0") + "_" + String(hour).padStart(4,"0") + "_ch129-pos" + String(plant).padStart(2,"0") + ".jpg",
                    () => { if (++completed >= totalImages) resolve() },
                    (err) => { if (++completed >= totalImages) reject(err) }));
                labels.push("Day " + day + " - " + Math.floor(hour/100).toString().padStart(2,"0") + ":" + (hour%100).toString().padStart(2,"0"));
                if (hour === 1630) {
                    hour = 900;
                    day++;
                } else {
                    if (hour % 100 === 0) hour += 30;
                    else hour += 70;
                }
            }
        });
        this.model.addVideo(video, labels, "Specimen #" + String(plant).padStart(2,"0"));
        this.model.setPercentLoaded(Math.floor((firstPlant - plant) / (firstPlant - lastPlant) * 100));
    }
}

Controller.prototype.handleLoadStocks = async function () {
    console.log("Loading stocks dataset...");
    const stocks = ["AAPL", "AMD", "AMZN", "CSCO", "META", "MSFT", "NFLX", "QCOM", "SBUX", "TSLA"]
    const firstYear = 2014, lastYear = 2024;
    const totalImages = 10;
    for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i];
        let video = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let year = firstYear; year < lastYear; year++) {
                video.push(loadImage("img/stocks/" + stock + "/" + year + ".png",
                    () => { if (++completed >= totalImages) resolve() },
                    (err) => { if (++completed >= totalImages) reject() }));
                labels.push(year.toString());
            }
        });
        this.model.addVideo(video, labels, stock);
        this.model.setPercentLoaded(Math.floor(i/(stocks.length-1)*100))
    }
}