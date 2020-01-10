let Err = require('../../aaIndex/err');

let Fder = require('../../../../models/foundry/fder');
let Machin = require('../../../../models/foundry/machin');

let _ = require('underscore');

exports.bsFders = function(req, res) {
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

	Fder.countDocuments({
		'firm': crUser.firm,
		$or:[
			{'code': {[keySymb]: keyword}},
			{'nome': {[keySymb]: keyword}},
		],
	}, function(err, keyCount) {
		if(err) {
			console.log(err);
			info = "bsFders, Fder.countDocuments， Error！";
			Err.usError(req, res, info);
		} else {
			Fder.find({
				'firm': crUser.firm,
				$or:[
					{'code': {[keySymb]: keyword}},
					{'nome': {[keySymb]: keyword}},
				],
			})
			.sort({[sortCond]: sortVal})
			.skip(skip)
			.limit(12)
			.exec(function(err, fders) { if(err) {
				console.log(err);
				info = "bsFders, Fder.find, Error！";
				Err.usError(req, res, info);
			} else {
				res.render('./user/bser/machin/fder/list', {
					title: '工厂',
					crUser : crUser,
					fders: fders,
				})
			} })
		}
	})
}



exports.bsFderFilter = function(req, res, next) {
	let crUser = req.session.crUser;
	let id = req.params.id
	Fder.findOne({_id: id, 'firm': crUser.firm})
	.populate({path:'machins', populate: {
		path: 'macfirs', populate: [
			{path: 'pdfir'},
			{path: 'macsecs', populate: [{path: 'macthds'}, {path: 'pdsec'}]},
			{path: 'macsezs'},
		]
	} })
	.exec(function(err, fder) { if(err) {
		info = "bsFderFilter, Fder.findOne, Error!";
		Err.usError(req, res, info);
	} else if(!fder) {
		info = "此工厂已经被删除";
		Err.usError(req, res, info);
	} else {
		req.body.fder = fder;
		next();
	} })
}
exports.bsFder = function(req, res) {
	let crUser = req.session.crUser;

	let objBody = new Object();
	objBody.fder = req.body.fder;
	// console.log(objBody.object)
	objBody.title = '工厂信息';
	objBody.crUser = crUser;
	objBody.thisAct = "/bsFder";

	res.render('./user/bser/machin/fder/detail', objBody);
}


exports.bsFderDel = function(req, res) {
	let fder = req.body.fder;
	if(fder.machins && fder.machins.length > 0) {
		info = "此工厂还有生产单,不可以删除";
		Err.usError(req, res, info);
	} else {
		Fder.deleteOne({_id: fder._id}, function(err, objRm) { if(err) {
			info = "bs删除工厂时, 工厂数据库删除错误, 请联系管理员";
			Err.usError(req, res, info);
		} else {
			res.redirect('/bsFders')
		} })
	}
}

exports.bsFderDelAjax = function(req, res) {
	let crUser = req.session.crUser;

	let id = req.query.id;
	Fder.findOne({_id: id}, function(err, object){ if(err) {
		res.json({success: 0, info: "bsFderDelAjax, Fder.findOne, Error"})
	} else if(!object){
		res.json({success: 0, info: "此工厂已经被删除"})
	} else if(object.firm != crUser.firm){
		res.json({success: 0, info: "操作错误,请联系管理员! bsFderDelAjax, object.firm != crUser.firm"})
	} else {
		if(object.machins && object.machins.length > 0) {
			res.json({success: 0, info: "此工厂还有生产单,不可以删除"})
		} else {
			Fder.deleteOne({_id: object._id}, function(err, objRm) { if(err) {
				res.json({success: 0, info: "bsFderDelAjax, Fder.deleteOne,Error!"})
			} else {
				res.json({success: 1})
			} })
		}
	} })
}




exports.bsFderUpd = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	if(obj.code) obj.code= obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	if(obj.nome) obj.nome= obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	Fder.findOne({_id: obj._id, 'firm': crUser.firm})
	.exec(function(err, object) {
		if(err) {
			info = "bsFderUpd, Fder.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!object) {
			info = "deleted! refresh Page!";
			Err.usError(req, res, info);
		} else {
			Fder.findOne({'nome': obj.nome, 'firm': crUser.firm})
			.where('_id').ne(obj._id)
			.exec(function(err, objExist) {
				if(err) {
					info = "bsFderUpd, Fder.findOne, Error!";
					Err.usError(req, res, info);
				} else if(objExist) {
					info = "已经有了此名字！";
					Err.usError(req, res, info);
				} else {
					let _object
					_object = _.extend(object, obj)
					_object.save(function(err, objSave){
						if(err) console.log(err);
						res.redirect('/bsFder/'+objSave._id);
					})
				}
			})
		} 
	})
}



exports.bsFderAdd =function(req, res) {
	let crUser = req.session.crUser;

	Fder.countDocuments({'firm': crUser.firm}, function(err, count) { if(err) {
		info = "bsFderAdd, Fder.countDocuments, Error!";
		Err.usError(req, res, info);
	} else {
		count = count +1;
		for(let len = (count + "").length; len < 4; len = count.length) { // 序列号补0
			count = "0" + count;            
		}
		let code = count;
		let machinId = req.query.machin;
		res.render('./user/bser/machin/fder/add', {
			title: '新工厂',
			crUser : req.session.crUser,
			code: code,
			machinId: machinId,
			thisAct: "/bsFder",
		});
	} })
}


exports.bsFderNew = function(req, res) {
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
	Fder.findOne({'firm': crUser.firm, nome: obj.nome}, function(err, objSm) {
		if(err) {
			info = "bsFderNew, Fder.findOne, Error!";
			Err.usError(req, res, info);
		} else if(objSm) {
			info = "已经有了此名字, 请换个名字！";
			Err.usError(req, res, info);
		} else {
			let _fder = new Fder(obj);
			_fder.save(function(err, fderSave) { if(err) {
				info = "bsFderNew, _fder.save, Error!";
				Err.usError(req, res, info);
			} else {
				if(obj.machin) {
					let machinId = obj.machin;
					Machin.findOne({_id: machinId}, function(err, machin) { if(err) {
						info = "bsFderNew, Machin.findOne, Error!";
						Err.usError(req, res, info);
					} else if(!machin) {
						info = "相应订单已被删除，请重新操作";
						Err.usError(req, res, info);
					} else {
						machin.fder = fderSave._id;
						machin.save(function(err, machinSave) {
							if(err) console.log(err);
							res.redirect('/bsMachin/'+machinId)
						})
					} })
					
				} else {
					res.redirect('/bsFders')
				}
			} })
		}
	})
		
}


exports.bsFderIsAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Fder.findOne({
		'firm': crUser.firm,
		[keytype]: keyword
	})
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "bsFderIsAjax, Fder.findOne, Error!"});
		} else if(object){
			res.json({ success: 1, object: object})
		} else {
			res.json({success: 0})
		}
	})
}


exports.bsFdersObjAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Fder.find({
		'firm': crUser.firm,
		$or:[
			{'code': new RegExp(keyword + '.*')},
			{'nome': new RegExp(keyword + '.*')},
		]
	})
	.limit(20)
	.exec(function(err, fders){
		if(err) {
			res.json({success: 0, info: "bs获取工厂列表时，数据库查找错误, 请联系管理员"});
		} else if(fders){
			res.json({ success: 1, fders: fders})
		} else {
			res.json({success: 0})
		}
	})
}