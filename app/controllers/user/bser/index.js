let Err = require('../aaIndex/err');
// let Language = require('../aaIndex/language');

exports.bser = function(req, res) {
	res.redirect('./bsOrds')
}

exports.bsShow = function(req, res) {
	let crUser = req.session.crUser;
	res.render('./user/bser/index/index', {
		title: '桌面',
		thisUrl: "/bser",
		crUser : crUser,
	})
}