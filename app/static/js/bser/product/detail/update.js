$(function() {
	$("#editBasicBtn").click(function(e) {
		$("#basicInfo").hide()
		$("#editBasicForm").show();
		$("#basicInfoBtn").show();
		$("#editBasicBtn").hide();
	})
	$("#basicInfoBtn").click(function(e) {
		$("#editBasicForm").hide()
		$("#basicInfo").show();
		$("#editBasicBtn").show();
		$("#basicInfoBtn").hide();
	})
})