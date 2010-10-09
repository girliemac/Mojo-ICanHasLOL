function AccountAssistant(lolurl, loltitle, referer, authResponse) {
	this.lolurl = lolurl;
	this.loltitle = loltitle;
	this.ref = referer;
	this.auth = authResponse;
	
	this.tokens = {
		screen_name: '', 
		username: '',
		oauth_token: '', 
		oauth_token_secret: ''
	};
Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@@ REF %s',this.ref);
	this.authCookie = new Mojo.Model.Cookie("TwitterAuth"); // token from oath req
	this.accountCookie = new Mojo.Model.Cookie("TwitterAccount"); // twitter user account info from API
	
	// http://dev.twitter.com/apps/138883
	// http://dev.twitter.com/pages/auth
}

AccountAssistant.prototype.setup = function() {
	
	if(this.auth) { // after coming back from Oauth web
		Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@@ AUTH %s',this.auth.response);
		this.controller.get('authDisplay').style.display = 'none';
		
		// get auth info and store as cookies
		this.getTokens(this.auth.response);
	
		//this.controller.get('twitterUserVerified').style.display = 'block';		
				
	} else {	
		// the first time - not authenticated yet
		this.controller.get('authDisplay').style.display = 'block';
	//	this.controller.get('twitterUserVerified').style.display = 'none';
	
		this.ButtonModel = {
			buttonLabel : $L('Login to Twitter'),
			//buttonClass : 'secondary',
			disable : false
		}

		this.controller.setupWidget('auth-button', {}, this.ButtonModel);
		this.controller.listen(this.controller.get('auth-button'),Mojo.Event.tap, this.getRequestToken.bind(this));
	}
}

AccountAssistant.prototype.getRequestToken = function(event){
	var oauthConfig = {
	    callbackScene: 'account', //Name of the assistant to be called on the OAuth Success
	    requestTokenUrl: 'https://api.twitter.com/oauth/request_token',
	    requestTokenMethod: 'GET', // Optional - 'GET' by default if not specified
	    authorizeUrl: 'https://api.twitter.com/oauth/authorize',
	    accessTokenUrl: 'https://api.twitter.com/oauth/access_token',
	    accessTokenMethod: 'POST', // Optional - 'GET' by default if not specified
	    consumer_key: Lol.twitterConsumerKeys.consumer_key,
	    consumer_key_secret: Lol.twitterConsumerKeys.consumer_key_secret,
	    callback:'http://www.google.com', // Optional - 'oob' by default if not specified
		
		// params to pass back with callback url
		paramUrl: this.lolurl,
		paramTitle: this.loltitle,
		paramRef: this.ref
	   };
	   Mojo.Controller.stageController.pushScene('oauth',oauthConfig);
}

AccountAssistant.prototype.getTokens = function(response) {
	// oauth_token=7103272-dxFfeJcvYf8mPD78b71qym01yOu8cAnAt0iPCmawgs
	// &oauth_token_secret=iHNt52Hbcs9nUC1kKC9NHBbACiL3NTzgLktzNMaeS8
	// &user_id=7103272
	// &screen_name=girlie_mac,
	
	var tokens = response.strip().split("&");
	
	for (var i = 0; i < tokens.length; i++) {
		var token = tokens[i];
		
		if (token.substr(0, 12) == "oauth_token=") {
			this.tokens.oauth_token = token.substr(12);
		}
		else if (token.substr(0, 18) == "oauth_token_secret") {
			this.tokens.oauth_token_secret = token.substr(19);
		}
		else if (token.substr(0, 11) == "screen_name") {
			this.tokens.screen_name = token.substr(12);
		}
	}
	
	Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@ oauth_token = %s', this.tokens.oauth_token);
	Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@ oauth_token_secret = %s', this.tokens.oauth_token_secret);
	Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@ screen_name = %s', this.tokens.screen_name);
	
	if (!this.tokens.oauth_token) {
		this.controller.showAlertDialog({
			title: $L("Error"),
			message: $L("Twitter is not responding. Please try again later."),
			choices: [{
				label: $L('OK'),
				value: 'ok',
				type: 'color'
			}]
		});
	} else {
		this.storeAccountInfo(this.tokens);
	}
}

AccountAssistant.prototype.storeAccountInfo = function(tokens) {
	// store info in cookie 
	this.authCookie.put({
		cookieOauthToken: tokens.oauth_token, 
		cookieScreenName: tokens.screen_name,
		cookieOauthTokenSecret: tokens.oauth_token_secret
	});
	
	// get a user info from API, and store as cookies
	this.getUserInfoApi(tokens.screen_name);
}


/* getting Twitter user info from API after authorization */

AccountAssistant.prototype.getUserInfoApi = function(screen_name) {
	
	var userUrl = "http://api.twitter.com/1/users/show.json?screen_name="+screen_name;
		
	var req = new Ajax.Request(userUrl, {
		method: 'get',
		evalJSON: 'true',
		onSuccess: this.userInfoApiSuccess.bind(this),
	    onFailure: function (transport) {
			
			Mojo.Log.info('***************'+Object.toJSON(e));
        	Mojo.Controller.errorDialog("JSON Error");
    	}
	});
}

AccountAssistant.prototype.userInfoApiSuccess = function(transport) {
	
	var json = transport.responseJSON;

	if (transport.request.transport.status == "200") {
		// store info in cookie 
		this.accountCookie.put({
			cookieUser: json.screen_name, 
			cookieFullname: json.name, 
			cookieAvatar: json.profile_image_url, 
		});
		
		Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ accountCookie %s', this.accountCookie.get().cookieUser);
		Mojo.Log.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ this.lolurl %s', this.lolurl);
		if(this.ref == 'twitter') {
			this.controller.stageController.swapScene('twitter', this.lolurl, this.loltitle);	
		} else {
			this.controller.stageController.swapScene('preferences');
		}
	}
}

AccountAssistant.prototype.activate = function(event) {

}

AccountAssistant.prototype.deactivate = function(event) {

}

AccountAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('auth-button'),Mojo.Event.tap, this.getRequestToken.bind(this));	
}