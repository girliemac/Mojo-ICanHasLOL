function BookmarksAssistant() {
	
}

BookmarksAssistant.prototype.setup = function() {
	
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
   	this.list_saved = [];
	this.list_model = { items: this.list_saved };
	
	// List Widget to display saved contents
	var attributes = {
    	itemTemplate: 'templates/list-templ',
	 	swipeToDelete: true
	};

	this.controller.setupWidget('listMenu', attributes, this.list_model);

	Mojo.Event.listen(this.controller.get('listMenu'),Mojo.Event.listTap, this.callback.bind(this));
	
	// Swipe to delete
	Mojo.Event.listen(this.controller.get('listMenu'),Mojo.Event.listDelete , this.deleteData.bindAsEventListener(this));
}




BookmarksAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command)
		{
			case 'refresh':
				this.controller.stageController.swapScene("bookmarks");
			break;
			
			// use this in future
			case 'do-appClearBookmarks':
			this.controller.showAlertDialog({
				onChoose: function(value) {
					if (value == "delete") {
						this.ClearTable(Lol.db, this.feedItem);
					}},
			    title: $L("Delete"),
			    message: $L("Are you sure you want to delete the entire bookmarks?"),
				choices:[
					{label:$L("Cancel"), value:"cancel", type:'dismiss'},
	 				{label:$L('Delete All'), value:"delete", type:'negative'}
					]				    
			    });	
		 
			break;
		}
	}
}

BookmarksAssistant.prototype.activate = function(event) {
	//this.controller.get("appTitle").innerHTML = Mojo.Controller.appInfo.title;
	
	// get data from DB
	Lol.db.transaction(
	    (function (transaction) {
	        transaction.executeSql("SELECT * from myBookmarks;", [], this.selectDataHandler.bind(this), this.errorHandler.bind(this));
	    }).bind(this)
	);
}

BookmarksAssistant.prototype.selectDataHandler = function(transaction, results) { 
	console.log("*** DB Selected. Results= "+results.rows.length);
	
    var list = [];
    for (var i=results.rows.length-1; i>=0; i--) {
        var row = results.rows.item(i);
        list.push ({
			id: row['id'],
			title: row['title'],
			date: row['date'],
			content: row['content'],
			url: row['url'],
			icon: row['icon']
		});
    }
	
	Object.extend(this.list_saved,list);
	this.controller.modelChanged(this.list_model, this);
}

BookmarksAssistant.prototype.errorHandler = function(transaction, error) { 
    console.log('*** DB Select Error: '+error.message+' (Code '+error.code+')'); 
    return true;
}

/* Swipe-to-Delete */
BookmarksAssistant.prototype.deleteData = function(event){	
	console.log("**** Swipe-Deleting: ID = "+ event.item.id);
	var db = Lol.db;
	db.transaction( 
        (function (transaction) { 
            transaction.executeSql('DELETE FROM myBookmarks WHERE id = ?', [event.item.id], this.deleteDataHandler.bind(this), this.deleteErrorHandler.bind(this)); 
        }).bind(this) 
    ); 
}
BookmarksAssistant.prototype.deleteErrorHandler = function(transaction, error) { 
    console.log('*** DB Create Error: '+error.message+' (Code '+error.code+')'); 
    return true;
}

BookmarksAssistant.prototype.deleteDataHandler = function(transaction, results) 
{
	console.log("**** Deleted 1 record");
	//this.controller.stageController.swapScene("favorites");
} 


BookmarksAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}


BookmarksAssistant.prototype.callback = function(event){
	this.controller.stageController.pushScene("bookmarked-content", event.index, this.list_saved);
}

// Delete the entire bookmarks
BookmarksAssistant.prototype.ClearTable = function (db){
	db.transaction( 
	        (function (transaction) { 
				transaction.executeSql("DROP TABLE myBookmarks", [], this.createTableDataHandler.bind(this), this.errorHandler.bind(this));
	            //transaction.executeSql('CREATE TABLE IF NOT EXISTS myBookmarks(title TEXT NOT NULL DEFAULT "", date TEXT NOT NULL DEFAULT "", content TEXT NOT NULL DEFAULT "");', [], this.createTableDataHandler.bind(this), this.errorHandler.bind(this)); 
	        }).bind(this) 
	    );
}

BookmarksAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.controller.get('listMenu'),Mojo.Event.listTap, this.callback.bind(this));
	Mojo.Event.stopListening(this.controller.get('listMenu'),Mojo.Event.listDelete , this.deleteData.bindAsEventListener(this));
}

