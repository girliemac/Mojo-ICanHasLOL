function TwitterAssistant(url, title) {
	this.url = url;
	this.title = title;
	this.cookie = new Mojo.Model.Cookie("TwitterInfo");
}
TwitterAssistant.prototype.shortenUrl = function(url){
	
	var bitlyApiKey = 'R_3e4e0eaca1e85f3eaf77f33db90b25fe'; 
	
  	var bitlyUrl = 'http://api.bit.ly/shorten?version=2.0.1&longUrl='+url+'&login=girliemac&apiKey='+bitlyApiKey+'&format=json';
	//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> bit.ly json = ' + bitlyUrl);

	try {
		var request = new Ajax.Request(bitlyUrl, {
			method: 'get',
			evalJSON: 'force',
			onComplete: this.generateTweet.bind(this),
			onFailure: function (transport) {
            	Mojo.Controller.errorDialog("JSON Error");
        	}
		});
	} 
	catch (e) {
		//console.log(e);
		this.controller.showAlertDialog({
			title: $L("Bit.ly API Error"),
			message: String(e),
			choices: [{
				label: $L('OK'),
				value: 'ok',
				type: 'color'
			}]
		});
	}
	
}
TwitterAssistant.prototype.setup = function() {
	/* init values - use cookies if there */
	
	this.twitterModel = {
		username: false,
		password: false,
		value: ''
	};
	
	this.shortenUrl(this.url);
	
	/* Username */
	this.controller.setupWidget('user-field', {
			hintText: 'Username',
			modelProperty:'username', 
			changeOnKeyPress: true,
			focusMode: Mojo.Widget.focusSelectMode,
			textCase: Mojo.Widget.steModeLowerCase
		},
		this.twitterModel
	);

	/* Password */
	this.controller.setupWidget('pass-field', {
	        hintText: 'Password',
			modelProperty: 'password',
			changeOnKeyPress: true, 
			focusMode: Mojo.Widget.focusSelectMode
		},
		this.twitterModel
	    );
	
	/* Post */
	this.controller.setupWidget('post-field', {
			multiline: true,
			enterSubmits: true,
			changeOnKeyPress: true
		},
	this.twitterModel
	);
	
	/* Button */
	this.buttonModel = {
		buttonClass:'affirmative', 
		buttonLabel:$L('Tweet!'), 
		disabled:true
	};
	this.controller.setupWidget('submit-twitter', {type: Mojo.Widget.activityButton}, this.buttonModel);
	
	/* Enter Cookie info */
	var savedInfo = this.cookie.get();
	if (savedInfo) {	
		this.twitterModel.username = savedInfo.cookieName;
		this.twitterModel.password = savedInfo.cookiePass;
		this.buttonModel.disabled = false;
		
		this.controller.modelChanged(this.twitterModel);
		this.controller.modelChanged(this.buttonModel);
	}

	
	//Set up our event listeners. 
	//Mojo.Event.listen(this.controller.get('user-field'), Mojo.Event.propertyChange, this.validateLogin.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('pass-field'), Mojo.Event.propertyChange, this.validateLogin.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('post-field'), Mojo.Event.propertyChange, this.updateCharCount.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('submit-twitter'), Mojo.Event.tap, this.sendPost.bindAsEventListener(this));	
	Mojo.Event.listen(this.controller.get('cancel-twitter'), Mojo.Event.tap, this.cancelTweet.bindAsEventListener(this));	
}

TwitterAssistant.prototype.generateTweet = function(transport) {
	var shortUrl = transport.responseJSON.results[this.url].shortUrl;
	//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> short url = ' + shortUrl);
	
	var title = this.title;
	title = title.replace( /\u2018/g, "'" );
	title = title.replace( /\u2019/g, "'" );
	title = title.replace( /\u201c/g, '"' );
	title = title.replace( /\u201d/g, '"' );
	title = title.replace( /\u2013/g, '-' );
	title = title.replace( /\u2014/g, '--' );
	
	var message = 'Found it with ICanHasLOL for WebOS: ' + title + ' - ' + shortUrl;
	//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> message = ' + message);
	this.twitterModel.value = message;
	this.controller.modelChanged(this.twitterModel);
	this.updateCharCount();
}

