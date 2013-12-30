var express = require('express'),  
  ubs = require('../../main.js'),
	http      = require('http');



var app = express();

app.configure(function() {
	app.set('port',process.env.PORT || 8081);
	app.use(express.favicon());
  app.use('/static',express.static(__dirname + '/static'));
  //app.use('/static',gzip.staticGzip(__dirname + '/static', { matchType: /js/ }));
  app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
  app.use(express.bodyParser({limit:'50mb'})); 
  app.use('/adm',ubs({categories:['Haberler','Sivastan','Denemeler','Teknoloji','Buluttan Haberler'],galleries:['Arabalar'],bsjs:'/static/js/bootstrap.min.js',bscss:'/static/css/bootstrap.min.css',jqjs:'/static/js/jquery-1.9.1.js'}));
	app.use(express.cookieParser('Usishi.WebSite.2012'));
	app.use(express.session({cookie:{ maxAge:60000}}));
  app.use(express.favicon(__dirname + '/static/favicon.ico', { maxAge: 2592000000 }));
  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });
  
  app.use(app.router);  
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});