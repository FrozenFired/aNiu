let Err = require('./err');

exports.index = function(req, res) {
	// 判断是否登录
	// console.log(req.session)
	if(req.session.crUser) {
		let crUser = req.session.crUser
		if(crUser.role == 1) {
			res.redirect('/bser');
		}
		// else if(crUser.role == 3) {
		// 	res.redirect('/pter');
		// }
		// else if(crUser.role == 5) {
		// 	res.redirect('/sfer');
		// }
		else {
			delete req.session.crUser;
			info = "登录角色错误，请联系管理员";
			Err.usError(req, res, info);
		}
	}
	else {
		res.redirect('/login');
	}
}



exports.login = function(req, res) {
	res.render('./aaViews/index/login', {
		title: 'Login',
		action: "/loginUser",
		code: "code",
		pwd: "pwd"
	});
}



let User = require('../../../models/login/user');
let bcrypt = require('bcryptjs');
exports.loginUser = function(req, res) {
	let code = req.body.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	let pwd = String(req.body.pwd).replace(/(\s*$)/g, "").replace( /^\s*/, '');
	if(pwd.length == 0) pwd = " ";

	loginUserf(req, res, code, pwd);
}
loginUserf = function(req, res, code, pwd) {
	User.findOne({code: code})
	.populate('firm')
	.exec(function(err, object) {
		if(err) console.log(err);
		if(!object){
			info = "用户名不正确，请重新登陆";
			Err.usError(req, res, info);
		} else{
			bcrypt.compare(pwd, object.pwd, function(err, isMatch) {
				if(err) console.log(err);
				if(isMatch) {
					object.lgAt = Date.now();
					// console.log(object)
					object.save(function(err, objSave){
						if(err) console.log(err)
					})
					req.session.crUser = object;
					if(object.role == 1) {
						res.redirect('/bser');
					}
					// else if(object.role == 3) {
					// 	res.redirect('/pter');
					// }
					// else if(object.role == 5) {
					// 	res.redirect('/sfer');
					// }
					else {
						info = "登录角色错误，请联系管理员";
						Err.usError(req, res, info);
					}
				}
				else {
					info = "用户名与密码不符，请重新登陆";
					Err.usError(req, res, info);
				}
			})
		}
	})
}

exports.logout = function(req, res) {
	// User
	if(req.session.crUser) delete req.session.crUser;
	// Ader
	if(req.session.crAder) delete req.session.crAder;

	res.redirect('/');
}