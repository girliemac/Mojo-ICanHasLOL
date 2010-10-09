function AllsitesAssistant() {

}

AllsitesAssistant.prototype.setup = function() {
	// System Menu	
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, Lol.commandMenuModel);
	
	// Spinner
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('splash', {spinnerSize: 'large'}, this.spinnerModel);
	
	
	//* Two Lists - 1) Featured 2) All Sites *** */
	
	// 1. Featured - Horizontal Scroll 
	this.list_featured = [];
   	this.list_featured_model = { items: this.list_featured };
	this.controller.setupWidget('featuredMenu', 
              {itemTemplate:'templates/hList-templ', listTemplate:'templates/hList-container-templ'},
              this.list_featured_model);
			  
	this.scrollNewModel = {mode: "horizontal"};
	var horizontalElements = $$('#listElements .scroll-top-element');
	this.scrollNewModel.snapElements = {x: horizontalElements, y: []};
	this.controller.setupWidget('featuredScroller', {}, this.scrollNewModel);
	this.generateFeatured();	
	Mojo.Event.listen(this.controller.get('featuredMenu'), Mojo.Event.listTap, this.goSite.bind(this));										 
			
											
	// 2. All sites - List
	this.list_all = [];
   	this.list_all_model = { items: this.list_all };
	this.controller.setupWidget('allsiteMenu', {
		itemTemplate: 'templates/list-desc-templ',
		dividerTemplate: 'templates/list-divider',
		dividerFunction: this.displayCategory,
		}, this.list_all_model);
	this.generateList();
	Mojo.Event.listen(this.controller.get('allsiteMenu'), Mojo.Event.listTap, this.goSite.bind(this));
	
	// Remove the spinner
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);
	this.controller.get('splashScrim').hide();
};

AllsitesAssistant.prototype.generateFeatured = function() {
	var featuredsites = [
		{sitename:'I Can Has Cheezburger?', feed:'ICanHasCheezburger'},
		{sitename:'I Has A Hotdog', feed:'IHasAHotdog'},
		{sitename:'FailBlog', feed:'failblog'},
		{sitename:'Engrish Funny', feed:'EngrishFunny'},
		{sitename:'ROFLrazzi', feed:'ROFLrazzi'},
		{sitename:'Pundit Kitchen', feed:'PunditKitchen'},
		{sitename:'Up Next In Sports', feed:'UpNextInSports'},
		{sitename:'Epicute', feed:'epicuteblog'},
	];
	for (var i=0; i<featuredsites.length; i++) {
		this.list_featured.push({
			sitename: featuredsites[i].sitename,
			feed: featuredsites[i].feed,
			thumbnail: 'images/site-thumbs/'+featuredsites[i].feed+'.png'
		});
	}
	this.controller.modelChanged(this.list_featured_model, this);
};

AllsitesAssistant.prototype.displayCategory = function(modelItem) {
	return modelItem.category;
}

AllsitesAssistant.prototype.generateList = function() {
	var lolsites = Lol.directory;
	for (var i=0; i<lolsites.length; i++) {
		this.list_all.push({
			category: lolsites[i].category,
			sitename: lolsites[i].label,
			feed: lolsites[i].value,
			description:lolsites[i].description
		});
	}
	this.controller.modelChanged(this.list_all_model, this);
};

AllsitesAssistant.prototype.goSite = function(event){
	this.controller.stageController.pushScene('menu', event.item.feed, event.item.sitename);
}

AllsitesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

AllsitesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AllsitesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
