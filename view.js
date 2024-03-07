/* Application View */
"use strict";

function View(model) {
    this.model = model;
}

View.prototype.draw = function () {
    clear();
    if (this.model.percentLoaded === 100) {
        let x = 0;
        let y = 0;
        this.model.videos.forEach(video => {
            image(video.images[video.index], x, y, video.width, video.height);
            x += video.width;
            if (x + video.width > width) {
                x = 0;
                y += video.height;
            }
        });
    } else {
        let txt = this.model.percentLoaded + "%";
        fill(0);
        stroke(0);
        textSize(24);
        text(txt, width/2-textWidth(txt)/2, height/2+12);
        noFill();
        rect(width/2-100, height/2+50, 200, 25);
        fill(50, 205, 50);
        noStroke();
        rect(width/2-100, height/2+50, 200*this.model.percentLoaded/100, 25)
    }
}

View.prototype.modelChanged = function () {
    this.draw();
}