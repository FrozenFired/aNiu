$(function() {
	$("#editBtn").click(function(e) {
		$("#info").hide()
		$("#editForm").show();
		$("#infoBtn").show();
		$("#editBtn").hide();
	})
	$("#infoBtn").click(function(e) {
		$("#editForm").hide()
		$("#info").show();
		$("#editBtn").show();
		$("#infoBtn").hide();
	})
})