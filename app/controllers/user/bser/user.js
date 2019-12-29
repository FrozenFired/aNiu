let Err = require('../aaIndex/err')

let User = require('../../../models/login/user')
let Firm = require('../../../models/login/firm')
let _ = require('underscore')


exports.bsUsers = function(req, res) {
	let crUser = req.session.crUser;
	
	User.find({'firm': crUser.firm})
	.populate('firm')
	.sort({'role': 1})
	.exec(function(err, users) {
		if(err) {
			console.log(err);
			info = "bsUsers, User.find, Error!";
			Err.usError(req, res, info);
		} else {
			res.render('./user/bser/firm/users', {
				title: '用户信息',
				crUser: crUser,
				users: users
			});
		}
	})
}



exports.bsUserFilter = function(req, res, next) {
	let crUser = req.session.crUser;
	let id = crUser._id;
	if(req.params && req.params.id) id = req.params.id;

	User.findOne({_id: id})
	.populate('firm')
	.exec(function(err, object) {
		if(err) {
			console.log(err);
			info = "bserFilter, User.findOne, Error!";
			Err.usError(req, res, info);
		}else if(!object) {
			info = "此帐号已经被删除";
			Err.usError(req, res, info);
		}else {
			req.body.object = object;
			next();
		}
	})
}
exports.bsMyInfo = function(req, res) {
	let crUser = req.session.crUser

	let object = req.body.object;
	let objBody = new Object();
	objBody.crUser = crUser;
	objBody.object = object;
	objBody.title = '个人信息';
	res.render('./user/bser/firm/user', objBody)
}




exports.bsUserUpd = function(req, res) {
	let obj = req.body.obj
	// console.log(obj)
	if(obj.code) {
		obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	if(obj.cd) {
		obj.cd = obj.cd.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	User.findOne({_id: obj._id}, function(err, object) {
		if(err) {
			info = "更新公司用户，公司用户数据库查找时错误, 请联系管理员";
			Err.usError(req, res, info);
		} else if(!object) {
			info = "此用户已经被删除";
			Err.usError(req, res, info);
		} else {
			if(obj.pwd || obj.pwd == "") {
				usUser_changePwd(req, res, obj, object);
			} else if(obj.code && obj.code != object.code) {
				usUser_changeCode(req, res, obj, object);
			} else if(obj.cd && obj.cd != object.cd) {
				usUser_changeCd(req, res, obj, object);
			} else {
				usUser_save(req, res, obj, object);
			}
		}
	})
}
let bcrypt = require('bcryptjs');
let usUser_changePwd = function(req, res, obj, object) {
	let crUser = req.session.crUser;
	if(crUser._id == object._id) {
		obj.pw = obj.pw.replace(/(\s*$)/g, "").replace( /^\s*/, '')
		bcrypt.compare(obj.pw, object.pwd, function(err, isMatch) {
			if(err) console.log(err);
			if(!isMatch) {
				info = "原密码错误，请重新操作";
				Err.usError(req, res, info);
			}
			else {
				usUser_save(req, res, obj, object);
			}
		});
	} else if(object.role != 1) {
		usUser_save(req, res, obj, object);
	} else {
		info = "您无权修改此人密码";
		Err.usError(req, res, info);
	}
}
let usUser_changeCode = function(req, res, obj, object) {
	User.findOne({code: obj.code})
	.where('_id').ne(obj._id)
	.exec(function(err, objSame) {
		if(err) {
			info = "更新公司用户，公司用户数据库查找相同时错误, 请联系管理员";
			Err.usError(req, res, info);
		} else if(objSame) {
			info = "此用户名已经存在";
			Err.usError(req, res, info);
		} else {
			if(obj.cd && obj.cd != object.cd) {
				usUser_changeCd(req, res, obj, object);
			} else {
				usUser_save(req, res, obj, object);
			}
		}
	})
}
let usUser_changeCd = function(req, res, obj, object) {
	if(obj.cd.length != 2) {
		info = "员工代码必须是两位字符，最好是两个字母";
		Err.usError(req, res, info);
	} else {
		User.findOne({cd: obj.cd})
		.where('firm').eq(obj.firm)
		.exec(function(err, objSame) {
			if(err) {
				info = "更新公司用户，公司用户数据库查找相同时错误, 请联系管理员";
				Err.usError(req, res, info);
			} else if(objSame) {
				info = "公司员工代号已经存在";
				Err.usError(req, res, info);
			} else {
				usUser_save(req, res, obj, object);
			}
		})
	}
}
let usUser_save = function(req, res, obj, object) {
	let _object = _.extend(object, obj)
	_object.save(function(err, objSave) {
		if(err) {
			info = "更新公司用户时数据库保存数据时出现错误, 请联系管理员"
			Err.usError(req, res, info);
		} else {
			if(req.session.crUser._id == objSave._id) {
				req.session.crUser = objSave;
			}
			res.redirect("/bsMyInfo")
		}
	})
}