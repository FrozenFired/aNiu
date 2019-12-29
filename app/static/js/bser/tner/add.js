$(function() {
	let ajaxUrl = '/ajaxBsCterAdd?';
	$("#iptNome").blur(function(e) {
		ajaxFilter($(this).val())
	});
	let ajaxFilter = function(str) {
		let nome = String(str).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		let keytype = 'nome';
		let keyword = encodeURIComponent(nome);
		let url = ajaxUrl+ 'keytype='+keytype+ '&keyword='+keyword;
		getObject(url)
	}
	let getObject = function(url) {
		$.ajax({
			type: 'GET',
			url: url
		})
		.done(function(results) {
			if(results.success === 1) {
				$("#optName").show();
			} else {
				$("#optName").hide();
			}
		})
	}
	$("#add").submit(function(e) {
		let str = $("#iptNome").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		if(str.length < 1) {
			$("#optName").show()
			e.preventDefault();
		}
		
	})
})