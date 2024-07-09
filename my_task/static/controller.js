/* Application Controller */
"use strict";

const STATE = {
    READY: "ready",
    NAVIGATING: "navigating",
    PLAYING: "playing",
    MARKING: "marking",
    ZOOMING: "zooming",
    COLOUR_PICKER: "colour_picker",
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
    if (!tutorial && this.model.percentLoaded !== 100) return true;
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            this.model.setScrollbarHighlighted(this.model.checkScrollbarHit());
            this.model.setMarkButtonHighlighted(this.model.checkMarkButtonHit());
            this.model.setColourButtonHighlighted(this.model.checkColourButtonHit());
            this.model.setHelpButtonHighlighted(this.model.checkHelpButtonHit());
            let hit = this.model.checkVideoHit();
            if (this.model.checkOverlayHit()) hit = "OVERLAY";
            this.model.setHoverTarget(hit);
            if (hit && this.model.interaction === INTERACTIONS.SHADOW_MARKER) this.model.highlightMarker(this.model.checkShadowMarkerHit());
            // if (this.model.gridActive) {
            //     this.model.setGridHighlight(hit);
            // }
            break;
        default:
            break;
    }
    return true;
}

Controller.prototype.handleMouseDragged = function (event) {
    if (!tutorial && this.model.percentLoaded !== 100) return true;
    let hit = null;
    switch (this.currentState) {
        case STATE.NAVIGATING:
            if (tutorial && this.model.interaction === INTERACTIONS.SMALL_MULTIPLES && this.model.currentChecklistPrompt === 2) this.model.nextPrompt();
            if (tutorial && this.model.interaction === INTERACTIONS.OVERLAYS && this.model.currentChecklistPrompt === 1) this.model.nextPrompt();
            this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
            break;
        case STATE.MARKING:
            hit = this.model.checkVideoHit();
            if (this.model.freeforming() && hit && hit === this.model.freeformTarget && !(this.model.shadowMarkType === MARKS.CIRCLE && this.model.circleOutOfBounds((mouseX-hit.x)/hit.width,(mouseY-hit.y)/hit.height))) {
                if (tutorial && this.model.interaction === INTERACTIONS.SHADOW_MARKER && this.model.currentChecklistPrompt === 4) this.model.nextPrompt();
                this.model.addToFreeformPath((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height);
            } else if (this.model.freeforming() && this.model.checkOverlayHit() && this.model.freeformTarget === "OVERLAY") {
                let ow = this.model.videos[0].width;
                let oh = this.model.videos[0].height;
                let ox = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - ow;
                let oy = scrollY;
                hit = "OVERLAY";
                if (!(this.model.shadowMarkType === MARKS.CIRCLE && this.model.circleOutOfBounds((mouseX-ox)/ow,(mouseY-oy)/oh))) {
                    this.model.addToFreeformPath((mouseX-ox) / ow, (mouseY-oy) / oh);
                }
            }
            this.model.setHoverTarget(hit);
            // if (this.model.gridActive) {
            //     this.model.setGridHighlight(hit);
            // }
            break;
        default:
            break;
    }
    return true;
}

Controller.prototype.handleMousePressed = function (event) {
    if (!tutorial && this.model.percentLoaded !== 100) return true;
    let hit = null, mark = null;
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            if (this.model.checkScrollbarHit()) {
                this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
                this.savedState = this.currentState;
                this.currentState = STATE.NAVIGATING;
            } else if (this.model.checkHelpButtonHit()) {
                if (tutorial && this.model.interaction === INTERACTIONS.SMALL_MULTIPLES && this.model.currentChecklistPrompt === 6) this.model.nextPrompt();
                this.model.setHelpMenuOpen(true);
                this.savedState = this.currentState;
                this.currentState = STATE.HELP;
            } else if (this.model.interaction === INTERACTIONS.SHADOW_MARKER && (mark = this.model.checkMarkButtonHit())) {
                this.model.setType(mark);
                return false;
            } else if (this.model.interaction === INTERACTIONS.SHADOW_MARKER && this.model.checkColourButtonHit()) {
                this.model.setColourMenuOpen(true);
                this.savedState = this.currentState;
                this.currentState = STATE.COLOUR_PICKER;
            } else if (hit = this.model.checkVideoHit()) {
                if (this.model.interaction === INTERACTIONS.OVERLAYS) {
                    this.model.addToOverlay(hit);
                    if (tutorial && this.model.interaction === INTERACTIONS.OVERLAYS && this.model.currentChecklistPrompt === 0 && this.model.overlay.length === 3) this.model.nextPrompt();
                    return false;
                } else if (event.ctrlKey) {
                    if (this.model.task > 1) {
                        // Tasks 2 and 3 do not allow multi-select.
                        this.model.selectedVideos.forEach(video => this.model.selectVideo(video));
                    }
                    this.model.selectVideo(hit);
                    if (tutorial && this.model.interaction === INTERACTIONS.SMALL_MULTIPLES && this.model.currentChecklistPrompt === 5) this.model.nextPrompt();
                } else if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
                    if (this.model.freeforming()) {
                        this.model.addToFreeformPath((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height);
                        this.model.setFreeformTarget(hit);
                    }
                    this.savedState = this.currentState;
                    this.currentState = STATE.MARKING;
                }
            } else if (this.model.checkOverlayHit()) { 
                if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
                    let ow = this.model.videos[0].width;
                    let oh = this.model.videos[0].height;
                    let ox = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - ow;
                    let oy = scrollY;
                    if (this.model.freeforming()) {
                        this.model.addToFreeformPath((mouseX-ox) / ow, (mouseY-oy) / oh);
                        this.model.setFreeformTarget("OVERLAY");
                    }
                    this.savedState = this.currentState;
                    this.currentState = STATE.MARKING;
                }
            }
            break;
        case STATE.COLOUR_PICKER:
            let colour = null;
            if (colour = this.model.checkColourMenuHit()) {
                if (tutorial && this.model.interaction === INTERACTIONS.SHADOW_MARKER && this.model.currentChecklistPrompt === 2) this.model.nextPrompt();
                this.model.setColour(colour);
            }
            this.model.setColourMenuOpen(false);
            this.currentState = this.savedState;
            break;
        case STATE.HELP:
            if (tutorial && this.model.interaction === INTERACTIONS.SMALL_MULTIPLES && this.model.currentChecklistPrompt === 7) this.model.nextPrompt();
            this.model.setHelpMenuOpen(false);
            this.currentState = this.savedState;
            break;
        default:
            break;
    }
    return true;
}

