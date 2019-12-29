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





	// /* ----------------- Size Add -------------------- */
	// $("#addSzBtn").click(function(e) {
	// 	$("#addSzForm").toggle();
	// })
	// /* ----------------- Size Add -------------------- */

	// /* ----------------- Size Del -------------------- */
	// $(".shieldSzBtn").click(function(e) {
	// 	$('.shieldSzDel').toggle();
	// })
	// $('.del').click(function(e) {
	// 	let target = $(e.target)
	// 	let size = target.data('size')
	// 	let fatherElem = $('.size-' + size)
	// 	$.ajax({
	// 		type: 'DELETE',
	// 		url: '/bsSizeDelAjax?size=' + size
	// 	})
	// 	.done(function(results) {
	// 		if(results.success === 1) {
	// 			if(fatherElem.length > 0) {
	// 				fatherElem.remove()
	// 			}
	// 		}
	// 		if(results.success === 0) {
	// 			alert(results.info)
	// 		}
	// 	})
	// })
	// /* ----------------- Size Del -------------------- */
})