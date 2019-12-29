let Index = require('./index');
let User = require('../../models/login/user');
let Firm = require('../../models/login/firm');
let _ = require('underscore');


exports.adUsers = function(req, res) {
	let crAder = req.session.crAder;

	User.find()
	.populate('firm')
	.sort({'firm': 1})
	.exec(function(err, users) {
		if(err) {
			console.log(err);
			info = "adUsersFilter, User.find, Error!";
			Index.adOptionWrong(req, res, info);
		} else {
			res.render('./ader/user/list', {
				title: 'User List',
				crAder: crAder,

				users: users
			})
		}
	})
}



exports.adUserFilter = function(req, res, next) {
	let id = req.params.id;
	User.findOne({_id: id})
	.populate('firm')
	.exec(function(err, user) {
		if(err) {
			console.log(err);
			info = "adUserFilter, User.findOne, Error!";
			Index.adOptionWrong(req, res, info);
		}else if(!user) {
			info = "此帐号已经被删除";
			Index.adOptionWrong(req, res, info);
		} else {
			req.body.object = user;
			next();
		}
	})
}
exports.adUserDel = function(req, res) {
	let user = req.body.object;
	User.deleteOne({_id: user.id}, function(err, objRm) {
		if(err) {
			info = "删除批发商用户时，数据删除错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else {
			res.redirect("/adUsers");
		}
	})
		
}
exports.adUser = function(req, res) {
	let objBody = new Object();
	objBody.user = req.body.object;
	objBody.title = "批发商用户:"+objBody.user.code;
	objBody.crAder = req.session.crAder;
	objBody.thisAct = "/adUser";
	objBody.thisTit = "批发商用户";
	res.render('./ader/user/detail', objBody);
}



exports.adUserUp = function(req, res) {
	let obj = req.body.obj
	if(obj.code) {
		obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	if(obj.cd) {
		obj.cd = obj.cd.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	User.findOne({_id: obj._id}, function(err, object) {
		if(err) {
			info = "更新批发商用户，批发商用户数据库查找时错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(!object) {
			info = "此用户名已经被删除";
			Index.adOptionWrong(req, res, info);
		} else {
			if(obj.code && obj.code != object.code) {
				adUser_changeCode(req, res, obj, object);
			} else if(obj.cd && obj.cd != object.cd) {
				adPrUserCd(req, res, obj, object);
			} else {
				adSaveUser(req, res, obj, object);
			}
		}
	})
}
let adUser_changeCode = function(req, res, obj, object) {
	User.findOne({code: obj.code})
	.where('_id').ne(obj._id)
	.exec(function(err, objSame) {
		if(err) {
			info = "更新批发商用户，批发商用户数据库查找相同时错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(objSame) {
			info = "此用户名已经存在";
			Index.adOptionWrong(req, res, info);
		} else {
			if(obj.cd && obj.cd != object.cd) {
				adPrUserCd(req, res, obj, object);
			} else {
				adSaveUser(req, res, obj, object);
			}
		}
	})
}
adPrUserCd = function(req, res, obj, object) {
	if(obj.cd.length != 2) {
		info = "员工代码必须是两位字符，最好是两个字母";
		Index.adOptionWrong(req, res, info);
	} else {
		User.findOne({cd: obj.cd})
		.where('firm').eq(obj.firm)
		.exec(function(err, objSame) {
			if(err) {
				info = "更新批发商用户，批发商用户数据库查找相同时错误, 请联系管理员";
				Index.adOptionWrong(req, res, info);
			} else if(objSame) {
				info = "公司员工代号已经存在";
				Index.adOptionWrong(req, res, info);
			} else {
				adSaveUser(req, res, obj, object);
			}
		})
	}
}
adSaveUser = function(req, res, obj, object) {
	let _object = _.extend(object, obj)
	_object.save(function(err, objSave) {
		if(err) {
			info = "更新批发商用户时数据库保存数据时出现错误, 请联系管理员"
			Index.adOptionWrong(req, res, info);
		} else {
			res.redirect("/adUser/"+objSave._id)
		}
	})
}



exports.adUserAdd =function(req, res) {
	Firm.find(function(err, firms) {
		if(err) {
			info = "添加批发商用户页面时，数据库批发商公司查找错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(firms && firms.length > 0) {
			res.render('./ader/user/add', {
				title: 'Add 批发商用户',
				crAder : req.session.crAder,
				thisAct : "/adUser",
				thisTit : "批发商用户",
				firms: firms,
			})
		} else {
			info = "请先添加批发商公司";
			Index.adOptionWrong(req, res, info);
		}
	})
}


exports.adUserNew = function(req, res) {
	let obj = req.body.obj;
	let info;
	if(obj.cd) {
		obj.cd = obj.cd.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(obj.cd.length != 2) {info = "员工代码必须是两位字符，最好是两位字母";}
	} else {
		info = "员工代码必须是两位字符，最好是两位字母";
	}
	if(obj.code) {
		obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(obj.code.length < 2) {info = "用户帐号必须大于2个字符";}
	} else {
		info = "用户帐号必须大于2个字符";
	}
	if(info && info.length > 0) {
		Index.adOptionWrong(req, res, info);
	} else {
		User.findOne({code: obj.code}, function(err, objSame) {
			if(err) {
				info = "添加批发商用户时，数据库查找错误, 请联系管理员";
				Index.adOptionWrong(req, res, info);
			} else if(objSame) {
				info = "此帐号已经被注册，请重新注册";
				Index.adOptionWrong(req, res, info);
			} else {
				User.findOne({firm: obj.firm, cd: obj.cd}, function(err, objSame) {
					if(err) {
						info = "添加批发商用户时，数据库查找错误, 请联系管理员";
						Index.adOptionWrong(req, res, info);
					} else if(objSame) {
						info = "公司员工代号已经存在";
						Index.adOptionWrong(req, res, info);
					} else {
						let _object = new User(obj)
						_object.save(function(err, objSave){
							if(err) {
								info = "添加批发商用户时，数据库保存错误, 请联系管理员";
								Index.adOptionWrong(req, res, info);
							} else {
								res.redirect('/adUsers')
							}
						})
					}
				})
			}
		})
	}
}

