var jade = require('jade'),
	mime = require('mime'),
	uuid = require('node-uuid'),
	spawn = require('child_process').spawn,
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
	  		case '/ajax' : 
	  			switch(req.body.job){
	  				case 'save' : 
	  					fname=__dirname+'/db/'+uuid.v4();
	  					fs.writeFileSync(fname+'.b64',req.body.img);
	  					var crop=JSON.parse(req.body.area);
	  					var resize=spawn('convert',['inline:'+fname+'.b64','-crop',crop.w+'x'+crop.h+'+'+crop.x+'+'+crop.y,fname+'.png'],{cwd:'db'});
      				resize.on('exit',function(estat){
      					fs.unlink(fname+'.b64');
      					//burdan dvm
      				});
	  				break;
	  			}
	  		break;
	  		default : next(); break;
	  	}
  	}
  }
};