


function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) val = "0" + val;
  return val;
};

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

function TurkceTarih(_date,mode){
   // Günler
   var weekday = new Array(7);
   weekday[1] = 'Pazar';
   weekday[2] = 'Pazartesi';
   weekday[3] = 'Salı';
   weekday[4] = 'Çarşamba';
   weekday[5] = 'Perşembe';
   weekday[6] = 'Cuma';
   weekday[7] = 'Cumartesi';
   // Aylar
   var month = new Array(12);
   month[1] = 'Ocak';
   month[2] = 'Şubat';
   month[3] = 'Mart';
   month[4] = 'Nisan';
   month[5] = 'Mayıs';
   month[6] = 'Haziran';
   month[7] = 'Temmuz';
   month[8] = 'Ağustos';
   month[9] = 'Eylül';
   month[10] = 'Ekim';
   month[11] = 'Kasım';
   month[12] = 'Aralık';

   yr_st = " 19";
   yr = _date.getYear();
   if ( yr > 99 )
   {
   yr_st =" ";
   if ( yr < 2000 ) yr += 1900;
   }
   
  switch(mode){
    case 'tarih' : return _date.getDate() + ' ' + month[_date.getMonth()+1] + ' ' + yr_st+ yr;
    case 'saat' : return pad(_date.getHours(),2) + ":" + pad(_date.getMinutes(),2) + ":" + pad(_date.getSeconds(),2);
    default : return _date.getDate() + ' ' 
          + month[_date.getMonth()+1] + ' ' 
          + yr_st+ yr + ' ' 
          + pad(_date.getHours(),2) + ":" + pad(_date.getMinutes(),2) + ":" + pad(_date.getSeconds(),2);
  }
}


function getOValue(objname) {
  var obj = document.getElementById(objname);
  if (obj){
    if (obj.type=='checkbox'){
      if (obj.checked) { return 'on';  } else { return 'off'; }
    } else {
      return document.getElementById(objname).value;   
    }
  } else {
    return null;
  }
}

function getRadioValue(radioname){
  alert($('input[name='+radioname+']:checked').val())
}

function postData(url,data,callback,timeoutms) {
  
  var reqopts = { type: 'POST',
           contentType: 'application/json',
              dataType:'json',
                  data: JSON.stringify(data),
                 cache:false
      ,success: function(data, textStatus, jqXHR) {
        callback(jQuery.parseJSON(jqXHR.responseText));
      }
      ,error  : function(e) {
        if (e.readyState==4 && e.statusText=="OK"){
          callback(e.responseText);
        } else if ((e.readyState==0) && (e.statusText=="timeout")) {
          callback("timeout");
        } else {
          callback("bad response : "+JSON.stringify(e)+'\n\n'+e.statusText);
        }
      }
  };
  
  if (timeoutms){ reqopts.timeout=timeoutms };
  $.ajax(url,reqopts);
}

function setActiveMenu(id){  
  if (id%100!=0){
    var anamenu = (Math.floor(id/100)*100);
    $('#menu'+anamenu).addClass('active').addClass('open');  
    $('#menu'+id).addClass('active');

  } else {
    $('#menu'+id).addClass('active');
  }
  
}

function getRandomString(charCount){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < charCount; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}


function bytesToSize(bytes, precision)
{  
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;
   
    if ((bytes >= 0) && (bytes < kilobyte)) {
        return bytes + ' B';
 
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        return (bytes / kilobyte).toFixed(precision) + ' KiB';
 
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        return (bytes / megabyte).toFixed(precision) + ' MiB';
 
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        return (bytes / gigabyte).toFixed(precision) + ' GiB';
 
    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TeB';
 
    } else {
        return bytes + ' Bi';
    }
}

/// Events 
$.fn.onEnterKey = function( cb ) {
  $(this).keypress(
    function( event ) {
        code = event.keyCode ? event.keyCode : event.which;
        if ( code == 13 ) {
            cb();
            return false;
        }
    } );
}

function usencode(str){
  return window.btoa(unescape(encodeURIComponent(str)));
}

function usdecode(str){
  return decodeURIComponent(escape(window.atob( str )));
}
