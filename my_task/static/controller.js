/* Application Controller */
"use strict";

const STATE = {
    READY: "ready",
    NAVIGATING: "navigating",
    PLAYING: "playing",
    MARKING: "marking",
    ZOOMING: "zooming",
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
}

Controller.prototype.handleMouseDragged = function (event) {
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
                    this.model.setFreeformTarget(null);
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
                this.timer = setInterval(() => {
                    this.model.zoomIn();
                    this.model.updateVideoLocations();
                }, 300);
                this.savedState = this.currentState;
                this.currentState = STATE.ZOOMING;
            }
            if (event.ctrlKey && keyCode === 189) {
                // Handle ctrl + "-" pressed
                event.preventDefault();
                event.stopPropagation();
                this.model.zoomOut();
                this.model.updateVideoLocations();
                this.timer = setInterval(() => {
                    this.model.zoomOut();
                    this.model.updateVideoLocations();
                }, 300);
                this.savedState = this.currentState;
                this.currentState = STATE.ZOOMING;
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
}

Controller.prototype.handleKeyReleased = function(event) {
    switch (this.currentState) {
        case STATE.ZOOMING:
            if (keyCode === 187 || keyCode === 189) {
                // Handle ctrl + "+" pressed
                event.preventDefault();
                event.stopPropagation();
                clearInterval(this.timer);
                this.currentState = this.savedState;
            }
            break;
        default:
            break;
    }
}

Controller.prototype.handleScroll = function() {
    this.model.notifySubscribers();
}

Controller.prototype.handleLoadBaseball = async function () {
    console.log("Loading 6 random baseball videos...");
    let category = assets.baseball.categories[getRandomInt(0, assets.baseball.categories.length)];
    for (let video = 0; video < category.videos.length; video++) {
        let frames = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 1; frame <= category.frames; frame++) {
                frames.push(loadImage(`${assets.baseball.path}/${category.name}/${category.videos[video].name}/img${String(frame).padStart(3,"0")}.jpg`,
                    () => {
                        if (++completed >= category.frames) resolve();
                        this.model.setPercentLoaded(Math.round((video/category.videos.length*100) + (completed/category.frames)*(100/category.videos.length)));
                    },
                    (err) => {
                        if (++completed >= category.frames) reject(err);
                        this.model.setPercentLoaded(Math.round((video/category.videos.length*100) + (completed/category.frames)*(100/category.videos.length)));
                    }));
                labels.push(`Frame ${frame}`);
            }
        });
        this.model.addVideo(frames, labels, category.videos[video].name);
    }
}

Controller.prototype.handleLoadLemnatec = async function () {
    console.log("Loading 6 random lemnatec videos...");
    let category = assets.lemnatec.categories[getRandomInt(0, assets.lemnatec.categories.length)];
    let videos = [];
    while (videos.length < 6) {
        let video = getRandomInt(0, category.videos.length);
        if (!videos.includes(video)) videos.push(video);
    }
    videos.sort((a,b) => a - b); // better to have numbers in order
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 0; frame < category.frames.length; frame++) {
                frames.push(loadImage(`${assets.lemnatec.path}/${category.name}/${category.videos[videos[video]].name}/${category.frames[frame]}.png`,
                    () => {
                        if (++completed >= category.frames.length) resolve();
                        this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames.length)*(100/videos.length)));
                    },
                    (err) => {
                        if (++completed >= category.frames.length) reject(err);
                        this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames.length)*(100/videos.length)));
                    }));
                labels.push(category.frames[frame]);
            }
        });
        this.model.addVideo(frames, labels, category.videos[videos[video]].name);
    }
}

Controller.prototype.handleLoadSeaIce = async function () {
    console.log("Loading 6 random sea ice videos...");
    let category = assets.seaice.categories[getRandomInt(0, assets.seaice.categories.length)];
    let videos = [];
    while (videos.length < 6) {
        let video = getRandomInt(0, category.videos.length);
        if (!videos.includes(video)) videos.push(video);
    }
    videos.sort((a,b) => a - b); // better to have years in order
    for (let video = 0; video < videos.length; video++) {
        let frames = [];
        let labels = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let frame = 1; frame <= category.frames; frame++) {
                frames.push(loadImage(`${assets.seaice.path}/${category.name}/${category.videos[videos[video]].name}/${category.videos[videos[video]].name}${String(frame).padStart(4, "0")}.png`,
                    () => {
                        if (++completed >= category.frames) resolve();
                        this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames)*(100/videos.length)));
                    },
                    (err) => {
                        if (++completed >= category.frames) reject(err);
                        this.model.setPercentLoaded(Math.round((video/videos.length*100) + (completed/category.frames)*(100/videos.length)));
                    }));
                labels.push(`Day ${frame}`);
            }
        });
        this.model.addVideo(frames, labels, category.videos[videos[video]].name);
    }
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