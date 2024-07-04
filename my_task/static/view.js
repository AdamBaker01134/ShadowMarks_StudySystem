/* Application View */
"use strict";

function View(model) {
    this.model = model;
}

View.prototype.draw = function () {
    clear();
    if (tutorial) {
        this.drawTutorials();
    } else if (this.model.percentLoaded === 100) {
        // Draw videos from the model
        this.model.videos.forEach(video => {
            const x = video.x;
            const y = video.y;
            image(video.images[this.model.index], x, y, video.width, video.height);
            if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
                this.drawShadowMarkers(video.x, video.y, video.width, video.height);
            }

            stroke(0);
            strokeWeight(1);
            fill(255);
            textSize(16);
            text(video.name, x + 5, y + 20);

            noFill();
            if (this.model.selectedVideos.includes(video)) {
                stroke(255,255,0);
                strokeWeight(4);
                rect(x, y, video.width, video.height);
            }
            stroke(0);
            strokeWeight(1);
            rect(x, y, video.width, video.height);
            let highlightedMarker = this.model.highlightedMarker;
            if (highlightedMarker && highlightedMarker.video === video) {
                strokeWeight(5);
                stroke(highlightedMarker.colour.r, highlightedMarker.colour.g, highlightedMarker.colour.b, 125);
                rect(x + 1, y + 1, video.width - 2, video.height - 2);
            }
        });

        // Draw example image 
        if (this.model.videos.length > 0 && this.model.task === 1 && this.model.exampleImage !== null) {
            let iw = this.model.videos[0].width;
            let ih = this.model.videos[0].height;
            let ix = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - iw;
            let iy = scrollY;
            image(this.model.exampleImage, ix, iy, iw, ih);
            if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) this.drawShadowMarkers(ix, iy, iw, ih);
            noFill();
            strokeWeight(1);
            stroke(0);
            rect(ix, iy, iw, ih);
            let highlightedMarker = this.model.highlightedMarker;
            if (highlightedMarker && highlightedMarker.video === "OVERLAY") {
                strokeWeight(5);
                stroke(highlightedMarker.colour.r, highlightedMarker.colour.g, highlightedMarker.colour.b, 125);
                rect(ix + 1, iy + 1, iw - 2, ih - 2);
            }
            strokeWeight(1);
            stroke(0);
            fill(255);
            textSize(16);
            text("Example Image", ix + 5, iy + 20);
        }

        // Draw overlay items, if any
        if (this.model.videos.length > 0 && this.model.interaction === INTERACTIONS.OVERLAYS) {
            let ow = this.model.videos[0].width;
            let oh = this.model.videos[0].height;
            let ox = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - ow;
            let oy = scrollY;
            if (this.model.overlay.length > 0) {
                this.model.overlay.forEach((video, index) => {
                    if (this.model.videos.length > 0 && this.model.task === 1 && this.model.exampleImage !== null) {
                        tint(255, Math.floor(255 * 1 / (index + 2)))
                    } else {
                        tint(255, Math.floor(255 * 1 / (index + 1)))
                    }
                    image(video.images[this.model.index], ox, oy, ow, oh);
                });
                noTint();
                noFill();
                stroke(0);
                rect(ox, oy, ow, oh);
            } else {
                noFill();
                stroke(0);
                rect(ox, oy, ow, oh);
                noStroke();
                fill(0);
                textSize(24);
                text("No videos in overlay.", ox + ow / 2 - textWidth("No videos in overlay.") / 2, oy + oh + 24);
                text("Right click video to add.", ox + ow / 2 - textWidth("Right click video to add.") / 2, oy + oh + 48);
            }
        }
        this.drawInstructions();

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
        text(txt, width / 2 - textWidth(txt) / 2, windowHeight / 2 + scrollY + 12);
        noFill();
        rect(width / 2 - 100, windowHeight / 2 + scrollY + 50, 200, 25);
        fill(50, 205, 50);
        noStroke();
        rect(width / 2 - 100, windowHeight / 2 + scrollY + 50, 200 * this.model.percentLoaded / 100, 25)
    }
}

