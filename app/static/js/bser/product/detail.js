$( function() {
	$(".pdNav").click(function(e) {
		let id = $(this).attr('id')
		$(".pdNav").removeClass("btn-primary");
		$(".pdNav").addClass("btn-default");

		$(this).removeClass("btn-default")
		$(this).addClass("btn-primary")

		$(".ptCont").hide();
		$(".pd"+id).show();
	})
	$(".dataSp").dblclick(function(e) {
		let attr = ($(this).attr('id')).split('-')[1]
		let id = ($(this).attr('id')).split('-')[2]
		$(this).hide();
		$("#form-"+attr+"-"+id).show();
	})
	$(".dataIpt").blur(function(e) {
		let attr = ($(this).attr('id')).split('-')[1]
		let id = ($(this).attr('id')).split('-')[2]
		$("#form-"+attr+'-'+id).hide();
		$("#span-"+attr+'-'+id).show();

		let orgVal = parseInt($("#org-"+attr+'-'+id).val());
		let stock = parseInt($(this).val());
		if(stock != orgVal) {
			let form = $("#form-"+attr+'-'+id);
			let data = form.serialize();
			let url = form.attr('action');
			console.log(url)
			$.ajax({
				type: "POST",
				url: url,
				data: data,
				success: function(results) {
					if(results.success == 1) {
						location.reload()
					} else {
						alert('Error')
					}
				}
			});
			
		}
	})
} );