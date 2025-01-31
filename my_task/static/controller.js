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
    ERROR: "error",
    PROMPT: "prompt",
}

const EVENTS = {
    MOUSE_MOVED: "mouse_moved",
    SHADOW_CURSOR_MOVED: "shadow_cursor_moved",
    SCROLLBAR_SCRUB: "scrollbar_scrub",
    TOGGLED_AUTOPLAYBACK: "toggled_autoplayback",
    NAVIGATED_FRAME_BACK: "navigated_frame_back",
    NAVIGATED_FRAME_FORWARD: "navigated_frame_forward",
    TOGGLED_MARK_BUTTON: "toggled_mark_button",
    OPENED_COLOUR_MENU: "opened_colour_menu",
    SELECTED_COLOUR: "selected_colour",
    OPENED_HELP_MENU: "opened_help_menu",
    CLOSED_HELP_MENU: "closed_help_menu",
    SELECTED_VIDEO: "selected_video",
    ADDED_TO_OVERLAY: "added_to_overlay",
    ADDED_MARK: "added_mark",
    DELETED_SHADOW_MARK: "deleted_shadow_mark",
    ZOOMED_IN: "zoomed_in",
    ZOOMED_OUT: "zoomed_out",
    SUBMIT: "submit",
}

function Controller(model) {
    this.model = model;
    this.currentState = STATE.READY;
    this.savedState = STATE.READY;
    this.timer = null;
}