View.prototype.drawTutorials = function () {
    this.model.videos.forEach((video, index) => {
        stroke(0);
        strokeWeight(1);
        fill(121, 121, 121);
        rect(video.x, video.y, video.width, video.height);
        // Moving circle
        fill(255, 0, 0);
        circle(video.x + 55 + (this.model.index / 360) * (video.width - 110), video.y + video.height * (index + 1) / 3 - 70, 100);
        // Scaling square
        stroke(0);
        strokeWeight(1);
        fill(0, 0, 255);
        square(video.x + video.width * (index + 1) / 6, video.y + 100, 20 + 150 * (this.model.index / 360));
        // Spinning line
        stroke(0, 255, 0);
        strokeWeight(3);
        angleMode(DEGREES);
        let p1 = [0, 0];
        let p2 = [90 * cos(this.model.index), 90 * sin(this.model.index)];
        line(video.x + p1[0] + 100, video.y + p1[1] + video.height * (index + 1) / 4, video.x + p2[0] + 100, video.y + p2[1] + video.height * (index + 1) / 4);
        if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
            this.drawShadowMarkers(video.x, video.y, video.width, video.height);
        }
        noFill();
        if (this.model.selectedVideos.includes(video)) {
            stroke(255,255,0);
            strokeWeight(4);
            rect(video.x, video.y, video.width, video.height);
        }
        stroke(0);
        strokeWeight(1);
        rect(video.x, video.y, video.width, video.height);
        let highlightedMarker = this.model.highlightedMarker;
        if (highlightedMarker && highlightedMarker.video === video) {
            strokeWeight(5);
            stroke(highlightedMarker.colour.r, highlightedMarker.colour.g, highlightedMarker.colour.b, 125);
            rect(video.x + 1, video.y + 1, video.width - 2, video.height - 2);
        }
        if (this.model.videos.length > 0 && this.model.interaction === INTERACTIONS.OVERLAYS && this.model.overlay.includes(video)) {
            let ow = this.model.videos[0].width;
            let oh = this.model.videos[0].height;
            let ox = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - ow;
            let oy = scrollY;
            stroke(0, 0, 0, 255 / (index + 1));
            strokeWeight(1);
            fill(121, 121, 121, 255 / (index + 1));
            rect(ox, oy, ow, oh);
            // Moving circle
            fill(255, 0, 0, 255 / (index + 1));
            circle(ox + 55 + (this.model.index / 360) * (ow - 110), oy + oh * (index + 1) / 3 - 70, 100);
            // Scaling square
            stroke(0, 0, 0, 255 / (index + 1));
            strokeWeight(1);
            fill(0, 0, 255, 255 / (index + 1));
            square(ox + ow * (index + 1) / 6, oy + 100, 20 + 150 * (this.model.index / 360));
            // Spinning line
            stroke(0, 255, 0, 255 / (index + 1));
            strokeWeight(3);
            angleMode(DEGREES);
            let p1 = [0, 0];
            let p2 = [90 * cos(this.model.index), 90 * sin(this.model.index)];
            line(ox + p1[0] + 100, oy + p1[1] + oh * (index + 1) / 4, ox + p2[0] + 100, oy + p2[1] + oh * (index + 1) / 4);
            noFill();
            stroke(0);
            strokeWeight(1);
            rect(ox, oy, ow, oh);
        }
    });

    if (this.model.videos.length > 0 && this.model.interaction === INTERACTIONS.OVERLAYS && this.model.overlay.length === 0) {
        let ow = this.model.videos[0].width;
        let oh = this.model.videos[0].height;
        let ox = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - ow;
        let oy = scrollY;
        noFill();
        stroke(0);
        rect(ox, oy, ow, oh);
        noStroke();
        fill(0);
        textSize(24);
        text("No videos in overlay.", ox + ow / 2 - textWidth("No videos in overlay.") / 2, oy + oh + 24);
        text("Right click video to add.", ox + ow / 2 - textWidth("Right click video to add.") / 2, oy + oh + 48);
    }

    stroke(0);
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
    stroke(0);
    strokeWeight(1);
    fill(0);
    textSize(24);
    let prompt = this.model.currentChecklistPrompt >= this.model.tutorialChecklist.length ? `! You've completed the tutorial. Press ENTER to begin tasks.` : this.model.tutorialChecklist[this.model.currentChecklistPrompt];
    let promptX = this.model.getScrollbarX() + this.model.getScrollbarWidth() / 2 - textWidth(prompt) / 2;
    let promptY = this.model.getScrollbarY() - 50;
    fill(255);
    rect(promptX-20, promptY-40, textWidth(prompt)+40, 64, 20);
    fill(0);
    text(prompt, promptX, promptY);
}

