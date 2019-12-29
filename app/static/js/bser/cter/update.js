$(function() {
	let ajaxUrl = '/ajaxBsCterUp?';
	$("#iptNome").blur(function(e) {
		ajaxFilter($(this).val(), $("#iptId").val())
	});
	let ajaxFilter = function(str, id) {
		let nome = String(str).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		let keytype = 'nome';
		let keyword = encodeURIComponent(nome);
		let url = ajaxUrl+ '&id='+id+ '&keytype='+keytype+ '&keyword='+keyword;
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
	$("#upInfo").submit(function(e) {
		let str = $("#iptNome").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(str.length < 1) {
			$("#optName").show()
			e.preventDefault();
		}
		
	})
})