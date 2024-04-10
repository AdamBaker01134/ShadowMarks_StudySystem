/* Application Model */
"use strict";

const SHAPES = {
    CROSSHAIR: "crosshair",
    CROSS: "cross",
    SQUARE: "square",
    CIRCLE: "circle",
    FREEFORM: "freeform",
}

const COLOURS = {
    WHITE: { r: 255, g: 255, b: 255 },
    BLACK: { r: 0, g: 0, b: 0 },
    RED: { r: 255, g: 0, b: 0 },
    GREEN: { r: 0, g: 255, b: 0 },
    BLUE: { r: 0, g: 0, b: 255 },
    YELLOW: { r: 255, g: 255, b: 0 },
    MAGENTA: { r: 255, g: 0, b: 255},
    CYAN: { r: 0, g: 255, b: 255 },
}

const STAGE = {
    INTRO: "intro",
    PRE_TRAINING_BLOCK: "pre_training_block",
    TRAINING_BLOCK: "training_block",
    PRE_BLOCK: "pre_block",
    BLOCK: "block",
    FINISHED: "finished",
}

function Model() {
    this.subscribers = [];
    this.percentLoaded = 0;
    this.videos = [];

    this.shadowMarks = [];
    this.shadowMarkShape = SHAPES.FREEFORM;
    this.shadowMarkColour = COLOURS.RED;
    this.freeformPath = [];
    this.freeformTarget = null;

    this.index = 0;
    this.scrollbarHighlighted = false;

    this.shapeButtonHighlighted = false;
    this.colourButtonHighlighted = false;
    this.helpButtonHighlighted = false;
    this.shapeMenuOpen = false;
    this.colourMenuOpen = false;
    this.helpMenuOpen = false;

    this.shadowing = false;
    this.hoverTarget = null;

    this.selectedVideo = null;
    this.id = -1;
    this.blockNum = 0;
    this.totalBlocks = 6;
    this.blockErrors = 0;
    this.blockStartTime = 0;
    this.currentStage = STAGE.INTRO;
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

Model.prototype.setId = function (id) {
    this.id = id;
    this.notifySubscribers();
}

Model.prototype.setStage = function (stage) {
    if (this.currentStage != stage) {
        this.currentStage = stage;
        this.notifySubscribers();
    }
}

Model.prototype.nextBlock = function () {
    this.blockNum += 1;
    this.notifySubscribers();
}

Model.prototype.startBlock = function () {
    this.blockStartTime = new Date().getTime();
    this.blockErrors = 0;
    this.notifySubscribers();
}

Model.prototype.error = function () {
    this.blockErrors++;
    this.notifySubscribers();
}

Model.prototype.setPercentLoaded = function (percent) {
    this.percentLoaded = percent;
    if (this.percentLoaded == 100) {
        // User and percentage bar are racing. Whoever finishes last sets the start block time.
        this.startBlock();
    } else {
        this.notifySubscribers();
    }
}

Model.prototype.addVideo = function (video, labels, name) {
    let x = 0;
    let y = 0;
    this.videos.forEach(video => {
        x += video.width;
        if (x + video.width > width) {
            x = 0;
            y += video.height;
        }
    });
    this.videos.push(new Video(video, labels, name, x, y));
    this.notifySubscribers();
}

Model.prototype.clearVideos = function () {
    this.videos = [];
    this.notifySubscribers();
}

Model.prototype.checkVideoHit = function () {
    for (let i = 0; i < this.videos.length; i++) {
        if (this.videos[i].checkHit(mouseX, mouseY)) return this.videos[i];
    }
    return null;
}

Model.prototype.selectVideo = function (video) {
    if (video != this.selectedVideo) {
        this.selectedVideo = video;
        this.notifySubscribers();
    }
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

Model.prototype.setShapeButtonHighlighted = function (highlighted) {
    if (this.shapeButtonHighlighted != highlighted) {
        this.shapeButtonHighlighted = highlighted;
        this.notifySubscribers();
    }
}

Model.prototype.setColourButtonHighlighted = function (highlighted) {
    if (this.colourButtonHighlighted != highlighted) {
        this.colourButtonHighlighted = highlighted;
        this.notifySubscribers();
    }
}

Model.prototype.setHelpButtonHighlighted = function (highlighted) {
    if (this.helpButtonHighlighted != highlighted) {
        this.helpButtonHighlighted = highlighted;
        this.notifySubscribers();
    }
}

Model.prototype.setShadowing = function (shadowing) {
    if (this.shadowing != shadowing) {
        this.shadowing = shadowing;
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
        colour: this.shadowMarkColour,
    });
    this.notifySubscribers();
}

Model.prototype.addToFreeformPath = function (widthRatio, heightRatio) {
    if (keyIsDown(SHIFT) && this.freeformPath.length > 1) {
        this.freeformPath = [
            this.freeformPath[0],
            {
                widthRatio: widthRatio,
                heightRatio: heightRatio,
            }
        ];
    } else {
        this.freeformPath.push({
            widthRatio: widthRatio,
            heightRatio: heightRatio,
        });
    }
    this.notifySubscribers();
}

Model.prototype.addFreeformPathToShadowMarks = function () {
    this.shadowMarks.push({
        path: this.freeformPath,
        shape: this.shadowMarkShape,
        colour: this.shadowMarkColour,
    });
    this.freeformPath = [];
    this.notifySubscribers();
}

Model.prototype.setFreeformTarget = function (target) {
    if (this.freeformTarget != target) {
        this.freeformTarget = target;
        this.notifySubscribers();
    }
}

Model.prototype.setHoverTarget = function (target) {
    this.hoverTarget = target;
    this.notifySubscribers();
}

Model.prototype.popLastShadowMark = function () {
    if (this.shadowMarks.length > 0) {
        this.shadowMarks.pop();
        this.notifySubscribers();
    }
}

Model.prototype.checkShapeButtonHit = function () {
    const x = this.getScrollbarX() + this.getScrollbarWidth() + 25;
    const y = this.getScrollbarY() - 60;
    const length = 50;
    return mouseX > x && mouseX < x + length && mouseY > y && mouseY < y + length;
}

Model.prototype.setShapeMenuOpen = function (open) {
    if (this.shapeMenuOpen != open) {
        this.shapeMenuOpen = open;
        this.notifySubscribers();
    }
}

Model.prototype.checkShapeMenuHit = function () {
    const width = 30 * 3 + 20;
    const height = 30 * 2 + 20;
    const x = this.getScrollbarX() + this.getScrollbarWidth() + 25 + 50 - width;
    const y = this.getScrollbarY() - 60 + 50 - height;
    const mx = mouseX, my = mouseY;
    if (mx>x+10 && mx<x+40 && my>y+10 && my<y+40) return SHAPES.CROSSHAIR;
    else if (mx>x+40 && mx<x+70 && my>y+10 && my<y+40) return SHAPES.CROSS;
    else if (mx>x+70 && mx<x+100 && my>y+10 && my<y+40) return SHAPES.SQUARE;
    else if (mx>x+25 && mx<x+55 && my>y+40 && my<y+70) return SHAPES.CIRCLE;
    else if (mx>x+55 && mx<x+85 && my>y+40 && my<y+70) return SHAPES.FREEFORM;
    else return null;
}

Model.prototype.setShape = function (shape) {
    this.shadowMarkShape = shape;
    this.notifySubscribers();
}

Model.prototype.checkColourButtonHit = function () {
    const x = this.getScrollbarX() + this.getScrollbarWidth() + 25;
    const y = this.getScrollbarY();
    const length = 50;
    return mouseX > x && mouseX < x + length && mouseY > y && mouseY < y + length;
}

Model.prototype.setColourMenuOpen = function (open) {
    if (this.colourMenuOpen != open) {
        this.colourMenuOpen = open;
        this.notifySubscribers();
    }
}

Model.prototype.checkColourMenuHit = function () {
    const width = 30 * 4 + 20;
    const height = 30 * 2 + 20;
    const x = this.getScrollbarX() + this.getScrollbarWidth() + 25 + 50 - width;
    const y = this.getScrollbarY() + 50 - height;
    const mx = mouseX, my = mouseY;
    if (mx>x+10 && mx<x+40 && my>y+10 && my<y+40) return COLOURS.BLACK;
    else if (mx>x+40 && mx<x+70 && my>y+10 && my<y+40) return COLOURS.WHITE;
    else if (mx>x+70 && mx<x+100 && my>y+10 && my<y+40) return COLOURS.RED;
    else if (mx>x+100 && mx<x+130 && my>y+10 && my<y+40) return COLOURS.GREEN;
    else if (mx>x+10 && mx<x+40 && my>y+40 && my<y+70) return COLOURS.BLUE;
    else if (mx>x+40 && mx<x+70 && my>y+40 && my<y+70) return COLOURS.YELLOW;
    else if (mx>x+70 && mx<x+100 && my>y+40 && my<y+70) return COLOURS.CYAN;
    else if (mx>x+100 && mx<x+130 && my>y+40 && my<y+70) return COLOURS.MAGENTA;
    else return null;
}

Model.prototype.setColour = function (colour) {
    this.shadowMarkColour = colour;
    this.notifySubscribers();
}

Model.prototype.setHelpMenuOpen = function (open) {
    if (this.helpMenuOpen != open) {
        this.helpMenuOpen = open;
        this.notifySubscribers();
    }
}

Model.prototype.checkHelpButtonHit = function () {
    const x = this.getScrollbarX();
    const y = height - 15;
    const w = 50;
    const h = 25;
    return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
    this.notifySubscribers();
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged());
}