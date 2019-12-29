let Index = require('./index')
let Firm = require('../../models/login/firm')
let User = require('../../models/login/user')
let _ = require('underscore')



exports.adFirms = function(req, res) {
	let crAder = req.session.crAder;
	Firm.find()
	.exec(function(err, firms) {
		if(err) {
			info = "adFirms, Firm.find(), Error!";
			Index.adOptionWrong(req, res, info);
		} else {
			res.render('./ader/firm/list', {
				title: 'Firm List',
				crAder: crAder,

				firms: firms
			});
		}
	})
}



exports.adFirmFilter = function(req, res, next) {
	let id = req.params.id;
	Firm.findOne({_id: id}, function(err, object) {
		if(err) {
			console.log(err);
			info = "adFirmFilter, Firm.findOne, Error!";
			Index.adOptionWrong(req, res, info);
		} else if(!object) {
			info = "这个批发商公司已经被删除";
			Index.adOptionWrong(req, res, info);
		} else {
			req.body.object = object;
			next();
		}
	})
}
exports.adFirmDel = function(req, res) {
	let object = req.body.object;
	let id = object._id;
	User.find({firm: id}, function(err, users) {
		if(err) {
			info = "adFirmDel, User.find, Error!";
			Index.adOptionWrong(req, res, info);
		} else if(users && users.length > 0) {
			info = "此公司中还有员工，请先删除此公司的员工";
			Index.adOptionWrong(req, res, info);
		} else {
			Firm.deleteOne({_id: id}, function(err, objRm) {
				if(err) {
					info = "adFirmDel, Firm.deleteOne, Error!";
					Index.adOptionWrong(req, res, info);
				} else {
					res.redirect("/adFirms");
				}
			})
		}
	})
}
exports.adFirm = function(req, res) {
	let object = req.body.object;

	let objBody = new Object();

	objBody.crAder = req.session.crAder;
	objBody.object = object;
	objBody.title = "批发商公司";
	objBody.thisAct = "/adFirm";
	objBody.thisTit = "批发商公司";

	User.find({firm: object._id}, function(err, users) {
		if(err) {
			info = "查看批发商公司时，批发商用户查找错误, 请联系管理员"
			Index.adOptionWrong(req, res, info);
		} else {
			objBody.users = users;
			res.render('./ader/firm/detail', objBody)
		}
	})
}



exports.adFirmUp = function(req, res) {
	let obj = req.body.obj
	obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Firm.findOne({_id: obj._id}, function(err, object) {
		if(err) {
			info = "更新批发商公司时数据库查找出现错误, 请联系管理员"
			Index.adOptionWrong(req, res, info);
		} else if(!object) {
			info = "此公司已经被删除，请刷新查看";
			Index.adOptionWrong(req, res, info);
		} else {
			Firm.findOne({code: obj.code})
			.where('_id').ne(obj._id)
			.exec(function(err, objSame) {
				if(err) {
					info = "更新批发商公司时数据库查找相同名称时出现错误, 请联系管理员"
					Index.adOptionWrong(req, res, info);
				} else if(objSame) {
					info = "已经有这个名字的批发商公司"
					Index.adOptionWrong(req, res, info);
				} else {
					let _object = _.extend(object, obj)
					_object.save(function(err, objSave) {
						if(err) {
							info = "更新批发商公司时数据库保存数据时出现错误, 请联系管理员"
							Index.adOptionWrong(req, res, info);
						} else {
							res.redirect("/adFirm/"+objSave._id)
						}
					})
				}
			})
		}
	})
}



exports.adFirmAdd =function(req, res) {
	res.render('./ader/firm/add', {
		title: 'Add 批发商公司',
		crAder : req.session.crAder,
		thisAct : "/adFirm",
		thisTit : "批发商公司",
	})
}


exports.adFirmNew = function(req, res) {
	let obj = req.body.obj;
	obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Firm.findOne({code: obj.code}, function(err, objSame) {
		if(err) {
			info = "添加批发商公司时 数据库查找错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(objSame) {
			info = "此公司帐号已经存在";
			Index.adOptionWrong(req, res, info);
		} else {
			let _object = new Firm(obj)
			_object.save(function(err, objSave){
				if(err) {
					info = "添加批发商公司时 数据库保存错误, 请联系管理员";
					Index.adOptionWrong(req, res, info);
				} else {
					res.redirect('/adFirms')
				}
			})
		}
	})
}



exports.adFirmDelAjax = function(req, res) {
	let id = req.query.id;
	Firm.findOne({_id: id}, function(err, object){
		if(err) {
			res.json({success: 0, info: "删除公司时数据库查找出现错误, 请联系管理员"});
		} else if(!object){
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"});
		} else {
			User.find({firm: id}, function(err, users) {
				if(err) {
					res.json({success: 0, info: "删除公司时数据库批发商员工查找出现错误, 请联系管理员"});
				} else if(users && users.length > 0) {
					res.json({success: 0, info: "此公司中还有员工，请先删除此公司的员工"});
				} else {
					Firm.deleteOne({_id: id}, function(err, objRm) {
						if(err) {
							res.json({success: 0, info: "删除公司时数据库保存出现错误, 请联系管理员"});
						} else {
							res.json({success: 1});
						}
					})
				}
			})
		}
	})
}
