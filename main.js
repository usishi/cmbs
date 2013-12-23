var jade = require('jade'),
	mime = require('mime'),
	fs = require('fs');

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
  	if (req.url.indexOf('/files')>-1){
  		console.log("file : "+req.url);
  		var fname=__dirname+'/files/'+req.url.replace('/files/','');
  		res.setHeader('Content-Type', mime.lookup(fname));
  		res.end(fs.readFileSync(fname, 'utf8'));
  	} else {
  		console.log("url : "+req.url);
  		switch (req.url){
	  		case '/newslist' :
	  			jade.renderFile(__dirname+'/jades/newslist.jade',{ubsoptions:ubsoptions,pjson:{name:"projeismi"}},function (err, html) {
						res.end(html);
						console.log("ok");
					});
	  		break;
	  		default : next(); break;
	  	}
  	}
  }
};