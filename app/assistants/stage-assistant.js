function StageAssistant() {
	//Create a database when the scene is generated
	try {
		this.db = openDatabase('lolDB', '1.0', 'LOL DB', 250000);
		//console.log("**** Created database:" +this.db);
		this.CreateTable(this.db);
	} catch (e){
		console.log(e);		
	}
	
	//Cookie
	this.cookie = new Mojo.Model.Cookie("LolPreferences");
}
StageAssistant.prototype.CreateTable = function (db){
	db.transaction( 
	    (function (transaction) { 
		//transaction.executeSql("DROP TABLE myBookmarks", [], this.createTableDataHandler.bind(this), this.errorHandler.bind(this));
	          transaction.executeSql('CREATE TABLE IF NOT EXISTS myBookmarks(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT, date TEXT, content TEXT, url TEXT, icon TEXT);', [], this.createTableDataHandler.bind(this), this.errorHandler.bind(this)); 
		}).bind(this) 
    );
}

StageAssistant.prototype.createTableDataHandler = function(transaction, results) {
	//console.log("*** Created myBookmarks.");
} 

StageAssistant.prototype.errorHandler = function(transaction, error) { 
	Mojo.Controller.errorDialog("Database Error");
    //console.log('*** DB Create Error: '+error.message+' (Code '+error.code+')'); 
    return true;
}

StageAssistant.prototype.setup = function() {
	
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
		this.controller.pushScene('allsites', this.db);
	} else {
		this.controller.pushScene('menu', this.db, this.initialPage, this.siteTitle);
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
		  	this.controller.stageController.pushScene('menu', this.db, this.initialPage, this.siteTitle);
			break;

		
		case 'go-directory':
		  	this.controller.stageController.popScenesTo();
			this.controller.stageController.pushScene('allsites', this.db);
			break;
					
		case 'go-faves':
		  	this.controller.stageController.pushScene('bookmarks', this.db);
			break;
			
		case 'go-pref':
	  		this.controller.stageController.pushScene('preferences', this.db);
			break;
			
		}
    }
};



