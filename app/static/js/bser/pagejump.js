$( function() {
	$("#bsOrdHis").click(function(e) {
		window.location.href='/bsOrdHis'
	})
	$("#bsMacHis").click(function(e) {
		window.location.href='/bsMacHis'
	})
	$("#bsTinHis").click(function(e) {
		window.location.href='/bsTinHis'
	})

	$("#bsMacs").click(function(e) {
		window.location.href='/bsMacs'
	})
	$("#bsTins").click(function(e) {
		window.location.href='/bsTins'
	})
	$("#bsOrds").click(function(e) {
		window.location.href='/bsOrds'
	})

	/* ============= 页面滚动 三级导航事件 ============= */
	var p=0, t=0;
	$(window).scroll(function(event){
		p=$(this).scrollTop();
		if(t<p){
			$(".scrollNav").hide();
			// setTimeout(function(){ $(".secNav").hide(); }, 50)
			
		}else{
			// $(".secNav").show();
			$(".scrollNav").show();
		}
		setTimeout(function(){ t = p ; },0)
	});
	/* ============= 页面滚动 三级导航事件 ============= */
} );