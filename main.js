var jade = require('jade'),
	mime = require('mime'),
	uuid = require('node-uuid'),
	spawn = require('child_process').spawn,
	fs = require('fs'),
	Datastore = require('nedb');
  
var isObject = function(a) {
    return (!!a) && (a.constructor === Object);
  }  
var sendReturn = function(res,returnVal) {
    if (res.getHeader('content-type')==undefined){
      res.contentType('application/json');
    } 
    if (isObject(returnVal)){
      res.send(JSON.stringify(returnVal));
    } else {
      res.send(returnVal);
    }
  }  

module.exports = function(ubsoptions) {
	db = new Datastore({ filename: __dirname+'/db/ubs.nedb', autoload: true });

	if (ubsoptions.bsjs==undefined){
		ubsoptions.bsjs='/static/js/bootstrap.js';
	}
	if (ubsoptions.jqjs==undefined){
		ubsoptions.jqjs='/static/js/jquery.js';
	}
	if (ubsoptions.bscss==undefined){
		ubsoptions.bscss='/static/css/bootstrap.min.css';
	}

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
      					sendReturn(res,estat);
      					if (estat==0){
      						fs.unlink(fname+'.b64');
	      					var content={};
	      					content.title=req.body.title;
	      					content.body=req.body.metin;
	      					content.img=fname.replace(__dirname+'/db/','');
	      					content.categories=JSON.parse(req.body.turler);
	      					content.tarih=new Date();
	      					content.enabled=false;
	      					db.insert(content,function(e,d){
	      						console.log(e);
	      					});
      					}
      				});
	  				break;
	  				case 'list' : 
	  					db.find({categories:req.body.cat},function(e,docs){
	  						console.log(e);
	  						sendReturn(res,docs);
	  					})
	  				break;
	  			}
	  		break;
	  		case '/content' : 
	  			switch(req.body.job){
	  				case 'get' : 
	  					db.findOne({_id:req.body.id},function(e,doc){
	  						console.log(e);
	  						sendReturn(res,doc);
	  					});
	  				break;
	  				case 'delete':
	  					db.findOne({_id:req.body.id},function(e,doc){
	  						var file = __dirname+'/db/'+doc.img+'.png';		
	  						fs.unlink(file);
	  						db.remove({_id:req.body.id},function(e2,n){
	  							sendReturn(res,'ok');
	  						});
	  					});
	  				break;
	  			}
	  		break;
	  		default : 
	  		  if(req.url.indexOf('/content/getimage/')>-1){
	  		  	var file = req.url.replace('/content/getimage/',__dirname+'/db/')+'.png';
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = 'image/png';
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  } else {
	  		  	next(); 	
	  		  } 
	  		break;
	  	}
  	}
  }
};