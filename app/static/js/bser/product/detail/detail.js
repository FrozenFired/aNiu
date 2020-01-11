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

	/* ========= 点击修改库存按钮 ========= */
	$("#editStockBtn").click(function(e) {
		$("#editStockBtn").hide()
		$("#fnStockBtn").show()
		$(".textStock").hide()
		$(".editStock").show()
	})
	/* ========= 点击修改库存按钮 ========= */

	/* ========= 点击完成修改按钮 ========= */
	$("#fnStockBtn").click(function(e) {
		$("#fnStockBtn").hide()
		$("#editStockBtn").show()
		$(".textStock").show()
		$(".editStock").hide()
	})
	/* ========= 点击完成修改按钮 ========= */

	/* =============== 焦点离开修改库存区域 =============== */
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
	/* =============== 焦点离开修改库存区域 =============== */



	/* =============== 自动填充textarea =============== */
	$("#iptNote").val($("#iptnote").val())
	/* =============== 自动填充textarea =============== */
} );