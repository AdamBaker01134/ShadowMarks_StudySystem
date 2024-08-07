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
    this.start = false;
    this.videosPerTrial = 9;
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
    this.correctlySelectedVideos = [];
    this.interaction = INTERACTIONS.SHADOW_MARKER;
    this.task = 1;
    this.category = [];
    this.trial = 0;
    this.trialLoadTime = [];
    this.attempt = 1;
    this.trialLog = [];
    this.streamLog = [];
    this.trialStartTime = 0;
    this.currentChecklistPrompt = 0;

    this.overlay = [];

    this.instructionImage = null;
}

Model.prototype.getTutorialChecklist = function () {
    switch (this.task) {
        case 1:
            switch (this.interaction) {
                case INTERACTIONS.SMALL_MULTIPLES: return smallMultiples1;
                case INTERACTIONS.OVERLAYS: return overlays1; 
                case INTERACTIONS.SHADOW_MARKER: return shadowMarkers1;
            }
        case 2:
            switch (this.interaction) {
                case INTERACTIONS.SMALL_MULTIPLES: return smallMultiples2;
                case INTERACTIONS.OVERLAYS: return overlays2;
                case INTERACTIONS.SHADOW_MARKER: return shadowMarkers2;
            }
        case 3:
            switch (this.interaction) {
                case INTERACTIONS.SMALL_MULTIPLES: return smallMultiples3;
                case INTERACTIONS.OVERLAYS: return overlays3;
                case INTERACTIONS.SHADOW_MARKER: return shadowMarkers3;
            }
        case 4:
            switch (this.interaction) {
                case INTERACTIONS.SMALL_MULTIPLES: return smallMultiples4;
                case INTERACTIONS.OVERLAYS: return overlays4;
                case INTERACTIONS.SHADOW_MARKER: return shadowMarkers4;
            }
    }
}

Model.prototype.nextPrompt = function () {
    this.currentChecklistPrompt++;
    if (this.currentChecklistPrompt >= this.getTutorialChecklist().length) this.currentChecklistPrompt = this.getTutorialChecklist().length-1;
    this.notifySubscribers();
}

Model.prototype.lastPrompt = function () {
    this.currentChecklistPrompt--;
    if (this.currentChecklistPrompt < 0) this.currentChecklistPrompt = 0;
    this.notifySubscribers();
}

Model.prototype.setCategory = function (category) {
    this.category.push(category);
    this.notifySubscribers();
}

Model.prototype.setTrialLoadTime = function (time) {
    this.trialLoadTime.push(time);
    this.notifySubscribers();
}

Model.prototype.nextTrial = function () {
    this.trial++;
    this.start = false;
    this.attempt = 1;
    this.videos.splice(0,this.videosPerTrial);
    this.category.splice(0,1);
    this.trialLoadTime.splice(0,1);
    this.overlay = [];
    this.selectedVideos = [];
    this.correctlySelectedVideos = [];
    if (this.videos.length < this.videosPerTrial) this.percentLoaded = 0;
    this.index = 0;
    this.clearShadowMarks();
    if (this.task === 3) this.shadowMarkType = MARKS.MARKER;
    else this.shadowMarkType = MARKS.CURSOR;
    this.shadowMarkColour = COLOURS.RED;
    this.updateVideoDimensions();
    this.updateVideoLocations();
    this.notifySubscribers();
}

Model.prototype.startTrial = function () {
    this.start = true;
    this.trialStartTime = new Date().getTime();
    this.updateVideoDimensions();
    this.updateVideoLocations();
    this.notifySubscribers();
}

Model.prototype.tryAgain = function (results) {
    this.attempt++;
    if (this.task === 3 && results.totalCorrect === 1) {
        alert("1/2 correct. Correct video will be highlighted in green. Try again.");
    } else {
        alert("Incorrect. Try again.");
    }
    this.notifySubscribers();
}

