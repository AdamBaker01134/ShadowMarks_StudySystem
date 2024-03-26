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
            this.model.shadowMarks.forEach(mark => {
                const colour = mark.colour;
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
            const colour = this.model.shadowMarkColour;
            stroke(colour.r, colour.g, colour.b);
            strokeWeight(2);
            for (let i = 0; i < this.model.freeformPath.length - 1; i++) {
                const x1 = video.x + video.width * this.model.freeformPath[i].widthRatio;
                const y1 = video.y + video.height * this.model.freeformPath[i].heightRatio;
                const x2 = video.x + video.width * this.model.freeformPath[i+1].widthRatio;
                const y2 = video.y + video.height * this.model.freeformPath[i+1].heightRatio;
                line(x1, y1, x2, y2);
            }

            // Draw shadow cursor
            if (this.model.shadowing && this.model.hoverTarget != null) {
                fill(colour.r, colour.g, colour.b);
                stroke(colour.r, colour.g, colour.b);
                strokeWeight(2);
                const widthRatio = (mouseX-this.model.hoverTarget.x)/this.model.hoverTarget.width;
                const heightRatio = (mouseY-this.model.hoverTarget.y)/this.model.hoverTarget.height;
                const x = video.x + video.width * widthRatio;
                const y = video.y + video.height * heightRatio;
                circle(x,y,5);
            }

            stroke(0);
            strokeWeight(1);
            fill(255);
            textSize(16);
            text(video.name, x+5, y+20);
            noFill();
            stroke(0);
            rect(x, y, video.width, video.height);
        });
        this.drawScrollbar();
        this.drawMarkModeButton();
        this.drawColourButton();
        if (this.model.shapeMenuOpen) {
            this.drawShapeMenu();
        }
        if (this.model.colourMenuOpen) {
            this.drawColourMenu();
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

View.prototype.drawScrollbar = function () {
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
        text(this.model.videos[0].labels[this.model.index], this.model.getScrollbarX() + this.model.index / this.model.getScrollbarSegments() * this.model.getScrollbarWidth() - textWidth(this.model.index.toString()) / 2, this.model.getScrollbarY() - 20);
    }
}

View.prototype.drawMarkModeButton = function () {
    stroke(0,0,0,this.model.shapeButtonHighlighted ? 255 : 100)
    fill(101, 101, 101, this.model.shapeButtonHighlighted ? 255 : 100);
    const x = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 25;
    const y = this.model.getScrollbarY() - 60;
    const length = 50;
    const centerX = x + length / 2;
    const centerY = y + length / 2;
    const centerLength = 30;
    square(x, y, length, 10);
    noFill();
    stroke(255,255,255,this.model.shapeButtonHighlighted ? 255 : 100);
    switch(this.model.shadowMarkShape) {
        case SHAPES.CROSSHAIR:
            line (centerX, centerY - centerLength / 2, centerX, centerY + centerLength / 2);
            line (centerX + centerLength / 2, centerY, centerX - centerLength / 2, centerY);
            break;
        case SHAPES.CROSS:
            line (centerX - centerLength / 2, centerY - centerLength / 2, centerX + centerLength / 2, centerY + centerLength / 2);
            line (centerX + centerLength / 2, centerY - centerLength / 2, centerX - centerLength / 2, centerY + centerLength / 2);
            break;
        case SHAPES.SQUARE:
            square(centerX - centerLength / 2, centerY - centerLength / 2, centerLength);
            break;
        case SHAPES.CIRCLE:
            ellipse(centerX, centerY, centerLength, centerLength);
            break;
        case SHAPES.FREEFORM:
            beginShape();
            curveVertex(x+10, y+10);
            curveVertex(x+15, y+15);
            curveVertex(x+10+(length-20)/2+5, y+10+(length-20)/2-5);
            curveVertex(x+10+(length-20)/2-5, y+10+(length-20)/2+5);
            curveVertex(x+10+(length-20)-5, y+10+(length-20)-5);
            curveVertex(x+10+(length-20), y+10+(length-20));
            endShape();
            break;
    }
}