View.prototype.drawInstructions = function () {
    if (this.model.videos.length > 0) {
        let w = this.model.videos[0].width;
        let h = this.model.videos[0].height;
        let x = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - w;
        let y = scrollY + h + 120;

        let iX = x-10;
        let iY = y-30;
        let instructions = [];
        switch (this.model.task) {
            case 1:
                if (this.model.getCurrentDataset() === "lemnatec") {
                    instructions.push(`Select any videos where the ${this.model.category.name} plant gets larger`);
                    instructions.push(`than the plant in the example image.`);
                } else {
                    if (this.model.category.name === "northpole") {
                        instructions.push(`Select any videos where the area of ice gets`);
                        instructions.push(`smaller than in the example image.`);
                    } else {
                        instructions.push(`Select any videos where the area of ice gets`);
                        instructions.push(`larger than in the example image.`);
                    }
                }
                break;
            case 2:
                if (this.model.getCurrentDataset() === "lemnatec") {
                    instructions.push("Select the plant that grows the largest.");
                } else {
                    instructions.push("Select the pitch that moves the farthest horizontally.");
                }
                break;
            case 3:
            default:
                instructions.push("Select the plant that grows the most during")
                instructions.push("their flowering cycle.");
                break;
        }

        let size = 24;
        noStroke();
        strokeWeight(1);
        textSize(size);
        while (x + textWidth(instructions[0]) > windowWidth*0.98) {
            size--;
            textSize(size);
        }
        fill(0);
        instructions.forEach(instruction => {
            text(instruction, x+w/2-textWidth(instruction)/2-10,y);
            y+=(size+10);
        });
        let iW = textWidth(instructions[0]+20);
        let iH = y-iY-size+10;
        stroke(0);
        noFill();
        rect(iX+w/2-iW/2,iY,iW,iH,10);

        if (this.model.task === 1 || this.model.selectedVideos.length > 0) {
            let submitPrompt = "Press ENTER to submit.";
            y += size + 10;
            fill(0)
            noStroke();
            text(submitPrompt,x+w/2-textWidth(submitPrompt)/2,y)
        }
    }
}

