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
            if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
                // Draw shadow marks on each video
                noFill();
                this.model.shadowMarks.forEach(mark => {
                    const colour = mark.colour;
                    stroke(0);
                    strokeWeight(2);
                    const markerX = video.x + video.width * mark.widthRatio;
                    const markerY = video.y + video.height * mark.heightRatio;
                    let maxLength = 16;
                    let markLength = Math.min(video.width, video.height) / 20;
                    if (mark.shape === SHAPES.CROSSHAIR) {
                        maxLength = 16;
                        markLength = Math.min(video.width, video.height) / 16;
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
                    fill(colour.r, colour.g, colour.b, 150);
                    stroke(colour.r, colour.g, colour.b, 150);
                    // strokeWeight(2);
                    strokeWeight(1);
                    const widthRatio = (mouseX-this.model.hoverTarget.x)/this.model.hoverTarget.width;
                    const heightRatio = (mouseY-this.model.hoverTarget.y)/this.model.hoverTarget.height;
                    const x = video.x + video.width * widthRatio;
                    const y = video.y + video.height * heightRatio;
                    // circle(x,y,5);
                    line(x, video.y, x, video.y + video.height);
                    line(video.x, y, video.x + video.width, y);
                }

                if (this.model.gridActive) {
                    let squareSize, numRows = 3, numCols = 3;
                    if (video.width > video.height) {
                        squareSize = Math.floor(video.height / 3);
                        numCols = Math.ceil(video.width/squareSize);
                    } else {
                        squareSize = Math.floor(video.width / 3);
                        numRows = Math.ceil(video.height/squareSize)
                    }
                    fill(200,200,200,125);
                    stroke(200,200,200,125);
                    strokeWeight(1);
                    // Draw row lines
                    for (let i = 1; i < numRows; i++) line(video.x, video.y + squareSize*i, video.x + video.width, video.y + squareSize*i);
                    // Draw column lines
                    for (let j = 1; j < numCols; j++) line(video.x + squareSize*j, video.y, video.x + squareSize*j, video.y + video.height);
                    // Draw highlight, if any
                    if (this.model.gridHighlight >= 0) {
                        noFill();
                        stroke(colour.r, colour.g, colour.b, 150);
                        strokeWeight(2);
                        let squareX = video.x + squareSize * (this.model.gridHighlight % numCols);
                        let squareY = video.y + squareSize * Math.floor(this.model.gridHighlight / numCols);
                        if (squareX + squareSize > video.x + video.width || squareY + squareSize > video.y + video.height) {
                            let squareW = squareSize, squareH = squareSize;
                            if (squareX + squareW > video.x + video.width) squareW -= (squareX + squareW - video.x - video.width);
                            if (squareY + squareH > video.y + video.height) squareH -= (squareY + squareH - video.y - video.height);
                            rect(squareX, squareY, squareW, squareH);
                        } else {
                            square(squareX, squareY, squareSize);
                        }
                    }
                }
            }

            stroke(0);
            strokeWeight(1);
            fill(255);
            textSize(16);
            text(video.name, x+5, y+20);

            noFill();
            stroke(0);
            rect(x, y, video.width, video.height);
            if (this.model.selectedVideo === video) {
                strokeWeight(2);
                if (video.name === blockDatasets[this.model.blockNum].correct) {
                    stroke(0,255,0);
                } else {
                    stroke(255,0,0);
                }
                rect(x+1,y+1,video.width-2,video.height-2);
            }
        });

        // Draw overlay items, if any
        if (this.model.videos.length > 0 && this.model.interaction === INTERACTIONS.OVERLAYS) {
            let ow = this.model.videos[0].width;
            let oh = this.model.videos[0].height;
            let ox = width - ow - 1;
            let oy = scrollY;
            if (this.model.overlay.length > 0) {
                this.model.overlay.forEach((video, index) => {
                    tint(255, Math.floor(255 * 1/(index+1)))
                    image(video.images[this.model.index], ox, oy, ow, oh);
                });
                noFill();
                stroke(0);
                rect(ox, oy, ow, oh);
                noTint();
            } else {
                stroke(101,101,101);
                fill(200,200,200);
                rect(ox, oy, ow, oh);
                noStroke();
                fill(0);
                textSize(24);
                text("No videos selected.", ox + ow/2 - textWidth("No videos selected.")/2, oy + oh/2);
                text("Right click video to select.", ox + ow/2 - textWidth("Right click video to select.")/2, oy + oh/2 + 24);
            }
        }

        strokeWeight(1);
        this.drawScrollbar();
        this.drawHelpButton();
        if (this.model.helpMenuOpen) this.drawHelpMenu();
        if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
            this.drawMarkModeButton();
            this.drawColourButton();
            if (this.model.shapeMenuOpen) this.drawShapeMenu();
            if (this.model.colourMenuOpen) this.drawColourMenu();
        }
    } else {
        let txt = this.model.percentLoaded + "%";
        fill(0);
        stroke(0);
        textSize(24);
        text(txt, width/2-textWidth(txt)/2, windowHeight/2+scrollY+12);
        noFill();
        rect(width/2-100, windowHeight/2+scrollY+50, 200, 25);
        fill(50, 205, 50);
        noStroke();
        rect(width/2-100, windowHeight/2+scrollY+50, 200*this.model.percentLoaded/100, 25)
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

View.prototype.drawHelpButton = function () {
    stroke(0,0,0,this.model.helpButtonHighlighted ? 255 : 100);
    fill(101, 101, 101, this.model.helpButtonHighlighted ? 255 : 100);
    const x = this.model.getScrollbarX();
    const y = windowHeight + scrollY - 20;
    const w = 50;
    const h = 25;
    rect(x, y, w, h, 10);
    noStroke();
    fill(255,255,255,this.model.helpButtonHighlighted ? 255 : 100);
    textSize(12);
    text("Help", x + (w/2) - textWidth("help")/2, y + (h/2));
}

View.prototype.drawHelpMenu = function () {
    stroke(0);
    fill(101);
    let helpPoints = [
        "SYSTEM UTILITIES",
        "- Drag the scrollbar to play through all videos at once, or press spacebar to auto-play.",
        "- Press 'CTRL+C' to toggle shadow cursor mode.",
        "- Press 'CTRL+G' to toggle shadow grid mode.",
        "- Zoom in/out with 'CTRL+plus' and 'CTRL+minus'.",
        "- The buttons to the right of the scrollbar control mark type and colour.",
        "- Hold 'CTRL' and click on a video if you think it is correct.",
        "- On selection, a video will either flash red for wrong or green for correct.",
        "----------------------------------------------------------------------------------------------------------------------"
    ];
    if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
        switch (this.model.shadowMarkShape) {
            case SHAPES.FREEFORM:
                helpPoints.push("FREEFORM SHADOW MARK");
                helpPoints.push("- Click and drag on a video to draw a freeform shadow mark.");
                helpPoints.push("- Press 'SHIFT' while dragging to make a straight line.");
                break;
            default:
                helpPoints.push("SHADOW MARK")
                helpPoints.push("- Click on a video to place a shadow mark.")
                break;
        }
        helpPoints.push("- Undo last shadow mark you placed with 'CTRL+Z'");
    }
    textSize(36);
    const w = Math.max(...helpPoints.map(point => textWidth(point) + 20));
    const h = helpPoints.reduce((prev, curr) => prev + 42, 0) + 12;
    const x = width/2-w/2;
    const y = windowHeight/2+scrollY-h/2;
    rect(x, y, w, h, 10);
    noStroke();
    fill(255);
    let textX = x + 10;
    let textY = y + 42;
    helpPoints.forEach(point => {
        text(point, textX, textY);
        textY += 42;
    });
}

View.prototype.modelChanged = function () {
    this.draw();
}