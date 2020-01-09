let Err = require('../../aaIndex/err');

let Tner = require('../../../../models/dryer/tner');
let Tint = require('../../../../models/dryer/tint');

let _ = require('underscore');

exports.bsTners = function(req, res) {
	let crUser = req.session.crUser;

	let keySymb = '$ne';
	let keyword = ' x '
	if(req.query.keyword) {
		keySymb = '$in';
		keyword = String(req.query.keyword);
		keyword = keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyword = new RegExp(keyword + '.*');
	}

	let sortCond = 'code';
	if(req.query.sortCond) sortCond = req.query.sortCond;

	let sortVal = 1;
	if(req.query.sortVal && !isNaN(parseInt(req.query.sortVal))) {
		sortVal = parseInt(req.query.sortVal);
	}

	let skip = 0;
	if(req.query.skip && !isNaN(parseInt(req.query.skip))) {
		skip = parseInt(req.query.skip)
	}

	Tner.countDocuments({
		'firm': crUser.firm,
		$or:[
			{'code': {[keySymb]: keyword}},
			{'nome': {[keySymb]: keyword}},
		],
	}, function(err, keyCount) {
		if(err) {
			console.log(err);
			info = "bsTners, Tner.countDocuments， Error！";
			Err.usError(req, res, info);
		} else {
			Tner.find({
				'firm': crUser.firm,
				$or:[
					{'code': {[keySymb]: keyword}},
					{'nome': {[keySymb]: keyword}},
				],
			})
			.sort({[sortCond]: sortVal})
			.skip(skip)
			.limit(12)
			.exec(function(err, tners) { if(err) {
				console.log(err);
				info = "bsTners, Tner.find, Error！";
				Err.usError(req, res, info);
			} else {
				res.render('./user/bser/tner/list', {
					title: '染洗厂',
					crUser : crUser,
					tners: tners,
				})
			} })
		}
	})
}



exports.bsTnerFilter = function(req, res, next) {
	let crUser = req.session.crUser;
	let id = req.params.id
	Tner.findOne({_id: id, 'firm': crUser.firm})
	.populate({path:'tints', populate: {
		path: 'tinfirs', populate: [
			{path: 'pdfir'},
			{path: 'tinsecs', populate: [{path: 'tinthds'}, {path: 'pdsec'}]},
			{path: 'tinsezs'},
		]
	} })
	.exec(function(err, tner) { if(err) {
		info = "bsTnerFilter, Tner.findOne, Error!";
		Err.usError(req, res, info);
	} else if(!tner) {
		info = "此染洗厂已经被删除";
		Err.usError(req, res, info);
	} else {
		req.body.tner = tner;
		next();
	} })
}
exports.bsTner = function(req, res) {
	let crUser = req.session.crUser;

	let objBody = new Object();
	objBody.tner = req.body.tner;
	// console.log(objBody.tner)
	objBody.title = '染洗厂信息';
	objBody.crUser = crUser;
	objBody.thisAct = "/bsTner";

	res.render('./user/bser/tner/detail', objBody);
}


exports.bsTnerDel = function(req, res) {
	let tner = req.body.tner;
	if(tner.tints && tner.tints.length > 0) {
		info = "此染洗厂还有染洗单,不可以删除";
		Err.usError(req, res, info);
	} else {
		Tner.deleteOne({_id: tner._id}, function(err, objRm) { if(err) {
			info = "bs删除染洗厂时, 染洗厂数据库删除错误, 请联系管理员";
			Err.usError(req, res, info);
		} else {
			res.redirect('/bsTners')
		} })
	}
}

exports.bsTnerDelAjax = function(req, res) {
	let crUser = req.session.crUser;

	let id = req.query.id;
	Tner.findOne({_id: id}, function(err, object){ if(err) {
		res.json({success: 0, info: "bsTnerDelAjax, Tner.findOne, Error"})
	} else if(!object){
		res.json({success: 0, info: "此染洗厂已经被删除"})
	} else if(object.firm != crUser.firm){
		res.json({success: 0, info: "操作错误,请联系管理员! bsTnerDelAjax, object.firm != crUser.firm"})
	} else {
		if(object.tints && object.tints.length > 0) {
			res.json({success: 0, info: "此染洗厂还有染洗单,不可以删除"})
		} else {
			Tner.deleteOne({_id: object._id}, function(err, objRm) { if(err) {
				res.json({success: 0, info: "bsTnerDelAjax, Tner.deleteOne,Error!"})
			} else {
				res.json({success: 1})
			} })
		}
	} })
}