Controller.prototype.handleMouseMoved = function (event) {
    if (this.model.percentLoaded !== 100 || !this.model.start) return true;
    mouseMovementLoop++;
    if (mouseMovementLoop % 50 === 0) this.model.addStreamData(EVENTS.MOUSE_MOVED);
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
            if (hit && this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
                this.model.highlightMarker(this.model.checkShadowMarkerHit());
                if (this.model.shadowMarkType === MARKS.CURSOR) {
                    this.model.addStreamData(EVENTS.SHADOW_CURSOR_MOVED);
                }
                if (this.model.trial === 0 && this.model.task === 4 && hit === this.model.videos[0] && this.model.currentChecklistPrompt === 0) this.model.nextPrompt();
                if (this.model.trial === 0 && this.model.task === 4 && hit === this.model.videos[7] && this.model.currentChecklistPrompt === 1) this.model.nextPrompt();
            }
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
    if (this.model.percentLoaded !== 100 || !this.model.start) return true;
    mouseMovementLoop++;
    let hit = null;
    switch (this.currentState) {
        case STATE.NAVIGATING:
            this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
            if (mouseMovementLoop % 50 === 0) this.model.addStreamData(EVENTS.SCROLLBAR_SCRUB);
            break;
        case STATE.MARKING:
            hit = this.model.checkVideoHit();
            if (this.model.freeforming() && hit && hit === this.model.freeformTarget && !(this.model.shadowMarkType === MARKS.CIRCLE && this.model.circleOutOfBounds((mouseX-hit.x)/hit.width,(mouseY-hit.y)/hit.height))) {
                this.model.addToFreeformPath((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height, event.shiftKey);
            } else if (this.model.freeforming() && this.model.checkOverlayHit() && this.model.freeformTarget === "OVERLAY") {
                let ow, oh, ox, oy;
                ({ ow, oh, ox, oy } = this.model.getOverlayDimensions());
                hit = "OVERLAY";
                if (!(this.model.shadowMarkType === MARKS.CIRCLE && this.model.circleOutOfBounds((mouseX-ox)/ow,(mouseY-oy)/oh))) {
                    this.model.addToFreeformPath((mouseX-ox) / ow, (mouseY-oy) / oh, event.shiftKey);
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
    if (this.model.percentLoaded !== 100) return true;
    if (!this.model.start) {
        if (this.model.checkStartButtonHit()) {
            fullscreen(true);
            this.model.startTrial();
            return false;
        }
        return true;
    } else if (!fullscreen() && this.model.errorCode === -1) {
        sendFullscreenPage();
        return false;
    }
    let hit = null, mark = null;
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            if (this.model.checkScrollbarHit()) {
                this.model.setIndex(this.model.getIndexFromMouse(this.model.getScrollbarX(), mouseX, this.model.getScrollbarSegments(), this.model.getScrollbarWidth()));
                this.model.addStreamData(EVENTS.SCROLLBAR_SCRUB);
                this.savedState = this.currentState;
                this.currentState = STATE.NAVIGATING;
            } else if (this.model.checkHelpButtonHit()) {
                this.model.setHelpMenuOpen(true);
                this.model.addStreamData(EVENTS.OPENED_HELP_MENU);
                this.savedState = this.currentState;
                this.currentState = STATE.HELP;
            } else if (this.model.interaction === INTERACTIONS.SHADOW_MARKER && (mark = this.model.checkMarkButtonHit())) {
                this.model.setType(mark);
                this.model.addStreamData(EVENTS.TOGGLED_MARK_BUTTON);
                return false;
            } else if (this.model.interaction === INTERACTIONS.SHADOW_MARKER && this.model.checkColourButtonHit()) {
                this.model.setColourMenuOpen(true);
                this.model.addStreamData(EVENTS.OPENED_COLOUR_MENU);
                this.savedState = this.currentState;
                this.currentState = STATE.COLOUR_PICKER;
            } else if (hit = this.model.checkVideoHit()) {
                if (event.ctrlKey) {
                    if (this.model.task !== 3) {
                        // Task 1, 2, and Task 4 do not allow multi-select.
                        this.model.selectedVideos.forEach(video => this.model.selectVideo(video));
                    } else if (this.model.task === 3 && this.model.videos[0] === hit) {
                        return true;
                    }
                    this.model.selectVideo(hit);
                    if (this.model.trial === 0 && this.model.task === 3 && hit === this.model.videos[1] && this.model.currentChecklistPrompt === 2) this.model.nextPrompt();
                    this.model.addStreamData(EVENTS.SELECTED_VIDEO);
                    return false;
                } else if (this.model.interaction === INTERACTIONS.OVERLAYS) {
                    this.model.addToOverlay(hit);
                    if (this.model.trial === 0 && (this.model.task === 1 || this.model.task === 2) && hit === this.model.videos[0] && this.model.currentChecklistPrompt === 0) this.model.nextPrompt();
                    else if (this.model.trial === 0 && (this.model.task === 1 || this.model.task === 2) && hit === this.model.videos[1] && this.model.currentChecklistPrompt === 1) this.model.nextPrompt();
                    else if (this.model.trial === 0 && (this.model.task === 1 || this.model.task === 2) && hit === this.model.videos[1] && this.model.currentChecklistPrompt === 2) this.model.nextPrompt();
                    else if (this.model.trial === 0 && (this.model.task === 1 || this.model.task === 2) && hit === this.model.videos[2] && this.model.currentChecklistPrompt === 3) this.model.nextPrompt();
                    else if (this.model.trial === 0 && (this.model.task === 1 || this.model.task === 2) && hit === this.model.videos[0] && this.model.currentChecklistPrompt === 4) this.model.nextPrompt();
                    else if (this.model.trial === 0 && this.model.task === 3 && hit === this.model.videos[0] && this.model.currentChecklistPrompt === 0) this.model.nextPrompt();
                    else if (this.model.trial === 0 && this.model.task === 3 && hit === this.model.videos[1] && this.model.currentChecklistPrompt === 1) this.model.nextPrompt();
                    else if (this.model.trial === 0 && this.model.task === 3 && hit === this.model.videos[2] && this.model.currentChecklistPrompt === 3) this.model.nextPrompt();
                    else if (this.model.trial === 0 && this.model.task === 3 && hit === this.model.videos[2] && this.model.currentChecklistPrompt === 4) this.model.nextPrompt();
                    else if (this.model.trial === 0 && this.model.task === 4 && hit === this.model.videos[0] && this.model.currentChecklistPrompt === 0) this.model.nextPrompt();
                    else if (this.model.trial === 0 && this.model.task === 4 && hit === this.model.videos[1] && !this.model.overlay.includes(hit) && this.model.currentChecklistPrompt === 1) this.model.nextPrompt();
                    else if (this.model.trial === 0 && this.model.task === 4 && hit === this.model.videos[0] && !this.model.overlay.includes(hit) && this.model.currentChecklistPrompt === 2) this.model.nextPrompt();
                    this.model.addStreamData(EVENTS.ADDED_TO_OVERLAY);
                    return false;
                } else if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
                    if (this.model.freeforming()) {
                        this.model.addToFreeformPath((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height, event.shiftKey);
                        this.model.setFreeformTarget(hit);
                    }
                    this.savedState = this.currentState;
                    this.currentState = STATE.MARKING;
                    return false;
                }
            } else if (this.model.checkOverlayHit()) { 
                if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
                    let ow, oh, ox, oy;
                    ({ ow, oh, ox, oy } = this.model.getOverlayDimensions());
                    if (this.model.freeforming()) {
                        this.model.addToFreeformPath((mouseX-ox) / ow, (mouseY-oy) / oh, event.shiftKey);
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
                this.model.setColour(colour);
            }
            this.model.setColourMenuOpen(false);
            this.model.addStreamData(EVENTS.SELECTED_COLOUR);
            this.currentState = this.savedState;
            break;
        case STATE.HELP:
            this.model.setHelpMenuOpen(false);
            this.model.addStreamData(EVENTS.CLOSED_HELP_MENU);
            this.currentState = this.savedState;
            break;
        case STATE.ERROR:
            if (this.model.checkErrorButtonHit()) {
                fullscreen(true);
                this.model.updateVideoDimensions();
                this.model.updateVideoLocations();
                this.model.error(-1);
                let prompt = document.getElementById("prompt");
                if (prompt) {
                    prompt.style.display = "flex";
                    this.currentState = STATE.PROMPT;
                } else {
                    this.currentState = this.savedState;
                }
            }
        default:
            break;
    }
    return true;
}

Controller.prototype.handleMouseReleased = function (event) {
    if (this.model.percentLoaded !== 100 || !this.model.start) return true;
    let hit = null;
    switch (this.currentState) {
        case STATE.NAVIGATING:
            this.currentState = this.savedState;
            break;
        case STATE.MARKING:
            if (this.model.freeforming()) {
                this.model.addFreeformPathToShadowMarks(this.model.freeformTarget);
                this.model.setFreeformTarget(null);
                this.model.addStreamData(EVENTS.ADDED_MARK);
            } else if ((hit = this.model.checkVideoHit()) || this.model.checkOverlayHit()) {
                if (this.model.checkOverlayHit()) {
                    let ow, oh, ox, oy;
                    ({ ow, oh, ox, oy } = this.model.getOverlayDimensions());
                    this.model.addShadowMark((mouseX-ox) / ow, (mouseY-oy) / oh, "OVERLAY");
                    this.model.addStreamData(EVENTS.ADDED_MARK);
                } else {
                    this.model.addShadowMark((mouseX-hit.x) / hit.width, (mouseY-hit.y) / hit.height, hit);
                    if (this.model.trial === 0 && (this.model.task === 1 || this.model.task === 2) && hit === this.model.videos[0] && this.model.currentChecklistPrompt === 0) this.model.nextPrompt();
                    else if (this.model.trial === 0 && (this.model.task === 1 || this.model.task === 2) && hit === this.model.videos[1] && this.model.currentChecklistPrompt === 2) this.model.nextPrompt();
                    else if (this.model.trial === 0 && this.model.task === 3 && hit === this.model.videos[0] && this.model.currentChecklistPrompt === 0) this.model.nextPrompt();
                    this.model.addStreamData(EVENTS.ADDED_MARK);
                }
            }
            this.currentState = this.savedState;
        default:
            break;
    }
    return true;
}

Controller.prototype.handleKeyPressed = function (event) {
    if (this.model.percentLoaded !== 100 || !this.model.start) return true;
    switch (this.currentState) {
        case STATE.READY:
        case STATE.PLAYING:
            if (keyCode === 68) {
                // Handle d pressed
                let hit = this.model.checkShadowMarkerHit();
                if (hit) {
                    this.model.deleteShadowMarker(hit);
                    if (this.model.trial === 0 && (this.model.task === 1 || this.model.task === 2) && this.model.currentChecklistPrompt === 1) this.model.nextPrompt();
                    this.model.addStreamData(EVENTS.DELETED_SHADOW_MARK);
                }
            }
            if (event.ctrlKey && [61,187].includes(keyCode)) {
                // Handle ctrl + "+" pressed
                this.model.zoomIn();
                this.model.addStreamData(EVENTS.ZOOMED_IN);
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
                this.model.zoomOut();
                this.model.addStreamData(EVENTS.ZOOMED_OUT);
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
                this.model.addStreamData(EVENTS.TOGGLED_AUTOPLAYBACK);
                if (this.currentState === STATE.PLAYING) {
                    clearInterval(this.timer);
                    this.currentState = STATE.READY;
                } else {
                    if (this.model.getIndex() + 1 >= this.model.getScrollbarSegments()) {
                        this.model.setIndex(0);
                    }
                    this.timer = setInterval(() => {
                        switch(this.currentState) {
                            case STATE.READY:
                            case STATE.PLAYING:
                            case STATE.MARKING:
                                if (this.model.getIndex() + 1 >= this.model.getScrollbarSegments()) {
                                    clearInterval(this.timer);
                                    if (this.currentState === STATE.MARKING) {
                                        this.savedState = STATE.READY;
                                    } else {
                                        this.currentState = STATE.READY;
                                    }
                                } else {
                                    this.model.setIndex(this.model.getIndex() + 1);
                                }
                        }
                    }, 50);
                    this.currentState = STATE.PLAYING;
                }
                return false;
            }
            // if (event.ctrlKey && keyCode === 71) {
                // Handle ctrl + g pressed
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
                if (this.model.trial === 0 && event.ctrlKey) {
                    this.model.lastPrompt();
                    return false;
                } else if (this.model.getIndex() > 0) {
                    this.model.addStreamData(EVENTS.NAVIGATED_FRAME_BACK);
                    this.model.setIndex(this.model.getIndex() - 1);
                    return false;
                }
            }
            if (keyCode === 39) {
                // Handle right arrow pressed
                if (this.model.trial === 0 && event.ctrlKey) {
                    this.model.nextPrompt();
                    return false;
                } else if (this.model.getIndex() < this.model.getScrollbarSegments() - 1) {
                    this.model.addStreamData(EVENTS.NAVIGATED_FRAME_FORWARD);
                    this.model.setIndex(this.model.getIndex() + 1);
                    return false;
                }
            }
            if (keyCode === ENTER) {
                // if (this.model.shadowMarks.length === this.model.videosPerTrial) {
                //     // Easy height calculator
                //     let resultTxt = "";
                //     for (let i = 0; i < this.model.shadowMarks.length; i++) {
                //         let video = this.model.videos[i];
                //         let mark = this.model.shadowMarks[i];
                //         resultTxt += `{ name: "${video.name}", peak: ${(1-mark.heightRatio).toFixed(4)} }, `;
                //     }
                //     console.log(resultTxt);
                //     // Easy height calculator
                //     let resultTxt = "";
                //     for (let i = 0; i < this.model.shadowMarks.length; i++) {
                //         let video = this.model.videos[i];
                //         let mark = this.model.shadowMarks[i];
                //         resultTxt += `{ name: "${video.name}", extension: ${(mark.widthRatio).toFixed(4)} }, `;
                //     }
                //     console.log(resultTxt);
                //     // Easy location marking
                //         // For location marking
                //         let resultTxt = "";
                //         for (let i = 0; i < this.model.shadowMarks.length; i++) {
                //             let video = this.model.videos[i];
                //             let mark = this.model.shadowMarks[i];
                //             resultTxt += `{ name: "${video.name}", release: [${(mark.widthRatio).toFixed(4)},${(1-mark.heightRatio).toFixed(4)}], }, `;
                //         }
                //         console.log(resultTxt);
                // }
                if (this.model.selectedVideos.length > 0 && (this.model.task !== 3 || this.model.selectedVideos.length === 2)) {
                    customConfirm("Confirm selection", () => {
                        this.model.addStreamData(EVENTS.SUBMIT);
                        let elapsedTime = new Date().getTime() - this.model.trialStartTime - this.model.errorTime;
                        if (this.model.trial < 2) {
                            let results = this.model.addTrialData();
                            if (results.falsePositives === 0 && results.falseNegatives === 0) {
                                this.model.nextTrial();
                                this.currentState = this.savedState;
                            } else if (elapsedTime > 180000) {
                                this.model.nextTrial();
                                this.currentState = this.savedState;
                            } else {
                                this.model.tryAgain();
                                if (this.model.task === 3 && results.totalCorrect === 1) {
                                    customAlert("1/2 correct.<br />Correct video will be highlighted in green. Try again.", () => this.currentState = this.savedState);
                                } else {
                                    customAlert("Incorrect. Try again.", () => this.currentState = this.savedState);
                                }
                            }
                        } else {
                            let results = this.model.addTrialData();
                            if (results.falsePositives === 0 && results.falseNegatives === 0) {
                                this.model.logData();
                            } else if (elapsedTime > 180000) {
                                this.model.logData();
                            } else {
                                this.model.tryAgain();
                                if (this.model.task === 3 && results.totalCorrect === 1) {
                                    customAlert("1/2 correct.<br />Correct video will be highlighted in green. Try again.", () => this.currentState = this.savedState);
                                } else {
                                    customAlert("Incorrect. Try again.", () => this.currentState = this.savedState);
                                }
                            }
                        }
                    }, () => this.currentState = this.savedState);
                    this.savedState = this.currentState;
                    this.currentState = STATE.PROMPT;
                } else {
                    let required = this.model.task === 3 ? 2 : 1;
                    if (this.model.selectedVideos.length > required) {
                        customAlert("Warning: Too many videos selected.", () => this.currentState = this.savedState);
                        this.savedState = this.currentState;
                        this.currentState = STATE.PROMPT;
                    } else {
                        customAlert("Warning: Not enough videos selected.", () => this.currentState = this.savedState);
                        this.savedState = this.currentState;
                        this.currentState = STATE.PROMPT;
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
    if (this.model.percentLoaded !== 100 || !this.model.start) return true;
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

Controller.prototype.handleWindowResized = function () {
    let newWidth = width;
    let newHeight = height;
    if (newWidth < windowWidth*0.98) newWidth = windowWidth*0.98;
    if (newHeight < windowHeight) newHeight = windowHeight;
    resizeCanvas(newWidth, newHeight);
    this.model.updateVideoDimensions();
    this.model.updateVideoLocations();
    this.model.notifySubscribers();
}

Controller.prototype.handleScroll = function() {
    this.model.notifySubscribers();
}

Controller.prototype.handleLoadSandbox = async function () {
    console.log("Loading 6 sandbox videos...");
    let category = assets.sandbox.categories[0];
    let videos = [0,1,2,3,4,5,6,7,8];
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        let errorOccurred = false;
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 0; frame < category.frames.length; frame++) {
                frames.push(loadImage(`${assets.sandbox.path}/${category.name}/${category.videos[videos[video]].name}/${category.frames[frame]}.webp`,
                    () => {
                        if (++completed >= category.frames.length) resolve();
                        if (this.model.videos.length < this.model.videosPerTrial) this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames.length)*(100/videos.length)));
                    },
                    (err) => {
                        if (!errorOccurred) {
                            errorOccurred = true;
                            this.model.error(4);
                            reject(err);
                        }
                    }));
                labels.push(category.frames[frame]);
            }
        });
        this.model.addVideo(frames, labels, category.videos[videos[video]].name);
    }
    return category;
}

Controller.prototype.handleLoadBaseball = async function (trialNum, undesired=[]) {
    console.log("Loading 9 random baseball videos...");
    let videos = [];
    let category;
    if (trialNum === 0) {
        if (this.model.instructionImage === null) {
            let instructionsName = "placeholder.webp";
            switch(this.model.interaction) {
                case INTERACTIONS.SMALL_MULTIPLES:
                    instructionsName = "smallmultiples_task3_img1.webp";
                    break;
                case INTERACTIONS.OVERLAYS:
                    instructionsName = "overlays_task3_img1.webp";
                    break;
                case INTERACTIONS.SHADOW_MARKER:
                    instructionsName = "shadowmarkers_task3_img1.webp";
                    break;
            }
            this.model.setInstructionImage(loadImage(`${instructionsPath}/${instructionsName}`));
        }
        category = assets.baseball.categories[6];
        while (videos.length < this.model.videosPerTrial) {
            let video = getRandomInt(0, category.videos.length);
            if (![0,1,7,...videos].includes(video)) videos.push(video);
        }
        videos[0] = 7;
        switch (this.model.interaction) {
            case INTERACTIONS.SMALL_MULTIPLES:
                videos[6] = 0;
                videos[8] = 1;
                break;
            case INTERACTIONS.OVERLAYS:
                videos[4] = 0;
                videos[1] = 1;
                break;
            case INTERACTIONS.SHADOW_MARKER:
                videos[2] = 0;
                videos[6] = 1;
                break;
        }
    } else {
        // Categories and videos hardcoded for task 3
        if (blockNum === 1 && trialNum === 1) {
            category = assets.baseball.categories[0];
            // ref: 0 ; correct: 5,2 ; positions: 4,7
            videos = [0,1,9,15,5,17,8,2,11];
        } else if (blockNum === 1 && trialNum === 2) {
            category = assets.baseball.categories[1];
            // ref: 3 ; correct: 5,11 ; positions: 6,8
            videos = [3,0,2,8,9,10,5,17,11];
        } else if (blockNum === 2 && trialNum === 1) {
            category = assets.baseball.categories[2];
            // ref: 3 ; correct: 4,10 ; positions: 3,5
            videos = [3,2,7,4,11,10,14,16,17];
        } else if (blockNum === 2 && trialNum === 2) {
            category = assets.baseball.categories[3];
            // ref: 7 ; correct: 1,16 ; positions: 7,6
            videos = [7,3,4,8,10,15,16,1,17];
        } else if (blockNum === 3 && trialNum === 1) {
            category = assets.baseball.categories[4];
            // ref: 17 ; correct: 0,7 ; positions: 5,6
            videos = [17,1,4,9,12,0,7,13,14];
        } else if (blockNum === 3 && trialNum === 2) {
            category = assets.baseball.categories[5];
            // ref: 11 ; correct: 9,16 ; positions: 8,4
            videos = [11,1,6,7,16,8,12,13,9];
        }
    }
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        let errorOccurred = false;
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 40; frame <= category.frames; frame++) {
                frames.push(loadImage(`${assets.baseball.path}/${category.name}/${category.videos[videos[video]].name}/img${String(frame).padStart(3,"0")}.webp`,
                    () => {
                        if (++completed >= category.frames-40) resolve();
                        if (this.model.videos.length < this.model.videosPerTrial) this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/(category.frames-40))*(100/videos.length)));
                    },
                    (err) => {
                        if (!errorOccurred) {
                            errorOccurred = true;
                            this.model.error(4);
                            reject(err);
                        }
                    }));
                labels.push(`Frame ${frame}`);
            }
        });
        this.model.addVideo(frames, labels, category.videos[videos[video]].name);
    }
    return category;
}

