/* Application Model */
"use strict";

const INTERACTIONS = {
    SMALL_MULTIPLES: "smallMultiples",
    OVERLAYS: "overlays",
    SHADOW_MARKER: "shadowMarkers",
}

const MARKS = {
    MARKER: "marker",
    RECT: "rect",
    CIRCLE: "circle",
    FREEFORM: "freeform",
    LINE: "line",
    CURSOR: "cursor", 
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
    this.shadowMarkType = MARKS.MARKER;
    this.shadowMarkColour = COLOURS.RED;
    this.freeformPath = [];
    this.freeformTarget = null;

    this.index = 0;
    this.scrollbarHighlighted = false;

    this.markerButtonHighlighted = false;
    this.rectButtonHighlighted = false;
    this.circleButtonHighlighted = false;
    this.lineButtonHighlighted = false;
    this.freeformButtonHighlighted = false;
    this.cursorButtonHighlighted = false;
    this.colourButtonHighlighted = false;
    this.helpButtonHighlighted = false;
    
    this.colourMenuOpen = false;
    this.helpMenuOpen = false;

    // this.gridActive = false;
    this.hoverTarget = null;
    // this.gridHighlight = -1;

    this.highlightedMarker = null;
    this.selectedVideos = [];
    this.interaction = INTERACTIONS.SHADOW_MARKER;
    this.task = 1;
    this.category = [];
    this.trial = 1;
    this.attempt = 1;
    this.log = [];
    this.trialLog = [];
    this.trialStartTime = 0;

    this.tutorialChecklist = [];
    this.currentChecklistPrompt = 0;

    this.overlay = [];

    this.exampleImage = [];
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
    this.category.push(category);
    this.notifySubscribers();
}

Model.prototype.nextTrial = function () {
    this.trial++;
    this.attempt = 1;
    this.videos.splice(0,6);
    this.category.splice(0,1);
    this.exampleImage.splice(0,1);
    this.overlay = [];
    this.selectedVideos = [];
    if (this.videos.length < 6) this.percentLoaded = 0;
    this.index = 0;
    this.clearShadowMarks();
    this.updateVideoLocations();
    this.startTrial();
    this.notifySubscribers();
}

Model.prototype.startTrial = function () {
    this.trialStartTime = new Date().getTime();
    this.notifySubscribers();
}

Model.prototype.tryAgain = function () {
    this.attempt++;
    if (this.attempt > 2) {
        alert("Incorrect. Moving on.")
    } else {
        alert("Incorrect. Try again.");
    }
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
    this.exampleImage.push(image);
    this.notifySubscribers();
}

Model.prototype.setPercentLoaded = function (percent) {
    this.percentLoaded = percent;
    if (this.percentLoaded == 100) {
        // User and percentage bar are racing. Whoever finishes last sets the start trial time.
        this.startTrial();
    } else {
        this.notifySubscribers();
    }
}

Model.prototype.addVideo = function (video, labels, name) {
    let x = 0;
    let y = 0;
    this.videos.forEach(video => {
        x += video.width;
        if (x + video.width > width - video.width - 20) {
            x = 0;
            y += video.height;
        }
        // if (this.interaction === INTERACTIONS.OVERLAYS || this.task === 1) {
        //     if (x + video.width > width - video.width - 20) {
        //         x = 0;
        //         y += video.height;
        //     }
        // } else {
        //     if (x + video.width > width) {
        //         x = 0;
        //         y += video.height;
        //     }
        // }
    });
    this.videos.push(new Video(video, labels, name, x, y));
    this.notifySubscribers();
}

Model.prototype.updateVideoLocations = function () {
    let x = 0;
    let y = 0;
    for (let i = 0; i < 6 && i < this.videos.length; i++) {
        let video = this.videos[i];
        video.setX(x);
        video.setY(y);
        x += video.width;
        if (x + video.width > width - video.width - 20) {
            x = 0;
            y += video.height;
        }
        // if (this.interaction === INTERACTIONS.OVERLAYS || this.task === 1) {
        //     if (x + video.width > width - video.width - 20) {
        //         x = 0;
        //         y += video.height;
        //     }
        // } else {
        //     if (x + video.width > width) {
        //         x = 0;
        //         y += video.height;
        //     }
        // }
    }
    if (this.videos.length > 0) {
        if (x === 0) {
            if (y > windowHeight) {
                resizeCanvas(width, y+110);
            } else {
                resizeCanvas(width, windowHeight);
            }
        } else {
            if (y+this.videos[0].height > windowHeight) {
                resizeCanvas(width, y+this.videos[0].height+110);
            } else {
                resizeCanvas(width, windowHeight);
            }
        }
    }
    this.notifySubscribers();
}

