
var japi;
var sa={};
var editor;

function setjapi(twidth,theight){

	$('input[type=file]').bootstrapFileInput(
		{
			onSelect:function(imgdata){

				$('.file-input-wrapper').remove();
				$('#loaded').attr('src', imgdata);

				var w = $('#loaded').context.images[0].naturalWidth;
				var h = $('#loaded').context.images[0].naturalHeight;

				var wc,hc;
				if ((w/twidth)>(h/theight)) {
					hc=h;
					wc=(hc*twidth)/theight;
					x=Math.round((w-wc)/2);
					y=0;
				} else {
					wc=w;
					hc=(wc*theight)/twidth;
					x=0;
					y=Math.round((h-hc)/2);
				}

				$('#loaded').Jcrop({
					onChange: showPreview,
					onSelect: showPreview,
				},function(){
					japi=this;
					scalefactor=w/japi.getBounds()[0];
					x2=Math.round(x/scalefactor);
					y2=Math.round(y/scalefactor);
					w2=Math.round(wc/scalefactor);
					h2=Math.round(hc/scalefactor);
					sa.w=wc;
					sa.h=hc;
					sa.sf=scalefactor;
					japi.setSelect([x2,y2,w2+x2,h2+y2]);
					japi.setOptions({ allowSelect: false,allowResize:false });
				});
			}
		}
	);
	
  function showPreview(coords)
  {
  	sa.x=coords.x*sa.sf;
  	sa.y=coords.y*sa.sf;
  }
};

function loadrc(){
	postData('/adm/ajax',{job:'getrc',name:getOValue('lst_icerik')},function(retVal){
		$('#txt_title1').val(retVal.title1);
		$('#txt_title2').val(retVal.title2);
		$('#medianamelist2').val(retVal.image);
		$('#txt_summary').val(retVal.summary);
		var editorInstance = editor.data('wysihtml5').editor;
    editorInstance.setValue(retVal.html, false);
	});
}


function opennew(tw,th){
	$('#haber').modal();
	$('#txt_title').val('');
	$('#resimsec').html('');
	$('#resimsec').append('<label for="txt_image"> <strong>İçerik Resmi</strong></label><input type="file" title="Dosya Seçiniz" id="txt_image"><img id="loaded" style="max-width:150px;max-height:150px">');
	setjapi(tw,th);
}

function savemedia(){
	if (getOValue('txt_title').trim()!='') {
		postData('/adm/ajax',{job:'savemedia',title:getOValue('txt_title'),img:$('#loaded').attr('src'),area:JSON.stringify(sa)},function(retVal){
			$('#haber').modal('hide');
			listmedia();
		});
	} else {
		alert('Lütfen Resim İsmi giriniz !');
	}
}

function saverc(){
	postData('/adm/ajax',{job:'saverc',name:getOValue('lst_icerik'),
				title1:getOValue('txt_title1'),
				title2:getOValue('txt_title2'),
				img:getOValue('medianamelist2'),
				summary:getOValue('txt_summary'),
				html:$('#txt_metin').val()
		},function(retVal){
			$('#haber').modal('hide');
			loadrc();
		}
	);
}

function listmedia(){
	postData('/adm/ajax',{job:'listmedia'},function(retVal){
		$('#medialist').html('');
		retVal.forEach(function(itm){
			$('#medialist').append('<div class="span6"><img src="/adm/media/getthumb/'+itm.img+'"/><br>'+itm.title+'</div>');
			$('#medianamelist').append('<option value="/adm/media/getimg/'+itm.imgtype+'/'+itm.img+'">'+itm.title+'</option>');
			$('#medianamelist2').append('<option value="'+itm.img+'">'+itm.title+'</option>');
		});
	});
}

$(document).ready(function() {
	editor=$('#txt_metin').wysihtml5({
        "stylesheets": ["/adm/files/wysiwyg-color.css"],
        "size": 'small',
        "html": true,
        "format-code": true
  });
	listmedia();
	loadrc();
  
});