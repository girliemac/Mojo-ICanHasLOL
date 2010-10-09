function StageAssistant() {
	// PrefCookie
	this.prefCookie = new Mojo.Model.Cookie("LolPreferences");
}

StageAssistant.prototype.setup = function() {
	
	/* Get Cookie info */	
	this.initialPage = 'ICanHasCheezburger';
	this.siteTitle = 'I Can Has Cheezburger?';
	
	// retrieve the saved cookie if any
	var savedInfo = this.prefCookie.get();
	if (savedInfo) {	
		this.initialPage = savedInfo.cookieFeed;
		this.siteTitle = savedInfo.cookieSitename;
	}
	
	if(this.initialPage == 'directory') {
		this.controller.pushScene('allsites');
	} else {
		this.controller.pushScene('menu', this.initialPage, this.siteTitle);
	}
	
}

// App Menu Handler (Global)	
StageAssistant.prototype.handleCommand = function(event) {
  	this.controller = Mojo.Controller.stageController.activeScene();

    if(event.type == Mojo.Event.command) {

		switch(event.command) {
		
		case 'go-about':		
			var title = Mojo.Controller.appInfo.title;
			var version = Mojo.Controller.appInfo.version;
			var vendor = Mojo.Controller.appInfo.vendor;
			var year = Mojo.Controller.appInfo.release_date;
			
			title = title + ' ' + version;
			var message = 'Copyright &copy; ' + year + '<br/>' + vendor + '<br/><a href="http://candymob.com">candymob.com</a>';
			
			this.controller.showAlertDialog({
				onChoose: function(value){
				},
				allowHTMLMessage: true,
				title: title,
				message: message,
				choices: [{
					label: 'OK',
					value: 'OK',
					type: 'affirmative'
				}]
			});
			break;
		
		case 'go-home':
		
			if(this.initialPage == 'directory') {
				this.initialPage = 'ICanHasCheezburger';
			}
			this.controller.stageController.popScenesTo();
		  	this.controller.stageController.pushScene('menu', this.initialPage, this.siteTitle);
			break;

		
		case 'go-directory':
		  	this.controller.stageController.popScenesTo();
			this.controller.stageController.pushScene('allsites');
			break;
					
		case 'go-faves':
		  	this.controller.stageController.pushScene('bookmarks');
			break;
			
		case 'go-pref':
	  		this.controller.stageController.pushScene('preferences');
			break;
			
		}
    }
};



