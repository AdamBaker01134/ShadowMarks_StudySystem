/*
 * Main file for creating and connecting MVC components.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

let model, view, controller;

let mouseMovementLoop = 0;

async function preload() {
    model = new Model();
    view = new View(model);
    controller = new Controller(model);

    model.setInteraction(interaction);
    model.setTask(parseInt(task));
}

function setup() {
    createCanvas(windowWidth*0.98, windowHeight);

    let startTime = new Date().getTime();

    switch (model.task) {
        case 0:
            controller.handleLoadSandbox().then(category => {
                model.setCategory(category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
            });
            break;
        case 1:
            controller.handleLoadLemnatec().then(results1 => { 
                model.setCategory(results1.category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
                let nowTime = new Date().getTime();
                model.setTrialLoadTime(nowTime-startTime);
                controller.handleLoadLemnatec(results1.selectionCondition).then(results2 => {
                    model.setCategory(results2.category);
                    model.setTrialLoadTime(new Date().getTime()-nowTime);
                });
            });
            break;
        case 2:
            controller.handleLoadSeaIce().then(results1 => { 
                model.setCategory(results1.category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
                let nowTime = new Date().getTime();
                model.setTrialLoadTime(nowTime-startTime);
                controller.handleLoadSeaIce(results1.selectionCondition).then(results2 => {
                    model.setCategory(results2.category);
                    model.setTrialLoadTime(new Date().getTime()-nowTime);
                });
            });
            break;
        case 3:
            controller.handleLoadBaseball().then(category => { 
                model.setCategory(category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
                let nowTime = new Date().getTime();
                model.setTrialLoadTime(nowTime-startTime);
                controller.handleLoadBaseball(model.category[0].name).then(category => {
                    model.setCategory(category);
                    model.setTrialLoadTime(new Date().getTime()-nowTime);
                });
            });
            break;
        case 4:
            controller.handleLoadScatterplots().then(category => {
                model.setCategory(category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
                let nowTime = new Date().getTime();
                model.setTrialLoadTime(nowTime-startTime);
                controller.handleLoadScatterplots().then(category => {
                    model.setCategory(category);
                    model.setTrialLoadTime(new Date().getTime()-nowTime);
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