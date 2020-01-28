$( function() {
	$("#crtImg").click(function(e) {
		$("#uploadPhoto").click();
	})
	$("#uploadPhoto").change(function(e) {
		var f = document.getElementById('uploadPhoto').files[0];
		var src = window.URL.createObjectURL(f);
		document.getElementById('crtImg').src = src;
		$("#crtImg").removeClass("rounded-circle")
	})


	$("#iptPrice").blur(function(e) {
		var str = $(this).val();
		// 突然想自己写个逻辑，就没有用正则
		if(isFloat(str)) {
			$("#optPrice").hide()
		} else {
			$("#optPrice").show()
		}
	})

	$("#iptCost").blur(function(e) {
		var str = $(this).val();
		// 突然想自己写个逻辑，就没有用正则
		if(isFloat(str)) {
			$("#optCost").hide()
		} else {
			$("#optCost").show()
		}
	})

	$("#iptAddquot").blur(function(e) {
		let addquot = parseInt($(this).val());
		if(isNaN(addquot)) {
			$("#optAddquot").show()
			$("#iptAddquot").focus()
		} else {
			$("#optAddquot").hide()
		}
	})


	$("#btnSubmit").click(function(e) {
		var nome = $("#iptNome").val()
		var price = $("#iptPrice").val()
		var priceIn = $("#iptCost").val()
		if( 1== 0) {}
		// else if(nome.length < 1) {
		// 	$("#optNome").show()
		// }
		else if(!isFloat(price)) {
			$("#optPrice").show()
		}else if(!isFloat(priceIn)) {
			$("#optCost").show()
		}
		else {
			$("#bsProdNew").submit()
		}
		// e.preventDefault();
	})

	

	var isFloat = function(str) {
		if(str.length == 0){
			return false
		} else {			
			var nums = str.split('.')
			if(nums.length > 2){
				return false
			} else {
				var n0 = nums[0]
				if(nums.length == 1){
					if(isNaN(n0)) {
						return false
					} else {
						return true
					}
				} else {
					var n1 = nums[1]
					if(isNaN(n0)) {
						return false
					} else {
						if(n1 && isNaN(n1)) {
							return false
						} else {
							return true
						}
					}
					
				}
				
			}
		}
	}

} );