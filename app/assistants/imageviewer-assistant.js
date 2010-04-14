function ImageviewerAssistant(imageUrl) {
	this.imageUrl = imageUrl;
}

ImageviewerAssistant.prototype.setup = function() {
	
	// allow landscape mode
	if (this.controller.stageController.setWindowOrientation) {
	  this.controller.stageController.setWindowOrientation("free");
	}
	
	document.getElementsByTagName('body')[0].removeClassName('palm-dark');
	document.getElementsByTagName('body')[0].addClassName('generic-dark');
				
    var attributes = {};
	this.imageViewModel = {};
	this.controller.setupWidget('fullsizeImage', attributes, this.imageViewModel);

	this.controller.listen(document, 'orientationchange',this.handleOrientation.bindAsEventListener(this));
};

ImageviewerAssistant.prototype.handleOrientation = function(event) {
	this.controller.get('fullsizeImage').mojo.manualSize(this.controller.window.innerWidth, this.controller.window.innerHeight);
};

ImageviewerAssistant.prototype.activate = function(event) {
	this.controller.get('fullsizeImage').mojo.centerUrlProvided(this.imageUrl);
	this.controller.get('fullsizeImage').mojo.manualSize(this.controller.window.innerWidth, this.controller.window.innerHeight);
};

ImageviewerAssistant.prototype.deactivate = function(event) {
	document.getElementsByTagName('body')[0].removeClassName('generic-dark');
	document.getElementsByTagName('body')[0].addClassName('palm-dark');
	this.controller.stageController.setWindowOrientation("up");
};

ImageviewerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
