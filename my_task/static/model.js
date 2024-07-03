/* Application Model */
"use strict";

const INTERACTIONS = {
    SMALL_MULTIPLES: "smallMultiples",
    OVERLAYS: "overlays",
    SHADOW_MARKER: "shadowMarkers",
}

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

function Model() {
    this.subscribers = [];
    this.percentLoaded = 0;
    this.videos = [];

    this.shadowMarks = [];
    this.shadowMarkShape = SHAPES.CROSSHAIR;
    this.shadowMarkColour = COLOURS.RED;
    this.freeformPath = [];
    this.freeformTarget = null;
    this.freeformStraight = false;

    this.index = 0;
    this.scrollbarHighlighted = false;

    this.shapeButtonHighlighted = false;
    this.colourButtonHighlighted = false;
    this.helpButtonHighlighted = false;
    this.shapeMenuOpen = false;
    this.colourMenuOpen = false;
    this.helpMenuOpen = false;

    this.shadowing = false;
    this.gridActive = false;
    this.hoverTarget = null;
    this.gridHighlight = -1;

    this.highlightedMarker = null;
    this.selectedVideos = [];
    this.interaction = INTERACTIONS.SHADOW_MARKER;
    this.task = 1;
    this.category = "";
    this.block = 1;
    this.log = [];
    this.trialLog = [];
    this.blockStartTime = 0;

    this.tutorialChecklist = [];
    this.currentChecklistPrompt = 0;

    this.overlay = [];

    this.exampleImage = null;
}

Model.prototype.setTutorialChecklist = function (checklist) {
    this.tutorialChecklist = checklist;
    this.notifySubscribers();
}

Model.prototype.nextPrompt = function () {
    if (this.tutorialChecklist.length > 0) {
        this.currentChecklistPrompt++;
        this.notifySubscribers();
    }
}

Model.prototype.setCategory = function (category) {
    if (category !== this.category) {
        this.category = category;
        this.notifySubscribers();
    }
}

Model.prototype.nextBlock = function () {
    this.block++;
    this.notifySubscribers();
}

Model.prototype.startBlock = function () {
    this.blockStartTime = new Date().getTime();
    this.notifySubscribers();
}

Model.prototype.setInteraction = function (interaction) {
    this.interaction = interaction;
    this.notifySubscribers();
}

Model.prototype.setTask = function (task) {
    this.task = task;
    this.notifySubscribers();
}

Model.prototype.setExampleImage = function (image) {
    this.exampleImage = image;
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
        if (this.interaction === INTERACTIONS.OVERLAYS || this.task === 1) {
            if (x + video.width > width - video.width - 20) {
                x = 0;
                y += video.height;
            }
        } else {
            if (x + video.width > width) {
                x = 0;
                y += video.height;
            }
        }
    });
    this.videos.push(new Video(video, labels, name, x, y));
    this.notifySubscribers();
}

Model.prototype.updateVideoLocations = function () {
    let x = 0;
    let y = 0;
    this.videos.forEach(video => {
        video.setX(x);
        video.setY(y);
        x += video.width;
        if (this.interaction === INTERACTIONS.OVERLAYS || this.task === 1) {
            if (x + video.width > width - video.width - 20) {
                x = 0;
                y += video.height;
            }
        } else {
            if (x + video.width > width) {
                x = 0;
                y += video.height;
            }
        }
    });
    this.notifySubscribers();
}

Model.prototype.clearVideos = function () {
    this.videos = [];
    this.overlay = [];
    this.selectedVideos = [];
    this.clearShadowMarks();
    this.notifySubscribers();
}

Model.prototype.addToOverlay = function (video) {
    if (!this.overlay.includes(video)) {
        this.overlay.push(video);
        this.notifySubscribers();
    }
}

Model.prototype.popFromOverlay = function () {
    if (this.overlay.length > 0) {
        this.overlay.pop();
        this.notifySubscribers();
    }
}

Model.prototype.checkOverlayHit = function () {
    // Overlay rectangle is only in play when the overlay interaction technique is active or during task 1 where it is an example image.
    if (this.videos.length > 0 && (this.interaction === INTERACTIONS.OVERLAYS || this.task === 1)) {
        let ow = this.videos[0].width;
        let oh = this.videos[0].height;
        let ox = this.getScrollbarX() + this.getScrollbarWidth() + 75 - ow;
        let oy = scrollY;
        return mouseX > ox && mouseX < ox + ow && mouseY > oy && mouseY < oy + oh;
    } else {
        return false;
    }
}

Model.prototype.checkVideoHit = function () {
    for (let i = 0; i < this.videos.length; i++) {
        if (this.videos[i].checkHit(mouseX, mouseY)) return this.videos[i];
    }
    return null;
}

