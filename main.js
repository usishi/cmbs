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

module.exports = function(options) {

	if (options.datafolder==undefined){
		options.datafolder=__dirname+'/db';
	}

	fs.mkdir(options.datafolder,function(e1){
		fs.mkdir(options.datafolder+'/content',function(e2){
			fs.mkdir(options.datafolder+'/gallery',function(e3){});		
		});
	});
	
	
	
	var db = new Datastore({ filename: options.datafolder+'/ubs.nedb', autoload: true });
	var dbgal = new Datastore({ filename: options.datafolder+'/gal.nedb', autoload: true });

	if (options.bsjs==undefined){
		options.bsjs='/static/js/bootstrap.js';
	}
	if (options.jqjs==undefined){
		options.jqjs='/static/js/jquery.js';
	}
	if (options.bscss==undefined){
		options.bscss='/static/css/bootstrap.min.css';
	}
  if (options.thumbsizes==undefined){
  	options.thumbsizes={content:{w:120,h:90},gallery:{w:100,h:100}};
  }
  return function(req, res, next) {
  	if (req.url.indexOf('/files')>-1){ //static files
  		var fname=__dirname+'/files/'+req.url.replace('/files/','');
  		res.setHeader('Content-Type', mime.lookup(fname));
  		res.end(fs.readFileSync(fname, 'utf8'));
  	} else {
  		switch (req.url){
	  		case '/newslist' :
	  			jade.renderFile(__dirname+'/jades/newslist.jade',{options:options,pjson:{name:"projeismi"}},function (err, html) {
						res.end(html);
						console.log("ok");
					});
	  		break;
	  		case '/gallist' :
	  			jade.renderFile(__dirname+'/jades/galeri.jade',{options:options,pjson:{name:"projeismi"}},function (err, html) {
						res.end(html);
						console.log("ok");
					});
	  		break;
	  		case '/ajax' : 
	  			switch(req.body.job){
	  				case 'save' : 
	  					var imgid=uuid.v4();
	  					var pos=req.body.img.indexOf(';');
	  					var buf = new Buffer(req.body.img.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
	  					var imgtype=req.body.img.substring(11,pos);
	  					var fname=options.datafolder+'/content/'+imgid+'.'+imgtype;
	  					var tname= options.datafolder+'/content/t_'+imgid+'.'+imgtype;
	  					fs.writeFileSync(fname,buf);
	  					var crop=JSON.parse(req.body.area);
	  					var resize=spawn('convert',[fname,'-crop',crop.w+'x'+crop.h+'+'+crop.x+'+'+crop.y,tname],{cwd:options.datafolder+'/content'});
      				resize.on('exit',function(estat){
      					console.log(estat);
      					sendReturn(res,estat);
      					if (estat==0){
	      					var content={};
	      					content.title=req.body.title;
	      					content.img=imgid;
	      					content.imgtype=imgtype;
	      					content.categories=JSON.parse(req.body.turler);
	      					content.tarih=new Date();
	      					content.enabled=false;
	      					db.insert(content,function(e,d){
	      						console.log(e);
	      					});
      					}
      				});
	  				break;
	  				case 'savegal' : 
	  					var imgid=uuid.v4();
	  					var pos=req.body.img.indexOf(';');
	  					var buf = new Buffer(req.body.img.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
	  					var imgtype=req.body.img.substring(11,pos);
	  					var fname=options.datafolder+'/galeri/'+imgid+'.'+imgtype;
	  					var tname= options.datafolder+'/galeri/t_'+imgid+'.'+imgtype;
	  					fs.writeFileSync(fname,buf);
	  					var crop=JSON.parse(req.body.area);
	  					var resize=spawn('convert',[fname,'-crop',crop.w+'x'+crop.h+'+'+crop.x+'+'+crop.y,tname],{cwd:options.datafolder+'/galeri'});
      				resize.on('exit',function(estat){
      					console.log(estat);
      					sendReturn(res,estat);
      					if (estat==0){
	      					var content={};
	      					content.title=req.body.title;
	      					content.img=imgid;
	      					content.imgtype=imgtype;
	      					content.categories=JSON.parse(req.body.turler);
	      					content.tarih=new Date();
	      					content.enabled=false;
	      					dbgal.insert(content,function(e,d){
	      						console.log(e);
	      					});
      					}
      				});
	  				break;
	  				case 'list' : 
	  					db.find({categories:req.body.cat},function(e,docs){
	  						sendReturn(res,docs);
	  					})
	  				break;

	  				case 'listgal' : {
	  					dbgal.find({categories:req.body.cat},function(e,docs){
	  						sendReturn(res,docs);
	  					})
	  				}
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
	  				case 'getgal' : 
	  					dbgal.findOne({_id:req.body.id},function(e,doc){
	  						console.log(e);
	  						sendReturn(res,doc);
	  					});
	  				break;
	  				case 'delete':
	  					db.findOne({_id:req.body.id},function(e,doc){
	  						fs.unlink(options.datafolder+'/content/'+doc.img+'.'+doc.imgtype);
	  						fs.unlink(options.datafolder+'/content/t_'+doc.img+'.jpg');
	  						db.remove({_id:req.body.id},function(e2,n){
	  							sendReturn(res,'ok');
	  						});
	  					});
	  				break;
	  				case 'deletegal':
	  					dbgal.findOne({_id:req.body.id},function(e,doc){
	  						fs.unlink(options.datafolder+'/galeri/'+doc.img+'.'+doc.imgtype);
	  						fs.unlink(options.datafolder+'/galeri/t_'+doc.img+'.jpg');
	  						dbgal.remove({_id:req.body.id},function(e2,n){
	  							sendReturn(res,'ok');
	  						});
	  					});
	  				break;
	  			}
	  		break;
	  		default : 
	  		  if(req.url.indexOf('/content/getthumb/')>-1){
	  		  	var file = req.url.replace('/content/getimage/',options.datafolder+'/content/t_')+'.jpg';
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = 'image/jpeg';
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  } if(req.url.indexOf('/gallery/getthumb/')>-1){
	  		  	var file = req.url.replace('/gallery/getimage/',options.datafolder+'/galeri/t_')+'.jpg';
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = 'image/jpeg';
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  } 
	  		  if(req.url.indexOf('/gallery/getimg/')>-1){
	  		  	var icerik=req.url.replace('/gallery/getimg/','').split('/');
	  		  	var file = options.datafolder+'/galeri/'+icerik[1]+'.'+icerik[0];
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = 'image/jpeg';
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  } if(req.url.indexOf('/content/getimg/')>-1){
	  		  	var icerik=req.url.replace('/content/getimg/','').split('/');
	  		  	var file = options.datafolder+'/content/'+icerik[1]+'.'+icerik[0];
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = 'image/jpeg';
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