/* Application View */
"use strict";

function View(model) {
    this.model = model;
}

View.prototype.draw = function () {
    clear();
    if (this.model.percentLoaded === 100 && this.model.start) {
        // Draw divider line
        stroke(0);
        fill(0);
        line(this.model.getWorkspaceWidth(), 0, this.model.getWorkspaceWidth(), height)
        
        // Draw videos from the model
        for (let i = 0; i < this.model.videosPerTrial && i < this.model.videos.length; i++) {
            let video = this.model.videos[i];
            const x = video.x;
            const y = video.y;
            if (this.model.correctlySelectedVideos.includes(video)) tint(0,255,0);
            image(video.images[this.model.getIndex()], x, y, video.width, video.height);
            noTint();
            if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
                this.drawShadowMarkers(video.x, video.y, video.width, video.height);
            }
    
            // stroke(0);
            // strokeWeight(1);
            // fill(255);
            // textSize(16);
            // text(video.name, x + 5, y + 20);
            if (this.model.interaction === INTERACTIONS.OVERLAYS) {
                let eyeW = video.width/5;
                let eyeH = eyeW/1.3;
                let eyeX = x + video.width - eyeW/2 - 10;
                let eyeY = y + eyeH/2 + 10;
                stroke(105,105,105);
                fill(220,220,220);
                ellipse(eyeX,eyeY,eyeW,eyeH);
                let index;
                if ((index = this.model.overlay.indexOf(video)) > -1) {
                    let innerH = eyeW/2;
                    ellipse(eyeX,eyeY,eyeW,innerH);
                    circle(eyeX,eyeY,innerH);
                    noStroke();
                    fill(105,105,105);
                    textSize(innerH);
                    text(index+1,eyeX-textWidth(index+1)/2,eyeY+innerH/3);
                } else {
                    line(eyeX-eyeW/2,eyeY,eyeX+eyeW/2,eyeY);
                }
            }
    
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
        }

        // Draw overlay items, if any
        if (this.model.videos.length > 0 && this.model.interaction === INTERACTIONS.OVERLAYS) {
            let ow, oh, ox, oy;
            ({ ow, oh, ox, oy } = this.model.getOverlayDimensions());
            if (this.model.overlay.length > 0) {
                this.model.overlay.forEach((video, index) => {
                    tint(255, Math.floor(255 * 1 / (index + 1)));
                    image(video.images[this.model.getIndex()], ox, oy, ow, oh);
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
                text("Click video to add.", ox + ow / 2 - textWidth("Click video to add.") / 2, oy + oh + 48);
            }
        }
        this.drawInstructions();

        strokeWeight(1);
        this.drawHelpButton();
        if (this.model.helpMenuOpen) this.drawHelpMenu();
        if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
            this.drawMarkerButton();
            // this.drawRectButton();
            // this.drawCircleButton();
            // this.drawLineButton();
            // this.drawFreeformButton();
            this.drawCursorButton();
            this.drawColourButton();
            if (this.model.colourMenuOpen) this.drawColourMenu();
        }

        if (this.model.trial === 0) {
            stroke(0);
            strokeWeight(1);
            fill(0);
            textSize(16);
            let prompt = this.model.getTutorialChecklist()[this.model.currentChecklistPrompt];
            let promptX = this.model.getScrollbarX() - 55;
            let promptY = this.model.getScrollbarY() - 50;
            fill(255);
            rect(promptX-20, promptY-40, textWidth(prompt)+40, 64, 20);
            fill(0);
            noStroke();
            text(prompt, promptX, promptY);
        }
        strokeWeight(1);
        if (this.model.videos.length > 0 && this.model.videos[0].images.length > 1) this.drawScrollbar();
    } else {
        this.drawInstructionPage();
    }
}

