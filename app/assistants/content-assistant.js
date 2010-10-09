function ContentAssistant(index, feedList) {
	this.index = index;
	this.feedList = feedList;
	this.feed = feedList[index];
	var str;
}

ContentAssistant.prototype.setup = function() {
	
	// System Menu	
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, Lol.commandMenuModel);
															 
	// View Menu
	this.viewMenuModel = {
		 	visible: true,
		  	items: [{
		    items: [
		      { icon: 'back', command: 'go-back'},
		      { label: 'Share', command: 'do-share', width: 100 },
			  { label: 'Save', command: 'do-save', width: 100 },
		      { icon: 'forward', command: 'go-next'}
		    ]
		  }]
		};
	this.viewMenuModelLast = {
	 	visible: true,
	  	items: [{
	    items: [
	      { icon: 'back', command: 'go-back'},
	      { label: 'Share', command: 'do-share', width: 100 },
		  { label: 'Save', command: 'do-save', width: 100 },
	      { icon: 'forward-disabled', command: 'do-nothing'}
	    ]
	  }]
	};
	this.attributes = {
       menuClass: '.palm-dark'
    }
	if(this.index == this.feedList.length-1){
		this.controller.setupWidget(Mojo.Menu.viewMenu, this.attributes, this.viewMenuModelLast);
	} else {
		this.controller.setupWidget(Mojo.Menu.viewMenu, this.attributes, this.viewMenuModel);
	}
}


ContentAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command)
		{
			case 'go-back':
				this.controller.stageController.popScene();
			break;
			case 'go-next':
				var nextIndex = this.index+1;
				this.controller.stageController.pushScene("content", nextIndex, this.feedList);
				//console.log("**** this index="+this.index+", Next="+nextIndex);
				break;
			break;
			case 'do-save':
				this.updateTables(Lol.db, this.feed);
				this.controller.showAlertDialog({
			    title: $L("Added to Favorites!"),
				choices:[
	 				{label:$L('OK'), value:"refresh", type:'affirmative'}
					]				    
			    });	
			break;
			case 'do-share':
				this.controller.showAlertDialog({
				onChoose: function(value) {
					if (value == "twitter") {
						this.controller.stageController.pushScene('twitter', this.feed.url, this.feed.title);
					}
					else if (value == "email"){
						AppAssistant.emailLink(this.feed.url);
					}
					else if (value == "sms"){
						AppAssistant.smsLink(this.feed.url);
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


ContentAssistant.prototype.launchYoutube = function(event, video){
	console.log("*** trying to launch youtube "+video);
	
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
    method:'launch',
    parameters: {
		id: 'com.palm.app.youtube', 
		target: video}
	});
	/*
	 * should i use cross-app launch instead?
	this.controller.stageController.pushScene(
	    { appId :'com.palm.app.youtube', target:video},
	    { sublaunch : true }
	);
	*/
}


ContentAssistant.prototype.displayContent = function (content) {
	
	str = content;
	
	// *** Remove links from images ***
	/*
	var linkedImage = /<a[^>]*>(<img [^>]* \/>)<\/a>/ig;	
	if (str.match(linkedImage)) {
		str = str.replace(linkedImage, '$1');
	}
	*/
	
	// *** Remove Digg links etc. ***
	
	var junk = /<p class="commentnow">[\S\s]*/;
	//var junk2 = /<a rel="nofollow"[\S\s]*/;
	if (str.match(junk)) {
		str = str.replace(junk, '');
		str += '</div>';
	//} else if (str.match(junk2)) {
	//	str = str.replace(junk2, '');
	//	str += '</div>';
	}

	
	// *** Find a video embed ***
	
	var youtubeThumb = /(<img src="http:\/\/img\.youtube\.com\/vi\/([\w\-]+)\/2.jpg"[\S\s]+? \/>)/ig;
	var youtubeEmbed = /<object[\S\s]+?http:\/\/www\.youtube\.com\/v\/([\w\-]+)[\S\s]+?<\/object>/ig;
	
	var youtubeThumbButton = '<div class="youtubeThumb">$1<a href="http://www.youtube.com/watch?v=$2"><img src="images/play.png" class="play"/></a></div>';
	var youtubeThumbButtonGeneric = '<div class="youtubeThumb"><a href="http://www.youtube.com/watch?v=$1"><img src="images/youtube_thumb_generic" alt="play" id="youtubeBtn" /></a></div>';

	if (str.match(youtubeThumb)) {
		str = str.replace(youtubeThumb, youtubeThumbButton);
	}
	if (str.match(youtubeEmbed)) {
		str = str.replace(youtubeEmbed, youtubeThumbButtonGeneric);
	}
		
	
	// If there's non-Youtube video:
	var videoEmbed = /<object[\S\s]*<\/object>/ig;
	var message = '<div align="center"><img src="images/not_supported.png" alt="Not supported" class="video" /></div>';
	
	if (str.match(videoEmbed)) {
		console.log(videoEmbed);
		str = str.replace(videoEmbed, message);
	}
	
	// *** Image size hack on WordPress
	// [A-Za-z]{3,4} = jpg, png, jpeg etc.
	/*
	var imgQuery = /src="(http:\/\/icanhascheezburger.files.wordpress.com[\S\s]+?\.[A-Za-z]{3,4})\?[\S\s]+?"/ig;
	if(imgQuery.test(str)){
		var newImg = 'src="$1?w=300"';
		str = str.replace(imgQuery,newImg);
	}
	var imgSrc = /src="(http:\/\/icanhascheezburger.files.wordpress.com[\S\s]+?\.[A-Za-z]{3,4})"/ig;
	if(imgSrc.test(str)){
		var newImg2 = 'src="$1?w=300"';
		str = str.replace(imgSrc,newImg2);
	}
	*/	
		
	// Content DOM - hate this combersomeness. I need to think...
	// 1. insert a magnify icon
	// 2. get the image url to pass to an ImageView
	// 3. dump the whole content in content container div to dispaly
	
	var div = document.createElement('div');
	div.innerHTML = str;

/*	add button on multiple images
	var assetContainers = div.getElementsByClassName('mine_asset');
	for (var i = 0; i < assetContainers.length; i++) {
		var icon = document.createElement('div');
		icon.className = 'magnify';
		icon.id = 'magnify'+i;
		assetContainers[i].appendChild(icon);
	}
	
	Use a single image-only for now
*/
	if(div.getElementsByClassName('mine_image')[0] || div.getElementsByClassName('mine_asset')[0]) {		
		var assetContainer = (div.getElementsByClassName('mine_image')[0] || div.getElementsByClassName('mine_asset')[0]);
		
		if(assetContainer.getElementsByTagName('img')[0]) {
			var image = assetContainer.getElementsByTagName('img')[0];
		 	var imageUrl = image.src;
			
			//adding an icon
			var icon = document.createElement('div');
			icon.className = 'magnify hide';
			icon.id = 'magnify0';
			assetContainer.appendChild(icon);
			
			// preload the image 
			imgObj = new Image();
			imgObj.src = imageUrl;
			
			// Display the content
			document.getElementById("content").appendChild(div);
			
			// add a listener to the button
			var that = this;
			document.getElementById('magnify0').addEventListener('click', function(event){ that.viewFullsizeImage(imageUrl) }, false);
			
			imgObj.onload = function() {
				icon.removeClassName('hide');
				document.getElementById("loading").style.display = 'none';
			}
			
		} else {
			// Display the content
			document.getElementById("loading").style.display = 'none';
			this.controller.get("content").appendChild(div);
		}
	} else {
		// Display the content
		document.getElementById("loading").style.display = 'none';
		this.controller.get("content").appendChild(div);
	}
}

ContentAssistant.prototype.viewFullsizeImage = function(url) {
	this.controller.stageController.pushScene('imageviewer', url);
}

ContentAssistant.prototype.activate = function(event) {
	this.controller.get("date").innerHTML = this.feed.date;
	this.controller.get("loading").innerHTML = "Loading...";
	this.displayContent(this.feed.content);
}

// Save (Local DB)
ContentAssistant.prototype.updateTables = function(db,feed) {	
	db.transaction( 
        (function (transaction) { 
            transaction.executeSql('INSERT INTO myBookmarks (title, date, content, url, icon) VALUES (?,?,?,?,?)', [feed.title, feed.date, str, feed.url, feed.icon], this.createRecordDataHandler.bind(this), this.errorHandler.bind(this)); 
        }).bind(this) 
    ); 
}

ContentAssistant.prototype.errorHandler = function(transaction, error) { 
    console.log('*** DB Create Error: '+error.message+' (Code '+error.code+')'); 
    return true;
}

ContentAssistant.prototype.createRecordDataHandler = function(transaction, results) 
{
	console.log("**** Inserted 1 record");
} 


ContentAssistant.prototype.deactivate = function(event) {
	// remove the appended content, so that it doesn't keep adding a child node to "content" each time the page is called
	var element = document.getElementById("content");
	while (element.firstChild) {
	  element.removeChild(element.firstChild);
	}
}

ContentAssistant.prototype.cleanup = function(event) {
}
