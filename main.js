var jade = require('jade');

module.exports = function(ubsoptions) {

	if (ubsoptions.bsjs==undefined){
		ubsoptions.bsjs='/static/js/bootstrap.js';
	}
	if (ubsoptions.jqjs==undefined){
		ubsoptions.jqjs='/static/js/jquery.js';
	}
	if (ubsoptions.bscss==undefined){
		ubsoptions.bscss='/static/css/bootstrap.min.css';
	}

	console.log('bune');
  return function(req, res, next) {
  	switch (req.url){
  		case '/newslist' :
  			jade.renderFile(__dirname+'/jades/dene.jade',{ubsoptions:ubsoptions,pjson:{name:"projeismi"}},function (err, html) {
					res.end(html);
				});
  		break;
  		default : next(); break;
  	}
  }
};