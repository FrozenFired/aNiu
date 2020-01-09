let Err = require('../../aaIndex/err');
let Conf = require('../../../../confile/conf');
let SaveMachinPre = require('../../../../confile/middle/saveMachinPre');

let Machin = require('../../../../models/foundry/machin');
let Macfir = require('../../../../models/foundry/macfir');
let Macsec = require('../../../../models/foundry/macsec');
let Macthd = require('../../../../models/foundry/macthd');

let Pdfir = require('../../../../models/material/pdfir');
let Pdsec = require('../../../../models/material/pdsec');
let Pdthd = require('../../../../models/material/pdthd');

let User = require('../../../../models/login/user');
let Fder = require('../../../../models/foundry/fder');

let _ = require('underscore')
let moment = require('moment')


/* ------------------------------- 添加生产单时的产品操作 ------------------------------- */
// 模糊查找出产品
exports.bsMachinProdsAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keywmac = ' x x x ';
	if(req.query.keywmac) {
		keywmac = String(req.query.keywmac);
		keywmac = keywmac.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keywmac = new RegExp(keywmac + '.*');
	}
	Pdfir.find({'firm': crUser.firm,'code':  keywmac,})
	.populate({path: 'pdsecs', populate: {path: 'pdthds'}})
	.limit(10)
	.exec(function(err, pdfirs) { if(err) {
		res.json({success: 0, info: "bsProdsAjax, Machin.find, Error"})
	} else {
		res.json({success: 1, pdfirs: pdfirs})
	} })
}


exports.bsMachinFilter = function(req, res, next) {
	let id = req.params.id
	Machin.findOne({_id: id})
	.populate('firm')
	.populate('fder')
	.populate({path:'macfirs', populate: [
		{path: 'pdfir', populate:{path: 'pdsecs', populate:{path: 'pdthds'}}}, 
		{path: 'macsecs', populate: [
			{path: 'macthds', populate: {path: 'pdthd'}},
			{path: 'pdsec'}
		]},
		{path: 'macsezs', populate: {path: 'pdsez'}}
	] })
	.exec(function(err, machin) { if(err) {
		info = "bs查看生产单时, 生产单数据库错误, 请联系管理员";
		Err.usError(req, res, info);
	} else if(!machin) {
		info = "machin 数据已经被删除，请刷新查看";
		Err.usError(req, res, info);
	} else if(!machin.firm){
		info = "bs查看生产单时, 本公司数据不存在, 请联系管理员";
		Err.usError(req, res, info);
	} else {
		req.body.machin = machin;
		next()
	} })
}

exports.bsMachin = function(req, res) {
	let crUser = req.session.crUser;

	let machin = req.body.machin;
	let objBody = new Object();
	objBody.machin = machin;
	objBody.firm = machin.firm;
	objBody.title = '生产单';
	objBody.crUser = crUser;
	objBody.thisAct = "/bsMachin";
	let detail = 'detail';
	if(machin.status == 5) {
		detail = 'detail5'
	} else if(machin.status == 10) {
		detail = 'detail10'
	}
	// console.log(detail)
	res.render('./user/bser/machin/detail/detail', objBody);
}








exports.bsMachinUp = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.params.id
	Machin.findOne({_id: id})
	.populate('fder')
	.populate({path:'macfirs', populate: [
		{path: 'pdfir', populate: [
			{path: 'pdsecs'}, {path: 'pdsezs'}
		]}, 
		{path: 'macsezs', populate:{path: 'pdsez'}}, 
		{path: 'macsecs', populate: [
			{path: 'pdsec', populate: {path: 'pdthds'}},
			{path: 'macthds', populate: {path: 'pdthd'}}
		]}
	] })
	.exec(function(err, machin) { 
		if(err) {
			info = "bs查看生产单时, 生产单数据库错误, 请联系管理员";
			Err.usError(req, res, info);
		} else if(!machin) {
			info = "machin 数据已经被删除，请刷新查看";
			Err.usError(req, res, info);
		} else if(!machin.macfirs && machin.macfirs.length == 0) {
			info = "machin 中的数据已经被删除，请刷新查看";
			Err.usError(req, res, info);
		} else {
			let update = 'update0';
			if(machin.macfirs[0].pdfir.semi == 1) {
				update = 'update1'
			}
			res.render('./user/bser/machin/update/'+update, {
				title : '生产单更新',
				crUser: crUser,
				machin : machin,
			});
		} 
	})
}



exports.bsMachinRelFderAjax = function(req, res) {
	let crUser = req.session.crUser;
	let machinId = req.query.machinId
	let fderId = req.query.fderId
	
	Machin.findOne({_id: machinId}, function(err, machin){
		if(err) {
			console.log(err);
			info = "bsMachinRelFderAjax, Machin.findOne, Error!"
			res.json({success: 0, info: info})
		} else if(!machin) {
			info = "没有找到订单， 请刷新重试!"
			res.json({success: 0, info: info})
		} else {
			Fder.findOne({_id: fderId}, function(err, fder) {
				if(err) {
					console.log(err);
					info = "bsMachinRelFderAjax, Fder.findOne, Error!"
					res.json({success: 0, info: info})
				} else if(!fder) {
					info = "没有找到选择的客户， 请刷新重试!"
					res.json({success: 0, info: info})
				} else {
					machin.fder = fder._id;
					machin.save(function(err, machinSv){
						if(err) {
							console.log(err);
							info = "bsMachinRelFderAjax, machin.save, Error!"
							res.json({success: 0, info: info})
						} else {
							res.json({success: 1})
						}
					})
				}
			})
		}
	})
}





exports.bsMachinDel = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.params.id
	Machin.findOne({_id: id, 'firm': crUser.firm})
	.populate({path: 'macfirs', populate: [
		{path: 'pdfir'},
		{path: 'macsezs', populate: {path: 'pdsez'}},
		{path: 'macsecs', populate: {path: 'macthds', populate: {path: 'pdthd'}}},
	]})
	.populate('fder')
	.exec(function(err, machin) {
		if(err) {
			console.log(err);
			info = "bsMachinDel, Machin.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!machin) {
			info = "生产单已经不存在, 请刷新查看!";
			Err.usError(req, res, info);
		} else {
			// 删除生产单时 pd和mac解除关联
			SaveMachinPre.pdRelMachinDel(machin, 'bsMachinDel');
			SaveMachinPre.bsMachinDelPre(machin._id);
			Machin.deleteOne({_id: id}, function(err, machinRm) {
				if(err) {
					info = "bsMachinDel, Machin.deleteOne, Error!";
					Err.usError(req, res, info);
				} else {
					res.redirect("/bsMacs?preUrl=bsMachinDel");
				}
			})
		}
	})
}