Model.prototype.addToOverlay = function (video) {
    let index;
    if ((index = this.overlay.indexOf(video)) === -1) {
        this.overlay.push(video);
    } else {
        this.overlay.splice(index,1);
        if (tutorial && this.interaction === INTERACTIONS.OVERLAYS && this.currentChecklistPrompt === 2) this.nextPrompt();
    }
    this.notifySubscribers();
}

Model.prototype.checkOverlayHit = function () {
    // Overlay rectangle is only in play when the overlay interaction technique is active or during task 1 where it is an example image.
    if (this.videos.length > 0 && this.interaction === INTERACTIONS.OVERLAYS) {
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
    for (let i = 0; i < 6 && i < this.videos.length; i++) {
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

// Model.prototype.setGridActive = function (gridActive) {
//     if (this.gridActive != gridActive) {
//         this.gridActive = gridActive;
//         this.notifySubscribers();
//     }
// }

// Model.prototype.setGridHighlight = function (video) {
//     let index = -1;
//     if (video !== null) {
//         let vx, vy, vw, vh;
//         if (video === "OVERLAY") {
//             vw = this.videos[0].width;
//             vh = this.videos[0].height;
//             vx = width - vw - 1;
//             vy = scrollY;
//         } else {
//             vx = video.x;
//             vy = video.y;
//             vw = video.width;
//             vh = video.height;
//         }
//         let squareSize, numRows = 3, numCols = 3;
//         if (vw > vh) {
//             squareSize = Math.floor(vh / 3);
//             numCols = Math.ceil(vw / squareSize);
//         } else {
//             squareSize = Math.floor(vw / 3);
//             numRows = Math.ceil(vh / squareSize);
//         }
//         let found = false;
//         for (let row = 0; row < numRows && !found; row++) {
//             for (let col = 0; col < numCols && !found; col++) {
//                 let squareX = vx + squareSize*col;
//                 let squareY = vy + squareSize*row;
//                 if (mouseX > squareX && mouseX < squareX+squareSize && mouseY > squareY && mouseY < squareY+squareSize) {
//                     index = numCols*row + col;
//                     found = true;
//                 }
//             }
//         }
//     }
//     if (this.gridHighlight != index) {
//         this.gridHighlight = index;
//         this.notifySubscribers();
//     }
// }

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
        type: this.shadowMarkType,
        colour: this.shadowMarkColour,
        video: video,
    });
    this.notifySubscribers();
}

