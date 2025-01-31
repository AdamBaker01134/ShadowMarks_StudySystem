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
    else model.setColour(COLOURS.GREEN);
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

function windowResized(event) { return controller.handleWindowResized(event) }

function attachUserEventListeners() {
    document.addEventListener("scroll", e => controller.handleScroll());
    document.getElementById("defaultCanvas0")?.addEventListener("contextmenu", e => e.preventDefault());
    document.getElementById("defaultCanvas0")?.addEventListener("mouseleave", e => { attentionTimer = setTimeout(sendLeftPage, 3000)});
    document.getElementById("defaultCanvas0")?.addEventListener("mouseenter", e => clearTimeout(attentionTimer));
}

function sendHiddenPage() {
    if (model.start && model.errorCode === -1 && document.hidden) {
        model.error(1);
        let prompt = document.getElementById("prompt");
        if (prompt) {
            prompt.style.display = "none";
            controller.currentState = STATE.ERROR;
        } else {
            controller.savedState = controller.currentState;
            controller.currentState = STATE.ERROR;
        }
    }
}

function sendLeftPage() {
    if (model.start && model.errorCode === -1) {
        model.error(2);
        let prompt = document.getElementById("prompt");
        if (prompt) {
            prompt.style.display = "none";
            controller.currentState = STATE.ERROR;
        } else {
            controller.savedState = controller.currentState;
            controller.currentState = STATE.ERROR;
        }
    }
}

function sendFullscreenPage() {
    if (model.start && model.errorCode === -1 && !fullscreen()) {
        model.error(3);
        let prompt = document.getElementById("prompt");
        if (prompt) {
            prompt.style.display = "none";
            controller.currentState = STATE.ERROR;
        } else {
            controller.savedState = controller.currentState;
            controller.currentState = STATE.ERROR;
        }
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

/**
 * Custom confirm() generator
 * @param {string} txt text message
 * @param {Function} okCallback ok button callback function
 * @param {Function} cancelCallback cancel button callback function
 */
function customConfirm (txt, okCallback=()=>{}, cancelCallback=()=>{}) {
    let div = createElement("div",`<div>${txt}</div>`);
    let w = windowWidth/8;
    let h = windowHeight/8;
    div.id("prompt");
    div.style("width",`${w}px`);
    div.style("height",`${h}px`);
    div.style("background","#696969");
    div.style("color","white");
    div.style("padding","20px");
    div.style("border-radius","20px");
    div.style("border","3px black solid");
    div.style("display","flex");
    div.style("flex-direction","column");
    div.style("justify-content","space-between");
    div.style("align-items","center");
    div.style("font-family", "Arial, Helvetica, sans-serif");
    div.style("font-size", "32");
    div.style("text-align", "center");
    div.position(windowWidth/2-w/2,windowHeight/2-h/2);
    let buttons = createElement("div");
    buttons.style("display","flex");
    buttons.style("justify-content","space-between");
    buttons.style("width","80%");
    let ok = createElement("button", "Ok");
    ok.elt.addEventListener("click", (e) => { div.elt.remove(); okCallback(); });
    ok.style("width",w/5);
    buttons.elt.appendChild(ok.elt);
    let cancel = createElement("button", "Cancel");
    cancel.elt.addEventListener("click", (e) => { div.elt.remove(); cancelCallback(); });
    cancel.style("width",w/5);
    buttons.elt.appendChild(cancel.elt);
    div.elt.appendChild(buttons.elt);
}

/**
 * Custom alert() generator
 * @param {string} txt text message
 * @param {Function} callback ok button callback function
 */
function customAlert(txt, callback=()=>{}) {
    let div = createElement("div",`<div>${txt}</div>`);
    let w = windowWidth/8;
    let h = windowHeight/8;
    div.id("prompt");
    div.style("width",`${w}px`);
    div.style("height",`${h}px`);
    div.style("background","#696969");
    div.style("color","white");
    div.style("padding","20px");
    div.style("border-radius","20px");
    div.style("border","3px black solid");
    div.style("display","flex");
    div.style("flex-direction","column");
    div.style("justify-content","space-between");
    div.style("align-items","center");
    div.style("font-family", "Arial, Helvetica, sans-serif");
    div.style("font-size", "32");
    div.style("text-align", "center");
    div.position(windowWidth/2-w/2,windowHeight/2-h/2);
    let ok = createElement("button", "Ok");
    ok.elt.addEventListener("click", (e) => { div.elt.remove(); callback(); });
    ok.style("width",w/5);
    div.elt.appendChild(ok.elt);
}