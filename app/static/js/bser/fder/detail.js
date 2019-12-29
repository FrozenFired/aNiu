$( function() {
	// Basic
	$("#back").click(function(e) {
		window.location.href = "/bsCters";
	})
	$("#billsRcd").click(function(e) {
		$(".basic").hide();
		$(".billsRcd").show();
		$(this).addClass('btn-info');
		$("#basic").removeClass('btn-info');
	})

	$("#basic").click(function(e) {
		$(".billsRcd").hide();
		$(".basic").show();
		$(this).addClass('btn-info');
		$("#billsRcd").removeClass('btn-info');
	})

	let isFloat=/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
	// 更改欠款
	$("#unpaidLab").click(function(e) {
		let unpaid = $("#orgUnpaid").val();
		if($("#orgUnpaid").val() == 0) unpaid="";
		$(".orgUnpaid").hide();
		$(".fixUnpaid").show();
		$("#iptUnpaid").val(unpaid)
	})
	$("#cancelUnpaid").click(function(e) {
		$(".orgUnpaid").show();
		$(".fixUnpaid").hide();
	})
	$("#iptUnpaid").blur(function(e) {
		if($(this).val().match(isFloat) || $(this).val() ==0 || $(this).val()=="") {
			$("#optUnpaid").hide()
		} else {
			$("#optUnpaid").show()
		}
	})
	$("#updUnpaid").submit(function(e) {
		if(!$("#iptUnpaid").val().match(isFloat) && $(this).val() !=0 && $(this).val()!="") {
			$("#optUnpaid").show()
			e.preventDefault();
		}
	})

	// unpaid Unpaid
	// 更改备注
	$("#noteLab").click(function(e) {
		$(".orgNote").hide();
		$(".fixNote").show();
		$("#iptNote").val($("#orgNote").val())
	})
	$("#iptNote").blur(function(e) {
		$("#cterUpdNote").submit();
	})
} );