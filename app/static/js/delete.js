$(function() {
	$('.del').click(function(e) {
		let target = $(e.target)
		let urlDel = target.data('urldel')
		let id = target.data('id')
		let tr = $('.object-id-' + id)
		$.ajax({
			type: 'DELETE',
			url: urlDel + '?id=' + id
		})
		.done(function(results) {
			if(results.success === 1) {
				if(tr.length > 0) {
					tr.remove()
				}
			}
			if(results.success === 0) {
				alert(results.info)
			}
		})
	})
})