exports.bsTnerUpd = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	if(obj.code) obj.code= obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	if(obj.nome) obj.nome= obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	Tner.findOne({_id: obj._id, 'firm': crUser.firm})
	.exec(function(err, object) {
		if(err) {
			info = "bsTnerUpd, Tner.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!object) {
			info = "deleted! refresh Page!";
			Err.usError(req, res, info);
		} else {
			Tner.findOne({'nome': obj.nome, 'firm': crUser.firm})
			.where('_id').ne(obj._id)
			.exec(function(err, objExist) {
				if(err) {
					info = "bsTnerUpd, Tner.findOne, Error!";
					Err.usError(req, res, info);
				} else if(objExist) {
					info = "已经有了此名字！";
					Err.usError(req, res, info);
				} else {
					let _object
					_object = _.extend(object, obj)
					_object.save(function(err, objSave){
						if(err) console.log(err);
						res.redirect('/bsTner/'+objSave._id);
					})
				}
			})
		} 
	})
}



exports.bsTnerAdd =function(req, res) {
	let crUser = req.session.crUser;

	Tner.countDocuments({'firm': crUser.firm}, function(err, count) { if(err) {
		info = "bsTnerAdd, Tner.countDocuments, Error!";
		Err.usError(req, res, info);
	} else {
		count = count +1;
		for(let len = (count + "").length; len < 4; len = count.length) { // 序列号补0
			count = "0" + count;            
		}
		let code = count;
		let tintId = req.query.tint;
		res.render('./user/bser/tner/add', {
			title: '新染洗厂',
			crUser : req.session.crUser,
			code: code,
			tintId: tintId,
			thisAct: "/bsTner",
		});
	} })
}


exports.bsTnerNew = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj

	if(obj.code) {
		obj.code= obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	} else {
		obj.code = 'NON';
	}
	if(obj.nome) obj.nome = obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	if(obj.iva) obj.iva= obj.iva.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	obj.firm = crUser.firm;
	Tner.findOne({'firm': crUser.firm, nome: obj.nome}, function(err, objSm) {
		if(err) {
			info = "bsTnerNew, Tner.findOne, Error!";
			Err.usError(req, res, info);
		} else if(objSm) {
			info = "已经有了此名字, 请换个名字！";
			Err.usError(req, res, info);
		} else {
			let _tner = new Tner(obj);
			_tner.save(function(err, tnerSave) { if(err) {
				info = "bsTnerNew, _tner.save, Error!";
				Err.usError(req, res, info);
			} else {
				if(obj.tint) {
					let tintId = obj.tint;
					Tint.findOne({_id: tintId}, function(err, tint) { if(err) {
						info = "bsTnerNew, Tint.findOne, Error!";
						Err.usError(req, res, info);
					} else if(!tint) {
						info = "相应订单已被删除，请重新操作";
						Err.usError(req, res, info);
					} else {
						tint.tner = tnerSave._id;
						tint.save(function(err, tintSave) {
							if(err) console.log(err);
							res.redirect('/bsTint/'+tintId)
						})
					} })
					
				} else {
					res.redirect('/bsTners')
				}
			} })
		}
	})
		
}


exports.bsTnerIsAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Tner.findOne({
		'firm': crUser.firm,
		[keytype]: keyword
	})
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "bsTnerIsAjax, Tner.findOne, Error!"});
		} else if(object){
			res.json({ success: 1, object: object})
		} else {
			res.json({success: 0})
		}
	})
}

exports.bsTnersObjAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Tner.find({
		'firm': crUser.firm,
		$or:[
			{'code': new RegExp(keyword + '.*')},
			{'nome': new RegExp(keyword + '.*')},
		]
	})
	.limit(20)
	.exec(function(err, tners){
		if(err) {
			res.json({success: 0, info: "bs获取染洗厂列表时，数据库查找错误, 请联系管理员"});
		} else if(tners){
			res.json({ success: 1, tners: tners})
		} else {
			res.json({success: 0})
		}
	})
}