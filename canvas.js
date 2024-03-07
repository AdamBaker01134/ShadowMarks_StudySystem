/*
 * Main file for creating and connecting MVC components.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

let images = [];

function preload() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    switch(page) {
        case "northpole.html":
            console.log("Preloading northpole dataset...");
            break;
        case "southpole.html":
            console.log("Preloading southpole dataset...");
            break;
        default:
            break;
    }
}

function setup() {
    createCanvas(windowWidth * 0.9,windowHeight*0.9);

    noLoop();
}

function draw() {}