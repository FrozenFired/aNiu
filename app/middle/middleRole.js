let AdIndex = require('../controllers/ader/index');
exports.aderIsLogin = function(req, res, next) {
	let crAder = req.session.crAder;
	if(!crAder) {
		info = "需要您的 Administrator 账户,请输入";
		AdIndex.adOptionWrong(req, res, info);
	} else {
		next();
	}
};


let User = require('../models/login/user');
let UsErr = require('../controllers/user/aaIndex/err');
exports.singleUsLogin = function(req, res, next){
	let crUser = req.session.crUser;
	User.findById(crUser._id, function(err, user){ 
		if(err) {
			console.log(err);
			info = "singleUsLogin, User.findById, Error!";
			UsErr.usError(req, res, info);
		} else if(!user) {
			info = "此帐号已经被删除!";
			UsErr.usError(req, res, info);
		} else {
			let crLog = (new Date(crUser.lgAt)).getTime();
			let atLog = (new Date(user.lgAt)).getTime();
			if(crLog == atLog){
				next();
			}else{
				res.redirect('/logout');
			}
		} 
	});
};


exports.bserIsLogin = function(req, res, next) {
	let crUser = req.session.crUser;
	if(!crUser || crUser.role != 1) {
		res.redirect('/logout');
	} else {
		next();
	}
};


exports.pterIsLogin = function(req, res, next) {
	let crUser = req.session.crUser;
	if(!crUser || crUser.role != 3) {
		res.redirect('/logout');
	} else {
		next();
	}
};


exports.sferIsLogin = function(req, res, next) {
	let crUser = req.session.crUser;
	if(!crUser || crUser.role != 5) {
		res.redirect('/logout');
	} else {
		next();
	}
};


