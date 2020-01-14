$(function(){
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
					url = "/bsOrdthdNewPdAjax";
					// console.log("add")
					ordRelpd(url, icon, id, "add");
				}
				// 否则是更改或删除
				else if(num != numOrg){
					if(num == 0 && numOppo == 0) {
						url = "/bsOrdthdDelPdAjax";
						// console.log("del")
						ordRelpd(url, icon, id, "del");
					} else {
						url = "/bsOrdthdUpdPdAjax";
						// console.log("upd")
						ordRelpd(url, icon, id, "upd");
					}
				}
			}
			window.location.reload();
		})
	})

	/* ------------- order更改prod ------------- */
	let ordRelpd = function(url, str, id, methed) {
		let form = $("#"+str+"Form-"+id);
		let data = form.serialize();
		$.ajax({
			type: "POST",
			url: url,
			data: data,
			success: function(results) {
				if(results.success == 1) {
				} else {
					// alert(results.info);
				}
			}
		});
	}
	/* ------------- order更改prod ------------- */
})