Controller.prototype.handleLoadLemnatec = async function (trialNum, selectionCondition=-1) {
    console.log("Loading 9 random lemnatec videos...");
    let videos = [];
    let category = assets.lemnatec.categories[0];
    let selectionCond = selectionCondition;
    if (trialNum === 0) {
        if (this.model.instructionImage === null) {
            let instructionsName = "placeholder.webp";
            switch(this.model.interaction) {
                case INTERACTIONS.SMALL_MULTIPLES:
                    instructionsName = "smallmultiples_task1_img1.webp";
                    break;
                case INTERACTIONS.OVERLAYS:
                    instructionsName = "overlays_task1_img1.webp";
                    break;
                case INTERACTIONS.SHADOW_MARKER:
                    instructionsName = "shadowmarkers_task1_img1.webp";
                    break;
            }
            this.model.setInstructionImage(loadImage(`${instructionsPath}/${instructionsName}`));
        }
        switch (this.model.interaction) {
            case INTERACTIONS.SMALL_MULTIPLES:
                videos = [1,2,0,7,4,6,5,3,8];
                break;
            case INTERACTIONS.OVERLAYS:
                videos = [0,1,8,5,6,7,3,4,2];
                break;
            case INTERACTIONS.SHADOW_MARKER:
                videos = [5,8,2,1,3,0,6,7,4];
                break;
        }
    } else {
        // const n = category.videos.length;
        // videos = category.videos;
        // const mean = videos.reduce((a,b) => a + b.peak, 0)/n;
        // const std = Math.sqrt(videos.map(x => Math.pow(x.peak - mean, 2)).reduce((a,b) => a + b) / n);
        // debugger;
        let peakVals = [];
        if (selectionCond === -1) selectionCond = getRandomInt(0,2);
        else selectionCond = Math.abs(selectionCond-1);
        let seen = [];
        switch (selectionCond) {
            case 0:
                // High peak condition
                while (videos.length < 3) {
                    let video = getRandomInt(9,category.videos.length);
                    let peak = category.videos[video].peak;
                    let name = category.videos[video].name.split("-")[0];
                    if (!videos.includes(video) && peak > 0.50) {
                        videos.push(video);
                        peakVals.push(peak);
                        seen.push(name);
                    }
                }
                while (videos.length < 9) {
                    let video = getRandomInt(9,category.videos.length);
                    let peak = category.videos[video].peak;
                    if (!videos.includes(video) && peak > 0.49 && peak < 0.50) {
                        videos.push(video);
                        peakVals.push(peak);
                    }
                }
                break;
            case 1:
            default:
                // Low peak condition
                while (videos.length < 2) {
                    let video = getRandomInt(9,category.videos.length);
                    let peak = category.videos[video].peak;
                    let name = category.videos[video].name.split("-")[0];
                    if (!videos.includes(video) && peak > 0.48 && peak < 0.49) {
                        videos.push(video);
                        peakVals.push(peak);
                        seen.push(name);
                    }
                }
                while (videos.length < 3) {
                    let video = getRandomInt(9,category.videos.length);
                    let peak = category.videos[video].peak;
                    if (!videos.includes(video) && peak > 0.47 && peak < 0.48) {
                        videos.push(video);
                        peakVals.push(peak);
                    }
                }
                while (videos.length < 9) {
                    let video = getRandomInt(9,category.videos.length);
                    let peak = category.videos[video].peak;
                    if (!videos.includes(video) && peak < 0.47) {
                        videos.push(video);
                        peakVals.push(peak);
                    }
                }
                break;
        }
        let tallest = Math.max(...peakVals);
        // Ensure video is in the correct position
        let position = positions[trialNum-1];
        while (videos.findIndex(video => category.videos[video].peak === tallest) !== position) shuffleArray(videos);
    }
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        let errorOccurred = false;
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 0; frame < category.frames.length; frame++) {
                frames.push(loadImage(`${assets.lemnatec.path}/${category.name}/${category.videos[videos[video]].name}/${category.frames[frame]}.webp`,
                    () => {
                        if (++completed >= category.frames.length) resolve();
                        if (this.model.videos.length < this.model.videosPerTrial) this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames.length)*(100/videos.length)));
                    },
                    (err) => {
                        if (!errorOccurred) {
                            errorOccurred = true;
                            this.model.error(4);
                            reject(err);
                        }
                    }));
                labels.push(category.frames[frame]);
            }
        });
        this.model.addVideo(frames, labels, category.videos[videos[video]].name);
    }
    return { category: category, selectionCondition: selectionCond };
}

