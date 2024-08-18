//
// SAGE2 application: Image presenter
//

"use strict";

/* global  */

var image_presenter = SAGE2_App.extend({
	
	init: function(data) 
	{
		// Create div into the DOM - main data container
		this.SAGE2Init("div", data);
		// Set the DOM id
		this.element.id = "div_" + data.id;
		this.element.className += " element";

		// move and resize callbacks
		this.resizeEvents = "continuous"; // onfinish
		// this.moveEvents   = "continuous";

		// SAGE2 Application Settings
		//
		// Control the frame rate for an animation application
		this.maxFPS = 2.0;
		// Not adding controls but making the default buttons available
		this.controls.finishedAddingControls();
		this.enableControls = true;
		
		//create widget buttons
		this.widgetInit(data.date);
		
		//ready for animation
		//this.timer = this.state.loadTimer;
		console.log("state in init:");
		console.log(this.state.anima);
		this.synced = true;
		if(this.state.anima === true)
		{
			//this.state.anima = false;
			this.synced = false;
			clearInterval(this.refreshT);
		}
		//this.timer = 0.0;
		//this.redraw = false;
		
		//display layer
		this.createLayer("#000");
		
		//create dom
		this.createDom();
		
		//using directory
		this.dirPath = this.state.dirPath;
		
		//list of image files
		this.allImageFiles = [];
		this.dirImageFiles = [];
		
		//get all images in directory
		this.registerFileListHandler(this.getFiles);
		
		//show loaded images
		this.displayImages();
		
		this.save();
	},

	load: function(date) 
	{
	    //called on external sync
		console.log('image_presenter> Load with state value', this.state.value);
		this.refresh(date);
	},
	
	save: function()
	{
		this.SAGE2UpdateAppOptionsFromState();
        this.SAGE2Sync(true);
	},
	
	widgetInit: function(date)
	{
		//defining button types
		this.controls.addButton({type: "next", position: 5, sequenceNo: 1, identifier: "Next"});
		this.controls.addButton({type: "prev", position: 3, sequenceNo: 2, identifier: "Prev"});
		this.controls.addButton({type: "loop", position: 11, sequenceNo: 3, identifier: "Loop"});
		this.controls.addButton({type: "stop", position: 9, sequenceNo: 4, identifier: "Stop"});
	},
	
	//get files from a directory
	getFiles: function(data)
	{
		//get all images from sage
		this.allImageFiles = data.images;
		for(var i = 0; i < this.allImageFiles.length; i++){
		var filePath = this.allImageFiles[i].sage2URL;
		var sameDir = true;
		
		//check if filepath corresponds with wanted directory
		for (var j = 0; j < this.dirPath.length; j++){
			if (this.dirPath[j] != filePath[j]) 
			{
				sameDir = false;
				break;
			}
		}
		if (sameDir === true )
			this.dirImageFiles.push(this.allImageFiles[i]);
	}
	this.save();
	},
	
	//creates structure for CSS formatting
	createDom: function()
	{
		//1 main image
        this.mainImg = document.createElement("img");
        this.mainImg.className = "main-img";
        
        //in container
        this.mContainer = document.createElement("div");
		this.mContainer.className = "m-container"; 
		this.mContainer.appendChild(this.mainImg);
		
		/*this.inContainer = document.createElement("div");
		this.inContainer.className = "in-container";
		this.mContainer.appendChild(this.inContainer);*/
		//this.inContainer.appendChild(this.mainImg);
        
		//4 sub images
		this.subContainer = document.createElement("div");
		this.subContainer.className = "sub-container";
		this.subImg = [];
		for(var i = 0; i < this.state.subImgCount; i++)
		{
			this.subImg[i] = document.createElement("img");
			this.subImg[i].className = "sub-img";
			this.subContainer.appendChild(this.subImg[i]);
		}
		
		this.mainContainer = document.createElement("div");
		this.mainContainer.className = "main-container";
		//this.mainContainer.appendChild(this.mainImg);
		this.mainContainer.appendChild(this.mContainer);
		this.mainContainer.appendChild(this.subContainer);
		//should be in displayed layer
		this.layer.appendChild(this.mainContainer);
		this.save();
	},
	
	//1 main, 4 sub (next in line)
	displayImages: function()
	{
		//number of sub images
		//this.subImgNum = 4;
		
		var idx = this.state.mainIndex;
		var len = this.dirImageFiles.length;
		
		for(var i = 1; i <= this.state.subImgCount; i++)
		{
			var finalIdx = idx-i;
			if(finalIdx < 0)
			{
				if(len < 5)
					finalIdx = (finalIdx + 6) % len;
				else
					finalIdx = len + finalIdx;
			}

			var image = this.dirImageFiles[finalIdx];
			//assign image URL as source
			this.subImg[i-1].src = image.sage2URL;
		}
		
		var mainImg = this.dirImageFiles[idx];
		this.mainImg.src = mainImg.sage2URL;
		
		//shows layer after each change
		this.showLayer();
		this.save();
	},
	
	//increase main index by one, display images
	incIndex: function(date)
	{
		this.state.mainIndex += 1;
		this.state.mainIndex %= this.dirImageFiles.length;
		this.displayImages();
		this.refresh(date);
	},

	//decreases main index by one
	decIndex: function(date)
	{
		this.state.mainIndex -= 1;
		if(this.state.mainIndex === -1)
			this.state.mainIndex = this.dirImageFiles.length-1;
		this.displayImages();
		this.refresh(date);
	},
	
	draw: function(date) 
	{
		//animation with timer
		/*this.timer += this.dt;
		if(this.timer >= 10.0)
		{	
			this.timer = 0.0;
			this.redraw = true;
		}
		
		if(this.redraw === true)
		{
			this.incIndex(date);
			this.refresh(date);
			this.redraw = false;
		}*/
	},
	
	stopAnimation: function(date)
	{
		/*console.log("state from stopAnim");
		console.log(this.state.anima);
		console.log("stopping");*/
		if(this.state.anima === true)
		{
			this.state.anima = false;
			clearInterval(this.refreshT);
		}
	},
	
	startAnimation: function(date)
	{
		/*console.log("state from startAnim:");
		console.log(this.state.anima);
		console.log("starting");*/
		if(this.state.anima === false)
		{
			this.state.anima = true;
			var tmp = this;
			this.refreshT = setInterval(function(){tmp.incIndex(date)}, this.state.interval);
		}
	},

	resize: function(date) 
	{
		// Called when window is resized
		//redisplay images
		this.displayImages();
		this.refresh(date);
		this.save();
	},

	move: function(date) 
	{
		// Called when window is moved (set moveEvents to continuous)
		this.refresh(date);
	},

	quit: function() 
	{
		this.state.animas = false;
		// Make sure to delete stuff (timers, ...)
	},

	//here application handles events, reacts to user input
	//change main index according to users action
	event: function(eventType, position, user_id, data, date) {
		if (eventType === "pointerPress" && (data.button === "left")) {
			// clicked left mouse button
			this.incIndex(date);
			this.save();
			this.refresh(date);
			
		} else if (eventType === "pointerMove" && this.dragging) {
			// move
		} else if (eventType === "pointerRelease" && (data.button === "left")) {
			// click release
		} else if (eventType === "pointerScroll") {
			// Scroll events for zoom
		} else if (eventType === "widgetEvent") {
			// widget events - access from right mouse button
			switch(data.identifier)
			{
				case "Next":
					this.incIndex(date);
					this.save();
					break;
					
				case "Prev":
					this.decIndex(date);
					this.save();
					break;
					
				case "Loop":
					this.startAnimation(date);
					this.save();
					break;
					
				case "Stop":
					this.stopAnimation(date);
					this.save();
					break;
					
				default:
			}
		} else if (eventType === "keyboard") {
			if (data.character === "m") {
				this.displayImages();
				this.save();
				this.refresh(date);
			}
			else if (data.character === "a")
			{
				this.startAnimation(date);
				this.save();
				this.refresh(date);
			}
			else if (data.character === "s")
			{
				this.stopAnimation(date);
				this.save();
				this.refresh(date);
			}
		} else if (eventType === "specialKey") {
			//using keyboard arrows
			if (data.code === 37 && data.state === "down") {
				// left
				this.decIndex(date);
				this.save();
				this.refresh(date);
				
			} else if (data.code === 38 && data.state === "down") {
				// up
				this.decIndex(date);
				this.save();
				this.refresh(date);

			} else if (data.code === 39 && data.state === "down") {
				// right
				this.incIndex(date);
				this.save();
				this.refresh(date);
				
			} else if (data.code === 40 && data.state === "down") {
				// down
				this.incIndex(date);
				this.save();
				this.refresh(date);
			}
		}
		this.refresh(date);
	}
});
