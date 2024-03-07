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

    const path = window.location.pathname;
    const page = path.split("/").pop();
    switch(page) {
        case "northpole":
            await controller.handleLoadNorthpole();
            break;
        case "southpole":
            await controller.handleLoadSouthpole();
            break;
        default:
            break;
    }
}

function setup() {
    createCanvas(windowWidth * 0.9,windowHeight*0.9);

    model.addSubscriber(view);

    noLoop();
}

function draw() {}

function mousePressed(event) { controller.handleMousePressed(event) }