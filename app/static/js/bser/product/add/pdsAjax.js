$( function() {
	let ajaxUrl = "/orderAjaxBsProds";
	let products = new Array();
	$("#back").click(function(e) {
		window.location.href = "/bsProds";
	})
	$(".ajaxPdKey").focus()

	$(".ajaxPdForm").on('input', '.ajaxPdKey', function(e) {
		obtPds();
	});

	let obtPds = function() {
		let str = $(".ajaxPdKey").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		$('.ajaxPds').remove(); products = new Array();
		if(str.length > 2){
			$('#iptCode').val(str);

			let keyword = encodeURIComponent(str);	// 转化码
			let keytype = 'code';
			$.ajax({
				type: 'get',
				url: ajaxUrl+'?keytype='+keytype+'&keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1) {
					$(".ajaxInfo").text($("#oldPd").val())
					$(".btnNewPd").hide()
					$(".newPd").hide()

					products[0] = results.prodfir;
					showProduct(products[0], 0)
				} else if(results.success === 2) {
					$(".ajaxInfo").text($("#oldNew").val())
					$(".btnNewPd").show()
					$(".newPd").hide()

					products = results.prodfirs;
					for(let i=0; i<products.length; i++) {
						showProduct(products[i], i)
					}
				} else {
					$(".ajaxInfo").text($("#iptPd").val())
					$(".newPd").show()
					$(".btnNewPd").hide()
				}
			})
		} else {
			$(".ajaxInfo").text($("#codeRule").val())
			$(".newPd").hide()
			$(".btnNewPd").hide()
		}
	}

	let showProduct = function(product, pl) {
		let nome = $("#unName");
		if(product.nome) nome = product.nome;

		let str = "";
		str += '<div class="ajaxPds col-12 col-lg-6 p-2">'
			str += '<div class="card" id='+pl+'>'
				str += '<div class="row">'
					str += '<div class="col-3">'
						str += '<img class="card-img" src='+dns+product.photo;
						str += ' alt='+product.code+' />';
					str += '</div>';
					str += '<div class="col-9">'
						str += '<div class="row">'
							str += '<div class="col-6"><h4 class="card-title">'+product.code+'</h4></div>';
							str += '<div class="col-6"><h5 class="card-text">'+nome+'</h5></div>';
						str += '</div>';
						str += '<div class="row">'
							str += '<div class="col-6">'+product.material+'</div>';
							str += '<div class="col-6">'+product.width+'</div>';
						str += '</div>';
						str += '<div class="row">'
							str += '<div class="col-12">'
								if(product.price && !isNaN(product.price)){
									price = (product.price).toFixed(2) + ' €';
								} else {
									price = $("#unPrice")
								}
								// p.card-text #{(object.price).toFixed(2)}
								str += '<p class="card-text">'+price+'</p>'
							str += '</div>';
						str += '</div>';
					str += '</div>';
				str += '</div>';
			str += '</div>';
		str += '</div>';
		
		$('.products').append(str);
	}
	
	$(".btnNewPd").click(function(e) {
		$('.ajaxPds').remove();
		$(".ajaxInfo").text($("#iptPd").val())
		$(".newPd").show()
		$(".btnNewPd").hide()
	})

	$('.products').on('click', '.card', function(e) {
		let arr = parseInt($(this).attr('id'));
		console.log(products)
		let product = products[arr];

		window.location.href = "/bsProd/"+product._id;

	})

	$("#bsProdUpd").on("input", "#iptAddquot", function(e) {
		let addquot = 0;
		if(!isNaN(parseInt($(this).val()) ) ) addquot = parseInt($(this).val());
		let stock = 0;
		if(!isNaN(parseInt($("#orgStock").val()) ) ) stock = parseInt($("#orgStock").val());
		let newStock = addquot + stock;
		$("#upStock").val(newStock)
	})
} );