Controller.prototype.handleLoadSeaIce = async function (trialNum, selectionCondition=-1) {
    console.log("Loading 9 random sea ice videos...");
    let videos = [];
    let category = assets.seaice.categories[0];
    let selectionCond = selectionCondition;
    if (trialNum === 0) {
        if (this.model.instructionImage === null) {
            let instructionsName = "placeholder.webp";
            switch(this.model.interaction) {
                case INTERACTIONS.SMALL_MULTIPLES:
                case INTERACTIONS.OVERLAYS:
                case INTERACTIONS.SHADOW_MARKER:
                    instructionsName = "smallmultiples_task2_img1.webp";
                    break;
            }
            this.model.setInstructionImage(loadImage(`${instructionsPath}/${instructionsName}`));
        }
        switch (this.model.interaction) {
            case INTERACTIONS.SMALL_MULTIPLES:
                videos = [30,25,31,14,16,17,19,21,23]; // 4
                break;
            case INTERACTIONS.OVERLAYS:
                videos = [14,21,16,25,31,19,23,30,17]; // 2
                break;
            case INTERACTIONS.SHADOW_MARKER:
                videos = [25,16,19,17,23,21,14,31,30]; // 1
                break;
        }
    } else {
        let extensionVals = [];
        if (selectionCondition === -1) selectionCond = getRandomInt(0,2);
        else selectionCond = Math.abs(selectionCondition-1);
        switch (selectionCond) {
            case 0:
                // High extension condition
                while (videos.length < 2) {
                    let video = getRandomInt(0,category.videos.length);
                    let extension = category.videos[video].extension;
                    if (!videos.includes(video) && extension > 0.68) {
                        videos.push(video);
                        extensionVals.push(extension);
                    }
                }
                while (videos.length < 5) {
                    let video = getRandomInt(0,category.videos.length);
                    let extension = category.videos[video].extension;
                    if (!videos.includes(video) && extension > 0.67 && extension < 0.68) {
                        videos.push(video);
                        extensionVals.push(extension);
                    }
                }
                while (videos.length < 9) {
                    let video = getRandomInt(0,category.videos.length);
                    let extension = category.videos[video].extension;
                    if (!videos.includes(video) && extension > 0.66 && extension < 0.67) {
                        videos.push(video);
                        extensionVals.push(extension);
                    }
                }
                break;
            case 1:
            default:
                // Low extension condition
                while (videos.length < 2) {
                    let video = getRandomInt(0,category.videos.length);
                    let extension = category.videos[video].extension;
                    if (!videos.includes(video) && !extensionVals.includes(extension) && extension > 0.66 && extension < 0.67) {
                        videos.push(video);
                        extensionVals.push(extension);
                    }
                }
                while (videos.length < 9) {
                    let video = getRandomInt(0,category.videos.length);
                    let extension = category.videos[video].extension;
                    if (!videos.includes(video) && extension > 0.65 && extension < 0.66) {
                        videos.push(video);
                        extensionVals.push(extension);
                    }
                }
                break;
        }
        let farthest = Math.max(...extensionVals);
        // Ensure video is in the correct position
        let position = positions[trialNum-1];
        while (videos.findIndex(video => category.videos[video].extension === farthest) !== position) shuffleArray(videos);
    }
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        let errorOccurred = false;
        await new Promise((resolve, reject) => {
            let completed = 214;
            for (let frame = 215; frame <= category.frames; frame++) {
                frames.push(loadImage(`${assets.seaice.path}/${category.name}/${category.videos[videos[video]].name}/${category.videos[videos[video]].name}${String(frame).padStart(4, "0")}.webp`,
                    () => {
                        if (++completed >= category.frames) resolve();
                        if (this.model.videos.length < this.model.videosPerTrial) this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames)*(100/videos.length)));
                    },
                    (err) => {
                        if (!errorOccurred) {
                            errorOccurred = true;
                            this.model.error(4);
                            reject(err);
                        }
                    }));
                labels.push(`Day ${frame}`);
            }
        });
        this.model.addVideo(frames, labels, category.videos[videos[video]].name);
    }
    return { category: category, selectionCondition: selectionCond };
}

