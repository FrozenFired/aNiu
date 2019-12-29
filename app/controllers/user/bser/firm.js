let Err = require('../aaIndex/err');

let Firm = require('../../../models/login/firm');
let _ = require('underscore');

exports.bsFirm = function(req, res) {
	let crUser = req.session.crUser;
	Firm.findOne({_id: crUser.firm}, function(err, firm) {
		if(err) {
			console.log(err);
			info = "bsFirm, Firm.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!firm) {
			info = "公司信息出现错误，联系管理员";
			Err.usError(req, res, info);
		} else {
			res.render('./user/bser/firm/detail', {
				title: '公司信息',
				crUser: crUser,

				firm : firm,
				colors: firm.colors,
			});
		}
	});
}


exports.bsFirmUpd = function(req, res) {
	let obj = req.body.obj;
	Firm.findOne({_id: obj._id}, function(err, object) {
		if(err) {
			console.log(err);
			info = "bsFirmUpd, Firm.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!object) {
			info = "公司信息被删除, 请联系管理员";
			Err.usError(req, res, info);
		} else {
			let _object = _.extend(object, obj);
			_object.save(function(err, objSave) {
				if(err) {
					info = "修改公司信息时，数据库保存错误 请联系管理员";
					Err.usError(req, res, info);
				} else {
					res.redirect("/bsFirm");
				}
			});
		}
	});
}




exports.bsColorNew = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	if(obj.color) obj.color = obj.color.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	if(obj.color && obj.color.length>0) {
		Firm.findOne({_id: crUser.firm}, function(err, object) {
			if(err) {
				info = "查找公司信息时，数据库错误 请联系管理员";
				Err.usError(req, res, info);
			} else if(!object) {
				info = "公司信息出现错误，联系管理员";
				Err.usError(req, res, info);
			} else {
				let flag = 0;
				if(object.colors && object.colors.length>0) {
					let colors = object.colors;
					let len = colors.length;
					for(i = 0; i<len; i++) {
						if(obj.color == colors[i]) break;
					}
					if(i==len) {
						flag = 1;
						object.colors.push(obj.color)
					}
				} else {
					flag = 1;
					object.colors = new Array();
					object.colors.push(obj.color)
				}

				if(flag == 1) {
					object.save(function(err, objSave) {
						if(err) console.log(err);
						res.redirect('/bsFirm');
					})
				} else {
					res.redirect('/bsFirm');
				}
			}
		});
	} else {
		info = "您没有输入颜色";
		Err.usError(req, res, info);
	}
}

exports.bsColorDelAjax = function(req, res) {
	let crUser = req.session.crUser;
	let color = req.query.color;
	Firm.findOne({_id: crUser.firm}, function(err, object) {
		if(err) {
			info = "查找公司信息时，数据库错误 请联系管理员";
			Err.usError(req, res, info);
		} else if(!object || !object.colors) {
			info = "公司信息出现错误，联系管理员";
			Err.usError(req, res, info);
		} else {
			object.colors.remove(color)
			object.save(function(err, objSave) {
				if(err) {
					res.json({success: 0, info: 'bsColorDelAjax, object.save, Error!'})
				} else {
					res.json({success: 1})
				}
			})
		}
	});
}


exports.bsSizeNew = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	if(obj.size) obj.size = obj.size.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	if(obj.size && obj.size.length>0) {
		Firm.findOne({_id: crUser.firm}, function(err, object) {
			if(err) {
				info = "查找公司信息时，数据库错误 请联系管理员";
				Err.usError(req, res, info);
			} else if(!object) {
				info = "公司信息出现错误，联系管理员";
				Err.usError(req, res, info);
			} else {
				let flag = 0;
				if(object.sizes && object.sizes.length>0) {
					let sizes = object.sizes;
					let len = sizes.length;
					for(i = 0; i<len; i++) {
						if(obj.size == sizes[i]) break;
					}
					if(i==len) {
						flag = 1;
						object.sizes.push(obj.size)
					}
				} else {
					flag = 1;
					object.sizes = new Array();
					object.sizes.push(obj.size)
				}

				if(flag == 1) {
					object.save(function(err, objSave) {
						if(err) console.log(err);
						res.redirect('/bsFirm');
					})
				} else {
					res.redirect('/bsFirm');
				}
			}
		});
	} else {
		info = "您没有输入颜色";
		Err.usError(req, res, info);
	}
}

exports.bsSizeDelAjax = function(req, res) {
	let crUser = req.session.crUser;
	let size = req.query.size;
	Firm.findOne({_id: crUser.firm}, function(err, object) {
		if(err) {
			info = "查找公司信息时，数据库错误 请联系管理员";
			Err.usError(req, res, info);
		} else if(!object || !object.sizes) {
			info = "公司信息出现错误，联系管理员";
			Err.usError(req, res, info);
		} else {
			object.sizes.remove(size)
			object.save(function(err, objSave) {
				if(err) {
					res.json({success: 0, info: 'bsSizeDelAjax, object.save, Error!'})
				} else {
					res.json({success: 1})
				}
			})
		}
	});
}