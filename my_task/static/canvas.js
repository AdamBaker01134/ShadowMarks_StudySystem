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
    
    switch (model.task) {
        case 0:
            controller.handleLoadSandbox();
            break;
        case 1:
            controller.handleLoadLemnatec().then(category => { 
                model.setCategory(category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
                controller.handleLoadLemnatec(model.category[0].name).then(category => model.setCategory(category));
            });
            break;
        case 2:
            controller.handleLoadSeaIce().then(category => { 
                model.setCategory(category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
                controller.handleLoadSeaIce().then(category => model.setCategory(category));
            });
            break;
        case 3:
            controller.handleLoadBaseball().then(category => { 
                model.setCategory(category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
                controller.handleLoadBaseball(model.category[0].name).then(category => model.setCategory(category));
            });
            break;
        case 4:
            controller.handleLoadScatterplots().then(category => {
                model.setCategory(category);
                model.updateVideoDimensions();
                model.updateVideoLocations();
                controller.handleLoadScatterplots().then(category => model.setCategory(category));
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
 * Returns a random integer between min and max.
 * min inclusive, max exclusive 
 */
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}