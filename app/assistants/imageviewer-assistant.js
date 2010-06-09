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
	
	// Save button 
	this.cmdMenuModel = {
	    visible: true,
	    items: [
	        {items:[{},{icon:'save', command:'do-download'}]}
	    ]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.cmdMenuModel);
};

ImageviewerAssistant.prototype.handleOrientation = function(event) {
	this.controller.get('fullsizeImage').mojo.manualSize(this.controller.window.innerWidth, this.controller.window.innerHeight);
};

ImageviewerAssistant.prototype.downloadImage = function(url, success){	
	
	// hide the save button -- not working?
	this.cmdMenuModel.visible = false;
	this.controller.modelChanged(this.cmdMenuModel);
	
	// Set a filename to be saved - extracting the filename.jpg from the url
	var index = url.lastIndexOf("/") + 1;
	var filename = url.substr(index); 

	// workaround -- repeat the doenload mngr twice due to mojo bug
	try {
		this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: {
				target: url,
				mime: "image/jpeg",
				targetDir: "/media/internal/ICanHasLOL/",
				targetFilename: filename,
				keepFilenameOnRedirect: false,
				subscribe: false
			},
			onSuccess: function (response){},
			onFailure: function (error){}
		});

	} catch (e) {}
	
	try {
		this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: {
				target: url,
				mime: "image/jpeg",
				targetDir: "/media/internal/ICanHasLOL/",
				targetFilename: filename,
				keepFilenameOnRedirect: false,
				subscribe: false
			},
			onSuccess: success,
			onFailure: function (e) {
				Mojo.Log.info(Object.toJSON(e))
				Mojo.Controller.errorDialog("Download Error");
			}
		});

	} catch (e) {
		Mojo.Log.info(Object.toJSON(e))
		Mojo.Controller.errorDialog("Download Error");
	}
};

ImageviewerAssistant.prototype.handleCommand = function(event) {
    this.controller = Mojo.Controller.stageController.activeScene();
    if (event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'do-download':
				
	            this.downloadImage(this.imageUrl, function(resp) {
					 if (resp.returnValue) {
						
						/*
					 	this.controller.showAlertDialog({
					    title: $L("Download Completed!"),
						message: $L("The image is saved in ICanHasLOL album in Photos App."),
						choices:[
			 				{label:$L('OK'), value:"ok", type:'affirmative'}
							]				    
					    });
					*/
						this.controller.serviceRequest('palm://com.palm.applicationManager', {
				        	method:'launch',
				        	parameters: {
				            	id:"com.palm.app.photos",
				              	params: {}
				          	}
				      	});
					 }
				}.bind(this));
            break;
        }
    }
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
