let Ader = require('../../models/login/ader');
let bcrypt = require('bcryptjs');

exports.aderHome = function(req, res, next) {
	if(!req.session.crAder) {
		res.redirect('/aderLogin');
	} else {
		res.render('./ader/index/index', {
			title: 'Adminnistrator Home',
			crAder : req.session.crAder,
		});
	}
};



exports.aderLogin = function(req, res) {
	res.render('./ader/index/login', {
		title: 'Admin Login',
		action: "/loginAder",
		code: "ader[code]",
		password: "ader[pwd]"
	});
};




exports.loginAder = function(req, res) {
	let code = "";
	if(req.body.ader.code) {
		code = req.body.ader.code.replace(/(\s*$)/g, "").replace( /^\s*/, '');
	}
	let pwd = "";
	if(req.body.ader.pwd) {
		pwd = req.body.ader.pwd.replace(/(\s*$)/g, "").replace( /^\s*/, '');
	}
	Ader.findOne({code: code}, function(err, ader) {
		if(err) {
			console.log(err);
			info = "admin登录时数据库错误, 请联系管理员";
			adWrongpage(req, res, info);
		} else {
			if(!ader){
				info = "Adminnistrator Code 不正确，请重新登陆";
				adWrongpage(req, res, info);
			}
			else{
				bcrypt.compare(pwd, ader.pwd, function(err, isMatch) {
					if(err) {
						console.log(err);
						info = "admin登录时密码判定错误, 请联系管理员";
						adWrongpage(req, res, info);
					} else {
						if(isMatch) {
							req.session.crAder = ader
							res.redirect('/ader')
						}
						else {
							info = "用户名与密码不符，请重新登陆";
							adWrongpage(req, res, info);
						}
					}
				})
			}
		}
	})
}




exports.aderLogout = function(req, res) {
	delete req.session.crAder
	res.redirect('/')
}




adWrongpage = function(req, res, info){
	res.render('./ader/index/optionWrong', {
		title: '操作错误',
		crAder: req.session.crAder,
		info: info
	})
}



exports.adOptionWrong = function(req, res, info) {
	res.render('./ader/index/optionWrong', {
		title: '操作错误',
		crAder: req.session.crAder,
		info: info
	})
}