View.prototype.drawInstructionPage = function () {
    let title = "";
    let description = [];
    let steps = [];
    let reminder = [];
    let begin = "Click on the circle below to begin. Please complete the task as quickly and as accurately as possible.";
    let txt = "";
    let size = 16;
    let x = width/2;
    let w = width/3;
    let y = 50;
    if (this.model.trial === 0) {
        switch (this.model.task) {
            case 1:
                title += "Tallest Plant with";
                description.push("This task has 2 comparison trials. For each trial, 9 sunflower videos will load in for you to view and compare like in the image on the left. Your task is to find the sunflower that grows the tallest.");
                reminder.push("Select a video by holding CONTROL and clicking on it.");
                switch (this.model.interaction) {
                    case INTERACTIONS.SMALL_MULTIPLES:
                        title += " Small Multiples";
                        steps.push("Play through all the videos and look for the highest point that each plant reaches. Select the plant whose highest point is closest to the top of the video window.");
                        break;
                    case INTERACTIONS.OVERLAYS:
                        title += " Overlays";
                        steps.push("Start by adding the first video to the overlay (click on it). Then go through each of the other videos and do the following:");
                        steps.push("1. Add the video to the overlay by clicking on its eye.");
                        steps.push("2. Play through the overlaid plant videos to see which grows the tallest.");
                        steps.push("3. Remove the shorter plant from the overlay by clicking on its eye again, and continue.");
                        steps.push("Once you have gone through all the videos, select the video that is still in the overlay (only video with its eye open).");
                        break;
                    case INTERACTIONS.SHADOW_MARKER:
                        title += " Shadow Marks";
                        steps.push("Start by playing through each video and estimating which plant reachest the highest point. Select the cursor mark and position your mouse over the highest point you see. Then, go through each of the other videos and do the following:");
                        steps.push("1. Play through the plant video using the arrow keys and check if the plant grows higher than the cursors horizontal line.");
                        steps.push("2. If it does, move your cursor to the highest point of the new video. Continue on to the next video.");
                        steps.push("Once you have gone through all the videos, select the video you are hovering over.");
                        break;
                }
                break;
            case 2:
                title += "Sea Ice Extent with";
                description.push("This task has 2 comparison trials. For each trial, 9 Arctic sea ice videos will load in for you to view and compare. Your task is to find the video where the ice extends farthest east (right) between the two island circled on the image to the left.")
                reminder.push("Select a video by holding CONTROL and clicking on it.");
                switch (this.model.interaction) {
                    case INTERACTIONS.SMALL_MULTIPLES:
                        title += " Small Multiples";
                        steps.push("Play through all the videos and look the video where ice (light blue and white) extends furthest east (right) between the two islands.");
                        break;
                    case INTERACTIONS.OVERLAYS:
                        title += " Overlays";
                        steps.push("Start by adding the first video to the overlay. Then go through each of the other videos and do the following:");
                        steps.push("1. Add the video to the overlay by clicking on its eye.");
                        steps.push("2. Play through the overlaid sea ice videos to see which extends furthest east (right) between the islands.");
                        steps.push("3. Remove the video that extends the least from the overlay by clicking on its eye again, and continue.");
                        steps.push("Once you have gone through all the videos, select the video that is still in the overlay.");
                        break;
                    case INTERACTIONS.SHADOW_MARKER:
                        title += " Shadow Marks";
                        steps.push("First, play through the videos and guess which video extends the furthest. Make a mark at the rightmost point of the ice between the two islands (we recommend a line mark, but you can use any of the mark types available). Then go through each of the other videos and do the following:");
                        steps.push("1. Play through the sea ice video and check if the ice extends further east (right) than your mark.");
                        steps.push("2. If it does, remove the last mark and add a new one to the rightmost of the ice. Continue on to the next video.");
                        steps.push("Once you have gone through all the videos, select the video that the remaining mark belongs to (hovering over the mark will highlight the video it belongs to).");
                        break;
                }
                break;
            case 3:
                title += "Baseball Registration with";
                description.push("This task has 2 comparison trials. For each trial, 9 baseball pitching videos will load in for you to view and compare, like in the image on the left. Your task is to find 2 videos where the pitcher's release point (location of the ball in the first frame it leaves the pitcher's hand and is in flight) is close to the release point of the pitcher in the top left-hand corner (highlighted in red in the image on the left).");
                reminder.push('"close" means within the length of a ball.');
                reminder.push("Select a video by holding CONTROL and clicking on it.");
                switch (this.model.interaction) {
                    case INTERACTIONS.SMALL_MULTIPLES:
                        title += " Small Multiples";
                        steps.push("Play through all the videos and locate the position where the pitcher releases the ball. If this position is close to the release point of the pitcher in the top left-hand corner, select the video.");
                        break;
                    case INTERACTIONS.OVERLAYS:
                        title += " Overlays";
                        steps.push("First, add the top left video to the overlay by clicking on its eye. Then, for each other video:");
                        steps.push("1. Add the video to the overlay by clicking on its eye.");
                        steps.push("2. Play through the overlaid pitch videos and observe if their release points are close.");
                        steps.push("3. If they are, select the video.");
                        steps.push("4. Remove the top video from the overlay by clicking on its eye again, and continue.");
                        break;
                    case INTERACTIONS.SHADOW_MARKER:
                        title += " Shadow Marks";
                        steps.push("Play through the top left video and add a mark at the pitcher's release point. You can use any mark you like, but we recommend using the marker (like in the image on the left). Then, play through the other videos and select the 2 videos whose release points are close to your mark.")
                        break;
                }
                break;
            case 4:
                title += "Identifying Outliers with";
                description.push("This task has 3 comparison trials. The first will be a tutorial trial for you to familiarize yourself with the technique, and the other two will be recorded. For each trial, 9 scatterplots will load in for you to view and compare. One example scatterplot is shown at left. Your task is to find the scatterplot that has the highest outlier in the upper half of the plot (in the example image at left, the upper half is highlighted with a red rectangle).");
                reminder.push("Select a scatterplot by holding CONTROL and clicking on it.");
                switch (this.model.interaction) {
                    case INTERACTIONS.SMALL_MULTIPLES:
                        title += " Small Multiples";
                        steps.push("Identify outliers in the top half of each plot, then compare which outlier is the highest. Select the scatterplot that contains this outlier. If you answer incorrectly, you will be asked to try again.");
                        break;
                    case INTERACTIONS.OVERLAYS:
                        title += " Overlays";
                        steps.push("Identify outliers in the top half of each plot, then compare which outlier is the highest. Select the scatterplot that contains this outlier. If you answer incorrectly, you will be asked to try again.");
                        reminder.push("You may use the Overlay feature if you want to compare multiple scatterplots at once.");
                        break;
                    case INTERACTIONS.SHADOW_MARKER:
                        title += " Shadow Marks";
                        steps.push(`First, select the cursor tool and hover over any outliers you see in the first plot. Then go through each of the other scatterplots and do the following:`);
                        steps.push(`1. Look for any outliers above the cursor line.`);
                        steps.push(`2. If there are, hover over that outlier instead and continue.`);
                        steps.push(`Once you have gone through all the scatterplots, select the plot that you are hovering over. If you answer incorrectly, you will be asked to try again.`);
                        break;
                }
                break;
            default:
                break;
        }
        
        // Draw title
        size = 32;
        textSize(size);
        noStroke();
        fill(0);
        strokeWeight(1);
        text(title, x-textWidth(title)/2, y);
        y+= (size+10);
        x = width/3;

        // Draw image
        if (this.model.trial === 0 && this.model.instructionImage !== null) {
            let aspectRatio = this.model.instructionImage.width / this.model.instructionImage.height;
            image(this.model.instructionImage, 10, 10, (x-50), (x-50)/aspectRatio);
        }

        // Draw description
        fill(0);
        noStroke();
        strokeWeight(1);
        size = 16
        textSize(size);
        description.forEach(desc => {
            desc.split(" ").forEach(word => {
                if (textWidth(txt + word + " " ) > w) {
                    text(txt,x,y);
                    y+=(size+5);
                    txt = "";
                }
                txt+=word+" ";
            });
            text(txt,x,y);
            y+=(size+25);
            txt = "";
        });

        // Draw steps
        txt = "";
        fill(0);
        noStroke();
        strokeWeight(1);
        size = 16
        textSize(size);
        steps.forEach(step => {
            step.split(" ").forEach(word => {
                if (textWidth(txt + word + " " ) > w) {
                    text(txt,x,y);
                    y+=(size+5);
                    txt = "";
                }
                txt+=word+" ";
            });
            text(txt, x,y);
            y+=(size+25);
            txt = "";
        });

        // Draw reminder
        txt = "";
        fill(0);
        noStroke();
        strokeWeight(1);
        size = 16
        textSize(size);
        reminder.forEach(remind => {
            remind.split(" ").forEach(word => {
                if (textWidth(txt + word + " " ) > w) {
                    text(txt,x,y);
                    y+=(size+5);
                    txt = "";
                }
                txt+=word+" ";
            });
            text(txt, x,y);
            y+=(size+25);
            txt = "";
        });
    }
    // Draw loading or begin text
    if (this.model.percentLoaded !== 100) {
        txt = this.model.percentLoaded + "%";
        fill(0);
        stroke(0);
        size = 16;
        textSize(size);
        text(txt, width/2-textWidth(txt)/2, y);
        y+=(size+25);
        noFill();
        rect(width/2-100, y, 200, 25);
        fill(50, 205, 50);
        noStroke();
        rect(width/2-100, y, 200*this.model.percentLoaded/100, 25)
    } else {
        size = 16;
        x = width/3;
        y = windowHeight-200;
        textSize(size);
        noStroke();
        strokeWeight(1);
        text(begin,windowWidth/2-textWidth(begin)/2,y);
        noFill();
        stroke(0);
        circle(windowWidth/2,windowHeight-120,100);
        fill(0);
        noStroke();
        text("Begin", windowWidth/2-textWidth("Begin")/2,windowHeight-120+5);
    }
}

