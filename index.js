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
		options.datafolder=__dirname+'/data';
	}

	fs.mkdir(options.datafolder,function(e1){
		fs.mkdir(options.datafolder+'/content',function(e2){
			fs.mkdir(options.datafolder+'/gallery',function(e3){
				fs.mkdir(options.datafolder+'/richmedia',function(e4){

				});
			});		
		});
	});
		
	var db = new Datastore({ filename: options.datafolder+'/ubs.nedb', autoload: true });
	var dbgal = new Datastore({ filename: options.datafolder+'/gal.nedb', autoload: true });
	var dbmedia = new Datastore({ filename: options.datafolder+'/media.nedb', autoload: true });
	var dbrc = new Datastore({ filename: options.datafolder+'/pages.nedb', autoload: true });
	dbrc.persistence.setAutocompactionInterval(3);

  if (options.thumbsizes==undefined){
  	options.thumbsizes={content:{w:120,h:90},gallery:{w:100,h:100}};
  }
  return function(req, res, next) {
  	if (req.url.indexOf('/files')>-1){ //static files
  		var fname=__dirname+'/files/'+req.url.replace('/files/','');
  		fs.stat(fname, function (err, stat) {
        var file = fs.readFileSync(fname);
        res.contentType =  mime.lookup(fname);
        res.contentLength = stat.size;
        res.end(file, 'binary');
      });
  	} else {
  		switch (req.url){
	  		case '/newslist' :
	  			jade.renderFile(__dirname+'/jades/newslist.jade',{options:options,pjson:{name:"projeismi"}},function (err, html) {
	  				if ((options.categories==undefined) || (options.categories.length<1)){
	  					res.end('content categories not defined');
	  				} else {
	  					res.end(html);	
	  				}
						
					});
	  		break;
	  		case '/gallist' :
	  			jade.renderFile(__dirname+'/jades/gallery.jade',{options:options,pjson:{name:"projeismi"}},function (err, html) {
	  				if ((options.galleries==undefined) || (options.galleries.length<1)){
	  					res.end('gallery list not defined');
	  				} else {
	  					res.end(html);	
	  				}
					});
	  		break;
	  		case '/rclist' :
	  			jade.renderFile(__dirname+'/jades/richcontent.jade',{options:options,pjson:{name:"projeismi"}},function (err, html) {
	  				if ((options.richcontents==undefined) || (options.richcontents.length<1)){
	  					res.end('richcontents not defined');
	  				} else {
	  					res.end(html);	
	  				}
					});
	  		break;
	  		case '/ajax' : 
	  			switch(req.body.job){
	  				case 'save' : 
	  					var imgid=uuid.v4();
	  					if (req.body.id==''){
		  					var pos=req.body.img.indexOf(';');
		  					var buf = new Buffer(req.body.img.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
		  					var imgtype=req.body.img.substring(11,pos);
		  					var fname=options.datafolder+'/content/'+imgid+'.'+imgtype;
		  					var tname= options.datafolder+'/content/t_'+imgid+'.jpg';
		  					fs.writeFileSync(fname,buf);
		  					var crop=JSON.parse(req.body.area);
		  					var resize=spawn('convert',[fname,'-crop',crop.w+'x'+crop.h+'+'+crop.x+'+'+crop.y,'-resize',options.thumbsizes.content.w+'x'+options.thumbsizes.content.h,tname],{cwd:options.datafolder+'/content'});
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
		      					content.metin=req.body.metin;
		      					db.insert(content,function(e,d){
		      						res.end('ok');
		      					});
	      					}
	      				});
	      			} else {
	      				db.findOne({_id:req.body.id},function(e,doc){
	  							doc.title=req.body.title;
	  							doc.categories=JSON.parse(req.body.turler);
	  							doc.tarih=new Date();
	  							doc.metin=req.body.metin;
	      					db.update(doc,function(e2,d){
	      						res.end('ok');
	      					});
	  						});
	      			}
	  				break;
	  				case 'savegal' : 
	  					var imgid=uuid.v4();
	  					var pos=req.body.img.indexOf(';');
	  					var buf = new Buffer(req.body.img.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
	  					var imgtype=req.body.img.substring(11,pos);
	  					var fname=options.datafolder+'/gallery/'+imgid+'.'+imgtype;
	  					var tname= options.datafolder+'/gallery/t_'+imgid+'.jpg';
	  					fs.writeFileSync(fname,buf);
	  					var crop=JSON.parse(req.body.area);
	  					var resize=spawn('convert',[fname,'-crop',crop.w+'x'+crop.h+'+'+crop.x+'+'+crop.y,'-resize',options.thumbsizes.gallery.w+'x'+options.thumbsizes.gallery.h,tname],{cwd:options.datafolder+'/gallery'});
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
	      						res.end('ok');
	      					});
      					}
      				});
	  				break;
	  				case 'savemedia' : 
	  					var imgid=uuid.v4();
	  					var pos=req.body.img.indexOf(';');
	  					var buf = new Buffer(req.body.img.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
	  					var imgtype=req.body.img.substring(11,pos);
	  					var fname=options.datafolder+'/richmedia/'+imgid+'.'+imgtype;
	  					var tname= options.datafolder+'/richmedia/t_'+imgid+'.jpg';
	  					fs.writeFileSync(fname,buf);
	  					var crop=JSON.parse(req.body.area);
	  					var resize=spawn('convert',[fname,'-crop',crop.w+'x'+crop.h+'+'+crop.x+'+'+crop.y,'-resize',options.thumbsizes.content.w+'x'+options.thumbsizes.content.h,tname],{cwd:options.datafolder+'/richmedia'});
      				resize.on('exit',function(estat){
      					console.log(estat);
      					sendReturn(res,estat);
      					if (estat==0){
	      					var content={};
	      					content.title=req.body.title;
	      					content.img=imgid;
	      					content.imgtype=imgtype;
	      					content.tarih=new Date();
	      					dbmedia.insert(content,function(e,d){
	      						res.end('ok');
	      					});
	      					
      					}
      				});
	  				break;
	  				case 'saverc' : 
	  					var content={};
	  					content.name=req.body.name;
    					content.title1=req.body.title1;
    					content.title2=req.body.title2;
    					content.image=req.body.img;
    					content.summary=req.body.summary;
    					content.html=req.body.html;
    					content.tarih=new Date();
    					dbrc.update({name:req.body.name},content,{upsert:true},function(e,d){
    						res.end('ok');
    					});

	  				break;
	  				case 'list' : 
	  					db.find({categories:req.body.cat},function(e,docs){
	  						sendReturn(res,docs);
	  					})
	  				break;
	  				case 'listgal' : 
	  					dbgal.find({categories:req.body.cat},function(e,docs){
	  						sendReturn(res,docs);
	  					})
	  				break;
	  				case 'listmedia' : 
	  					dbmedia.find({},function(e,docs){
	  						sendReturn(res,docs);
	  					})
	  				break;
	  				case 'getrc':
	  					dbrc.findOne({name:req.body.name},function(e,doc){
	  						sendReturn(res,doc);
	  					});
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
	  						fs.unlink(options.datafolder+'/gallery/'+doc.img+'.'+doc.imgtype);
	  						fs.unlink(options.datafolder+'/gallery/t_'+doc.img+'.jpg');
	  						dbgal.remove({_id:req.body.id},function(e2,n){
	  							sendReturn(res,'ok');
	  						});
	  					});
	  				break;
	  				case 'deletemedia' :
	  					dbmedia.findOne({_id:req.body.id},function(e,doc){
	  						fs.unlink(options.datafolder+'/richmedia/'+doc.img+'.'+doc.imgtype);
	  						fs.unlink(options.datafolder+'/richmedia/t_'+doc.img+'.jpg');
	  						dbmedia.remove({_id:req.body.id},function(e2,n){
	  							sendReturn(res,'ok');
	  						});
	  					});
	  				break;
	  			}
	  		break;
	  		default :
	  		  if(req.url.indexOf('/content/getthumb/')>-1){
	  		  	var file = req.url.replace('/content/getthumb/',options.datafolder+'/content/t_')+'.jpg';
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = 'image/jpeg';
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  } else if(req.url.indexOf('/gallery/getthumb/')>-1){
	  		  	var file = req.url.replace('/gallery/getthumb/',options.datafolder+'/gallery/t_')+'.jpg';
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = 'image/jpeg';
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  }  else if(req.url.indexOf('/media/getthumb/')>-1){
	  		  	var file = req.url.replace('/media/getthumb/',options.datafolder+'/richmedia/t_')+'.jpg';
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = 'image/jpeg';
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  }  else if(req.url.indexOf('/gallery/getimg/')>-1){
	  		  	var icerik=req.url.replace('/gallery/getimg/','').split('/');
	  		  	var file = options.datafolder+'/gallery/'+icerik[1]+'.'+icerik[0];
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = mime.lookup(file);
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  } else if(req.url.indexOf('/content/getimg/')>-1){
	  		  	var icerik=req.url.replace('/content/getimg/','').split('/');
	  		  	var file = options.datafolder+'/content/'+icerik[1]+'.'+icerik[0];
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = mime.lookup(file);
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  } else if(req.url.indexOf('/media/getimg/')>-1){
	  		  	var icerik=req.url.replace('/media/getimg/','').split('/');
	  		  	var file = options.datafolder+'/richmedia/'+icerik[1]+'.'+icerik[0];
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                res.contentType = mime.lookup(file);
                res.contentLength = stat.size;
                res.end(img, 'binary');
            });
	  		  } else {
	  		  	console.log(req.url); 
	  		  	next(); 	
	  		  } 
	  		break;
	  	}
  	}
  }
};