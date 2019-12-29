exports.usError = function(req, res, info) {
	res.render('./aaViews/index/wrongPage', {
		title: '500-15 Page',
		info: info
	});
}