View.prototype.drawInstructions = function () {
    if (this.model.videos.length > 0 && this.model.category.length > 0) {
        let w,h,x,y;
        ({ ow: w, oh: h, ox: x, oy: y } = this.model.getOverlayDimensions());
        y += h + 120;

        let instructions = [];
        switch (this.model.task) {
            case 1:
                instructions.push(`* Task`);
                instructions.push(`Select the sunflower plant that grows the tallest (at its highest extent), by Control-clicking the video.`);
                instructions.push(`* Steps`)
                switch (this.model.interaction) {
                    case INTERACTIONS.SMALL_MULTIPLES:
                        instructions.push(`Play through all the videos and look for the highest point that each plant reaches. Select the plant whose highest point is closest to the top of the video window.`)
                        break;
                    case INTERACTIONS.OVERLAYS:
                        instructions.push(`Start by adding the first video to the overlay. Then go through each of the other videos and do the following:`)
                        instructions.push(`1. Add the video to the overlay.`);
                        instructions.push(`2. Play through the overlaid plant videos to see which grows the tallest.`);
                        instructions.push(`3. Remove the shorter plant from the overlay by clicking on it on the left, and continue.`);
                        instructions.push(`Once you have gone through all the videos, select the video that is still in the overlay.`);
                        break;
                    case INTERACTIONS.SHADOW_MARKER:
                        instructions.push(`Start by playing through each video and estimating which plant reachest the highest point. Select the cursor mark and position your mouse over the highest point you see. Then, go through each of the other videos and do the following:`);
                        instructions.push(`1. Play through the plant video using the arrow keys and check if the plant grows higher than the cursors horizontal line.`);
                        instructions.push(`2. If it does, move your cursor to the highest point of the new video. Continue on to the next video.`);
                        instructions.push(`Once you have gone through all the videos, select the video you are hovering over.`);
                        break;
                    default:
                        break;
                }
                break;
            case 2:
                instructions.push(`* Task`);
                instructions.push(`Select the video where the ice extends farthest east (right) between the two islands to the right of Greenland (large island in the middle), by Control-clicking the image.`);
                instructions.push(`* Steps`)
                switch (this.model.interaction) {
                    case INTERACTIONS.SMALL_MULTIPLES:
                        instructions.push(`Play through all the videos and look the video where ice (light blue and white) extends furthest east (right) between the two islands.`)
                        break;
                    case INTERACTIONS.OVERLAYS:
                        instructions.push(`Start by adding the first video to the overlay. Then go through each of the other videos and do the following:`)
                        instructions.push(`1. Add the video to the overlay.`);
                        instructions.push(`2. Play through the overlaid sea ice videos to see which extends furthest east (right) between the islands.`);
                        instructions.push(`3. Remove the video that extends the least from the overlay by clicking on it on its eye, and continue.`);
                        instructions.push(`Once you have gone through all the videos, select the video that is still in the overlay.`);
                        break;
                    case INTERACTIONS.SHADOW_MARKER:
                        instructions.push(`First, play through the videos and guess which video extends the furthest. Make a mark at the rightmost point of the ice between the two islands (we recommend a line mark, but you can use any of the mark types available). Then go through each of the other videos and do the following:`);
                        instructions.push(`1. Play through the sea ice video and check if the ice extends further east (right) than your mark.`);
                        instructions.push(`2. If it does, remove the last mark and add a new one to the rightmost of the ice. Continue on to the next video.`);
                        instructions.push(`Once you have gone through all the videos, select the video that the remaining mark belongs to (hovering over the mark will highlight the video it belongs to).`);
                        break;
                    default:
                        break;
                }
                break;
            case 3:
                instructions.push(`* Task`);
                instructions.push(`Select 2 videos where the pitcher's release point (location of the ball in the first frame it leaves the pitcher's hand and is in flight) is close to the release point of the pitcher in the top left-hand corner, by Control-clicking the video.`);
                instructions.push(`* Steps`)
                switch (this.model.interaction) {
                    case INTERACTIONS.SMALL_MULTIPLES:
                        instructions.push(`Play through all the videos and locate the position where the pitcher releases the ball. If this position is close to the release point of the pitcher in the top left-hand corner, select the video.`);
                        break;
                    case INTERACTIONS.OVERLAYS:
                        instructions.push(`First, add the top left video to the overlay by clicking on its eye. Then, for each other video:`);
                        instructions.push(`1. Add the video to the overlay by clicking on its eye.`);
                        instructions.push(`2. Play through the overlaid pitch videos and observe if their release points are close.`);
                        instructions.push(`3. If they are, select the video.`);
                        instructions.push(`4. Remove the top video from the overlay by clicking on its eye again, and continue.`);
                        break;
                    case INTERACTIONS.SHADOW_MARKER:
                        instructions.push(`Play through the top left video and add a mark at the pitcher's release point. You can use any mark you like, but we recommend using the marker. Then, play through the other videos and select the 2 videos whose release points are close to your mark.`);
                        break;
                    default:
                        break;
                }
                instructions.push(`* Reminder`);
                instructions.push(`"close" means within the length of a ball.`);
                break;
            case 4:
                instructions.push(`* Task`);
                instructions.push(`Select the scatterplot with the outlier that is the highest in the top half of the plot, by Control-clicking the image.`);
                instructions.push(`* Steps`)
                switch (this.model.interaction) {
                    case INTERACTIONS.SMALL_MULTIPLES:
                        instructions.push(`Identify outliers in the top half of each plot, then compare which outlier is the highest. Select the scatterplot that contains this outlier.`)
                        break;
                    case INTERACTIONS.OVERLAYS:
                        instructions.push(`Identify outliers in the top half of each plot, then compare which outlier is the highest. Select the scatterplot that contains this outlier.`)
                        instructions.push(`You may use the Overlay feature if you want to compare multiple scatterplots at once.`);
                        break;
                    case INTERACTIONS.SHADOW_MARKER:
                        instructions.push(`First, select the cursor tool and hover over any outliers you see in the first plot. Then go through each of the other scatterplots and do the following:`);
                        instructions.push(`1. Look for any outliers above the cursor line.`);
                        instructions.push(`2. If there are, hover over that outlier instead and continue.`);
                        instructions.push(`Once you have gone through all the scatterplots, select the plot that you are hovering over.`);
                        break;
                    default:
                        break;
                }
                break;
        }
        if (this.model.trial === 0) instructions.push(`Help prompts are displayed at the bottom left corner for this first trial. Follow them if you wish.`);

        let txt = "";
        let size = 16;
        fill(0);
        noStroke();
        strokeWeight(1);
        textSize(size);
        instructions.forEach(instruction => {
            instruction.split(" ").forEach(word => {
                if (word === "*") {
                    textStyle(BOLD);
                } else {
                    if (textWidth(txt + word + " " ) > w) {
                        text(txt, x,y);
                        y+=(size+5);
                        txt = "";
                    }
                    txt+=word+" ";
                }
            });
            text(txt, x,y);
            y+=(size+25);
            txt = "";
            textStyle(NORMAL);
        });

        // let largestInstruction = instructions.reduce((prev,curr) => {
        //     if (textWidth(curr) > textWidth(prev)) return curr;
        //     else return prev;
        // }, instructions[0]);
        // let largestReminder = reminders.reduce((prev, curr) => {
        //     if (textWidth(curr) > textWidth(prev)) return curr;
        //     else return prev;
        // }, reminders[0]);
        // let size = 24;
        // fill(0);
        // noStroke();
        // strokeWeight(1);
        // textSize(size);
        // while (size > 1 && iX+w/2-(textWidth(largestInstruction)+20)/2 + textWidth(largestInstruction)+30 > this.model.getScrollbarX() + this.model.getScrollbarWidth() + 25) {
        //     size--;
        //     textSize(size);
        // }
        // instructions.forEach(instruction => {
        //     text(instruction, x+w/2-textWidth(instruction)/2-10,y);
        //     y+=(size+10);
        // });
        // let iW = textWidth(largestInstruction)+20;
        // let iH = y-iY-size+10;
        // stroke(0);
        // noFill();
        // rect(iX+w/2-iW/2,iY,iW,iH,10);

        // if (reminders.length > 0) {
        //     y+=size+10;
        //     fill(0);
        //     noStroke();
        //     strokeWeight(1);
        //     iY = y-30;
        //     reminders.forEach(reminder => {
        //         text(reminder, x+w/2-textWidth(reminder)/2-10,y);
        //         y+=(size+10);
        //     });
        //     iW = textWidth(largestReminder)+20;
        //     iH = y-iY-size+10;
        //     stroke(0);
        //     noFill();
        //     rect(iX+w/2-iW/2,iY,iW,iH,10);
        // }

        if (this.model.selectedVideos.length > 0 && (this.model.task !== 3 || this.model.selectedVideos.length === 2)) {
            let submitPrompt = "Press ENTER to submit.";
            y += (size+5);
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
        stroke(0,0,0,150);
        strokeWeight(2);
        const markerX = vx + vw * mark.widthRatio;
        const markerY = vy + vh * mark.heightRatio;
        switch (mark.type) {
            case MARKS.MARKER:
                let maxLength = 16;
                let markLength = Math.min(vw, vh) / 16;
                if (markLength > maxLength) markLength = maxLength;
                line(markerX, markerY - markLength / 2, markerX, markerY + markLength / 2);
                line(markerX + markLength / 2, markerY, markerX - markLength / 2, markerY);
                stroke(colour.r, colour.g, colour.b, 150);
                strokeWeight(1);
                line(markerX, markerY - markLength / 2, markerX, markerY + markLength / 2);
                line(markerX + markLength / 2, markerY, markerX - markLength / 2, markerY);
                break;
            case MARKS.RECT:
                if (mark.path.length === 2) {
                    stroke(colour.r, colour.g, colour.b, 150);
                    strokeWeight(1);
                    const x1 = vx + vw * mark.path[0].widthRatio;
                    const y1 = vy + vh * mark.path[0].heightRatio;
                    const x2 = vx + vw * mark.path[1].widthRatio;
                    const y2 = vy + vh * mark.path[1].heightRatio;
                    const x = Math.min(x1,x2);
                    const y = Math.min(y1,y2);
                    const w = Math.abs(x1-x2);
                    const h = Math.abs(y1-y2);
                    rect(x,y,w,h);
                }
                break;
            case MARKS.CIRCLE:
                if (mark.path.length === 2) {
                    stroke(colour.r, colour.g, colour.b, 150);
                    strokeWeight(1);
                    const x1 = vx + vw * mark.path[0].widthRatio;
                    const y1 = vy + vh * mark.path[0].heightRatio;
                    const x2 = vx + vw * mark.path[1].widthRatio;
                    const y2 = vy + vh * mark.path[1].heightRatio;
                    const d = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))*2;
                    circle(x1,y1,d);
                }
                break;
            case MARKS.LINE:
            case MARKS.FREEFORM:
                stroke(colour.r, colour.g, colour.b, 150);
                strokeWeight(1);
                for (let i = 0; i < mark.path.length - 1; i++) {
                    const x1 = vx + vw * mark.path[i].widthRatio;
                    const y1 = vy + vh * mark.path[i].heightRatio;
                    const x2 = vx + vw * mark.path[i + 1].widthRatio;
                    const y2 = vy + vh * mark.path[i + 1].heightRatio;
                    line(x1, y1, x2, y2);
                }
                break;
            case MARKS.CURSOR:
                stroke(colour.r, colour.g, colour.b, 150);
                strokeWeight(1);
                line(markerX, vy, markerX, vy + vh);
                line(vx, markerY, vx + vw, markerY);
                break;
            default:
                break;
        }
    });

    // For pixel height
    // if (this.model.shadowMarks.length === 1) {
    //     let mark = this.model.shadowMarks[0];
    //     stroke(0);
    //     fill(0);
    //     strokeWeight(1);
    //     text(`${(1 - mark.heightRatio).toFixed(4)}px`, vx + vw * mark.widthRatio, vy + vh * mark.heightRatio);
    // }
    // For pixel width
    // if (this.model.shadowMarks.length === 1) {
    //     let mark = this.model.shadowMarks[0];
    //     stroke(0);
    //     fill(0);
    //     strokeWeight(1);
    //     text(`${(1 - mark.widthRatio).toFixed(4)}px`, vx + vw * mark.widthRatio, vy + vh * mark.heightRatio);
    // }
    // For location marking
    // if (this.model.shadowMarks.length === 1) {
    //     let mark = this.model.shadowMarks[0];
    //     const mx = Math.floor(vw * mark.widthRatio);
    //     const my = Math.floor(vh * mark.heightRatio);
    //     stroke(0);
    //     fill(255);
    //     strokeWeight(1);
    //     text(`${mx},${my}`,vx + vw * mark.widthRatio, vy + vh * mark.heightRatio);
    // } 

    // Draw current freeform path
    const colour = this.model.shadowMarkColour;
    stroke(colour.r, colour.g, colour.b, 150);
    strokeWeight(1);
    switch (this.model.shadowMarkType) {
        case MARKS.FREEFORM:
        case MARKS.LINE:
            for (let i = 0; i < this.model.freeformPath.length - 1; i++) {
                const x1 = vx + vw * this.model.freeformPath[i].widthRatio;
                const y1 = vy + vh * this.model.freeformPath[i].heightRatio;
                const x2 = vx + vw * this.model.freeformPath[i + 1].widthRatio;
                const y2 = vy + vh * this.model.freeformPath[i + 1].heightRatio;
                line(x1, y1, x2, y2);
            }
            break;
        case MARKS.RECT:
            if (this.model.freeformPath.length === 2) {
                const x1 = vx + vw * this.model.freeformPath[0].widthRatio;
                const y1 = vy + vh * this.model.freeformPath[0].heightRatio;
                const x2 = vx + vw * this.model.freeformPath[1].widthRatio;
                const y2 = vy + vh * this.model.freeformPath[1].heightRatio;
                const x = Math.min(x1,x2);
                const y = Math.min(y1,y2);
                const w = Math.abs(x1-x2);
                const h = Math.abs(y1-y2);
                rect(x,y,w,h);
            }
            break;
        case MARKS.CIRCLE:
            if (this.model.freeformPath.length === 2) {
                const x1 = vx + vw * this.model.freeformPath[0].widthRatio;
                const y1 = vy + vh * this.model.freeformPath[0].heightRatio;
                const x2 = vx + vw * this.model.freeformPath[1].widthRatio;
                const y2 = vy + vh * this.model.freeformPath[1].heightRatio;
                const d = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))*2;
                circle(x1,y1,d);
            }
            break;
        default:
            break;
    }

    // Draw shadow cursor
    if (this.model.shadowMarkType === MARKS.CURSOR && this.model.hoverTarget != null) {
        fill(colour.r, colour.g, colour.b, 150);
        stroke(colour.r, colour.g, colour.b, 150);
        // strokeWeight(2);
        strokeWeight(1);
        let widthRatio, heightRatio, x, y;
        if (this.model.hoverTarget === "OVERLAY") {
            let ow, oh, ox, oy;
            ({ ow, oh, ox, oy } = this.model.getOverlayDimensions());
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

    // if (this.model.gridActive) {
    //     let squareSize, numRows = 3, numCols = 3;
    //     if (vw > vh) {
    //         squareSize = Math.floor(vh / 3);
    //         numCols = Math.ceil(vw / squareSize);
    //     } else {
    //         squareSize = Math.floor(vw / 3);
    //         numRows = Math.ceil(vh / squareSize)
    //     }
    //     fill(200, 200, 200, 125);
    //     stroke(200, 200, 200, 125);
    //     strokeWeight(1);
    //     // Draw row lines
    //     for (let i = 1; i < numRows; i++) line(vx, vy + squareSize * i, vx + vw, vy + squareSize * i);
    //     // Draw column lines
    //     for (let j = 1; j < numCols; j++) line(vx + squareSize * j, vy, vx + squareSize * j, vy + vh);
    //     // Draw highlight, if any
    //     if (this.model.gridHighlight >= 0) {
    //         noFill();
    //         stroke(colour.r, colour.g, colour.b, 150);
    //         strokeWeight(2);
    //         let squareX = vx + squareSize * (this.model.gridHighlight % numCols);
    //         let squareY = vy + squareSize * Math.floor(this.model.gridHighlight / numCols);
    //         if (squareX + squareSize > vx + vw || squareY + squareSize > vy + vh) {
    //             let squareW = squareSize, squareH = squareSize;
    //             if (squareX + squareW > vx + vw) squareW -= (squareX + squareW - vx - vw);
    //             if (squareY + squareH > vy + vh) squareH -= (squareY + squareH - vy - vh);
    //             rect(squareX, squareY, squareW, squareH);
    //         } else {
    //             square(squareX, squareY, squareSize);
    //         }
    //     }
    // }
}

View.prototype.drawScrollbar = function () {
    // Draw model scrollbar
    stroke(0, 0, 0, this.model.scrollbarHighlighted ? 255 : 100)
    fill(101, 101, 101, this.model.scrollbarHighlighted ? 255 : 100);
    rect(this.model.getScrollbarX(), this.model.getScrollbarY(), this.model.getScrollbarWidth(), this.model.getScrollbarHeight(), 20);
    fill(151, 151, 151, this.model.scrollbarHighlighted ? 255 : 100);
    circle(this.model.getScrollbarX() + this.model.index / (this.model.getScrollbarSegments()-1) * this.model.getScrollbarWidth(), this.model.getScrollbarY() + this.model.getScrollbarHeight() / 2, 30);
    if (this.model.scrollbarHighlighted) {
        stroke(0);
        fill(0);
        textSize(16);
        let txt = this.model.videos[0].labels[this.model.getIndex()];
        if (this.model.getIndex() > 0) {
            txt = "<   " + txt;
        }
        if (this.model.getIndex() < this.model.getScrollbarSegments()-1) {
            txt = txt + "   >";
        }
        text(txt, this.model.getScrollbarX() + this.model.index / (this.model.getScrollbarSegments()-1) * this.model.getScrollbarWidth() - textWidth(txt) / 2, this.model.getScrollbarY() - 20);
    }
}

View.prototype.drawMarkerButton = function () {
    const highlighted = this.model.shadowMarkType === MARKS.MARKER || this.model.markerButtonHighlighted
    stroke(0, 0, 0, highlighted ? 255 : 100);
    fill(101, 101, 101, highlighted ? 255 : 100);
    const x = this.model.getMarkButtonX();
    const y = this.model.getScrollbarY() - 60;
    const length = 50;
    const centerX = x + length / 2;
    const centerY = y + length / 2;
    const centerLength = 30;
    square(x, y, length, 10);
    noFill();
    stroke(255);
    line(centerX, centerY - centerLength / 2, centerX, centerY + centerLength / 2);
    line(centerX + centerLength / 2, centerY, centerX - centerLength / 2, centerY);
}

// View.prototype.drawRectButton = function () {
//     const highlighted = this.model.shadowMarkType === MARKS.RECT || this.model.rectButtonHighlighted;
//     stroke(0, 0, 0, highlighted ? 255 : 100);
//     fill(101, 101, 101, highlighted ? 255 : 100);
//     const x = this.model.getMarkButtonX();
//     const y = this.model.getScrollbarY() - 120;
//     const length = 50;
//     const centerX = x + length / 2;
//     const centerY = y + length / 2;
//     const centerLength = 30;
//     square(x, y, length, 10);
//     noFill();
//     stroke(255);
//     square(centerX - centerLength / 2, centerY - centerLength / 2, centerLength);
// }

// View.prototype.drawCircleButton = function () {
//     const highlighted = this.model.shadowMarkType === MARKS.CIRCLE || this.model.circleButtonHighlighted;
//     stroke(0, 0, 0, highlighted ? 255 : 100);
//     fill(101, 101, 101, highlighted ? 255 : 100);
//     const x = this.model.getMarkButtonX();
//     const y = this.model.getScrollbarY() - 180;
//     const length = 50;
//     const centerX = x + length / 2;
//     const centerY = y + length / 2;
//     const centerLength = 30;
//     square(x, y, length, 10);
//     noFill();
//     stroke(255);
//     circle(centerX, centerY, centerLength);
// }

// View.prototype.drawLineButton = function () {
//     let highlighted = this.model.shadowMarkType === MARKS.LINE || this.model.lineButtonHighlighted;
//     stroke(0, 0, 0, highlighted ? 255 : 100);
//     fill(101, 101, 101, highlighted ? 255 : 100);
//     const x = this.model.getMarkButtonX();
//     const y = this.model.getScrollbarY() - 240;
//     const length = 50;
//     const centerLength = 30;
//     square(x, y, length, 10);
//     noFill();
//     stroke(255);
//     line(x+10, y+10, x+10+centerLength, y+10+centerLength);
// }

// View.prototype.drawFreeformButton = function () {
//     const highlighted = this.model.shadowMarkType === MARKS.FREEFORM || this.model.freeformButtonHighlighted;
//     stroke(0, 0, 0, highlighted ? 255 : 100);
//     fill(101, 101, 101, highlighted ? 255 : 100);
//     const x = this.model.getMarkButtonX();
//     const y = this.model.getScrollbarY() - 300;
//     const length = 50;
//     const centerLength = 30;
//     square(x, y, length, 10);
//     noFill();
//     stroke(255);
//     beginShape();
//     curveVertex(x + 10, y + 10);
//     curveVertex(x + 15, y + 15);
//     curveVertex(x + 10 + centerLength / 2 + 5, y + 10 + centerLength / 2 - 5);
//     curveVertex(x + 10 + centerLength / 2 - 5, y + 10 + centerLength / 2 + 5);
//     curveVertex(x + 10 + centerLength - 5, y + 10 + centerLength - 5);
//     curveVertex(x + 10 + centerLength, y + 10 + centerLength);
//     endShape();
// }

View.prototype.drawCursorButton = function () {
    const highlighted = this.model.shadowMarkType === MARKS.CURSOR || this.model.cursorButtonHighlighted;
    stroke(0, 0, 0, highlighted ? 255 : 100);
    fill(101, 101, 101, highlighted ? 255 : 100);
    const x = this.model.getMarkButtonX();
    // const y = this.model.getScrollbarY() - 360;
    const y = this.model.getScrollbarY() - 120;
    const length = 50;
    const centerLength = 30;
    square(x, y, length, 10);
    noFill();
    stroke(255);
    beginShape();
    vertex(x+20, y+10);
    vertex(x+20, y+5+centerLength);
    vertex(x+25, y+2+centerLength);
    vertex(x+27, y+7+centerLength);
    vertex(x+30, y+6+centerLength);
    vertex(x+29, y+2+centerLength);
    vertex(x+35, y+1+centerLength);
    vertex(x+20, y+10);
    endShape();
}

View.prototype.drawColourButton = function () {
    stroke(0, 0, 0, this.model.colourButtonHighlighted ? 255 : 100)
    fill(101, 101, 101, this.model.colourButtonHighlighted ? 255 : 100);
    const x = this.model.getMarkButtonX();
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
    const x = this.model.getMarkButtonX() + 50 - width;
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
    hotkeysPoints.push("- Toggle playback ------------------------------------------------------------------------------------------ SPACEBAR");
    hotkeysPoints.push("- Zoom in ---------------------------------------------------------------------------------------------------------- CTRL +");
    hotkeysPoints.push("- Zoom out -------------------------------------------------------------------------------------------------------- CTRL -");
    hotkeysPoints.push("- One frame back -------------------------------------------------------------------------------------- LEFT ARROW");
    hotkeysPoints.push("- One frame forward -------------------------------------------------------------------------------- RIGHT ARROW");
    hotkeysPoints.push("- Select video ------------------------------------------------------------------------------------------------ CTRL click");
    if (this.model.interaction === INTERACTIONS.SHADOW_MARKER) {
        generalPoints.push("- Marks can be placed by clicking, dragging, and releasing on a video.");
        generalPoints.push("- Mark mode can be selected from any of the buttons on the bottom right.");
        generalPoints.push("- Click the bottom button to open a colour palette to choose from.");
        generalPoints.push("- Hovering over a shadow marker will highlight the video it originally came from.");
        hotkeysPoints.push("- Remove shadow marker  --------------------------------------------------------------------------------- hover + d");
    } else if (this.model.interaction === INTERACTIONS.OVERLAYS) {
        generalPoints.push("- Click on a video to add it to the overlay on the right.");
        generalPoints.push("- Click on the video again to remove it from the overlay.");
    }
    if (this.model.trial === 0) {
        taskPoints.push("- Follow the instructions displayed above the scrollbar.");
    } else {
        taskPoints.push("- Follow the instructions displayed on the right.")
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