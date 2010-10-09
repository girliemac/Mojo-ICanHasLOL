function BookmarkedContentAssistant(index,savedList) {
	this.index = index;
	this.savedList = savedList;
	this.savedItem = savedList[index];
}

BookmarkedContentAssistant.prototype.setup = function() {
	// System Menu	
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, Lol.commandMenuModel);
															 
	// View Menu
	this.viewMenuModelFaves = {
	 	visible: true,
	  	items: [{
	    items: [
	      { icon: 'back', command: 'go-back'},
	      { label: 'Share', command: 'do-share', width: 106 },
		  { label: 'Delete', command: 'do-delete', width: 100 },
	      { icon: 'forward', command: 'go-next'}
	    ]
	  }]
	};
	this.viewMenuModelFavesLast = {
	 	visible: true,
	  	items: [{
	    items: [
	      { icon: 'back', command: 'go-back'},
	      { label: 'Share', command: 'do-share', width: 100 },
		  { label: 'Delete', command: 'do-delete', width: 100 },
	      { icon: 'forward-disabled', command: 'do-nothing'}
	    ]
	  }]
	};
	this.attributes = {
       menuClass: '.palm-dark'
    }
	if(this.index == this.savedList.length-1){
		this.controller.setupWidget(Mojo.Menu.viewMenu, this.attributes, this.viewMenuModelFavesLast);
	} else {
		this.controller.setupWidget(Mojo.Menu.viewMenu, this.attributes, this.viewMenuModelFaves);
	}	
	
}

BookmarkedContentAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command)
		{
			case 'go-back':
				this.controller.stageController.popScene();
			break;
			case 'go-next':
				var nextIndex = this.index+1;
				this.controller.stageController.pushScene("bookmarked-content", nextIndex, this.savedList);
				console.log("**** this index="+this.index+", Next="+nextIndex);
				break;
			break;
			case 'do-delete':
				this.controller.showAlertDialog({
				onChoose: function(value) {
					if (value == "delete") {
						this.deleteData(Lol.db, this.savedItem);
					}},
			    title: $L("Delete"),
			    message: $L("Are you sure you want to delete this bookmark?"),
				choices:[
					{label:$L("Cancel"), value:"cancel", type:'dismiss'},
	 				{label:$L('Delete'), value:"delete", type:'negative'}
					]				    
			    });	
			break;
			case 'do-share':
				this.controller.showAlertDialog({
				onChoose: function(value) {
					if (value == "twitter") {
						this.controller.stageController.pushScene('twitter', this.savedItem.url, this.savedItem.title);
					}
					else if (value == "email"){
						AppAssistant.emailLink(this.savedItem.url);
					}
					else if (value == "sms"){
						AppAssistant.smsLink(this.savedItem.url);
					}},
			    title: $L("Share"),
				message: $L("Share this URL by:"),
				choices:[
					{label:$L('Email'), value:"email"},
					{label:$L('SMS'), value:"sms"},
	 				{label:$L('Twitter'), value:"twitter"},
					{label:$L('Cancel'), value:"cencel", type:'dismiss'}
					]				    
			    });	
			break;
			
			default:
				//Mojo.Controller.errorDialog("Got command " + event.command);
			break;
		}
	}
}

// Delete from Local DB
BookmarkedContentAssistant.prototype.deleteData = function(db,savedItem){	
	console.log("**** Deleting: ID = "+ savedItem.id);
	db.transaction( 
        (function (transaction) { 
            transaction.executeSql('DELETE FROM myBookmarks WHERE id = ?', [savedItem.id], this.deleteRecordDataHandler.bind(this), this.errorHandler.bind(this)); 
        }).bind(this) 
    ); 
}


BookmarkedContentAssistant.prototype.errorHandler = function(transaction, error) { 
    console.log('*** DB Create Error: '+error.message+' (Code '+error.code+')'); 
    return true;
}

BookmarkedContentAssistant.prototype.deleteRecordDataHandler = function(transaction, results) 
{
	console.log("**** Delete 1 record");
	this.controller.stageController.swapScene("bookmarks");
} 


BookmarkedContentAssistant.prototype.activate = function(event) {
	//this.controller.get("title").innerHTML = this.savedItem.title;
	this.controller.get("date").innerHTML = this.savedItem.date;
	this.controller.get("content").innerHTML = this.savedItem.content;
}


BookmarkedContentAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

BookmarkedContentAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
