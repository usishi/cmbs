CMBS
===
Content Management Bootstrap

You can easily manage your website's contents and galleries


Install
```bash
npm install cmbs
```

Usage : 

in your main "js" 

```javascript
	app.use('/adm',ubs({
		categories:['News','Technology','Cars'],
		galleries:['Cars','Cities'],
		bsjs:'/static/js/bootstrap.min.js',
		bscss:'/static/css/bootstrap.min.css',
		jqjs:'/static/js/jquery-1.9.1.js'
	}));
```