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
            console.log("Loading northpole dataset...");
            for (let year = 1979; year <= 2022; year++) {
                let video = []
                await new Promise((resolve, reject) => {
                    let completed = 0;
                    for (let day = 1; day <= 353; day++) {
                        video.push(loadImage("img/northpole/" + year + "/" + year + "" + String(day).padStart(4, "0") + ".png",
                            () => { if (++completed >= 353) resolve() },
                            (err) => { if (++completed >= 353) reject(err) }));
                    }
                });
                model.addVideo(video);
                model.setPercentLoaded(Math.floor((1979-year)/(1979-2022)*100));
            }
            break;
        case "southpole":
            console.log("Preloading southpole dataset...");
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