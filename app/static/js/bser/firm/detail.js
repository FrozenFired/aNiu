$(function() {
	/* ----------------- 导航 -------------------- */
	$("#wsers").click(function(e) {
		window.location.href = "/bsWsers";
	})
	$("#group").click(function(e) {
		window.location.href = "/bsGroup";
	})
	/* ----------------- 导航 -------------------- */

	/* ----------------- Color Add -------------------- */
	$("#addClBtn").click(function(e) {
		$("#addClForm").toggle();
	})
	/* ----------------- Color Add -------------------- */

	/* ----------------- Color Del -------------------- */
	$(".shieldClBtn").click(function(e) {
		$('.shieldClDel').toggle();
	})
	$('.del').click(function(e) {
		let target = $(e.target)
		let color = target.data('color')
		let fatherElem = $('.color-' + color)
		$.ajax({
			type: 'DELETE',
			url: '/bsColorDelAjax?color=' + color
		})
		.done(function(results) {
			if(results.success === 1) {
				if(fatherElem.length > 0) {
					fatherElem.remove()
				}
			}
			if(results.success === 0) {
				alert(results.info)
			}
		})
	})
	/* ----------------- Color Del -------------------- */


	/* ----------------- Color Add -------------------- */
	$("#iptColor").blur(function(e) {
		let val = $(this).val();
		$(this).val(val.replace(/\s+/g,""));
	})
	/* ----------------- Color Add -------------------- */

})