Controller.prototype.handleMouseReleased = function (event) {
    if (!tutorial && this.model.percentLoaded !== 100) return true;
    let hit = null;
    switch (this.currentState) {
        case STATE.NAVIGATING:
            this.currentState = this.savedState;
            break;
        case STATE.MARKING:
            if ((hit = this.model.checkVideoHit()) || this.model.checkOverlayHit()) {
                if (this.model.freeforming()) {
                    this.model.addFreeformPathToShadowMarks(this.model.freeformTarget);
                    this.model.setFreeformTarget(null);
                } else {
                    if (this.model.checkOverlayHit()) {
                        let ow = this.model.videos[0].width;
                        let oh = this.model.videos[0].height;
                        let ox = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - ow;
                        let oy = scrollY;
                        this.model.addShadowMark((mouseX-ox) / ow, (mouseY-oy) / oh, "OVERLAY");
                    } else {
                        if (tutorial && this.model.interaction === INTERACTIONS.SHADOW_MARKER && this.model.currentChecklistPrompt === 0) this.model.nextPrompt();
                        this.model.addShadowMark((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height, hit);
                    }
                }
            }
            this.currentState = this.savedState;
        default:
            break;
    }
    return true;
}

Controller.prototype.handleKeyPressed = function (event) {
    if (!tutorial && this.model.percentLoaded !== 100) return true;
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            if (keyCode === 68) {
                // Handle d pressed
                let hit = this.model.checkShadowMarkerHit();
                if (hit) {
                    if (tutorial && this.model.interaction === INTERACTIONS.SHADOW_MARKER && this.model.currentChecklistPrompt === 6) this.model.nextPrompt();
                    this.model.deleteShadowMarker(hit);
                }
            }
            if (event.ctrlKey && [61,187].includes(keyCode)) {
                // Handle ctrl + "+" pressed
                if (tutorial && this.model.interaction === INTERACTIONS.SMALL_MULTIPLES && this.model.currentChecklistPrompt === 0) this.model.nextPrompt();
                this.model.zoomIn();
                this.model.updateVideoLocations();
                if (keyCode === 187) {
                    // Firefox does not like this behaviour
                    this.timer = setInterval(() => {
                        this.model.zoomIn();
                        this.model.updateVideoLocations();
                    }, 300);
                    this.savedState = this.currentState;
                    this.currentState = STATE.ZOOMING;
                }
                return false;
            }
            if (event.ctrlKey && [173,189].includes(keyCode)) {
                // Handle ctrl + "-" pressed
                if (tutorial && this.model.interaction === INTERACTIONS.SMALL_MULTIPLES && this.model.currentChecklistPrompt === 1) this.model.nextPrompt();
                this.model.zoomOut();
                this.model.updateVideoLocations();
                if (keyCode === 189) {
                    // Firefox does not like this behaviour
                    this.timer = setInterval(() => {
                        this.model.zoomOut();
                        this.model.updateVideoLocations();
                    }, 300);
                    this.savedState = this.currentState;
                    this.currentState = STATE.ZOOMING;
                }
                return false;
            }
            if (keyCode === 32) {
                // Handle spacebar pressed
                if (this.currentState === STATE.PLAYING) {
                    if (tutorial && this.model.interaction === INTERACTIONS.SMALL_MULTIPLES && this.model.currentChecklistPrompt === 4) this.model.nextPrompt();
                    clearInterval(this.timer);
                    this.currentState = STATE.READY;
                } else {
                    if (tutorial && this.model.interaction === INTERACTIONS.SMALL_MULTIPLES && this.model.currentChecklistPrompt === 3) this.model.nextPrompt();
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
                return false;
            }
            // if (event.ctrlKey && keyCode === 71) {
                // Handle ctrl + g pressed
                // if (tutorial && this.model.interaction === INTERACTIONS.SHADOW_MARKER && this.model.currentChecklistPrompt === 7) this.model.nextPrompt();
                // this.model.setGridActive(!this.model.gridActive);
                // let hit = this.model.checkVideoHit();
                // if (this.model.checkOverlayHit()) hit = "OVERLAY";
                // this.model.setHoverTarget(hit);
                // if (this.model.gridActive) {
                //     this.model.setGridHighlight(hit);
                // }
                // return false;
            // }
            if (keyCode === 37) {
                // Handle left arrow pressed
                if (this.model.index > 0) {
                    this.model.setIndex(this.model.index - 1);
                    return false;
                }
            }
            if (keyCode === 39) {
                // Handle right arrow pressed
                if (this.model.index < this.model.getScrollbarSegments() - 1) {
                    this.model.setIndex(this.model.index + 1);
                    return false;
                }
            }
            if (keyCode === ENTER) {
                if (tutorial && this.model.currentChecklistPrompt >= this.model.tutorialChecklist.length) {
                    this.model.logData();
                } else if (confirm("Are you sure you want to submit your selection?")) {
                    if (!tutorial && this.model.trial < 2) {
                        this.model.addTrialData();
                        this.model.nextTrial();
                    } else {
                        this.model.addTrialData();
                        this.model.logData();  
                    }
                }
            }
            break;
        default:
            break;
    }
    return true;
}

Controller.prototype.handleKeyReleased = function(event) {
    if (!tutorial && this.model.percentLoaded !== 100) return true;
    switch (this.currentState) {
        case STATE.ZOOMING:
            if ([187,189].includes(keyCode)) {
                // Handle ctrl + "+" or "-" released
                clearInterval(this.timer);
                this.currentState = this.savedState;
                return false;
            }
            break;
        default:
            break;
    }
    return true;
}

Controller.prototype.handleScroll = function() {
    this.model.notifySubscribers();
}

Controller.prototype.handleLoadTutorials = async function () {
    console.log("Loading tutorials into the model...");
    for (let i = 1; i <= 3; i++) {
        let frames = [];
        let labels = [];
        for (let j = 1; j <= 360; j++) {
            frames.push({ width: 420, height: 420 });
            labels.push(`Frame ${j}`);
        }
        this.model.addVideo(frames, labels, `video-${i}`)
    }
}

Controller.prototype.handleLoadBaseball = async function (undesired="") {
    console.log("Loading 6 random baseball videos...");
    let category;
    while ((category = assets.baseball.categories[getRandomInt(0, assets.baseball.categories.length)]).name === undesired);
    let videos = [];
    while (videos.length < 6) {
        let video = getRandomInt(0, category.videos.length);
        if (!videos.includes(video)) videos.push(video);
    }
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 1; frame <= category.frames; frame++) {
                frames.push(loadImage(`${assets.baseball.path}/${category.name}/${category.videos[video].name}/img${String(frame).padStart(3,"0")}.jpg`,
                    () => {
                        if (++completed >= category.frames) resolve();
                        if (this.model.videos.length < 6) this.model.setPercentLoaded(Math.round((video/category.videos.length*100) + (completed/category.frames)*(100/category.videos.length)));
                    },
                    (err) => {
                        if (++completed >= category.frames) reject(err);
                        if (this.model.videos.length < 6) this.model.setPercentLoaded(Math.round((video/category.videos.length*100) + (completed/category.frames)*(100/category.videos.length)));
                    }));
                labels.push(`Frame ${frame}`);
            }
        });
        this.model.addVideo(frames, labels, category.videos[video].name);
    }
    return category;
}

