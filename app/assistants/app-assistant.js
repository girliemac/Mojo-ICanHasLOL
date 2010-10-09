/* Globals */

// Namespace
Lol = {};

// App Menu Model
Lol.commandMenuModel = {
	items: [
		{label: $L('Home'), icon: 'home', command: 'go-home'},
		{label: $L('All'), icon: 'directory', command: 'go-directory'},
		{label: $L('Favorites'), icon: 'faves', command: 'go-faves'},
		{label: $L('Preferences'), icon: 'pref', command: 'go-pref'}
		]
};

// All Sites
Lol.directory = [
	{category:'LOL', label:'I Can Has Cheezburger?', value:'ICanHasCheezburger', description:'Lolcats n Funny Pictures'},
	{category:'LOL', label:'I Has A Hotdog', value:'IHasAHotdog', description:'Loldogs n Cute Puppies'},
	{category:'LOL', label:'Very Demotivational', value:'VeryDemotivational', description:'(sorta NSFW) Work Harder, Not Smarter'},
	{category:'LOL', label:'Acting Like Animals', value:'ActingLikeAnimals', description:'Funny Animal Fails'},
	{category:'LOL', label:'Crazy Things Parents Say', value:'IHTPT', description:'Your parents told you that?'},
	{category:'LOL', label:'My First Fail', value:'MyFirstFail', description:'Funny Babies!'},
	{category:'LOL', label:'Comixed', value:'Comixed', description:'(sorta NSFW) Vertical 4 Pane Comics'},
	{category:'LOL', label:'Friends of Irony', value:'FriendsOfIrony', description:'Ironic Moments of Irony'},
	{category:'LOL', label:'Historic LOL', value:'HistoricLOLs', description:'Captioned Portraits of Yore'},
	{category:'LOL', label:'My Food Looks Funny', value:'MFLF', description:'Funny Food Photos'},
	{category:'LOL', label:'So Much Pun', value:'SoMuchPun', description:'Visual Puns and Jokes'},
	{category:'FAIL', label:'FAILBlog', value:'failblog', description:'Funny FAIL Pictures and Videos'},
	{category:'FAIL', label:'There I Fixed It', value:'ThereIFixedIt', description:'Funny Bad Repairs'},
	{category:'FAIL', label:'Engrish Funny', value:'EngrishFunny', description:'Funny Engrish pictures from around the world.'},
	{category:'FAIL', label:'Failbooking', value:'Failbooking', description:'Too Funny To Unfriend'},
	{category:'FAIL', label:'Monday Through Friday', value:'Mthruf', description:'Failing in the Workplace'},
	{category:'FAIL', label:'Learn From My Fail', value:'lfmf', description:'Life\'s Little Lessons'},
	{category:'FAIL', label:'Poorly Dressed', value:'PoorlyDressed', description:'Seriously Questionable Style Moments'},
	{category:'FAIL', label:'That Will Buff Out', value:'TWBO', description:'Cars in Funny Situations'},
	{category:'FAIL', label:'Wedinator', value:'Wedinator', description:'Your special day... is hilarious.'},
	{category:'FAIL', label:'Probably Bad News', value:'ProbablyBadNews', description:'Hilarious Headlines and News Fails'},
	{category:'POP CULTURE', label:'ROFLrazzi', value:'ROFLrazzi', description:'Lol Celebs and All That\'s Fab Funny in Showbiz'},
	{category:'POP CULTURE', label:'GraphJam', value:'GraphJam', description:'Music & Culture for People Who Love Charts'},
	{category:'POP CULTURE', label:'Up Next In Sports', value:'UpNextInSports', description:'Sports Commentary in Captions'},
	{category:'POP CULTURE', label:'Pundit Kitchen', value:'PunditKitchen', description:'Lol News and Lol Politics Fun '},
	{category:'POP CULTURE', label:'Totally Looks Like', value:'TotallyLooksLike', description:'Stuff That Looks Like Other Stuff'},
	{category:'WTF?', label:'Picture Is Unrelated', value:'PictureIsUnrelated', description:'(sorta NSFW) Funny WTF Pictures'},
	{category:'WTF?', label:'This Is Photobomb', value:'ThisIsPhotobomb', description:'(sorta NSFW) Surprise! Ruined Photos'},
	{category:'WTF?', label:'Hawtness', value:'Hawtness', description:'(NSFW) Lovely Ladies of WTF'},
	{category:'WTF?', label:'Autocomplete Me', value:'AutocompleteMe', description:'Funny Search Suggestions'},
	{category:'WTF?', label:'Lovely Listing', value:'LovelyListing', description:'Strange Findings in Real Estate Listings'},
	{category:'WTF?', label:'Things That Are Doing It', value:'TTARDI', description:'(sorta NSFW) I See Naked People'},
	{category:'WTF?', label:'Ugliest Tattoos', value:'UgliestTattoos', description:'(sorta NSFW) Regrettable Tattoos'},
	{category:'WTF?', label:'Hacked IRL', value:'Hackedirl', description:'Culture Jamming Wins'},
	{category:'WTF?', label:'Art of Trolling', value:'AOT', description:'Messages from the Padded Inbox'},
	{category:'WTF?', label:'Oddly Specific', value:'OddlySpecific', description:'Funny Signs'},
	{category:'WTF?', label:'Derp', value:'herpthederp', description:'All the Derp Durr Hurr that\'s fit to Derp'},
	{category:'WIN', label:'It Made My Day', value:'ItMadeMyDay', description:'Little Moments of Win!'},
	{category:'WIN', label:'EpicWinFTW', value:'EpicWinFTW', description:'Pure Win Photos'},
	{category:'WIN', label:'Once Upon A Win', value:'OnceUponAWin', description:'Epic Wins from the Past'},
	{category:'CUTE', label:'Babysaur', value:'Babysaur', description:'Cute Stuff For Kids '},
	{category:'CUTE', label:'Daily Squee', value:'DailySquee', description:'So cute your brain might explode'},
	{category:'CUTE', label:'Epicute', value:'epicuteblog', description:'The Cute Food Blog'},
	{category:'CUTE', label:'Must Have Cute', value:'MustHaveCute', description:'See. Want. Must Have!'}
];