TwitterAssistant.prototype.validateLogin = function(event){
	// A character was entered.  Enable or disable the "Sign In" button based on valid data
	if (this.buttonModel.disabled && this.twitterModel.password.length > 0) {
		this.buttonModel.disabled = false;
		this.controller.modelChanged(this.buttonModel);
	} 
	else if (!this.buttonModel.disabled && (this.twitterModel.password.length == 0)) {
		this.buttonModel.disabled = true;
		this.controller.modelChanged(this.buttonModel);
	}
}

TwitterAssistant.prototype.sendPost = function(event){
	// Authenticate
	var name = this.twitterModel.username;
	var pass = this.twitterModel.password;
	var post = this.twitterModel.value;
	
	var authErrorDiv = document.getElementById('error_message');
	var submitButtonDiv = document.getElementById('submit-twitter');
	
	var stage = this.controller.stageController;
	
	var authUrl = "http://" + name + ":" + pass + "@twitter.com/account/verify_credentials.json";
	//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> authurl ' + authUrl);
	
	try {
		var request = new Ajax.Request(authUrl, {
			method: 'get',
			evalJSON: 'force',
			onComplete: function(transport){
				if (transport.responseJSON.error) {
					// Not authenticated
					//console.log('>>>>>>>>>>>>>' +transport.responseJSON.error);
					authErrorDiv.style.display = 'block';
					submitButtonDiv.mojo.deactivate();
				} else {
					// authenticated
					
					// Hide the error message
					if(authErrorDiv.style.display == 'block') {
						authErrorDiv.style.visibility = 'hidden';
					}
					
					// Send to Twitter
					var sendObj = {};
					var postUrl = "http://"+name+":"+pass+"@twitter.com/statuses/update.json";
					
					sendObj = {"status":post,"source":"iCanHasLOL"};
					
					try {
						var request2 = new Ajax.Request(postUrl, {
							method: 'post',
							parameters: sendObj,
							onComplete: function(transport){
								// close and go back
								//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> has been sent: ' + sendObj.status);
								submitButtonDiv.mojo.deactivate();
								stage.popScene();
							},
							onFailure: function (transport) {
				            	Mojo.Controller.errorDialog("POST Error");
								submitButtonDiv.mojo.deactivate();
				        	}
						});
					}
					catch (e){
						console.log(e);
						Mojo.Controller.errorDialog("Twitter Error");
						submitButtonDiv.mojo.deactivate();
					}
				}
			},
			onFailure: function (transport) {
            	Mojo.Controller.errorDialog(e);
				submitButtonDiv.mojo.deactivate();
        	}
		});
	}
	catch (e){
		console.log(e);
		Mojo.Controller.errorDialog("Twitter Error");
		submitButtonDiv.mojo.deactivate();
	}
}

TwitterAssistant.prototype.updateCharCount = function(){
	Mojo.Log.info("********* property Change *************");   
	var chars  = this.twitterModel.value.length;    
	var charleft = 140 - chars;
	document.getElementById('char-counter').innerHTML = charleft.toString();
}

TwitterAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}

TwitterAssistant.prototype.cancelTweet = function(event){
	this.controller.stageController.popScene();
}

TwitterAssistant.prototype.deactivate = function(event) {
	/* store cookie */
	this.cookie.put({
		cookieName: this.twitterModel.username, 
		cookiePass: this.twitterModel.password
	});
}

TwitterAssistant.prototype.cleanup = function(event) {
	//Mojo.Event.stopListening(this.controller.get('user-field'), Mojo.Event.propertyChange, this.validateLogin.bindAsEventListener(this));
	Mojo.Event.stopListening(this.controller.get('pass-field'), Mojo.Event.propertyChange, this.validateLogin.bindAsEventListener(this));
	Mojo.Event.stopListening(this.controller.get('post-field'), Mojo.Event.propertyChange, this.updateCharCount.bindAsEventListener(this));
	Mojo.Event.stopListening(this.controller.get('submit-twitter'), Mojo.Event.tap, this.sendPost.bindAsEventListener(this));
	Mojo.Event.stopListening(this.controller.get('cancel-twitter'), Mojo.Event.tap, this.cancelTweet.bindAsEventListener(this));	
}
