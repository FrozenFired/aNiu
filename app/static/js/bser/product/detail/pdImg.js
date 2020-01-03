$(function() {
	$("#proImg").dblclick(function(e) {
		$("#uploadPhoto").click();
	})
	$("#uploadPhoto").change(function(e) {
		var f = document.getElementById('uploadPhoto').files[0];
		var src = window.URL.createObjectURL(f);
		document.getElementById('proImg').src = src;

		$("#upForm").show();
	})

} );