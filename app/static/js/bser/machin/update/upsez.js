$(function(){
	/* ============= 焦点离开订单quot区域 ============= */
	$("#changeBtn").click(function(e) {
		$(".iptBlur").each(function(index,elem) {
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
					url = "/bsMacsezNewPdAjax";
					macRelpd(url, icon, id, "add");
				}
				// 否则是更改或删除
				else if(num != numOrg){
					if(num == 0 && numOppo == 0) {
						url = "/bsMacsezDelPdAjax";
						macRelpd(url, icon, id, "del");
					} else {
						url = "/bsMacsezUpdPdAjax";
						macRelpd(url, icon, id, "upd");
					}
				}
			}
		})
	})
	/* ============= 焦点离开订单quot区域 ============= */

	/* ------------- machin更改prod ------------- */
	let macRelpd = function(url, str, id, methed) {
		let form = $("#"+str+"Form-"+id);
		let data = form.serialize();
		$.ajax({
			type: "POST",
			url: url,
			data: data,
			success: function(results) {
				if(results.success == 1) {
					if(methed == 'upd') {

					} else {
						window.location.reload();
					}
				} else {
					alert(results.info);
					window.location.reload();
				}
			}
		});
	}
	/* ------------- machin更改prod ------------- */
})