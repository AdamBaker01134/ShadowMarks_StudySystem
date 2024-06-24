/*
 * Main file for creating and connecting MVC components.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

let model, view, controller;

async function preload() {
    model = new Model();
    view = new View(model);
    controller = new Controller(model);

    switch (task) {
        case 1:
        case 2:
        case 3:
    }
}

function setup() {
    createCanvas(windowWidth*0.98, windowHeight*3);

    attachUserEventListeners();
    model.addSubscriber(view);

    noLoop();
}

function draw() {}

function mouseMoved(event) { controller.handleMouseMoved(event) }

function mouseDragged(event) { controller.handleMouseDragged(event) }

function mousePressed(event) { controller.handleMousePressed(event) }

function mouseReleased(event) { controller.handleMouseReleased(event) }

function keyPressed(event) { controller.handleKeyPressed(event) }

function keyReleased(event) { controller.handleKeyReleased(event) }

function attachUserEventListeners() {
    document.addEventListener("scroll", e => controller.handleScroll());
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