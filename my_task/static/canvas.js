/*
 * Main file for creating and connecting MVC components.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

let model, view, controller;

let mouseMovementLoop = 0;

let attentionTimer;

async function preload() {
    model = new Model();
    view = new View(model);
    controller = new Controller(model);

    model.setInteraction(interaction);
    model.setTask(parseInt(task));

    if (model.task !== 3) model.setType(MARKS.CURSOR);
}

function setup() {
    createCanvas(windowWidth*0.98, windowHeight);

    let startTime = new Date().getTime();

    switch (model.task) {
        case 1:
            controller.handleLoadLemnatec(0).then(results1 => { 
                model.setCategory(results1.category);
                model.setTrialLoadTime(new Date().getTime()-startTime);
                startTime = new Date().getTime();
                controller.handleLoadLemnatec(1).then(results2 => {
                    model.setCategory(results2.category);
                    model.setTrialLoadTime(new Date().getTime()-startTime);
                    startTime = new Date().getTime();
                    controller.handleLoadLemnatec(2, results2.selectionCondition).then(results3 => {
                        model.setCategory(results3.category);
                        model.setTrialLoadTime(new Date().getTime()-startTime);
                    });
                });
            });
            break;
        case 2:
            controller.handleLoadSeaIce(0).then(results1 => { 
                model.setCategory(results1.category);
                model.setTrialLoadTime(new Date().getTime()-startTime);
                startTime = new Date().getTime();
                controller.handleLoadSeaIce(1).then(results2 => {
                    model.setCategory(results2.category);
                    model.setTrialLoadTime(new Date().getTime()-startTime);
                    startTime = new Date().getTime();
                    controller.handleLoadSeaIce(2, results2.selectionCondition).then(results3 => {
                        model.setCategory(results3.category);
                        model.setTrialLoadTime(new Date().getTime()-startTime);
                    });
                });
            });
            break;
        case 3:
            let loadedCategories = ["oakland_coliseum"];
            controller.handleLoadBaseball(0).then(category => {
                model.setCategory(category);
                loadedCategories.push(category);
                model.setTrialLoadTime(new Date().getTime()-startTime);
                startTime = new Date().getTime();
                controller.handleLoadBaseball(1,loadedCategories).then(category => {
                    model.setCategory(category);
                    loadedCategories.push(category);
                    model.setTrialLoadTime(new Date().getTime()-startTime);
                    startTime = new Date().getTime();
                    controller.handleLoadBaseball(2,loadedCategories).then(category => {
                        model.setCategory(category);
                        model.setTrialLoadTime(new Date().getTime()-startTime);
                    });
                });
            });
            break;
        case 4:
            controller.handleLoadScatterplots(0).then(category => {
                model.setCategory(category);
                model.setTrialLoadTime(new Date().getTime()-startTime);
                startTime = new Date().getTime();
                controller.handleLoadScatterplots(1).then(category => {
                    model.setCategory(category);
                    model.setTrialLoadTime(new Date().getTime()-startTime);
                    startTime = new Date().getTime();
                    controller.handleLoadScatterplots(2).then(category => {
                        model.setCategory(category);
                        model.setTrialLoadTime(new Date().getTime()-startTime);
                    });
                });
            });
            break;
    }

    attachUserEventListeners();
    model.addSubscriber(view);

    noLoop();
}

function draw() {}

function mouseMoved(event) { return controller.handleMouseMoved(event) }

function mouseDragged(event) { return controller.handleMouseDragged(event) }

function mousePressed(event) { return controller.handleMousePressed(event) }

function mouseReleased(event) { return controller.handleMouseReleased(event) }

function keyPressed(event) { return controller.handleKeyPressed(event) }

function keyReleased(event) { return controller.handleKeyReleased(event) }

function attachUserEventListeners() {
    document.addEventListener("scroll", e => controller.handleScroll());
    document.getElementById("defaultCanvas0")?.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("visibilitychange", sendHiddenPage);
    document.addEventListener("mouseleave", e => { attentionTimer = setTimeout(sendLeftPage, 5000)});
    document.addEventListener("mouseenter", e => clearTimeout(attentionTimer));
    document.addEventListener("click", sendFullscreenPage);
}

function sendHiddenPage() {
    if (document.hidden) {
        window.location.href = `/redirect_to_page/oops/1/${model.task}/${model.interaction}`;
    }
}

function sendLeftPage() {
    document.removeEventListener("visibilitychange", sendHiddenPage);
    window.location.href = `/redirect_to_page/oops/2/${model.task}/${model.interaction}`;
}

function sendFullscreenPage() {
    if (!(window.fullScreen || (window.innerWidth == screen.width && window.innerHeight == screen.height))) {
        document.removeEventListener("visibilitychange", sendHiddenPage);
        window.location.href = `/redirect_to_page/oops/3/${model.task}/${model.interaction}`;
    }
}

function shuffleArray(arr) {
    for (let i = arr.length-1; i > 0; i--) {
        let index = Math.floor(Math.random()*(i+1));
        let temp = arr[index];
        arr[index] = arr[i];
        arr[i] = temp;
    }
    return arr;
}

/**
 * Move a value at an array index to a row specified by the caller.
 * Placement in row is random.
 * If the value is already in that row, return immediately.
 * Works for 3x3 matrices only.
 */
function moveToRow(arr, index, row) {
    if (Math.floor(index/3) === row) return arr;
    let rowIndex = getRandomInt(0,3);
    let moveIndex = (row*3)+rowIndex;
    let temp = arr[moveIndex];
    arr[moveIndex] = arr[index];
    arr[index] = temp;
    return arr;
}

/**
 * Returns a random integer between min and max.
 * min inclusive, max exclusive 
 */
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}