Model.prototype.checkMoveOn = function () {
    if (new Date().getTime() - this.trialStartTime > 60000) {
        return true;
    } else {
        let scrollbarScrubData = this.streamLog.filter(data => data.trial === this.trial && data.event === "scrollbar_scrub");
        let addedToOverlayData = this.streamLog.filter(data => data.trial === this.trial && data.event === "added_to_overlay");
        let addedMarkData = this.streamLog.filter(data => data.trial === this.trial && (data.event === "added_mark" || data.event === "shadow_cursor_moved"));
        switch (this.interaction) {
            case INTERACTIONS.SMALL_MULTIPLES:
                if (this.task === 4 || scrollbarScrubData.length > 0) return true;
                break;
            case INTERACTIONS.OVERLAYS:
                if (this.task === 4 || (scrollbarScrubData.length > 0 && (this.task === 2 || addedToOverlayData.length > 0))) return true;
                break;
            case INTERACTIONS.SHADOW_MARKER:
                if ((this.task === 4 || scrollbarScrubData.length > 0) && addedMarkData.length > 0) return true;
                break;
            default:
                break;
        }
    }
    return false;
}

Model.prototype.setInteraction = function (interaction) {
    this.interaction = interaction;
    this.notifySubscribers();
}

Model.prototype.setTask = function (task) {
    this.task = task;
    this.notifySubscribers();
}

Model.prototype.setPercentLoaded = function (percent) {
    this.percentLoaded = percent;
    this.notifySubscribers();
}

Model.prototype.setInstructionImage = function (image) {
    this.instructionImage = image;
    this.notifySubscribers();
}