Controller.prototype.handleLoadLemnatec = async function (undesired="") {
    console.log("Loading 6 random lemnatec videos...");
    let category;
    while ((category = assets.lemnatec.categories[getRandomInt(0, assets.lemnatec.categories.length)]).name === undesired);
    let videos = [];
    while (videos.length < 6) {
        let video = getRandomInt(0, category.videos.length);
        if (!videos.includes(video)) videos.push(video);
    }
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 0; frame < category.frames.length; frame++) {
                frames.push(loadImage(`${assets.lemnatec.path}/${category.name}/${category.videos[videos[video]].name}/${category.frames[frame]}.png`,
                    () => {
                        if (++completed >= category.frames.length) resolve();
                        if (this.model.videos.length < 6) this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames.length)*(100/videos.length)));
                    },
                    (err) => {
                        if (++completed >= category.frames.length) reject(err);
                        if (this.model.videos.length < 6) this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames.length)*(100/videos.length)));
                    }));
                labels.push(category.frames[frame]);
            }
        });
        this.model.addVideo(frames, labels, category.videos[videos[video]].name);
    }
    return category;
}

Controller.prototype.handleLoadSeaIce = async function (undesired="") {
    console.log("Loading 6 random sea ice videos...");
    let category;
    while ((category = assets.seaice.categories[getRandomInt(0, assets.seaice.categories.length)]).name === undesired);
    let videos = [];
    let zeros = 0;
    let halves = 0;
    let ones = 0;
    while (videos.length < 6) {
        let video = getRandomInt(0, category.videos.length);
        if (!videos.includes(video)) {
            switch (category.videos[video].extends) {
                case 0.0:
                    if (zeros < 2) {
                        zeros++;
                        videos.push(video);
                    }
                    break;
                case 0.5:
                    if (halves < 2) {
                        halves++;
                        videos.push(video);
                    }
                    break;
                case 1.0:
                    if (ones < 2) {
                        ones++;
                        videos.push(video);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    videos.sort((a,b) => a - b); // better to have years in order
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 214;
            for (let frame = 215; frame <= category.frames; frame++) {
                frames.push(loadImage(`${assets.seaice.path}/${category.name}/${category.videos[videos[video]].name}/${category.videos[videos[video]].name}${String(frame).padStart(4, "0")}.png`,
                    () => {
                        if (++completed >= category.frames) resolve();
                        if (this.model.videos.length < 6) this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames)*(100/videos.length)));
                    },
                    (err) => {
                        if (++completed >= category.frames) reject(err);
                        if (this.model.videos.length < 6) this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames)*(100/videos.length)));
                    }));
                labels.push(`Day ${frame}`);
            }
        });
        this.model.addVideo(frames, labels, category.videos[videos[video]].name);
    }
    return category;
}

