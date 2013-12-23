var japi;

function setjapi(){

	$('input[type=file]').bootstrapFileInput(
		{
			onSelect:function(imgdata){

				$('.file-input-wrapper').remove();
				$('#loaded').attr('src', imgdata);

				var w = $('#loaded').context.images[0].naturalWidth;
				var h = $('#loaded').context.images[0].naturalHeight;

				var wc,hc;
				if ((w/4)>(h/3)) {
					console.log("YATAY");
					hc=h;
					wc=(hc*4)/3;
					x=Math.round((w-wc)/2);
					y=0;
				} else {
					console.log("DİKEY");
					wc=w;
					hc=(wc*3)/4;
					x=0;
					y=Math.round((h-hc)/2);
				}
				japi = $.Jcrop('#loaded');
				scalefactor=w/japi.getBounds()[0];
				console.log(scalefactor);
				x2=Math.round(x/scalefactor);
				y2=Math.round(y/scalefactor);
				w2=Math.round(wc/scalefactor);
				h2=Math.round(hc/scalefactor);
				console.log(japi.getBounds());
				console.log(x2+'--'+y2+'--'+w2+'--'+h2);
				japi.setSelect([x2,y2,w2,h2]);
				japi.setOptions({ allowSelect: false,allowResize:false });

			}
		}
	);
	
  function showPreview(coords)
  {

  }
};


function opennew(){
	$('#haber').modal();
	$('#resimsec').html('');
	$('#resimsec').append('<label for="txt_image"> <strong>İçerik Resmi</strong></label><input type="file" title="Dosya Seçiniz" id="txt_image"><img id="loaded" style="max-width:150px;max-height:150px">');
	setjapi();
}