View.prototype.drawShadowMarkers = function (vx, vy, vw, vh) {
    noFill();
    // Draw shadow marks on each video
    this.model.shadowMarks.forEach(mark => {
        const colour = mark.colour;
        stroke(0);
        strokeWeight(2);
        const markerX = vx + vw * mark.widthRatio;
        const markerY = vy + vh * mark.heightRatio;
        let maxLength = 16;
        let markLength = Math.min(vw, vh) / 20;
        if (mark.shape === SHAPES.CROSSHAIR) {
            maxLength = 16;
            markLength = Math.min(vw, vh) / 16;
        }
        if (markLength > maxLength) markLength = maxLength;
        switch (mark.shape) {
            case SHAPES.CROSSHAIR:
                line(markerX, markerY - markLength / 2, markerX, markerY + markLength / 2);
                line(markerX + markLength / 2, markerY, markerX - markLength / 2, markerY);
                stroke(colour.r, colour.g, colour.b);
                strokeWeight(1);
                line(markerX, markerY - markLength / 2, markerX, markerY + markLength / 2);
                line(markerX + markLength / 2, markerY, markerX - markLength / 2, markerY);
                break;
            case SHAPES.CROSS:
                line(markerX - markLength / 2, markerY - markLength / 2, markerX + markLength / 2, markerY + markLength / 2);
                line(markerX + markLength / 2, markerY - markLength / 2, markerX - markLength / 2, markerY + markLength / 2);
                stroke(colour.r, colour.g, colour.b);
                strokeWeight(1);
                line(markerX - markLength / 2, markerY - markLength / 2, markerX + markLength / 2, markerY + markLength / 2);
                line(markerX + markLength / 2, markerY - markLength / 2, markerX - markLength / 2, markerY + markLength / 2);
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
                    const x1 = vx + vw * mark.path[i].widthRatio;
                    const y1 = vy + vh * mark.path[i].heightRatio;
                    const x2 = vx + vw * mark.path[i + 1].widthRatio;
                    const y2 = vy + vh * mark.path[i + 1].heightRatio;
                    line(x1, y1, x2, y2);
                }
                break;
            default:
                break;
        }
    });

    // For pixel counting
    // if (this.model.shadowMarks.length === 2) {
    //     let marks = [this.model.shadowMarks[0], this.model.shadowMarks[1]];
    //     stroke(0);
    //     fill(0);
    //     strokeWeight(1);
    //     // text(`${Math.abs(marks[0].widthRatio - marks[1].widthRatio).toFixed(4)}px`, vx + vw * marks[0].widthRatio, vy + vh * marks[0].heightRatio);
    //     text(`${Math.abs(marks[0].heightRatio - marks[1].heightRatio).toFixed(4)}px`, vx + vw * marks[0].widthRatio, vy + vh * marks[0].heightRatio);
    //     text(`${(1 - marks[0].heightRatio).toFixed(4)}px`, vx + vw * marks[0].widthRatio, vy + vh * marks[0].heightRatio);

    // } else if (this.model.shadowMarks.length === 4) {
    //     let marks = [this.model.shadowMarks[0], this.model.shadowMarks[1], this.model.shadowMarks[2], this.model.shadowMarks[3]];
    //     let a = Math.abs(marks[0].heightRatio - marks[1].heightRatio)/2;
    //     let b = Math.abs(marks[2].widthRatio - marks[3].widthRatio)/2;
    //     stroke(0);
    //     fill(0);
    //     strokeWeight(1);
    //     text(`${(PI*a*b).toFixed(4)}px`, vx + vw * marks[0].widthRatio, vy + vh * marks[0].heightRatio);
    // }

    // Draw current freeform path
    const colour = this.model.shadowMarkColour;
    stroke(colour.r, colour.g, colour.b);
    strokeWeight(2);
    for (let i = 0; i < this.model.freeformPath.length - 1; i++) {
        const x1 = vx + vw * this.model.freeformPath[i].widthRatio;
        const y1 = vy + vh * this.model.freeformPath[i].heightRatio;
        const x2 = vx + vw * this.model.freeformPath[i + 1].widthRatio;
        const y2 = vy + vh * this.model.freeformPath[i + 1].heightRatio;
        line(x1, y1, x2, y2);
    }

    // Draw shadow cursor
    if (this.model.shadowing && this.model.hoverTarget != null) {
        fill(colour.r, colour.g, colour.b, 150);
        stroke(colour.r, colour.g, colour.b, 150);
        // strokeWeight(2);
        strokeWeight(1);
        let widthRatio, heightRatio, x, y;
        if (this.model.hoverTarget === "OVERLAY") {
            let ow = this.model.videos[0].width;
            let oh = this.model.videos[0].height;
            let ox = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 75 - ow;
            let oy = scrollY;
            widthRatio = (mouseX - ox) / ow;
            heightRatio = (mouseY - oy) / oh;
            x = vx + vw * widthRatio;
            y = vy + vh * heightRatio;
        } else {
            widthRatio = (mouseX - this.model.hoverTarget.x) / this.model.hoverTarget.width;
            heightRatio = (mouseY - this.model.hoverTarget.y) / this.model.hoverTarget.height;
            x = vx + vw * widthRatio;
            y = vy + vh * heightRatio;
        }
        // circle(x,y,5);
        line(x, vy, x, vy + vh);
        line(vx, y, vx + vw, y);
    }

    if (this.model.gridActive) {
        let squareSize, numRows = 3, numCols = 3;
        if (vw > vh) {
            squareSize = Math.floor(vh / 3);
            numCols = Math.ceil(vw / squareSize);
        } else {
            squareSize = Math.floor(vw / 3);
            numRows = Math.ceil(vh / squareSize)
        }
        fill(200, 200, 200, 125);
        stroke(200, 200, 200, 125);
        strokeWeight(1);
        // Draw row lines
        for (let i = 1; i < numRows; i++) line(vx, vy + squareSize * i, vx + vw, vy + squareSize * i);
        // Draw column lines
        for (let j = 1; j < numCols; j++) line(vx + squareSize * j, vy, vx + squareSize * j, vy + vh);
        // Draw highlight, if any
        if (this.model.gridHighlight >= 0) {
            noFill();
            stroke(colour.r, colour.g, colour.b, 150);
            strokeWeight(2);
            let squareX = vx + squareSize * (this.model.gridHighlight % numCols);
            let squareY = vy + squareSize * Math.floor(this.model.gridHighlight / numCols);
            if (squareX + squareSize > vx + vw || squareY + squareSize > vy + vh) {
                let squareW = squareSize, squareH = squareSize;
                if (squareX + squareW > vx + vw) squareW -= (squareX + squareW - vx - vw);
                if (squareY + squareH > vy + vh) squareH -= (squareY + squareH - vy - vh);
                rect(squareX, squareY, squareW, squareH);
            } else {
                square(squareX, squareY, squareSize);
            }
        }
    }
}

