/* Application View */
"use strict";

function View(model) {
    this.model = model;
}

View.prototype.draw = function () {
    clear();
    if (this.model.percentLoaded === 100) {
        // Draw videos from the model
        this.model.videos.forEach(video => {
            const x = video.x;
            const y = video.y;
            image(video.images[this.model.index], x, y, video.width, video.height);

            // Draw shadow marks on each video
            noFill();
            const colour = this.model.shadowMarkColour;
            this.model.shadowMarks.forEach(mark => {
                stroke(0);
                strokeWeight(3);
                const markerX = video.x + video.width * mark.widthRatio;
                const markerY = video.y + video.height * mark.heightRatio;
                let maxLength = 16;
                let markLength = Math.min(video.width, video.height) / 16;
                if (mark.shape === SHAPES.CROSSHAIR) {
                    maxLength = 16;
                    markLength = Math.min(video.width, video.height) / 12;
                }
                if (markLength > maxLength) markLength = maxLength;
                switch(mark.shape) {
                    case SHAPES.CROSSHAIR:
                        line (markerX, markerY - markLength / 2, markerX, markerY + markLength / 2);
                        line (markerX + markLength / 2, markerY, markerX - markLength / 2, markerY);
                        stroke(colour.r, colour.g, colour.b);
                        strokeWeight(1);    
                        line (markerX, markerY - markLength / 2, markerX, markerY + markLength / 2);
                        line (markerX + markLength / 2, markerY, markerX - markLength / 2, markerY);    
                        break;
                    case SHAPES.CROSS:
                        line (markerX - markLength / 2, markerY - markLength / 2, markerX + markLength / 2, markerY + markLength / 2);
                        line (markerX + markLength / 2, markerY - markLength / 2, markerX - markLength / 2, markerY + markLength / 2);
                        stroke(colour.r, colour.g, colour.b);
                        strokeWeight(1);  
                        line (markerX - markLength / 2, markerY - markLength / 2, markerX + markLength / 2, markerY + markLength / 2);
                        line (markerX + markLength / 2, markerY - markLength / 2, markerX - markLength / 2, markerY + markLength / 2);
                        break;
                    case SHAPES.SQUARE:
                        square(markerX - markLength / 2, markerY - markLength / 2, markLength);
                        stroke(colour.r, colour.g, colour.b);
                        strokeWeight(1); 
                        square(markerX - markLength / 2, markerY - markLength / 2, markLength);    
                        break;
                    case SHAPES.CIRCLE:
                        ellipse(markerX, markerY, markLength, markLength);
                        stroke(colour.r, colour.g, colour.b);
                        strokeWeight(1);
                        ellipse(markerX, markerY, markLength, markLength);    
                        break;
                    case SHAPES.FREEFORM:
                        stroke(colour.r, colour.g, colour.b);
                        strokeWeight(2);
                        for (let i = 0; i < mark.path.length - 1; i++) {
                            const x1 = video.x + video.width * mark.path[i].widthRatio;
                            const y1 = video.y + video.height * mark.path[i].heightRatio;
                            const x2 = video.x + video.width * mark.path[i+1].widthRatio;
                            const y2 = video.y + video.height * mark.path[i+1].heightRatio;
                            line(x1, y1, x2, y2);
                        }
                        break;
                    default:
                        break;
                }
            });

            // Draw current freeform path
            stroke(colour.r, colour.g, colour.b);
            strokeWeight(2);
            for (let i = 0; i < this.model.freeformPath.length - 1; i++) {
                const x1 = video.x + video.width * this.model.freeformPath[i].widthRatio;
                const y1 = video.y + video.height * this.model.freeformPath[i].heightRatio;
                const x2 = video.x + video.width * this.model.freeformPath[i+1].widthRatio;
                const y2 = video.y + video.height * this.model.freeformPath[i+1].heightRatio;
                line(x1, y1, x2, y2);
            }

            stroke(0);
            fill(255);
            textSize(16);
            text(video.name, x+5, y+20);
            noFill();
            stroke(0);
            rect(x, y, video.width, video.height);
        });

        // Draw model scrollbar
        stroke(0,0,0,this.model.scrollbarHighlighted ? 255 : 100)
        fill(101, 101, 101, this.model.scrollbarHighlighted ? 255 : 100);
        rect(this.model.getScrollbarX(), this.model.getScrollbarY(), this.model.getScrollbarWidth(), this.model.getScrollbarHeight(), 20);
        fill(151, 151, 151, this.model.scrollbarHighlighted ? 255 : 100);
        circle(this.model.getScrollbarX() + this.model.index / this.model.getScrollbarSegments() * this.model.getScrollbarWidth(), this.model.getScrollbarY() + this.model.getScrollbarHeight() / 2, 30);
        if (this.model.scrollbarHighlighted) {
            stroke(0);
            fill(0);
            textSize(16);
            text(this.model.index, this.model.getScrollbarX() + this.model.index / this.model.getScrollbarSegments() * this.model.getScrollbarWidth() - textWidth(this.model.index.toString()) / 2, this.model.getScrollbarY() - 20);
        }
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