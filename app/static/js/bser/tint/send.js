$( function() {
	/*================= 提交生产单 =================*/
	$("#submitBtn").click(function(e) {
		$("#tintNew").submit();
	})
	$(".sendBtn").click(function(e) {
		let id = ($(this).attr('id')).split('-')[1]
		$("#sendForm-"+id).submit();
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