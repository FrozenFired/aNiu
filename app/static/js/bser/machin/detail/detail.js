$(function() {
	/* ======== 点击导航按钮 ======== */
	$(".macNav").click(function(e) {
		let id = $(this).attr('id')
		$(".macNav").removeClass("btn-info");
		$(".macNav").addClass("btn-secondary");

		$(this).removeClass("btn-secondary")
		$(this).addClass("btn-info")

		$(".macCont").hide();
		$(".mac"+id).show();
	})
	/* ======== 点击导航按钮 ======== */
})