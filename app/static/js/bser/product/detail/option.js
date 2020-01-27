$(function() {
	let Colors = JSON.parse($("#colors").val());	// 此产品现有颜色
	let Sizes = JSON.parse($("#sizes").val());	// 此产品现有尺寸
	/* ======= 点击导航中的设置 ======= */
	$("#option").click(function(e) {
		$(".option").toggle();
	})
	/* ======= 点击导航中的设置 ======= */


	/* ======= 点击添加时的取消键 ======= */
	$(".cancelBtn").click(function(e) {
		$(".iptPage").hide();
		$(".optionBtn").show()
	})
	/* ======= 点击添加时的取消键 ======= */

	/* ======= 点击添加颜色的按钮 ======= */
	$(".plusColorBtn").click(function(e) {
		$(".optionBtn").hide()
		$(".plusColor").show();
	})
	/* ======= 点击添加颜色的按钮 ======= */

	/* ======= 焦点从添加颜色框中出来时, 判断颜色是否重复 ======= */
	$("#plusColor").blur(function(e) {
		let color = $(this).val().replace(/\s+/g,"").toUpperCase();
		let i=0;
		for(; i<Colors.length; i++) {
			if(color == Colors[i]) {
				$(this).val("");
				$("#optPlusColor").text('已经有了 “'+color+'” 这个颜色');
				break;
			}
		}
		if(i == Colors.length) {
			$("#optPlusColor").text("");
			$(this).val(color)
		}
	})
	/* ======= 焦点从添加颜色框中出来时, 判断颜色是否重复 ======= */

	/* ======= 提交添加新颜色表格时, 判断颜色是否重复 ======= */
	$("#newColorBtn").click(function(e) {
		let url = "/bsProdNewColorAjax";
		let pdfirId = $("#pdfirId").val();
		let color = $("#plusColor").val();
		$("#plusColor").val(color.replace(/\s+/g,""));
		if(!color || color.length < 0) {
			alert("请添加颜色，再提交");
			e.preventDefault();
		} else {
			$.ajax({
				type: "GET",
				url: url+'?pdfirId='+pdfirId+'&color='+color,
				success: function(results) {
					if(results.success == 1) {
						
					} else {
						alert(results.info);
					}
					let pdfir = results.pdfir;
					window.location.href = "/bsProduct/"+pdfir._id+"?add=1";
				}
			});
		}
	})
	/* ======= 提交添加新颜色表格时, 判断颜色是否重复 ======= */

	/* ======= 点击删除颜色的按钮 ======= */
	$(".minusColorBtn").click(function(e) {
		$(".optionBtn").hide()
		$(".minusColor").show();
	})
	/* ======= 点击删除颜色的按钮 ======= */

	/* ======= 提交删除颜色表格时 ======= */
	$("#delColorBtn").click(function(e) {
		let url = "/bsProdDelColorAjax";
		let pdfirId = $("#pdfirId").val();
		let pdsecId = $("#minusColor").val();
		$.ajax({
			type: "GET",
			url: url+'?pdfirId='+pdfirId+'&pdsecId='+pdsecId,
			success: function(results) {
				if(results.success == 1) {
					
				} else {
					alert(results.info);
				}
				let pdfir = results.pdfir;
				window.location.href = "/bsProduct/"+pdfir._id;
			}
		});
	})
	/* ======= 提交删除颜色表格时 ======= */


	/* ======= 点击添加尺寸的按钮 ======= */
	$(".plusSizeBtn").click(function(e) {
		$(".optionBtn").hide()
		$(".plusSize").show();
	})
	/* ======= 点击添加尺寸的按钮 ======= */

	/* ======= 提交添加尺寸表格时 ======= */
	$("#newSizeBtn").click(function(e) {
		let url = "/bsProdNewSizeAjax";
		let pdfirId = $("#pdfirId").val();
		let size = $("#plusSize").val();
		console.log(size)
		$.ajax({
			type: "GET",
			url: url+'?pdfirId='+pdfirId+'&size='+size,
			success: function(results) {
				if(results.success == 1) {
					
				} else {
					alert(results.info);
				}
				let pdfir = results.pdfir;
				window.location.href = "/bsProduct/"+pdfir._id+"?add=1";
			}
		});
	})
	/* ======= 提交添加尺寸表格时 ======= */

	/* ======= 点击删除尺寸的按钮 ======= */
	$(".minusSizeBtn").click(function(e) {
		$(".optionBtn").hide()
		$(".minusSize").show();
	})
	/* ======= 点击删除尺寸的按钮 ======= */

	/* ======= 提交删除尺寸表格时 ======= */
	$("#delSizeBtn").click(function(e) {
		let url = "/bsProdDelSizeAjax";
		let pdfirId = $("#pdfirId").val();
		let pdsezId = $("#minusSize").val();
		$.ajax({
			type: "GET",
			url: url+'?pdfirId='+pdfirId+'&pdsezId='+pdsezId,
			success: function(results) {
				if(results.success == 1) {
					
				} else {
					alert(results.info);
				}
				let pdfir = results.pdfir;
				window.location.href = "/bsProduct/"+pdfir._id;
			}
		});
	})
	/* ======= 提交删除尺寸表格时 ======= */

	$(".pdfirDelBtn").click(function(e) {
		let target = $(e.target);
		let id = target.data('id');
		let pdfir = JSON.parse($("#pdfir").val());
		let numSecs = pdfir.pdsecs.length
		let numSezs = pdfir.pdsezs.length
		if(numSecs > 0) {
			alert("请先删除所有颜色再删除产品");
		} else if(numSezs > 0){
			alert("请先删除所有尺寸再删除产品");
		} else {
			window.location.href="/bsPdfirDel/"+id;
		}
	})
})