Model.prototype.getWorkspaceWidth = function () {
    return (this.trial > 0 ? this.getScrollbarY() - 30 - scrollY : this.getScrollbarY() - 100 - scrollY) + 300;
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

Model.prototype.updateVideoDimensions = function () {
    this.verifyVideoDimensions();
    if (this.videos.length > 0) {
        const maxHeight = this.trial > 0 ? this.getScrollbarY() - 30 - scrollY : this.getScrollbarY() - 100 - scrollY;
        const maxWidth = maxHeight;
        let vHeight = maxHeight/3;
        let vWidth = vHeight * this.videos[0].aspectRatio;
        while (vWidth*3 > maxWidth) {
            vWidth -= 5;
            vHeight -= (5/this.videos[0].aspectRatio);
        }
        while (vHeight*3 > maxHeight) {
            vWidth -= 5;
            vHeight -= (5/this.videos[0].aspectRatio);
        }
        for (let i = 0; i < this.videosPerTrial && i < this.videos.length; i++) {
            let video = this.videos[i];
            video.setWidth(vWidth);
            video.setHeight(vHeight);
        }
    }
}

Model.prototype.verifyVideoDimensions = function () {
    if (this.videos.length > 0) {
        const vWidth = this.videos[0].width;
        const vHeight = this.videos[0].height;
        for (let i = 1; i < this.videosPerTrial && i < this.videos.length; i++) {
            let video = this.videos[i];
            if (video.width !== vWidth || video.height !== vHeight) {
                video.setWidth(vWidth);
                video.setHeight(vHeight);
            }
        }
    }
}

Model.prototype.updateVideoLocations = function () {
    this.verifyVideoDimensions();
    let x = 0;
    let y = 0;
    for (let i = 0; i < this.videosPerTrial && i < this.videos.length; i++) {
        let video = this.videos[i];
        video.setX(x);
        video.setY(y);
        x += video.width;
        const maxWidth = Math.min(video.width * 3, this.trial > 0 ? this.getScrollbarY() - 30 - scrollY : this.getScrollbarY() - 100 - scrollY);
        if (x + video.width > maxWidth) {
            x = 0;
            y += video.height;
        }
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
    }
    this.notifySubscribers();
}

Model.prototype.getOverlayDimensions = function () {
    let padding = 100;
    let ow = width - this.getWorkspaceWidth() - padding*2;
    let oh = ow;
    let ox = this.getWorkspaceWidth() + padding;
    let oy = scrollY;
    return { ow, oh, ox, oy };
}

Model.prototype.checkOverlayHit = function () {
    // Overlay rectangle is only in play when the overlay interaction technique is active or during task 1 where it is an example image.
    if (this.videos.length > 0 && this.interaction === INTERACTIONS.OVERLAYS) {
        let ow, oh, ox, oy;
        ({ ow, oh, ox, oy } = this.getOverlayDimensions());
        return mouseX > ox && mouseX < ox + ow && mouseY > oy && mouseY < oy + oh;
    } else {
        return false;
    }
}

Model.prototype.checkVideoHit = function () {
    for (let i = 0; i < this.videosPerTrial && i < this.videos.length; i++) {
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

Model.prototype.setCorrectlySelected = function (video) {
    if (!this.correctlySelectedVideos.includes(video)) {
        this.correctlySelectedVideos.push(video);
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

Model.prototype.getMarkButtonX = function () {
    return width-75;
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
    return this.getWorkspaceWidth()-200;
}

Model.prototype.getScrollbarHeight = function () {
    return 20;
}

// Slightly larger hitbox.
Model.prototype.checkScrollbarHit = function () {
    if (this.videos.length > 0 && this.videos[0].images.length === 1) return false; 
    return mouseX > 100-15 && mouseX < width-100+15 &&
        mouseY > windowHeight+scrollY-100 && mouseY < windowHeight+scrollY-50;
}

Model.prototype.getIndex = function () {
    return Math.floor(this.index);
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
    let idx = map(
        mx,                 // value to map
        x,                  // min value of mx
        x + width,          // max value of mx
        0,                  // min value of desired index
        segments            // max value of desired index
    );

    if (idx >= segments-1) {
        idx = segments-1;
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
        ({ ow: targetW, oh: targetH, ox: targetX, oy: targetY } = this.getOverlayDimensions());
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
        ({ ow: hoverTargetW, oh: hoverTargetH, ox: hoverTargetX, oy: hoverTargetY } = this.getOverlayDimensions());
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
            case MARKS.MARKER: {
                let sx = hoverTargetX + hoverTargetW * shadowMarker.widthRatio;
                let sy = hoverTargetY + hoverTargetH * shadowMarker.heightRatio;
                let maxLength = 16;
                let markLength = Math.min(hoverTargetW, hoverTargetH) / 16;
                if (markLength > maxLength) markLength = maxLength;
                if (mouseX > sx - markLength/2 && mouseX < sx + markLength/2 && mouseY > sy - markLength/2 && mouseY < sy + markLength/2) return shadowMarker;
                break;
            }
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
                for (let j = 0; j < shadowMarker.path.length; j++) {
                    let point = shadowMarker.path[j];
                    let px = hoverTargetX + hoverTargetW * point.widthRatio;
                    let py = hoverTargetY + hoverTargetH * point.heightRatio;
                    if (mouseX > px - padding && mouseX < px + padding && mouseY > py - padding && mouseY < py + padding) return shadowMarker;
                }
                break;
            case MARKS.CURSOR: {
                let sx = hoverTargetX + hoverTargetW * shadowMarker.widthRatio;
                let sy = hoverTargetY + hoverTargetH * shadowMarker.heightRatio;
                if ((mouseX > sx-padding && mouseX < sx+padding) || (mouseY > sy-padding && mouseY < sy+padding)) return shadowMarker;
                break;
            }
            default:
                break;
        }
    }
    return null;
}

Model.prototype.checkMarkButtonHit = function () {
    let x = this.getMarkButtonX();
    let y = this.getScrollbarY() - 60;
    let length = 50;
    const mx = mouseX, my = mouseY;
    if (this.task === 3 && mx > x && mx < x + length && my > y && my < y + length) return MARKS.MARKER;
    // y -= 60;
    // if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.RECT;
    // y -= 60;
    // if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.CIRCLE;
    // y -= 60;
    // if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.LINE;
    // y -= 60;
    // if (mx > x && mx < x + length && my > y && my < y + length) return MARKS.FREEFORM;
    // y -= 60;
    if (this.task !== 3 && mx > x && mx < x + length && my > y && my < y + length) return MARKS.CURSOR;
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
    const x = this.getMarkButtonX();
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
    const x = this.getMarkButtonX() + 50 - width;
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

Model.prototype.checkStartButtonHit = function () {
    const x = windowWidth/2;
    const y = windowHeight-120;
    const l = 100;
    const r = l/2;
    return Math.sqrt(Math.pow(mouseX-x,2)+Math.pow(mouseY-y,2)) <= r;
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
            return "baseball";
        case 4:
            return "scatterplots";
        default:
            return "";
    }
}

Model.prototype.getCookieCategories = function () {
    let cookieValue = document.cookie.split("; ").find((row) => row.startsWith("previousCategories="))?.split("=")[1];
    if (cookieValue) {
        return cookieValue.split("|");
    } else {
        return [];
    }
}

Model.prototype.addCategoriesToCookies = function () {
    if (this.task !== 3) return;
    let previousCategories = this.getCookieCategories();
    if (!previousCategories.includes(this.category[0].name)) previousCategories.push(this.category[0].name);
    let cookieString = "";
    previousCategories.forEach(previousCategory => cookieString += previousCategory + "|");
    cookieString = cookieString.slice(0,-1);
    document.cookie = `previousCategories=${cookieString}; Secure`;
}

Model.prototype.removeCategoryCookies = function (total) {
    let previousCategories = this.getCookieCategories();
    previousCategories = previousCategories.slice(0, -total);
    let cookieString = "";
    previousCategories.forEach(previousCategory => cookieString += previousCategory + "|");
    cookieString = cookieString.slice(0,-1);
    document.cookie = `previousCategories=${cookieString}; Secure`;
    return previousCategories;
}

Model.prototype.logData = function () {
    // Ensure that the visibility change does not fire.
    document.removeEventListener("visibilitychange", sendHiddenPage);

    let submitForm = document.createElement("form");
    submitForm.setAttribute("action", "#");
    submitForm.setAttribute("method", "post");
    submitForm.style.display = "none";
    document.body.append(submitForm);
    
    // Convert JSONs to formatted strings.
    let dataToSend = this.cleanLogData();
    let submitResponses = document.createElement("input");
    
    // writing to streamLog column
    let streamResponses = document.createElement("input");
    streamResponses = document.createElement("input");
    streamResponses.setAttribute("type", "text");
    streamResponses.setAttribute("value", JSON.stringify(dataToSend.streamLog));
    streamResponses.setAttribute("name", "streamLog");
    streamResponses.style.display = "none";
    submitForm.append(streamResponses);

    // writing to trialLog column
    let trialResponses = document.createElement("input");
    trialResponses.setAttribute("type", "text");
    trialResponses.setAttribute("value", JSON.stringify(dataToSend.trialLog));
    trialResponses.setAttribute("name", "trialLog");
    trialResponses.style.display = "none";
    submitForm.append(trialResponses);
  
    // Submitting the result. This will redirect to the next page
    let submitBut = document.createElement("input");
    submitBut.setAttribute("type", "submit");
    submitBut.setAttribute("name", "submitButton");
    submitBut.setAttribute("value", "Continue");
    submitBut.style.display = "none";
    submitForm.append(submitBut);
    submitBut.click();
}

Model.prototype.cleanLogData = function () {
    let cleanedTrialData = "";
    if (this.trialLog.length > 0) {
        // Cleaning trial log data
        for (let key in this.trialLog[0]) {
            cleanedTrialData += key + ",";
        }
        cleanedTrialData = cleanedTrialData.slice(0,-1);
        cleanedTrialData += "|";

        for (let entry = 0; entry < this.trialLog.length; entry++) {
            let trialLogEntry = this.trialLog[entry];
            let entryString = "";
            for (let key in trialLogEntry) {
                entryString += trialLogEntry[key] + ",";
            }
            entryString = entryString.slice(0,-1);
            entryString += "|";
            cleanedTrialData += entryString;
        }
    }

    let cleanedStreamData = ""
    if (this.streamLog.length > 0) {
        // Cleaning stream log data
        for (let key in this.streamLog[0]) {
            cleanedStreamData += key + ",";
        }
        cleanedStreamData = cleanedStreamData.slice(0,-1);
        cleanedStreamData += "|";

        for (let entry = 0; entry < this.streamLog.length; entry++) {
            let streamLogEntry = this.streamLog[entry];
            let entryString = "";
            for (let key in streamLogEntry) {
                entryString += streamLogEntry[key] + ",";
            }
            entryString = entryString.slice(0,-1);
            entryString += "|";
            cleanedStreamData += entryString;
        }
    }

    return { trialLog: cleanedTrialData, streamLog: cleanedStreamData };
}

Model.prototype.getCorrectVideos = function () {
    let correctVideos = [];
    let trialVideos = [];
    let category = this.category[0];
    for (let i = 0; i < this.videosPerTrial && i < this.videos.length; i++) {
        let video = this.videos[i];
        let index = category.videos.findIndex(categoryVideo => video.name === categoryVideo.name);
        if (index > -1) trialVideos.push(category.videos[index]);
    }
    if (trialVideos.length !== this.videosPerTrial) console.error("DID NOT GET THE CORRECT NUMBER OF VIDEOS");
    trialVideos.forEach((video,index) => {
        switch (this.task) {
            case 1:
                if (correctVideos.length === 0) correctVideos = [ video ];
                else if (correctVideos[0].peak < video.peak) correctVideos = [ video ];
                break;
            case 2:
                if (correctVideos.length === 0) correctVideos = [ video ];
                else if (correctVideos[0].extension < video.extension) correctVideos = [ video ];
                break;
            case 3:
                if (index > 0) {
                    let firstVideo = trialVideos[0];
                    let x1 = firstVideo.release[0];
                    let y1 = firstVideo.release[1];
                    let x2 = video.release[0];
                    let y2 = video.release[1];
                    let distance = Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
                    if (distance < 0.025) correctVideos.push(video);
                }
                break;
            case 4:
                if (correctVideos.length === 0) correctVideos = [ video ];
                else if (correctVideos[0].outlier < video.outlier) correctVideos = [ video ];
                break;
            default:
                break;
        }
    });
    return correctVideos;
}

Model.prototype.addTrialData = function () {
    // // Elapsed time
    let elapsedTime = new Date().getTime() - this.trialStartTime;

    // // Errors
    let falseNegatives = 0;
    let falsePositives = 0;
    let correctVideos = this.getCorrectVideos();
    
    this.correctlySelectedVideos = [];
    // Parse false positives
    this.selectedVideos.forEach(selectedVideo => {
        if (correctVideos.findIndex(correctVideo => correctVideo.name === selectedVideo.name) === -1) falsePositives++;
        else this.setCorrectlySelected(selectedVideo);
    });
    // Parse false negatives
    correctVideos.forEach(correctVideo => {
        if (this.selectedVideos.findIndex(selectedVideo => correctVideo.name === selectedVideo.name) === -1) falseNegatives++;
    });

    // Construct trial data object
    let results = {
        pID: pID,
        condition: condition,
        task: this.task,
        interaction: this.interaction,
        trial: this.trial,
        attempt: this.attempt,
        dataset: this.getCurrentDataset(),
        category: this.category[0].name,
        videos: this.videos.slice(0,this.videosPerTrial).reduce((prev,curr) => prev+curr.name+";",""),
        loadTime: this.trialLoadTime[0],
        elapsedTime: elapsedTime,
        totalCorrect: this.correctlySelectedVideos.length,
        falseNegatives: falseNegatives,
        falsePositives: falsePositives,
        incompleteTrial: elapsedTime > 180000 && (falseNegatives+falsePositives) > 0,
    };
    this.trialLog.push(results);
    return results;
}

Model.prototype.addStreamData = function (event) {
    this.streamLog.push({
        pID: pID,
        condition: condition,
        task: this.task,
        interaction: this.interaction,
        trial: this.trial,
        attempt: this.attempt,
        event: event,
        timestamp: new Date().getTime(),
        mx: mouseX,
        my: mouseY,
        hoverTarget: this.hoverTarget === "OVERLAY" ? this.hoverTarget : this.hoverTarget === null ? "NONE" : this.hoverTarget.name,
        index: this.getIndex(),
        overlaidVideos: this.overlay.length,
        selectedVideos: this.selectedVideos.reduce((prev,curr) => prev+curr.name+";",""),
        shadowMarks: this.shadowMarks.length,
        shadowMarkMode: this.interaction === INTERACTIONS.SHADOW_MARKER ? this.shadowMarkType : "NONE",
        shadowMarkColour: this.interaction === INTERACTIONS.SHADOW_MARKER ? `(r:${this.shadowMarkColour.r};g:${this.shadowMarkColour.g};b:${this.shadowMarkColour.b})` : "NONE",
    });
}

Model.prototype.addSubscriber = function (subscriber) {
    this.subscribers.push(subscriber);
    this.notifySubscribers();
}

Model.prototype.notifySubscribers = function () {
    this.subscribers.forEach(subscriber => subscriber.modelChanged());
}