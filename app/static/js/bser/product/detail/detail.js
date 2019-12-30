$( function() {
	/* ======== 点击导航按钮 ======== */
	$(".pdNav").click(function(e) {
		$(".option").hide();
		$(".editStock").hide();

		let id = $(this).attr('id')
		$(".pdNav").removeClass("btn-primary");
		$(".pdNav").addClass("btn-default");

		$(this).removeClass("btn-default")
		$(this).addClass("btn-primary")

		$(".ptCont").hide();
		$(".pd"+id).show();
	})
	/* ======== 点击导航按钮 ======== */

	/* = 点击库存按钮，一定要放在点击导航按钮下面 = */
	$("#stock").click(function(e) {
		$(".editStock").show();
	})
	/* = 点击库存按钮，一定要放在点击导航按钮下面 = */
} );