View.prototype.drawShapeMenu = function () {
    stroke(0);
    fill(101);
    const width = 30 * 3 + 20;
    const height = 30 * 2 + 20;
    let x = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 25 + 50 - width;
    let y = this.model.getScrollbarY() - 60 + 50 - height;
    rect(x, y, width, height, 10);
    noFill();
    
    stroke(0);
    square(x+10,y+10,30);
    square(x+40,y+10,30);
    square(x+70,y+10,30);
    square(x+25,y+40,30);
    square(x+55,y+40,30);

    stroke(255);
    // Crosshair
    let centerX = x+25;
    let centerY = y+25;
    let centerLength = 20;
    line (centerX, centerY - centerLength / 2, centerX, centerY + centerLength / 2);
    line (centerX + centerLength / 2, centerY, centerX - centerLength / 2, centerY);
    // Cross
    centerX += 30;
    line (centerX - centerLength / 2, centerY - centerLength / 2, centerX + centerLength / 2, centerY + centerLength / 2);
    line (centerX + centerLength / 2, centerY - centerLength / 2, centerX - centerLength / 2, centerY + centerLength / 2);
    // Square
    centerX += 30;
    square(centerX - centerLength / 2, centerY - centerLength / 2, centerLength);
    // Circle
    centerX = x+40;
    centerY += 30;
    ellipse(centerX, centerY, centerLength, centerLength);
    // Freeform
    x += 60;
    y += 45;
    beginShape();
    curveVertex(x, y);
    curveVertex(x+3, y+3);
    curveVertex(x+13, y+7);
    curveVertex(x+7, y+13);
    curveVertex(x+17, y+17);
    curveVertex(x+20, y+20);
    endShape();
}

View.prototype.drawColourButton = function () {
    stroke(0,0,0,this.model.colourButtonHighlighted ? 255 : 100)
    fill(101, 101, 101, this.model.colourButtonHighlighted ? 255 : 100);
    const x = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 25;
    const y = this.model.getScrollbarY();
    const length = 50;
    square(x, y, length, 10);
    noStroke();
    const colour = this.model.shadowMarkColour;
    fill(colour.r, colour.g, colour.b, this.model.colourButtonHighlighted ? 255 : 100);
    square(x+10,y+10,30);
}

View.prototype.drawColourMenu = function () {
    stroke(0);
    fill(101);
    const width = 30 * 4 + 20;
    const height = 30 * 2 + 20;
    const x = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 25 + 50 - width;
    const y = this.model.getScrollbarY() + 50 - height;
    rect(x, y, width, height, 10);
    noStroke();
    fill(COLOURS.BLACK.r, COLOURS.BLACK.g, COLOURS.BLACK.b);
    square(x+10,y+10,30);
    fill(COLOURS.WHITE.r, COLOURS.WHITE.g, COLOURS.WHITE.b);
    square(x+40,y+10,30);
    fill(COLOURS.RED.r, COLOURS.RED.g, COLOURS.RED.b);
    square(x+70,y+10,30);
    fill(COLOURS.GREEN.r, COLOURS.GREEN.g, COLOURS.GREEN.b);
    square(x+100,y+10,30);
    fill(COLOURS.BLUE.r, COLOURS.BLUE.g, COLOURS.BLUE.b);
    square(x+10,y+40,30);
    fill(COLOURS.YELLOW.r, COLOURS.YELLOW.g, COLOURS.YELLOW.b);
    square(x+40,y+40,30);
    fill(COLOURS.CYAN.r, COLOURS.CYAN.g, COLOURS.CYAN.b);
    square(x+70,y+40,30);
    fill(COLOURS.MAGENTA.r, COLOURS.MAGENTA.g, COLOURS.MAGENTA.b);
    square(x+100,y+40,30);
}

View.prototype.modelChanged = function () {
    this.draw();
}