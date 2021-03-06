$(function(){
	/* ============ 点击显示颜色按钮 ============ */
	$(".colorsBtn").click(function(e) {
		let strs = ($(this).attr("id")).split("-");
		let icon = strs[0];
		let orderId = strs[3];
		let colors = JSON.parse($("#colors-"+icon).val());
		let str="";
		for(let i=0; i<colors.length; i++) {
			let color = colors[i];
			str += '<div class="col-2 show-color my-2">';
				str += '<button id='+color+'-'+icon+'-'+orderId+' class="btn btn-warning addColorBtn" type="button">'
					str += color
				str += '</button>';
			str += '</div>';
		}
		$(".show-color").remove();
		$(".show-colors-"+icon).append(str)
		$(".colorsBtn").hide()
		$(".colorsCancelBtn").show()
	})
	/* ============ 点击显示颜色按钮 ============ */

	/* ============ 点击取消颜色按钮 ============ */
	$(".colorsCancelBtn").click(function(e) {
		$(".colorsCancelBtn").hide()
		$(".colorsBtn").show()
		$(".show-color").remove();
	})
	/* ============ 点击取消颜色按钮 ============ */

	/* ============ 点击颜色按钮 添加订单颜色 ============ */
	$(".info").on("click", ".addColorBtn", function(e) {
		let strs = ($(this).attr("id")).split("-");
		let color = strs[0];
		let icon = strs[1];
		let orderId = strs[2];
		let pdsecId = $("#pdsec-"+icon+"-"+color).val();
		if(orderId && pdsecId) {
			$.ajax({
				type: "GET",
				url: '/bsOrdsecNewPdAjax?order='+orderId+'&pdsec='+pdsecId,
				success: function(results) {
					if(results.success == 1) {
					} else {
						alert(results.info);
					}
					window.location.reload();
				}
			});
		} else {
			alert('订单添加颜色错误, 请联系管理员!');
		}
	})
	/* ============ 点击颜色按钮 添加订单颜色 ============ */

	/* ============ 点击颜色按钮 删除订单颜色 ============ */
	$(".delColorBtn").click(function(e) {
		let target = $(e.target)
		let ordfirId = target.data('fir')
		let ordsecId = target.data('sec')
		if(ordfirId && ordsecId) {
			$.ajax({
				type: "GET",
				url: '/bsOrdsecDelPdAjax?ordfirId='+ordfirId+'&ordsecId='+ordsecId,
				success: function(results) {
					if(results.success == 1) {
					} else {
						alert(results.info);
					}
					window.location.reload();
				}
			});
		}
	})
	/* ============ 点击颜色按钮 删除订单颜色 ============ */
})