Model.prototype.addToFreeformPath = function (widthRatio, heightRatio) {
    if (this.shadowMarkType !== MARKS.FREEFORM && this.freeformPath.length > 1) {
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
        type: this.shadowMarkType,
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

Model.prototype.circleOutOfBounds = function (newMarkWidthRatio, newMarkHeightRatio) {
    let targetX, targetY, targetW, targetH;
    if (this.freeformTarget === "OVERLAY") {
        targetW = this.videos[0].width;
        targetH = this.videos[0].height;
        targetX = this.getScrollbarX() + this.getScrollbarWidth() + 75 - targetW;
        targetY = scrollY;
    } else if (this.freeformTarget !== null) {
        targetX = this.freeformTarget.x;
        targetY = this.freeformTarget.y;
        targetW = this.freeformTarget.width;
        targetH = this.freeformTarget.height;
    } else {
        return false;
    }
    if (this.freeformPath.length <= 2) {
        let p1 = this.freeformPath[0];
        let p2 = { widthRatio: newMarkWidthRatio, heightRatio: newMarkHeightRatio };
        let p1x = targetX + targetW * p1.widthRatio;
        let p1y = targetY + targetH * p1.heightRatio;
        let p2x = targetX + targetW * p2.widthRatio;
        let p2y = targetY + targetH * p2.heightRatio;
        let r = Math.sqrt(Math.pow(p1x-p2x,2)+Math.pow(p1y-p2y,2));
        if (p1x-r < targetX || p1x+r > targetX+targetW || p1y-r < targetY || p1y+r > targetY+targetH) return true;
    }
    return false;
}

Model.prototype.setHoverTarget = function (target) {
    this.hoverTarget = target;
    this.notifySubscribers();
}

Model.prototype.deleteShadowMarker = function (shadowMarker) {
    let index;
    if ((index = this.shadowMarks.indexOf(shadowMarker)) > -1) {
        this.shadowMarks.splice(index, 1);
        this.notifySubscribers();
    }
}

Model.prototype.clearShadowMarks = function () {
    this.shadowMarks = [];
    this.highlightedMarker = null;
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
        let padding = 5;
        switch (shadowMarker.type) {
            case MARKS.MARKER:
                let sx = hoverTargetX + hoverTargetW * shadowMarker.widthRatio;
                let sy = hoverTargetY + hoverTargetH * shadowMarker.heightRatio;
                let maxLength = 16;
                let markLength = Math.min(hoverTargetW, hoverTargetH) / 20;
                if (shadowMarker.type === MARKS.MARKER) {
                    maxLength = 16;
                    markLength = Math.min(hoverTargetW, hoverTargetH) / 16;
                }
                if (markLength > maxLength) markLength = maxLength;
                if (mouseX > sx - markLength/2 && mouseX < sx + markLength/2 && mouseY > sy - markLength/2 && mouseY < sy + markLength/2) return shadowMarker;
                break;
            case MARKS.RECT:
                if (shadowMarker.path.length === 2) {
                    let p1 = shadowMarker.path[0];
                    let p2 = shadowMarker.path[1];
                    let p1x = hoverTargetX + hoverTargetW * p1.widthRatio;
                    let p1y = hoverTargetY + hoverTargetH * p1.heightRatio;
                    let p2x = hoverTargetX + hoverTargetW * p2.widthRatio;
                    let p2y = hoverTargetY + hoverTargetH * p2.heightRatio;
                    if (
                        (mouseX > p1x-padding && mouseX < p1x+padding && mouseY > p1y-padding && mouseY < p2y+padding) ||
                        (mouseX > p1x-padding && mouseX < p2x+padding && mouseY > p1y-padding && mouseY < p1y+padding) ||
                        (mouseX > p2x-padding && mouseX < p2x+padding && mouseY > p1y-padding && mouseY < p2y+padding) ||
                        (mouseX > p1x-padding && mouseX < p2x+padding && mouseY > p2y-padding && mouseY < p2y+padding)
                    ) return shadowMarker;
                }
                break;
            case MARKS.CIRCLE: {
                if (shadowMarker.path.length === 2) {
                    let p1 = shadowMarker.path[0];
                    let p2 = shadowMarker.path[1];
                    let p1x = hoverTargetX + hoverTargetW * p1.widthRatio;
                    let p1y = hoverTargetY + hoverTargetH * p1.heightRatio;
                    let p2x = hoverTargetX + hoverTargetW * p2.widthRatio;
                    let p2y = hoverTargetY + hoverTargetH * p2.heightRatio;
                    let r = Math.sqrt(Math.pow(p1x-p2x,2)+Math.pow(p1y-p2y,2));
                    if (Math.pow(mouseX-p1x,2)+Math.pow(mouseY-p1y,2) < Math.pow(r+padding,2) && Math.pow(mouseX-p1x,2)+Math.pow(mouseY-p1y,2) > Math.pow(r-padding,2)) {
                        return shadowMarker;
                    }
                }
                break;
            }
            case MARKS.LINE: {
                if (shadowMarker.path.length === 2) {
                    let p1, p2;
                    if (Math.abs(shadowMarker.path[0].widthRatio - shadowMarker.path[1].widthRatio)*hoverTargetW > padding) {
                        if (shadowMarker.path[0].widthRatio < shadowMarker.path[1].widthRatio) {
                            p1 = shadowMarker.path[0];
                            p2 = shadowMarker.path[1];
                        } else {
                            p1 = shadowMarker.path[1];
                            p2 = shadowMarker.path[0];
                        }
                    } else {
                        // Close x = infinite slope
                        let px = hoverTargetX + hoverTargetW * shadowMarker.path[0].widthRatio;
                        let p1y, p2y;
                        if (shadowMarker.path[0].heightRatio < shadowMarker.path[1].heightRatio) {
                            p1y = hoverTargetY + hoverTargetH * shadowMarker.path[0].heightRatio;
                            p2y = hoverTargetY + hoverTargetH * shadowMarker.path[1].heightRatio;
                        } else {
                            p1y = hoverTargetY + hoverTargetH * shadowMarker.path[1].heightRatio;
                            p2y = hoverTargetY + hoverTargetH * shadowMarker.path[0].heightRatio;
                        }
                        if (mouseX > px - padding && mouseX < px + padding && mouseY > p1y - padding && mouseY < p2y + padding ) return shadowMarker;
                        else continue;
                    }
                    let p1x = hoverTargetX + hoverTargetW * p1.widthRatio;
                    let p1y = hoverTargetY + hoverTargetH * p1.heightRatio;
                    let p2x = hoverTargetX + hoverTargetW * p2.widthRatio;
                    let p2y = hoverTargetY + hoverTargetH * p2.heightRatio;
                    let m = (p2y-p1y)/(p2x-p1x);
                    let b = p1y - m*p1x;
                    let fx = m*mouseX + b;
                    if (mouseX > p1x - padding && mouseX < p2x + padding && mouseY > fx - padding && mouseY < fx + padding) return shadowMarker;
                }
                break;
            }
            case MARKS.FREEFORM:
            default:
                for (let j = 0; j < shadowMarker.path.length; j++) {
                    let point = shadowMarker.path[j];
                    let px = hoverTargetX + hoverTargetW * point.widthRatio;
                    let py = hoverTargetY + hoverTargetH * point.heightRatio;
                    if (mouseX > px - padding && mouseX < px + padding && mouseY > py - padding && mouseY < py + padding) return shadowMarker;
                }
                break;
        }
    }
    return null;
}

Model.prototype.checkMarkButtonHit = function () {
    let x = this.getScrollbarX() + this.getScrollbarWidth() + 25;
    let y = this.getScrollbarY() - 60;
    let length = 50;
    const mx = mouseX, my = mouseY;
    if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.MARKER;
    y -= 60;
    if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.RECT;
    y -= 60;
    if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.CIRCLE;
    y -= 60;
    if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.LINE;
    y -= 60;
    if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.FREEFORM;
    y -= 60;
    if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.CURSOR;
    return null;
}

Model.prototype.setMarkButtonHighlighted = function (highlighted) {
    this.markerButtonHighlighted = highlighted === MARKS.MARKER;
    this.rectButtonHighlighted = highlighted === MARKS.RECT;
    this.circleButtonHighlighted = highlighted === MARKS.CIRCLE;
    this.lineButtonHighlighted = highlighted === MARKS.LINE;
    this.freeformButtonHighlighted = highlighted === MARKS.FREEFORM;
    this.cursorButtonHighlighted = highlighted === MARKS.CURSOR;
    this.notifySubscribers();
}

Model.prototype.setType = function (type) {
    this.shadowMarkType = type;
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

Model.prototype.freeforming = function () {
    return this.shadowMarkType === MARKS.FREEFORM ||
        this.shadowMarkType === MARKS.LINE ||
        this.shadowMarkType === MARKS.RECT ||
        this.shadowMarkType === MARKS.CIRCLE;
}

Model.prototype.getCurrentDataset = function () {
    switch (this.task) {
        case 1:
            return "lemnatec";
        case 2:
            return "seaice";
        case 3:
        default:
            return "baseball";
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
    // // Elapsed time
    let elapsedTime = new Date().getTime() - this.trialStartTime;

    // // Errors
    let falseNegatives = 0;
    let falsePositives = 0;
    let possibleVideos = [];
    let correctVideos = [];
    let trialVideos = [];
    let category = this.category[0];
    for (let i = 0; i < 6 && i < this.videos.length; i++) {
        let video = this.videos[i];
        let index = category.videos.findIndex(categoryVideo => video.name === categoryVideo.name);
        if (index > -1) trialVideos.push(category.videos[index]);
    }
    if (trialVideos.length !== 6) console.error("DID NOT GET THE CORRECT NUMBER OF VIDEOS");
    trialVideos.forEach((video,index) => {
        switch (this.task) {
            case 1:
                if (correctVideos.length === 0) correctVideos = [ video ];
                else if (correctVideos[0].peak < video.peak) correctVideos = [ video ];
                break;
            case 2:
                if (video.extends === 1.0) correctVideos.push(video);
                else if (video.extends === 0.5) possibleVideos.push(video);
                break;
            case 3:
                if (index > 0) {
                    let firstVideo = trialVideos[0];
                    let x1 = firstVideo.release[0];
                    let y1 = firstVideo.release[1];
                    let x2 = video.release[0];
                    let y2 = video.release[1];
                    let distance = Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
                    if (distance >= 30) correctVideos.push(video);
                    else if (distance >= 25) possibleVideos.push(video);
                }
                break;
            default:
                break;
        }
    });
    
    // Parse false positives
    this.selectedVideos.forEach(selectedVideo => {
        if (correctVideos.findIndex(correctVideo => correctVideo.name === selectedVideo.name) === -1 &&
            possibleVideos.findIndex(possibleVideo => possibleVideo.name === selectedVideo.name) === -1) falsePositives++;
    });
    // Parse false negatives
    correctVideos.forEach(correctVideo => {
        if (this.selectedVideos.findIndex(selectedVideo => correctVideo.name === selectedVideo.name) === -1) falseNegatives++;
    });

    // Construct trial data object
    let results = {
        pID: pID,
        task: this.task,
        interaction: this.interaction,
        trial: this.trial,
        attempt: this.attempt,
        dataset: this.getCurrentDataset(),
        category: category.name,
        videos: this.videos.map(video => video.name),
        elapsedTime: elapsedTime,
        falseNegatives: falseNegatives,
        falsePositives: falsePositives,
    };
    this.log.push(results);
    return results;
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
    this.notifySubscribers();
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged());
}