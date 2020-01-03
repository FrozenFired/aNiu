$(function() {
	/* ======== 点击导航按钮 ======== */
	$(".tinNav").click(function(e) {
		let id = $(this).attr('id')
		$(".tinNav").removeClass("btn-info");
		$(".tinNav").addClass("btn-secondary");

		$(this).removeClass("btn-secondary")
		$(this).addClass("btn-info")

		$(".tinCont").hide();
		$(".tin"+id).show();
	})
	/* ======== 点击导航按钮 ======== */
})