// Twitter Oauth
Lol.twitterConsumerKeys = {
	consumer_key: 'IBCnMJS7FoxqWpn7GOQ4mQ',
	consumer_key_secret: 'wUHuRHRlpXFWAKds5Fjx3z0cbpmfsqRpldGJwEMiuhw'
};

// DB
Lol.db;



function AppAssistant(controller) {
}

AppAssistant.prototype.setup = function() {      
	//Open a database when app started
	try {
		Lol.db = openDatabase('lolDB', '1.0', 'LOL DB', 250000);
		console.log("**** Created database:" +Lol.db);
		this.CreateTable(Lol.db);
	} catch (e){
		console.log(e);		
	}        
}
AppAssistant.prototype.CreateTable = function (db){
	db.transaction( 
	    (function (transaction) { 
		//transaction.executeSql("DROP TABLE myBookmarks", [], this.createTableDataHandler.bind(this), this.errorHandler.bind(this));
	          transaction.executeSql('CREATE TABLE IF NOT EXISTS myBookmarks(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT, date TEXT, content TEXT, url TEXT, icon TEXT);', [], this.createTableDataHandler.bind(this), this.errorHandler.bind(this)); 
		}).bind(this) 
    );
}

AppAssistant.prototype.createTableDataHandler = function(transaction, results) {
	console.log("*** Created myBookmarks.");
} 

AppAssistant.prototype.errorHandler = function(transaction, error) { 
	Mojo.Controller.errorDialog("Database Error");
    //console.log('*** DB Create Error: '+error.message+' (Code '+error.code+')'); 
    return true;
}

// Cross App Launch

AppAssistant.emailLink = function(url){
	var stage = Mojo.Controller.stageController.activeScene();
	stage.serviceRequest('palm://com.palm.applicationManager', {
		method: 'open',
		parameters: {
			id: 'com.palm.app.email',
			params: {
				uri: 'mailto:?subject=You Can Has LOL!&body=Check out this link that I found using "ICanHasLOL for Palm webOS"!\r\r'+url
			}
		}
	})
};

AppAssistant.smsLink = function(url){
	var stage = Mojo.Controller.stageController.activeScene();
	stage.serviceRequest('palm://com.palm.applicationManager', {
		method: 'launch',
		parameters: {
			id: 'com.palm.app.messaging',
			params: {
				messageText: 'Found it with ICanHasLOL for webOS: ' + url
			}
		}
	})
};