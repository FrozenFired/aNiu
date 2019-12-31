$(function() {
	/* ======== 点击导航按钮 ======== */
	$(".ordNav").click(function(e) {
		let id = $(this).attr('id')
		$(".ordNav").removeClass("btn-info");
		$(".ordNav").addClass("btn-secondary");

		$(this).removeClass("btn-secondary")
		$(this).addClass("btn-info")

		$(".ordCont").hide();
		$(".ord"+id).show();
	})
	/* ======== 点击导航按钮 ======== */
})