Controller.prototype.handleLoadScatterplots = async function (trialNum) {
    console.log("Loading 9 random scatterplots...");
    let category = assets.scatterplots.categories[0];
    let videos = [];
    if (trialNum === 0) {
        if (this.model.instructionImage === null) {
            let instructionsName = "placeholder.webp";
            switch(this.model.interaction) {
                case INTERACTIONS.SMALL_MULTIPLES:
                case INTERACTIONS.OVERLAYS:
                    instructionsName = "smallmultiples_task4_img1.webp";
                    break;
                case INTERACTIONS.SHADOW_MARKER:
                    instructionsName = "shadowmarkers_task4_img1.webp";
                    break;
            }
            this.model.setInstructionImage(loadImage(`${instructionsPath}/${instructionsName}`));
        }
        switch (this.model.interaction) {
            case INTERACTIONS.SMALL_MULTIPLES:
                videos = [0,1,2,4,5,6,7,8,9];
                break;
            case INTERACTIONS.OVERLAYS:
                videos = [0,1,5,2,4,6,7,8,9];
                break;
            case INTERACTIONS.SHADOW_MARKER:
                videos = [0,1,2,4,6,7,8,5,9];
                break;
        }
    } else {
        let found = false;
        let farthest = 0;
        while (!found) {
            videos = [];
            found = true;
            farthest = 0;
            // Retrieve the videos
            while (videos.length < this.model.videosPerTrial) {
                let video = getRandomInt(0, category.videos.length);
                if (!videos.includes(video)) videos.push(video);
            }
            for (let i = 0; i < videos.length; i++) {
                // Check that there are no similar outliers
                if (Math.abs(category.videos[videos[i]].outlier - farthest) < 5) found = false;
                if (category.videos[videos[i]].outlier > farthest) farthest = category.videos[videos[i]].outlier;
            }
        }
        // Ensure scatterplot is in the correct position
        let position = positions[trialNum-1];
        while (videos.findIndex(video => category.videos[video].outlier === farthest) !== position) shuffleArray(videos);
    }
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        let errorOccurred = false;
        await new Promise((resolve, reject) => {
            frames.push(loadImage(`${assets.scatterplots.path}/${category.name}/${category.videos[videos[video]].name}.webp`,
                () => resolve(),
                (err) => {
                    if (!errorOccurred) {
                        errorOccurred = true;
                        this.model.error(4);
                        reject(err);
                    }}));
            labels.push(`scatterplot-${videos[video]}`);
        });
        if (this.model.videos.length < this.model.videosPerTrial) this.model.setPercentLoaded(Math.round(100*((video+1)/this.model.videosPerTrial)));
        this.model.addVideo(frames, labels, `scatterplot-${videos[video]}`);
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
