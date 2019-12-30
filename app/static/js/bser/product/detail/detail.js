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

	$("#editStockBtn").click(function(e) {
		$("#editStockBtn").hide()
		$("#fnStockBtn").show()
		$(".textStock").hide()
		$(".editStock").show()
	})
	$("#fnStockBtn").click(function(e) {
		$("#fnStockBtn").hide()
		$("#editStockBtn").show()
		$(".textStock").show()
		$(".editStock").hide()
	})

	$(".editStock").blur(function(e) {
		let pdId = ($(this).attr('id')).split("-")[1];
		let stock = parseInt($(this).val())
		let stockOrg = parseInt($("#stockOrg-"+pdId).val())
		let form = $("#form-"+pdId);
		let data = form.serialize();
		let url = form.attr('action');
		if(stock != stockOrg) {
			$.ajax({
				type: "POST",
				url: url,
				data: data,
				success: function(results) {
					if(results.success == 1) {
						$("#stockOrg-"+pdId).val(stock)
						$("#stockText-"+pdId).text(stock)
					} else {
						alert(results.info)
					}
				}
			});
		}
	})
} );