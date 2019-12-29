let Index = require('./index')
let ObjDB = require('../../models/login/ader')
let _ = require('underscore')


exports.aderAdd =function(req, res) {
	res.render('./ader/ader/add', {
		title: 'Add Adminnistrator',
		crAder : req.session.crAder,
		action: "/aderNew",
	})
}

exports.aderNew = function(req, res) {
	let obj = req.body.obj
	obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '');
	ObjDB.findOne({code: obj.code}, function(err, objSame) {
		if(err) {
			info = "添加admin时数据库错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(objSame) {
			info = "此帐号已经被注册，请重新注册"
			Index.adOptionWrong(req, res, info)
		} else {
			let _ader = new ObjDB(obj)
			_ader.save(function(err, objSave){
				if(err) {
					info = "添加admin时数据库存储admin错误, 请联系管理员";
					Index.adOptionWrong(req, res, info);
				} else {
					res.redirect('/aders')
				}
			})
		}
	})
}

exports.aders = function(req, res) {
	ObjDB.find(function(err, objects) {
		if(err) {
			info = "查看adimn列表时 数据库查找错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else {
			res.render('./ader/ader/list', {
				title: '用户列表',
				crAder : req.session.crAder,
				objects: objects
			})
		}
	})
}

exports.ader = function(req, res) {
	let id = req.params.id
	ObjDB.findOne({_id: id}, function(err, object) {
		if(err) {
			info = "查看adimn信息时 数据库查找错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(!object) {
			info = "This code is not exist";
			Index.adOptionWrong(req, res, info)
		} else {
			res.render('./ader/ader/detail', {
				title: '用户列表',
				crAder : req.session.crAder,
				object: object
			})
		}
	})
}

exports.aderDelAjax = function(req, res) {
	let id = req.query.id
	ObjDB.findOne({_id: id}, function(err, object){
		if(err) {
			res.json({success: 0, info: "删除adimn时 数据库查找错误, 请联系管理员"})
		} else if(object){
			ObjDB.deleteOne({_id: id}, function(err, object) {
				if(err) console.log(err) 
				res.json({success: 1})
			})
		} else {
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"})
		}
	})
}