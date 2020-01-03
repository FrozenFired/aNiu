$(function(){
	/* ============= 焦点离开订单quot区域 ============= */
	$(".iptBlur").blur(function(e) {
		let strs = ($(this).attr("id")).split("-");
		let icon = strs[0];
		let oppo = strs[1];
		let id = strs[2];
		let num = parseInt($(this).val());
		let numOrg = parseInt($("#"+icon+"Org-"+id).val());
		let numOppo = parseInt($("#"+oppo+"Org-"+id).val());
		if(!isNaN(num) && num >= 0) {
			// 如果对应的是pd则是新增
			if(oppo == 'pd') {
				url = "/bsTinthdNewPdAjax";
				tinRelpd(url, icon, id);
			}
			// 否则是更改或删除
			else if(num != numOrg){
				if(num == 0 && numOppo == 0) {
					url = "/bsTinthdDelPdAjax";
					tinRelpd(url, icon, id);
				} else {
					url = "/bsTinthdUpdPdAjax";
					tinRelpd(url, icon, id);
				}
			}
		}
	})
	/* ============= 焦点离开订单quot区域 ============= */

	/* ------------- tint更改prod ------------- */
	let tinRelpd = function(url, str, id) {
		let form = $("#"+str+"Form-"+id);
		let data = form.serialize();
		$.ajax({
			type: "POST",
			url: url,
			data: data,
			success: function(results) {
				if(results.success == 1) {
				} else {
					alert(results.info);
				}
				window.location.reload();
			}
		});
	}
	/* ------------- tint更改prod ------------- */
})