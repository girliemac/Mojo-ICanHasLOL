function MenuAssistant(db, feed, title) {
	this.db = db;
	this.url = 'http://feeds.feedburner.com/'+feed;
	this.feed = feed;
	this.title = title;
}

MenuAssistant.prototype.setup = function() {
	// System Menu	
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, Lol.commandMenuModel);
	
	// View Menu
	/*
	this.viewMenuModel = {
		visible: true,
		items: [
		  {},
		  { icon: 'refresh', command: 'refresh', label: $L('Refresh')}
		]
	};
	this.controller.setupWidget(Mojo.Menu.viewMenu, { spacerHeight: 0, menuClass:'no-fade'}, this.viewMenuModel);
	*/
	// Spinner
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('splash', {spinnerSize: 'large'}, this.spinnerModel);
		
		
	this.list_feed = [];
   	this.list_model = { items: this.list_feed };
										 
												
	// List Widget to display RSS feed
	this.controller.setupWidget('listMenu', {itemTemplate: 'templates/list-templ'}, this.list_model);
	
	// Ajax call
	this.checkFeed();
   
	//Mojo.Event.listen(this.controller.get('newFeeds'), Mojo.Event.listTap, this.goContent.bind(this));
	Mojo.Event.listen(this.controller.get('listMenu'), Mojo.Event.listTap, this.goContent.bind(this));
}


// Ajax call functions ---


MenuAssistant.prototype.checkFeed = function() {
	//console.log('*** current='+Mojo.Host.current+' *** mojoHost='+Mojo.Host.mojoHost);
	if (Mojo.Host.current === Mojo.Host.mojoHost) {
		// use the proxy on mojo-host
		this.url = '/proxy?url=' + encodeURIComponent(this.url) + '?timestamp=' + new Date().getTime();
	}
	
	/*
	 * Use the prototype AJAX object, being sure to use Prototype's
	 * bind function to make sure the 'this' keyword is set to this
	 * instance when the callbacks are called.
	 */
	var request = new Ajax.Request(this.url, {
		method: 'get',
		evalJSON: 'false', 
		//onSuccess: function(){console.info('******* onSuccess happened')},
		onComplete: this.setupModel.bind(this),
		onFailure: this.failure.bind(this)
	});
}

/*
 * Called by Prototype when the request succeeds. Parse the XML response
 */
MenuAssistant.prototype.setupModel = function(transport){

	var rssItems = transport.responseXML.getElementsByTagName("item");
	for (i = 0; i < rssItems.length; i++) {
	
		this.list_feed.push ({
			title: unescape(rssItems[i].getElementsByTagName("title").item(0).textContent),
			date: rssItems[i].getElementsByTagName("pubDate").item(0).textContent,
			content: rssItems[i].getElementsByTagNameNS("http://purl.org/rss/1.0/modules/content/","encoded").item(0).textContent,
			url: rssItems[i].getElementsByTagName("link").item(0).textContent,
			icon: this.feed
		});
	}
	this.controller.modelChanged(this.list_model, this);
	
	// Remove the spinner
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);
	this.controller.get('splashScrim').hide();
}

/*
 * Called by Prototype when the request fails.
 */
MenuAssistant.prototype.failure = function(transport) {
	/*
	 * Use the Prototype template object to generate a string from the return status.
	 */
	var t = new Template($L("Error: Status #{status} "));
	var m = t.evaluate(transport);
	
	/*
	 * Show an alert with the error.
	 */
	this.controller.showAlertDialog({
	    onChoose: function(value) {},
		title: $L("Error reading RSS"),
		message: m,
		choices:[
			{label: $L('OK'), value:'ok', type:'color'}    
		]
	});	  
}

MenuAssistant.prototype.goContent = function(event){
	this.controller.stageController.pushScene("content", event.index, this.list_feed, this.db);
}

MenuAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command)
		{
			case 'back':
			break;
			case 'refresh':
				this.controller.stageController.swapScene("menu", this.db, this.feed);
			break;
			default:
				//Mojo.Controller.errorDialog("Got command " + event.command);
			break;
		}
	}
}

MenuAssistant.prototype.activate = function(event) {
	//this.controller.get("appTitle").innerHTML = Mojo.Controller.appInfo.title;
	this.controller.get("feedTitle").innerHTML = this.title;
}


MenuAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

MenuAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('listMenu'), Mojo.Event.listTap, this.goContent.bind(this));
}
