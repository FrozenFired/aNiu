$(function(){
	$(".colorsBtn").click(function(e) {
		let strs = ($(this).attr("id")).split("-");
		let icon = strs[0];
		let orderId = strs[3];
		let colors = JSON.parse($("#colors-"+icon).val());
		let str="";
		for(let i=0; i<colors.length; i++) {
			let color = colors[i];
			str += '<div class="col-2 show-color">';
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
	$(".colorsCancelBtn").click(function(e) {
		$(".colorsCancelBtn").hide()
		$(".colorsBtn").show()
		$(".show-color").remove();
	})

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
})