Model.prototype.highlightMarker = function (marker) {
    if (marker != this.highlightedMarker) {
        this.highlightedMarker = marker;
        this.notifySubscribers();
    }
}

Model.prototype.selectVideo = function (video) {
    let index;
    if ((index = this.selectedVideos.indexOf(video)) > -1) {
        this.selectedVideos.splice(index, 1);
        this.notifySubscribers();
    } else {
        this.selectedVideos.push(video);
        this.notifySubscribers();
    }
}

Model.prototype.zoomIn = function () {
    this.videos.forEach(video => {
        const vWidth = video.width;
        const vHeight = video.height;
        const aspectRatio = vWidth / vHeight;
        const increment = Math.max(vWidth,vHeight) * 0.1;
        video.setWidth(vWidth + increment * aspectRatio);
        video.setHeight(vHeight + increment);
    });
    this.notifySubscribers();
}

Model.prototype.zoomOut = function () {
    this.videos.forEach(video => {
        const vWidth = video.width;
        const vHeight = video.height;
        const aspectRatio = vWidth / vHeight;
        const decrement = Math.max(vWidth, vHeight) * 0.1;
        video.setWidth(vWidth - decrement * aspectRatio);
        video.setHeight(vHeight - decrement);
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
    return windowHeight+scrollY-50-20;
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
        mouseY > windowHeight+scrollY-100 && mouseY < windowHeight+scrollY-50;
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

Model.prototype.setGridActive = function (gridActive) {
    if (this.gridActive != gridActive) {
        this.gridActive = gridActive;
        this.notifySubscribers();
    }
}

Model.prototype.setGridHighlight = function (video) {
    let index = -1;
    if (video !== null) {
        let vx, vy, vw, vh;
        if (video === "OVERLAY") {
            vw = this.videos[0].width;
            vh = this.videos[0].height;
            vx = width - vw - 1;
            vy = scrollY;
        } else {
            vx = video.x;
            vy = video.y;
            vw = video.width;
            vh = video.height;
        }
        let squareSize, numRows = 3, numCols = 3;
        if (vw > vh) {
            squareSize = Math.floor(vh / 3);
            numCols = Math.ceil(vw / squareSize);
        } else {
            squareSize = Math.floor(vw / 3);
            numRows = Math.ceil(vh / squareSize);
        }
        let found = false;
        for (let row = 0; row < numRows && !found; row++) {
            for (let col = 0; col < numCols && !found; col++) {
                let squareX = vx + squareSize*col;
                let squareY = vy + squareSize*row;
                if (mouseX > squareX && mouseX < squareX+squareSize && mouseY > squareY && mouseY < squareY+squareSize) {
                    index = numCols*row + col;
                    found = true;
                }
            }
        }
    }
    if (this.gridHighlight != index) {
        this.gridHighlight = index;
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

Model.prototype.addShadowMark = function (widthRatio, heightRatio, video) {
    this.shadowMarks.push({
        widthRatio: widthRatio,
        heightRatio: heightRatio,
        shape: this.shadowMarkShape,
        colour: this.shadowMarkColour,
        video: video,
    });
    this.notifySubscribers();
}

Model.prototype.addToFreeformPath = function (widthRatio, heightRatio) {
    if (this.freeformStraight && this.freeformPath.length > 1) {
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

Model.prototype.addFreeformPathToShadowMarks = function (video) {
    this.shadowMarks.push({
        path: this.freeformPath,
        shape: this.shadowMarkShape,
        colour: this.shadowMarkColour,
        video: video,
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

Model.prototype.toggleFreeformStraight = function () {
    this.freeformStraight = !this.freeformStraight;
    this.notifySubscribers();
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

Model.prototype.clearShadowMarks = function () {
    this.shadowMarks = [];
    this.notifySubscribers();
}

Model.prototype.checkShadowMarkerHit = function () {
    let hoverTargetX, hoverTargetY, hoverTargetW, hoverTargetH;
    if (this.hoverTarget === "OVERLAY") {
        hoverTargetW = this.videos[0].width;
        hoverTargetH = this.videos[0].height;
        hoverTargetX = this.getScrollbarX() + this.getScrollbarWidth() + 75 - hoverTargetW;
        hoverTargetY = scrollY;
    } else if (this.hoverTarget !== null) {
        hoverTargetX = this.hoverTarget.x;
        hoverTargetY = this.hoverTarget.y;
        hoverTargetW = this.hoverTarget.width;
        hoverTargetH = this.hoverTarget.height;
    } else {
        return null;
    }
    for (let i = 0; i < this.shadowMarks.length; i++) {
        let shadowMarker = this.shadowMarks[i];
        if (shadowMarker.shape === SHAPES.FREEFORM) {
            for (let j = 0; j < shadowMarker.path.length; j++) {
                let point = shadowMarker.path[j];
                let px = hoverTargetX + hoverTargetW * point.widthRatio;
                let py = hoverTargetY + hoverTargetH * point.heightRatio;
                let padding = 5;
                if (mouseX > px - padding && mouseX < px + padding && mouseY > py - padding && mouseY < py + padding) return shadowMarker;
            }
        } else {
            let sx = hoverTargetX + hoverTargetW * shadowMarker.widthRatio;
            let sy = hoverTargetY + hoverTargetH * shadowMarker.heightRatio;
            let maxLength = 16;
            let markLength = Math.min(hoverTargetW, hoverTargetH) / 20;
            if (shadowMarker.shape === SHAPES.CROSSHAIR) {
                maxLength = 16;
                markLength = Math.min(hoverTargetW, hoverTargetH) / 16;
            }
            if (markLength > maxLength) markLength = maxLength;
            if (mouseX > sx - markLength/2 && mouseX < sx + markLength/2 && mouseY > sy - markLength/2 && mouseY < sy + markLength/2) return shadowMarker;
        }
    }
    return null;
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
    const x = this.getScrollbarX() - 75;
    const y = this.getScrollbarY() - 12;
    const l = 50;
    return mouseX > x && mouseX < x + l && mouseY > y && mouseY < y + l;
}

Model.prototype.getCurrentDataset = function () {
    switch (this.block) {
        case 2:
            switch (this.task) {
                case 1:
                    return "seaice";
                case 2:
                    return "baseball";
                case 3:
                default:
                    return "lemnatec";
            }
        case 1:
        default:
            return "lemnatec";
    }
}

Model.prototype.logData = function () {
    let submitForm = document.createElement("form");
    submitForm.setAttribute("action", "#");
    submitForm.setAttribute("method", "post");
    submitForm.style.display = "none";
    document.body.append(submitForm);
  
    if (!tutorial) {
        // writing to trialLog column
        let submitResponses = document.createElement("input");
        submitResponses.setAttribute("type", "text");
        submitResponses.setAttribute("value", JSON.stringify(this.log));
        submitResponses.setAttribute("name", "trialLog");
        submitResponses.style.display = "none";
        submitForm.append(submitResponses);
    }
  
    // Submitting the result. This will redirect to the next page
    let submitBut = document.createElement("input");
    submitBut.setAttribute("type", "submit");
    submitBut.setAttribute("name", "submitButton");
    submitBut.setAttribute("value", "Continue");
    submitBut.style.display = "none";
    submitForm.append(submitBut);
    submitBut.click();
}

Model.prototype.addTrialData = function () {
    // Elapsed time
    let elapsedTime = new Date().getTime() - this.blockStartTime;

    // Errors
    let falseNegatives = 0;
    let falsePositives = 0;
    let correctVideos = [];
    let blockVideos = [];
    this.category.videos.forEach(categoryVideo => {
        if (this.videos.findIndex(video => video.name === categoryVideo.name) > -1) blockVideos.push(categoryVideo);
    });
    if (blockVideos.length !== 6) console.error("DID NOT GET THE CORRECT NUMBER OF VIDEOS");
    blockVideos.forEach(video => {
        switch (this.task) {
            case 1:
                if (this.getCurrentDataset() === "seaice" && this.category.name === "northpole") {
                    // Northpole measures smaller area
                    if (video.area < this.category.example_area) correctVideos.push(video);
                } else {
                    // All other datasets measure larger area
                    if (video.area > this.category.example_area) correctVideos.push(video);
                }
                break;
            case 2:
                if (correctVideos.length === 0) correctVideos = [ video ];
                else if (correctVideos[0].dist < video.dist) correctVideos = [ video ];
                break;
            case 3:
            default:
                if (correctVideos.length === 0) correctVideos = [ video ];
                else if (correctVideos[0].dist-correctVideos[0].dist_flower < video.dist-video.dist_flower) correctVideos = [ video ];
                break;
        }
    });
    correctVideos.forEach(video => { if (this.selectedVideos.findIndex(selectedVideo => video.name === selectedVideo.name) === -1) falseNegatives++ });
    this.selectedVideos.forEach(selectedVideo => { if (correctVideos.findIndex(video => video.name === selectedVideo.name) === -1) falsePositives++ });

    // Construct trial data object
    let trialData = {
        pID: pID,
        task: this.task,
        interaction: this.interaction,
        block: this.block,
        dataset: this.getCurrentDataset(),
        category: this.category.name,
        videos: this.videos.map(video => video.name),
        elapsedTime: elapsedTime,
        falseNegatives: falseNegatives,
        falsePositives: falsePositives,
    };
    this.log.push(trialData);
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
    this.notifySubscribers();
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged());
}