View.prototype.drawScrollbar = function () {
    // Draw model scrollbar
    stroke(0, 0, 0, this.model.scrollbarHighlighted ? 255 : 100)
    fill(101, 101, 101, this.model.scrollbarHighlighted ? 255 : 100);
    rect(this.model.getScrollbarX(), this.model.getScrollbarY(), this.model.getScrollbarWidth(), this.model.getScrollbarHeight(), 20);
    fill(151, 151, 151, this.model.scrollbarHighlighted ? 255 : 100);
    circle(this.model.getScrollbarX() + this.model.index / this.model.getScrollbarSegments() * this.model.getScrollbarWidth(), this.model.getScrollbarY() + this.model.getScrollbarHeight() / 2, 30);
    if (this.model.scrollbarHighlighted) {
        stroke(0);
        fill(0);
        textSize(16);
        text(this.model.videos[0].labels[this.model.index], this.model.getScrollbarX() + this.model.index / this.model.getScrollbarSegments() * this.model.getScrollbarWidth() - textWidth(this.model.videos[0].labels[this.model.index]) / 2, this.model.getScrollbarY() - 20);
    }
}

View.prototype.drawMarkModeButton = function () {
    stroke(0, 0, 0, this.model.shapeButtonHighlighted ? 255 : 100)
    fill(101, 101, 101, this.model.shapeButtonHighlighted ? 255 : 100);
    const x = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 25;
    const y = this.model.getScrollbarY() - 60;
    const length = 50;
    const centerX = x + length / 2;
    const centerY = y + length / 2;
    const centerLength = 30;
    square(x, y, length, 10);
    noFill();
    stroke(255, 255, 255, this.model.shapeButtonHighlighted ? 255 : 100);
    switch (this.model.shadowMarkShape) {
        case SHAPES.CROSSHAIR:
            line(centerX, centerY - centerLength / 2, centerX, centerY + centerLength / 2);
            line(centerX + centerLength / 2, centerY, centerX - centerLength / 2, centerY);
            break;
        case SHAPES.CROSS:
            line(centerX - centerLength / 2, centerY - centerLength / 2, centerX + centerLength / 2, centerY + centerLength / 2);
            line(centerX + centerLength / 2, centerY - centerLength / 2, centerX - centerLength / 2, centerY + centerLength / 2);
            break;
        case SHAPES.SQUARE:
            square(centerX - centerLength / 2, centerY - centerLength / 2, centerLength);
            break;
        case SHAPES.CIRCLE:
            ellipse(centerX, centerY, centerLength, centerLength);
            break;
        case SHAPES.FREEFORM:
            if (this.model.freeformStraight) {
                line(x + 10, y + 10, x + 10 + (length - 20), y + 10 + (length - 20))
            } else {
                beginShape();
                curveVertex(x + 10, y + 10);
                curveVertex(x + 15, y + 15);
                curveVertex(x + 10 + (length - 20) / 2 + 5, y + 10 + (length - 20) / 2 - 5);
                curveVertex(x + 10 + (length - 20) / 2 - 5, y + 10 + (length - 20) / 2 + 5);
                curveVertex(x + 10 + (length - 20) - 5, y + 10 + (length - 20) - 5);
                curveVertex(x + 10 + (length - 20), y + 10 + (length - 20));
                endShape();
            }
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
    square(x + 10, y + 10, 30);
    square(x + 40, y + 10, 30);
    square(x + 70, y + 10, 30);
    square(x + 25, y + 40, 30);
    square(x + 55, y + 40, 30);

    stroke(255);
    // Crosshair
    let centerX = x + 25;
    let centerY = y + 25;
    let centerLength = 20;
    line(centerX, centerY - centerLength / 2, centerX, centerY + centerLength / 2);
    line(centerX + centerLength / 2, centerY, centerX - centerLength / 2, centerY);
    // Cross
    centerX += 30;
    line(centerX - centerLength / 2, centerY - centerLength / 2, centerX + centerLength / 2, centerY + centerLength / 2);
    line(centerX + centerLength / 2, centerY - centerLength / 2, centerX - centerLength / 2, centerY + centerLength / 2);
    // Square
    centerX += 30;
    square(centerX - centerLength / 2, centerY - centerLength / 2, centerLength);
    // Circle
    centerX = x + 40;
    centerY += 30;
    ellipse(centerX, centerY, centerLength, centerLength);
    // Freeform
    x += 60;
    y += 45;
    if (this.model.freeformStraight) {
        line(x, y, x + 20, y + 20);
    } else {
        beginShape();
        curveVertex(x, y);
        curveVertex(x + 3, y + 3);
        curveVertex(x + 13, y + 7);
        curveVertex(x + 7, y + 13);
        curveVertex(x + 17, y + 17);
        curveVertex(x + 20, y + 20);
        endShape();
    }
}

View.prototype.drawColourButton = function () {
    stroke(0, 0, 0, this.model.colourButtonHighlighted ? 255 : 100)
    fill(101, 101, 101, this.model.colourButtonHighlighted ? 255 : 100);
    const x = this.model.getScrollbarX() + this.model.getScrollbarWidth() + 25;
    const y = this.model.getScrollbarY();
    const length = 50;
    square(x, y, length, 10);
    noStroke();
    const colour = this.model.shadowMarkColour;
    fill(colour.r, colour.g, colour.b, this.model.colourButtonHighlighted ? 255 : 100);
    square(x + 10, y + 10, 30);
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
    square(x + 10, y + 10, 30);
    fill(COLOURS.WHITE.r, COLOURS.WHITE.g, COLOURS.WHITE.b);
    square(x + 40, y + 10, 30);
    fill(COLOURS.RED.r, COLOURS.RED.g, COLOURS.RED.b);
    square(x + 70, y + 10, 30);
    fill(COLOURS.GREEN.r, COLOURS.GREEN.g, COLOURS.GREEN.b);
    square(x + 100, y + 10, 30);
    fill(COLOURS.BLUE.r, COLOURS.BLUE.g, COLOURS.BLUE.b);
    square(x + 10, y + 40, 30);
    fill(COLOURS.YELLOW.r, COLOURS.YELLOW.g, COLOURS.YELLOW.b);
    square(x + 40, y + 40, 30);
    fill(COLOURS.CYAN.r, COLOURS.CYAN.g, COLOURS.CYAN.b);
    square(x + 70, y + 40, 30);
    fill(COLOURS.MAGENTA.r, COLOURS.MAGENTA.g, COLOURS.MAGENTA.b);
    square(x + 100, y + 40, 30);
}

View.prototype.drawHelpButton = function () {
    stroke(0, 0, 0, this.model.helpButtonHighlighted ? 255 : 100)
    fill(101, 101, 101, this.model.helpButtonHighlighted ? 255 : 100);
    const x = this.model.getScrollbarX() - 75;
    const y = this.model.getScrollbarY() - 12;
    const l = 50;
    square(x, y, l, 10);
    noFill();
    stroke(255, 255, 255, this.model.helpButtonHighlighted ? 255 : 100);
    circle(x + (l / 2), y + (l / 2), 30);
    noStroke();
    fill(255, 255, 255, this.model.helpButtonHighlighted ? 255 : 100);
    textSize(24);
    text("?", x + (l / 2) - textWidth("?") / 2, y + (l / 2) + 8);
}

View.prototype.drawHelpMenu = function () {
    stroke(0);
    fill(101);
    let generalPoints = ["GENERAL"], hotkeysPoints = ["HOTKEYS"], taskPoints = [];
    generalPoints.push("- Drag the scrollbar to play through all videos at once.");
    hotkeysPoints.push("- Auto-play ---------------------------------------------------------------------------------------------------- spacebar");
    hotkeysPoints.push("- Zoom in ----------------------------------------------------------------------------------------------------- ctrl + plus");
    hotkeysPoints.push("- Zoom out ------------------------------------------------------------------------------------------------- ctrl + minus");
    hotkeysPoints.push("- Select ------------------------------------------------------------------------------------------------------- ctrl + click")
    if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
        generalPoints.push("- Markers can be placed by clicking on a video.");
        generalPoints.push("- Marker shape and colour are controlled in the menus to the right of the scrollbar.");
        generalPoints.push("- The freeform marker (squiggly line) allows you to freely draw shapes in each video.");
        generalPoints.push("- Hovering over a shadow marker will highlight the video it originally came from.");
        hotkeysPoints.push("- Toggle straight freeform lines ------------------------------------------------------------------ shift + dragging");
        hotkeysPoints.push("- Toggle shadow cursor --------------------------------------------------------------------------------------- ctrl + c");
        hotkeysPoints.push("- Toggle shadow grid ------------------------------------------------------------------------------------------ ctrl + g");
        hotkeysPoints.push("- Delete shadow marker  --------------------------------------------------------------------------- hover + delete");
    } else if (this.model.interaction === INTERACTIONS.OVERLAYS) {
        generalPoints.push("- Right click on a video to add it to the overlay on the right.");
        generalPoints.push("- Right click on the overlay to remove the top video from the stack.");
    }
    if (tutorial) {
        taskPoints.push("- Follow the prompts displayed above the scrollbar.");
    } else {
        taskPoints.push("- Follow the instruction displayed on the right.")
    }
    let helpPoints = [
        "---------------------------------------------------------------------------------------------------- Click anywhere to exit",
        ...generalPoints,
        "----------------------------------------------------------------------------------------------------------------------------------",
        ...hotkeysPoints,
        "----------------------------------------------------------------------------------------------------------------------------------",
        ...taskPoints,
        "----------------------------------------------------------------------------------------------------------------------------------",
    ]
    textSize(36);
    const w = Math.max(...helpPoints.map(point => textWidth(point) + 20));
    const h = helpPoints.reduce((prev, curr) => prev + 42, 0) + 20;
    const x = width / 2 - w / 2;
    const y = windowHeight / 2 + scrollY - h / 2;
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