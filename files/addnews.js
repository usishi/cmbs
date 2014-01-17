
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


function save(){
	if ((getOValue('txt_title').trim()!='') && (getOValue('txt_metin').trim()!='') && (cats.length>0)) {
		postData('/adm/ajax',{job:'saveusernews',title:getOValue('txt_title'),metin:getOValue('txt_metin'),img:$('#loaded').attr('src'),area:JSON.stringify(sa),encodedqs=$('#encodedqs').html()},function(retVal){
			$('#giris').addClass('hide');
			$('#sonmesaj').html('İçerik kaydedilmiştir.');
		});
	} else {
		alert('Lütfen İçerik Başlığı ve İçerik Metni girdikten sonra en az bir adet İçerik Türü seçiniz !');
	}
}
