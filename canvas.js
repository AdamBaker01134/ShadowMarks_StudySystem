/*
 * Main file for creating and connecting MVC components.
 */

"use strict";

/* Turn off p5's friendly error detection system to boost performance.
   Try commenting out this line when debugging. */
p5.disableFriendlyErrors = true;

let model, view, controller;

const blockDatasets = {
    0: {
        "total": 184,
        "names": shuffleArray(["bryse_wilson","dean_kremer","domingo_german","felix_bautista","jhony_brito","spencer_strider"]),
        "correct": "felix_bautista",
    },
    1: {
        "total": 179,
        "names": shuffleArray(["cal_quantrill","chris_bassitt","duane_underwood_jr","mitch_keller","shohei_ohtani","zach_eflin"]),
        "correct": "chris_bassitt",
    },
    2: {
        "total": 180,
        "names": shuffleArray(["cal_quantrill","eli_morgan","rico_garcia","shane_bieber","tyler_wells","yennier_cano"]),
        "correct": "tyler_wells",
    },
    3: {
        "total": 191,
        "names": shuffleArray(["aaron_civale","carlose_carrasco","edward_cabrera","james_naile","miles_mikolas","paolo_espino"]),
        "correct": "aaron_civale",
    },
    4: {
        "total": 188,
        "names": shuffleArray(["dylan_cease","joe_musgrove","luis_severino","ronel_blanco","seranthony_dominguez","yunior_marte"]),
        "correct": "ronel_blanco",
    },
    5: {
        "total": 208,
        "names": shuffleArray(["griffin_jax","michael_fulmer","michael_king","shohei_ohtani","sonny_gray","yency_almonte"]),
        "correct": "griffin_jax",
    },
};

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
        case "arabidopsis":
            await controller.handleLoadArabidopsis();
            break;
        case "stocks":
            await controller.handleLoadStocks();
            break;
        default:
            await controller.handleLoadBlock();
            break;
    }
}

function setup() {
    createCanvas(1250, 610);

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