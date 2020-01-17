$( function() {
	$("#showDialBtn").click(function(e) {
		$(".tblDial").show()

		$("#showDialBtn").hide();
		$("#hideDialBtn").show();
	})
	$("#hideDialBtn").click(function(e) {
		$(".tblDial").hide()

		$("#hideDialBtn").hide();
		$("#showDialBtn").show();
	})

	$("#pdCode").on("input", "#iptCode", function(e) {
		let str = $(this).val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(str.length > 0) {
			$(".pdfir").hide();
			$(".tblDial").hide();
			let codes = fuzzyQuery(str);
			for(let i=0; i<codes.length; i++) {
				$(".pdfir-"+codes[i]).show();
			}
		} else {
			$(".pdfir").show();
		}
		
	})

	let products = JSON.parse($("#products").val());
	let fuzzyQuery = function(keyWord) {
		var arr = [];
		for (var i = 0; i < products.length; i++) {
			if (products[i].code.indexOf(keyWord) >= 0) {
				arr.push(products[i].code);
			}
		}
		return arr;
	}
} );