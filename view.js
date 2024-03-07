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

        // Draw videos from the model
        this.model.videos.forEach(video => {
            image(video.images[this.model.index], x, y, video.width, video.height);
            noFill();
            stroke(0);
            rect(x, y, video.width, video.height);
            x += video.width;
            if (x + video.width > width) {
                x = 0;
                y += video.height;
            }
        });

        // Draw model scrollbar
        stroke(0,0,0,this.model.scrollbarHighlighted ? 255 : 100)
        fill(101, 101, 101, this.model.scrollbarHighlighted ? 255 : 100);
        rect(this.model.getScrollbarX(), this.model.getScrollbarY(), this.model.getScrollbarWidth(), this.model.getScrollbarHeight(), 20);
        fill(151, 151, 151, this.model.scrollbarHighlighted ? 255 : 100);
        circle(this.model.getScrollbarX() + this.model.index / this.model.getScrollbarSegments() * this.model.getScrollbarWidth(), this.model.getScrollbarY() + this.model.getScrollbarHeight() / 2, 30);
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