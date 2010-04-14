function PreferencesAssistant(db) {
	this.db = db;
	this.cookie = new Mojo.Model.Cookie("LolPreferences");
	
	this.dirList = Lol.directory;
}

PreferencesAssistant.prototype.setup = function() {

	var savedValue = 'ICanHasCheezburger';
	
	// retrieve the saved cookie if any
	
	var savedInfo = this.cookie.get();
	if (savedInfo) {	
		savedValue = savedInfo.cookieFeed;
	}
	
	this.selectorsModel = { currentValue: savedValue};
	
	if(this.dirList[0].value != 'directory') {
		this.dirList.unshift({label:'[ LOL Directory ]', value:'directory'});
	}
	
	this.controller.setupWidget('initFeedSelector', {
		choices: this.dirList, multiline:true, modelProperty:'currentValue'
		}, this.selectorsModel);
	this.controller.listen('initFeedSelector', Mojo.Event.propertyChange, this.selectorChanged.bindAsEventListener(this));
	
	// button to apply the change
	Mojo.Event.listen(this.controller.get('apply-pref'), Mojo.Event.tap, this.applyPref.bindAsEventListener(this));	
};

PreferencesAssistant.prototype.selectorChanged = function(event) {
	
	var selectedValue = event.value;
	var selectedLabel;
	
	// not sure if there's a better way to get the label without looping...
	for(var i = 0; i < this.dirList.length; i++) {
		if (this.dirList[i].value == selectedValue) {
			selectedLabel = this.dirList[i].label;
		}
	}
	
	/* store cookie */
	this.cookie.put ({
		cookieFeed: selectedValue, 
		cookieSitename: selectedLabel
	});
};
PreferencesAssistant.prototype.applyPref = function(event) {
	/* Get Cookie info */	
	this.initialPage = 'ICanHasCheezburger',
	this.siteTitle = 'I Can Has Cheezburger?'
	
	// retrieve the saved cookie if any
	var savedInfo = this.cookie.get();
	if (savedInfo) {	
		this.initialPage = savedInfo.cookieFeed;
		this.siteTitle = savedInfo.cookieSitename;
	}

	if(this.initialPage == 'directory') {
		this.controller.stageController.swapScene('allsites', this.db);
	} else {
		this.controller.stageController.swapScene('menu', this.db, this.initialPage, this.siteTitle);
	}
};

PreferencesAssistant.prototype.activate = function(event) {
};

PreferencesAssistant.prototype.deactivate = function(event) {
	this.dirList.splice (0, 1);  // remove the Directory from the array so it won't keep adding
};

PreferencesAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening('initFeedSelector', Mojo.Event.propertyChange, this.selectorChanged.bindAsEventListener(this));
	Mojo.Event.stopListening(this.controller.get('apply-pref'), Mojo.Event.tap, this.applyPref.bindAsEventListener(this));	
};
