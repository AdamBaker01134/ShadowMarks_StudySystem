/* Application Controller */
"use strict";

function Controller(model) {
    this.model = model;
}

Controller.prototype.handleMousePressed = function (event) {
}

Controller.prototype.handleLoadNorthpole = async function () {
    console.log("Loading northpole dataset...");
    const firstYear = 1992, lastYear = 2022;
    const totalDays = 353;
    for (let year = firstYear; year <= lastYear; year++) {
        let video = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let day = 1; day <= totalDays; day++) {
                video.push(loadImage("img/northpole/" + year + "/" + year + "" + String(day).padStart(4, "0") + ".png",
                    () => { if (++completed >= totalDays) resolve() },
                    (err) => { if (++completed >= totalDays) reject(err) }));
            }
        });
        this.model.addVideo(video);
        this.model.setPercentLoaded(Math.floor((firstYear - year) / (firstYear - lastYear) * 100));
    }
}

Controller.prototype.handleLoadSouthpole = async function () {
    console.log("Loading southpole dataset...");
    const firstYear = 1992, lastYear = 2022;
    const totalDays = 353;
    for (let year = firstYear; year <= lastYear; year++) {
        let video = [];
        await new Promise((resolve, reject) => {
            let completed = 0;
            for (let day = 1; day <= totalDays; day++) {
                video.push(loadImage("img/southpole/" + year + "/" + year + "" + String(day).padStart(4, "0") + ".png",
                    () => { if (++completed >= totalDays) resolve() },
                    (err) => { if (++completed >= totalDays) reject(err) }));
            }
        });
        this.model.addVideo(video);
        this.model.setPercentLoaded(Math.floor((firstYear - year) / (firstYear - lastYear) * 100));
    }
}