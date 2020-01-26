$( function() {
	$(".sendBtn").click(function(e) {
		let id = ($(this).attr('id')).split('-')[1];

		let form = $("#sendForm-"+id);
		let data = form.serialize();
		$.ajax({
			type: "POST",
			url: '/bsOrderIfSendAjax',
			data: data,
			success: function(results) {
				if(results.success == 1) {
					$("#sendForm-"+id).submit();
				} else {
					alert(results.info);
					// window.location.reload();
				}
			}
		});
	})
	$(".shiping").blur(function(e) {
		let id = ($(this).attr("id")).split('-')[1];
		let shiping = parseInt($(this).val());
		let stock = parseInt($("#stock-"+id).val())
		if(shiping > stock) {
			alert('大于库存')
			$(this).val(0)
		}
	})
} );