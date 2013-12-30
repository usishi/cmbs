
var japi;
var sa={};

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


function opennew(tw,th){
	$('#haber').modal();
	$('#txt_title').val('');
	$('#resimsec').html('');
	$('#resimsec').append('<label for="txt_image"> <strong>İçerik Resmi</strong></label><input type="file" title="Dosya Seçiniz" id="txt_image"><img id="loaded" style="max-width:150px;max-height:150px">');
	setjapi(tw,th);
}


function save(){
	var cats=[];
	cats.push(getOValue('lst_kategori'));
	if ((getOValue('txt_title').trim()!='')) {
		postData('/adm/ajax',{job:'savegal',title:getOValue('txt_title'),img:$('#loaded').attr('src'),area:JSON.stringify(sa),turler:JSON.stringify(cats)},function(retVal){
			$('#haber').modal('hide');
			list();
		});
	} else {
		alert('Lütfen İçerik Başlığı ve İçerik Metni girdikten sonra en az bir adet İçerik Türü seçiniz !');
	}
}

function list(){
	postData('/adm/ajax',{job:'listgal',cat:getOValue('lst_kategori')},function(retVal){
		$('#tbl').html('');
		retVal.forEach(function(itm){
			if (itm.enabled){
				$('#tbl').append('<tr class="success"><td>'+itm.title+'</td><td>'+itm.categories+'</td><td>'+itm.tarih+'</td><td><a href="javascript:news_ed(\''+itm._id+'\')" title="Yayından çıkart" ><i class="icon icon-eye-close"></i></a> <a href="javascript:news_edit(\''+itm._id+'\')" title="İçeriği Düzenle"><i class="icon icon-edit"></i></a></td></tr>');		
			} else {
				$('#tbl').append('<tr class="warning"><td>'+itm.title+'</td><td>'+itm.categories+'</td><td>'+itm.tarih+'</td><td><a href="javascript:news_ed(\''+itm._id+'\')" title="Yayına Al" ><i class="icon icon-eye-open"></i></a> <a href="javascript:news_edit(\''+itm._id+'\')" title="İçeriği Düzenle"><i class="icon icon-edit"></i></a><a href="javascript:news_delete(\''+itm._id+'\')"><i class="icon icon-trash"></i></a></td></tr>');	
			}
		})
		console.log(retVal);
	});
}

function news_ed(id){

}

function news_edit(id){
	postData('/adm/content',{job:'getgal',id:id},function(retVal){
		console.log(retVal);
		$('#haber').modal();
		$('#txt_title').val(retVal.title);
		$('#resimsec').html('<img src="/adm/gallery/getimage/'+retVal.imgtype+'/'+retVal.img+'">');
	});
}


function news_delete(id){
	postData('/adm/content',{job:'deletegal',id:id},function(retVal){
		list();
	});
}

list();