// Controller.prototype.handleLoadRustPlants = async function () {
//     console.log("Loading plant rust dataset...");
//     const plants = ["BigLab iPhone14", "iPhone 2", "iPhone 7", "iPhone 8"];
//     let filenames = [];
//     const totalImages = 1000;
//     for (let i = 0; i < plants.length; i++) {
//         // filenames.push(await fetch(`http://${host}:3018/get/filenames/plant_rust`, {
//         //     method: "POST",
//         //     headers: { "Content-Type": "application/json"},
//         //     body: JSON.stringify({ plant: plants[i] })
//         // })
//         //     .then(response => response.json())
//         //     .then(response => response.filenames));
//     }
//     for (let j = 0; j < plants.length; j++) {
//         const plant = plants[j];
//         const filename = filenames[j];
//         let video = [];
//         let labels = [];
//         await new Promise((resolve, reject) => {
//             let completed = 0;
//             for (let frame = 0; frame < totalImages; frame++) {
//                 video.push(loadImage("img/plant_rust/" + filename[frame],
//                     () => {
//                         if (++completed >= totalImages) resolve();
//                         this.model.setPercentLoaded(Math.ceil((j/(plants.length)*100) + (completed/totalImages)*(100/plants.length)));
//                     },
//                     (err) => {
//                         if (++completed >= totalImages) reject();
//                         this.model.setPercentLoaded(Math.ceil((j/(plants.length)*100) + (completed/totalImages)*(100/plants.length)));
//                     }));
//                 labels.push(filename[frame]);
//             }
//         });
//         this.model.addVideo(video, labels, plant);
//     }
// }