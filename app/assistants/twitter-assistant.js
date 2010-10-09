function TwitterAssistant(url, title) {
	this.url = url;
	this.title = title;
	this.authCookie = new Mojo.Model.Cookie("TwitterAuth");
	this.accountCookie = new Mojo.Model.Cookie("TwitterAccount");
	this.screen_name;
	this.oauth_token;
	this.oauth_token_secret;
}

TwitterAssistant.prototype.setup = function() {
	//this.accountCookie.remove();
	var savedInfo = this.accountCookie.get();
	
	if (!savedInfo || !savedInfo.cookieUser) {	
		Mojo.Controller.stageController.swapScene('account', this.url, this.title, 'twitter');
	} else {
		this.screen_name = savedInfo.cookieUser;
		
		var full_name = savedInfo.cookieFullname;
		var avatar = savedInfo.cookieAvatar;
		//Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@ has cookie. avatar = %s', avatar);
		
		// display user's name and avatar
		this.controller.get('avatar-img').src = avatar;
		this.controller.get('fullname').innerHTML = full_name;
		this.controller.get('screenname').innerHTML = '@'+this.screen_name;	
	}
	
	this.twitterModel = {
		value: ''
	};
	this.shortenUrl(this.url);
		
	/* Post */
	this.controller.setupWidget('post-field', {
			multiline: true,
			changeOnKeyPress: true,
			holdToEdit: true
		}, 
		this.twitterModel
	);
	
	/* Button */
	this.buttonModel = {
		buttonClass:'affirmative', 
		buttonLabel:$L('Tweet!'), 
		disabled:false
	};
	this.controller.setupWidget('submit-twitter', {type: Mojo.Widget.activityButton}, this.buttonModel);
		
	// Set up our event listeners. 
	Mojo.Event.listen(this.controller.get('post-field'), Mojo.Event.propertyChange, this.updateCharCount.bindAsEventListener(this));
	Mojo.Event.listen(this.controller.get('submit-twitter'), Mojo.Event.tap, this.sendPost.bindAsEventListener(this));	
	Mojo.Event.listen(this.controller.get('cancel-twitter'), Mojo.Event.tap, this.cancelTweet.bindAsEventListener(this));	
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
	
	var message = 'Found it with ICanHasLOL for webOS: ' + title + ' - ' + shortUrl;

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
	var stage = this.controller.stageController;
	
	var tweet = this.twitterModel.value;
	var postUrl = "http://twitter.com/statuses/update.json";
	
	var authErrorDiv = document.getElementById('error_message');
	var submitButtonDiv = document.getElementById('submit-twitter');

	this.oauth_token = this.authCookie.get().cookieOauthToken;
	this.oauth_token_secret = this.authCookie.get().cookieOauthTokenSecret;

	var consumer_key = Lol.twitterConsumerKeys.consumer_key;
	var consumer_key_secret = Lol.twitterConsumerKeys.consumer_key_secret;

	var timestamp = OAuth.timestamp();
    var nonce = OAuth.nonce(11);

	// get oauth_signature		
	this.accessor = {consumerSecret: consumer_key_secret, tokenSecret : this.oauth_token_secret};
    this.message = {method: 'POST', action: postUrl, parameters: OAuth.decodeForm('')};
    this.message.parameters.push(['oauth_consumer_key',this.consumer_key]);
    this.message.parameters.push(['oauth_nonce',nonce]);
    this.message.parameters.push(['oauth_signature_method','HMAC-SHA1']);
    this.message.parameters.push(['oauth_timestamp',timestamp]);
	this.message.parameters.push(['oauth_token',this.oauth_token]);
    this.message.parameters.push(['oauth_version','1.0']);
	this.message.parameters.push(['status',tweet]);
    this.message.parameters.sort()
    OAuth.SignatureMethod.sign(this.message, this.accessor);
    this.authHeader = OAuth.getAuthorizationHeader("", this.message.parameters);
		
		
	var sendObj = {	
		'status': tweet
	};
			
	try {
		var request2 = new Ajax.Request(postUrl, {
			method: 'post',
			parameters: sendObj,
			//requestHeaders: ["Authorization", "Basic " + btoa(name + ":" + pass)],
			requestHeaders:['Authorization', this.authHeader],
			contentType: 'application/x-www-form-urlencoded',
			onComplete: function(transport){
				Mojo.Log.info('@@@@@@@@@@@@@@@@@@@ HEADERS: %s', transport.getAllHeaders());
				if(transport.status == 200) {
					stage.popScene();
				} else {
					Mojo.Controller.errorDialog("Status: "+transport.status+ ' - ' +transport.responseJSON.error);
				}
				submitButtonDiv.mojo.deactivate();
			},
			onFailure: function (transport) {
            	Mojo.Controller.errorDialog("POST Error");
				submitButtonDiv.mojo.deactivate();
        	}
		});
	}
	catch (e){
		console.log(e);
		Mojo.Controller.errorDialog(e);
		submitButtonDiv.mojo.deactivate();
	}
}

TwitterAssistant.prototype.updateCharCount = function(){ 
	var chars  = this.twitterModel.value.length;    
	var charleft = 140 - chars;
	document.getElementById('char-counter').innerHTML = charleft.toString();
}

TwitterAssistant.prototype.activate = function(event) {
}

TwitterAssistant.prototype.cancelTweet = function(event){
	this.controller.stageController.popScene();
}

TwitterAssistant.prototype.deactivate = function(event) {
}

TwitterAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('post-field'), Mojo.Event.propertyChange, this.updateCharCount.bindAsEventListener(this));
	Mojo.Event.stopListening(this.controller.get('submit-twitter'), Mojo.Event.tap, this.sendPost.bindAsEventListener(this));
	Mojo.Event.stopListening(this.controller.get('cancel-twitter'), Mojo.Event.tap, this.cancelTweet.bindAsEventListener(this));	
}


