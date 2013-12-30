
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
				if ((w/4)>(h/3)) {
					hc=h;
					wc=(hc*4)/3;
					x=Math.round((w-wc)/2);
					y=0;
				} else {
					wc=w;
					hc=(wc*3)/4;
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
	$('#kategoricontainer input:checked').each(function(i,cb){
		$(cb).removeAttr('checked');
	})
	$('#txt_title').val('');
	$('#txt_metin').val('');
	$('#resimsec').html('');
	$('#resimsec').append('<label for="txt_image"> <strong>İçerik Resmi</strong></label><input type="file" title="Dosya Seçiniz" id="txt_image"><img id="loaded" style="max-width:150px;max-height:150px">');
	setjapi(tw,th);
}


function save(){
	var cats=[];
	$('#kategoricontainer input:checked').each(function(i,cb){
		cats.push(cb.value);
	})
	if ((getOValue('txt_title').trim()!='') && (getOValue('txt_metin').trim()!='') && (cats.length>0)) {
		postData('/adm/ajax',{job:'save',title:getOValue('txt_title'),metin:getOValue('txt_metin'),img:$('#loaded').attr('src'),area:JSON.stringify(sa),turler:JSON.stringify(cats)},function(retVal){
			$('#haber').modal('hide');
			list();
		});
	} else {
		alert('Lütfen İçerik Başlığı ve İçerik Metni girdikten sonra en az bir adet İçerik Türü seçiniz !');
	}
}

function list(){
	postData('/adm/ajax',{job:'list',cat:getOValue('lst_kategori')},function(retVal){
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
	postData('/adm/content',{job:'get',id:id},function(retVal){
		console.log(retVal);
		$('#haber').modal();
		$('#txt_title').val(retVal.title);
		$('#txt_metin').val(retVal.body);
		$('#kategoricontainer input').each(function(i,cb){
			if (retVal.categories.indexOf(cb.value)>-1){
				$(cb).attr('checked','');
			}
		});
		$('#resimsec').html('<img src="/adm/content/getimg/'+retVal.imgtype+'/'+retVal.img+'">');
	});
}


function news_delete(id){
	postData('/adm/content',{job:'delete',id:id},function(retVal){
		list();
	});
}

list();