function PreferencesAssistant() {
	this.prefCookie = new Mojo.Model.Cookie("LolPreferences");
	this.dirList = Lol.directory;
	this.accountCookie = new Mojo.Model.Cookie("TwitterAccount");
}

PreferencesAssistant.prototype.setup = function() {
	var savedValue = 'ICanHasCheezburger';
	
	// retrieve the saved cookie if any
	var savedDefault = this.prefCookie.get();
	if (savedDefault) {	
		savedValue = savedDefault.cookieFeed;
	}
	
	this.selectorsModel = { currentValue: savedValue};
	
	this.controller.setupWidget('initFeedSelector', {
		choices: this.dirList, multiline:true, modelProperty:'currentValue'
		}, this.selectorsModel);
	this.controller.listen(this.controller.get('initFeedSelector'), Mojo.Event.propertyChange, this.selectorChanged.bindAsEventListener(this));
	
	// Twitter account
	
	var savedAccountInfo = this.accountCookie.get();
	
	if (!savedAccountInfo || !savedAccountInfo.cookieUser) {	
		this.controller.get('twitterNoAccount').innerHTML = $L("Login to Twitter");
		this.controller.get('twitterAccount').style.display = 'none';
		Mojo.Event.listen(this.controller.get('twitterNoAccount'), Mojo.Event.tap, this.setTwitterAccount.bindAsEventListener(this));
	} else {
		this.screen_name = savedAccountInfo.cookieUser;
		
		var full_name = savedAccountInfo.cookieFullname;
		var avatar = savedAccountInfo.cookieAvatar;
		Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@ has cookie. avatar = %s', avatar);
		
		// display user's name and avatar
		this.controller.get('twitterNoAccount').style.display = 'none';
		this.controller.get('avatar-img').style.backgroundImage = 'url('+avatar+')';
		this.controller.get('fullname').innerHTML = full_name;
		this.controller.get('screenname').innerHTML = '@'+this.screen_name;	
	}
	
	Mojo.Event.listen(this.controller.get('resetAll'), Mojo.Event.tap, this.resetAll.bindAsEventListener(this));	
};

PreferencesAssistant.prototype.setTwitterAccount = function(event) {
	Mojo.Controller.stageController.swapScene('account', null, null, 'pref');
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
	this.prefCookie.put ({
		cookieFeed: selectedValue, 
		cookieSitename: selectedLabel
	});
};

PreferencesAssistant.prototype.resetAll = function(event) {
	this.prefCookie.put ({
		cookieFeed: 'ICanHasCheezburger', 
		cookieSitename: 'I Can Has Cheezburger?'
	});
	
	this.accountCookie.remove();
	
	this.controller.stageController.pushScene('preferences');
};

PreferencesAssistant.prototype.activate = function(event) {
};

PreferencesAssistant.prototype.deactivate = function(event) {
	//this.dirList.splice (0, 1);  // remove the Directory from the array so it won't keep adding
	
	/* Setup the pref */	
	
	this.initialPage = 'ICanHasCheezburger',
	this.siteTitle = 'I Can Has Cheezburger?'
	
	// retrieve the saved cookie if any
	var savedInfo = this.prefCookie.get();
	if (savedInfo) {	
		this.initialPage = savedInfo.cookieFeed;
		this.siteTitle = savedInfo.cookieSitename;
	} 
};

PreferencesAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening (this.controller.get('initFeedSelector'), Mojo.Event.propertyChange, this.selectorChanged.bindAsEventListener(this));
	Mojo.Event.stopListening (this.controller.get('twitterNoAccount'), Mojo.Event.tap, this.setTwitterAccount.bindAsEventListener(this));
	Mojo.Event.stopListening (this.controller.get('resetAll'), Mojo.Event.tap, this.resetAll.bindAsEventListener(this));
};
