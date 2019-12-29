let Err = require('../aaIndex/err');
let Conf = require('../../../confile/conf');
let SaveMachinpre = require('../../../confile/middle/saveMachinPre');

let moment = require('moment')

let Machin = require('../../../models/foundry/machin');
let Macfir = require('../../../models/foundry/macfir');
let Macsec = require('../../../models/foundry/macsec');
let Macsez = require('../../../models/foundry/macsez');
let Macthd = require('../../../models/foundry/macthd');

let Pdfir = require('../../../models/material/pdfir');

exports.bsMacs = function(req, res) {
	let crUser = req.session.crUser;

	/* ---------- Fder 筛选 ------------- */
	let randId = '1d5e744e6a5a830c1a469cee'
	let symFder = "$ne";
	let condFder = randId;
	if(req.query.fder && req.query.fder.length == 24){
		symFder = "$eq";
		condFder = req.query.fder;
	}
	/* ---------- Fder 筛选 ------------- */

	Machin.find({
		'firm': crUser.firm,
		'fder': {[symFder]: condFder},
		'status': 5,
	})
	.populate('fder', 'nome')
	.populate({path: 'macfirs', populate: [
		{path: 'pdfir'},
		{path: 'macsecs', populate: [
			{path: 'pdsec'},
			{path: 'macthds', populate: {path: 'pdthd'}},
		]},
		{path: 'macsezs', populate: {path: 'pdthd'}}
	]})
	.sort({"status": 1, "ctAt": -1})
	.exec(function(err, machins) {
		if(err) {
			info = "bsMachins, User.find, Error";
			Err.usError(req, res, info);
		} else {

			Pdfir.find({
				'firm': crUser.firm,
			})
			.populate({path: 'pdsecs', populate: [
				{path: 'pdthds', populate: [
					{path: 'ordthds'},
					{path: 'macthds'},
					// {path: 'tinthds'},
				]},
			]})
			.populate({path: 'pdsezs', populate: [
				{path: 'macsezs'}, 
				{path: 'pdthds', populate:[
					{path: 'ordthds'}, {path: 'tinthds'}
				]},
			]})
			.exec(function(err, pdfirs) { if(err) {
				console.log(err);
				info = "bsProducts, Pdfir.find， Error！";
				Err.usError(req, res, info);
			} else {
				let products = bsMacGetProducts(pdfirs);
				res.render('./user/bser/machin/machin5', {
					title : '生产单',
					crUser: crUser,
					machins : machins,
					products : products,
				});
			} })

		}
	})
}
let bsMacGetProducts = function(pdfirs) {
	let products = new Array();
	for(let i=0; i<pdfirs.length; i++) {
		let pdfir = pdfirs[i];
		let needMac = 0;				// 获取一个产品所需生产的数量
		let selColors = new Array();	// 获取一个产品所需生产的颜色
		if(pdfir.semi == 1) {
			for(let j=0; j<pdfir.pdsezs.length; j++) {
				let pdsez = pdfir.pdsezs[j];
				let quotTthds = 0;
				let needTthds = 0;
				for (let k=0; k<pdsez.pdthds.length; k++) {
					let pdthd = pdsez.pdthds[k];
					let quotOthd = shipOthd = 0;
					let quotTthd = shipTthd = 0;
					for(let m=0; m<pdthd.ordthds.length; m++) {
						let ordthd = pdthd.ordthds[m];
						if(!isNaN(parseInt(ordthd.quot))) {
							quotOthd += parseInt(ordthd.quot);
						}
						if(!isNaN(parseInt(ordthd.ship))) {
							shipOthd += parseInt(ordthd.ship);
						}
					}
					for(let m=0; m<pdthd.tinthds.length; m++) {
						let tinthd = pdthd.tinthds[m];
						if(!isNaN(parseInt(tinthd.quot))) {
							quotTthd += parseInt(tinthd.quot);
						}
						if(!isNaN(parseInt(tinthd.ship))) {
							shipTthd += parseInt(tinthd.ship);
						}
					}
					let showThdStock = parseInt(pdthd.stock) + shipTthd - shipOthd;
					let needTthd = (quotOthd-shipOthd) - (quotTthd-shipTthd) - showThdStock;
					if(needTthd < 0) needTthd = 0;
					needTthds += needTthd;
					quotTthds += quotTthd;	// 正在染色的
				}
				let quotMsez = shipMsez = 0;
				for(let m=0; m<pdsez.macsezs.length; m++) {
					let macsez = pdsez.macsezs[m];
					if(!isNaN(parseInt(macsez.quot))) {
						quotMsez += parseInt(macsez.quot);
					}
					if(!isNaN(parseInt(macsez.ship))) {
						shipMsez += parseInt(macsez.ship);
					}
				}
				let stock = parseInt(pdsez.stock);
				let showSezStock = stock + shipMsez - quotTthds
				needMac += needTthds - showSezStock - (quotMsez - shipMsez);
			}
			// console.log(needMac)
		} else {
			for(let j=0; j<pdfir.pdsecs.length; j++) {
				let pdsec = pdfir.pdsecs[j];
				let ndsecMac = 0;
				for(let k=0; k<pdsec.pdthds.length; k++) {
					let pdthd = pdsec.pdthds[k];
					let quotOthd = shipOthd = 0;
					let quotMthd = shipMthd = 0;
					for(let m=0; m<pdthd.ordthds.length; m++) {
						let ordthd = pdthd.ordthds[m];
						if(!isNaN(parseInt(ordthd.quot))) {
							quotOthd += parseInt(ordthd.quot);
						}
						if(!isNaN(parseInt(ordthd.ship))) {
							shipOthd += parseInt(ordthd.ship);
						}
					}
					for(let m=0; m<pdthd.macthds.length; m++) {
						let macthd = pdthd.macthds[m];
						if(!isNaN(parseInt(macthd.quot))) {
							quotMthd += parseInt(macthd.quot);
						}
						if(!isNaN(parseInt(macthd.ship))) {
							shipMthd += parseInt(macthd.ship);
						}
					}
					let showStock = parseInt(pdthd.stock) + shipMthd - shipOthd;
					let ndthdMac = (quotOthd - shipMthd) - (quotMthd - shipMthd) - showStock;
					if(ndthdMac < 0) ndthdMac = 0;
					ndsecMac += ndthdMac;
					needMac += ndthdMac;
				}
				if(ndsecMac > 0) {
					selColors.push(pdsec.color)
				}
			}
		}
		if(needMac > 0) {
			pdfir.needMac = needMac;
			pdfir.selColors = selColors;
			products.push(pdfir);
		}
	}
	return products;
}

exports.bsMacHis = function(req, res) {
	let crUser = req.session.crUser;

	let symAtFm = "$gte";
	let condAtFm = new Date(new Date().setHours(0, 0, 0, 0))
	let symAtTo = "$lte";
	let condAtTo = new Date(new Date().setHours(23, 59, 59, 0)) 
	if(req.query.atFm && req.query.atFm.length == 10){
		symAtFm = "$gte";   // $ ne eq gte gt lte lt
		condAtFm = new Date(req.query.atFm).setHours(0,0,0,0);
	}
	if(req.query.atTo && req.query.atTo.length == 10){
		symAtTo = "$lte";
		condAtTo = new Date(req.query.atTo).setHours(23,59,59,0);
	}

	/* ---------- Fder 筛选 ------------- */
	let randId = '1d5e744e6a5a830c1a469cee'
	let symFder = "$ne";
	let condFder = randId;
	if(req.query.fder && req.query.fder.length == 24){
		symFder = "$eq";
		condFder = req.query.fder;
	}
	/* ---------- Fder 筛选 ------------- */

	Machin.find({
		'firm': crUser.firm,
		'fder': {[symFder]: condFder},
		'status': 10,
		'ctAt': {[symAtFm]: condAtFm, [symAtTo]: condAtTo}
		// $or:[
		// 	{'status': 5},
		// 	{'status': 10,'ctAt': {[symAtFm]: condAtFm, [symAtTo]: condAtTo}},
		// ],
	})
	.populate('fder', 'nome')
	.populate({path: 'macfirs', populate: [
		{path: 'pdfir'},
		{path: 'macsecs', populate: [
			{path: 'pdsec'},
			{path: 'macthds', populate: {path: 'pdthd'}}
		]},
		{path: 'macsezs', populate:{path: 'pdsez'}}
	]})
	.sort({"status": 1, "ctAt": -1})
	.exec(function(err, machins) {
		if(err) {
			info = "bsMachins, User.find, Error";
			Err.usError(req, res, info);
		} else {
			res.render('./user/bser/machin/machin10', {
				title : '生产单记录',
				crUser: crUser,
				machins : machins,
			});
		}
	})
}



exports.bsMachinSend = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	let thds = obj.thds;
	let macs = new Array();
	for(i in thds) {
		if(thds[i].shiping > 0) {
			macs.push(thds[i])
		}
	}
	if(obj.semi == 1) {
		bsMacsezSend(res, macs, 0)
	} else {
		bsMacthdSend(res, macs, 0)
	}
}
let bsMacsezSend = function(res, macs, n) {
	if(n == macs.length) {
		return res.redirect('/bsMacs');
	} else {
		let mac = macs[n];
		let shiping = parseInt(mac.shiping);
		let macsezId = mac.macsezId;
		Macsez.findOne({_id: macsezId})
		.populate('pdsez')
		.exec(function(err, macsez) {
			if(err) console.log(err);
			let pdsez = macsez.pdsez
			macsez.ship = parseInt(macsez.ship) + shiping;
			macsez.save(function(err, macsezSave) {
				if(err) console.log(err);
				bsMacsezSend(res, macs, n+1)
			})
		})
	}
}
let bsMacthdSend = function(res, macs, n) {
	if(n == macs.length) {
		return res.redirect('/bsMacs');
	} else {
		let mac = macs[n];
		let shiping = parseInt(mac.shiping);
		let macthdId = mac.macthdId;
		Macthd.findOne({_id: macthdId})
		.populate('pdthd')
		.exec(function(err, macthd) {
			if(err) console.log(err);
			let pdthd = macthd.pdthd
			macthd.ship = parseInt(macthd.ship) + shiping;
			macthd.save(function(err, macthdSave) {
				if(err) console.log(err);
				bsMacthdSend(res, macs, n+1)
			})
		})
	}
}


exports.bsMacNew = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	Pdfir.findOne({_id: obj.pdfirId}, function(err, pdfir) {
		if(err) {
			info = "bsMacNew, Pdfir.findOne, Error!";
			Err.usError(req, res, info);
			console.log(err)
		} else {
			let dbs = new Array();

			/* ====== 创建生产单数据库 ====== */
			let machinObj = new Object();
			machinObj.firm = crUser.firm;
			machinObj.creater = crUser._id;
			machinObj.status = 5;
			machinObj.code = moment(Date.now()).format('YYMMDD');
			machinObj.fder = obj.fderId;
			machinObj.sizes = pdfir.sizes
			let _machin = new Machin(machinObj);
			/* ====== 创建生产单数据库 ====== */

			/* ====== 创建macfir数据库 ====== */
			let macfirObj = new Object();
			macfirObj.machin = _machin._id;
			macfirObj.pdfir = obj.pdfirId;
			macfirObj.macCost = pdfir.macCost;
			let _macfir = new Macfir(macfirObj);
			/* ====== 创建macfir数据库 ====== */

			if(pdfir.semi == 1) {
				/* =============== 创建macsec数据库 =============== */
				for(let j in obj.sezs) {
					let sez = obj.sezs[j];
					if(parseInt(sez.quot) > 0) {
						let macsezObj = new Object();
						macsezObj.machin = _machin._id;
						macsezObj.macfir = _macfir._id;
						macsezObj.pdsez = sez.pdsezId;
						macsezObj.size = parseInt(sez.size);
						macsezObj.quot = parseInt(sez.quot);
						let _macsez = new Macsez(macsezObj);
						
						_macfir.macsezs.push(_macsez._id);
						dbs.push(_macsez);
					}
				}
				if(_macfir.macsezs.length > 0) {	// 如果fir中有sec则加入到machin
					_machin.macfirs.push(_macfir._id);
					dbs.push(_macfir);
				}
			} 

			else {
				/* =============== 创建macsec数据库 =============== */
				for(let j in obj.secs) {
					let sec = obj.secs[j];
					let macsecObj = new Object();
					macsecObj.machin = _machin._id;
					macsecObj.macfir = _macfir._id;
					macsecObj.pdsec = sec.pdsecId;
					macsecObj.color = sec.color;
					let _macsec = new Macsec(macsecObj);

					/* =========== 创建macthd数据库 =========== */
					for(let k in sec.thds) {
						let thd = sec.thds[k];
						if(parseInt(thd.quot) > 0) {	// 如果有数据再创建
							let macthdObj = new Object();
							macthdObj.machin = _machin._id;
							macthdObj.macfir = _macfir._id;
							macthdObj.macsec = _macsec._id;
							macthdObj.pdthd = thd.pdthdId;
							macthdObj.size = parseInt(thd.size);
							macthdObj.quot = parseInt(thd.quot);
							let _macthd = new Macthd(macthdObj);

							_macsec.macthds.push(_macthd._id)
							dbs.push(_macthd);
						}
					}
					/* =========== 创建macthd数据库 =========== */
					if(_macsec.macthds.length > 0) {	// 如果sec中有thd就加入到fir
						_macfir.macsecs.push(_macsec._id);
						dbs.push(_macsec)
					}
				}
				if(_macfir.macsecs.length > 0) {	// 如果fir中有sec则加入到machin
					_machin.macfirs.push(_macfir._id);
					dbs.push(_macfir);
				}
			}
			/* =============== 创建macsec数据库 =============== */
			if(_machin.macfirs.length > 0) {
				bsMacSave(req, res, _machin, dbs, 0);
			} else {
				info = "请添加模特数量";
				Err.usError(req, res, info);
			}
		}
	})
}
let bsMacSave = function(req, res, machin, dbs, n) {
	if(n == dbs.length) {
		machin.save(function(err, machinSv) {
			if(err) {
				info = "bsMachinNew, Machin.save, Error!";console.log(err);
				Err.usError(req, res, info);
			} else {
				/* =============== 重新找到此生产单，做保存前的操作 =============== */
				Machin.findOne({_id: machinSv._id})
				.populate({path: 'macfirs', populate: [
					{path: 'pdfir'},
					{path: 'macsecs', populate: {path: 'macthds', populate: {path: 'pdthd'}}},
					{path: 'macsezs', populate: {path: 'pdsez'}}
				]})
				.populate('fder')
				.exec(function(err, machin) {
					if(err) {
						console.log(err);
					} else {
						// 状态从无到5时， 把pd和mac关联起来
						SaveMachinpre.pdRelMachinNew(machin, "bsMachinNew")
					}
					res.redirect('/bsMacs?preUrl=bsMacNew')
				})
				/* =============== 重新找到此生产单，做保存前的操作 =============== */
			}
		})
	} else {
		let savedb = dbs[n];
		savedb.save(function(err, dbSave) {
			if(err) console.log(err);
			bsMacSave(req, res, machin, dbs, n+1)
		})
	}
}

exports.bsMacChangeSts = function(req, res) {
	let crUser = req.session.crUser;
	let machinId = req.body.machinId;
	let target = req.body.target;

	Machin.findOne({_id: machinId, 'firm': crUser.firm})
	.populate({path: 'macfirs', populate: [
		{path: 'pdfir'},
		{path: 'macsecs', populate: {path: 'macthds', populate: {path: 'pdthd'}}},
		{path: 'macsezs', populate: {path: 'pdsez'}},
	]})
	.exec(function(err, machin) {
		let info = 'T';
		if(err) {
			console.log(err);
			info = "bsMachinNew, Machin.findOne, Error!";
		} else if(!machin) {
			info = "数据错误，请重试";
		} else {
			if(target == "bsMachinFinish") {
				machin.status = 10;
				machin.fnAt = Date.now();
				// 生产单状态从5变为10的时候 解除 pd与mac的联系
				SaveMachinpre.pdRelMachinFinish(machin, 'bsMachinFinish')
			} else if(target == "bsMachinBack") {
				machin.status = 5;
				machin.fnAt = null;
				// 生产单状态从10变为5的时候 链接 pd与mac的联系
				SaveMachinpre.pdRelMachinBack(machin, 'bsMachinBack')
			} else {
				info = "操作错误，请重试"
			}
			if(info == 'T') {
				machin.save(function(err, machinSv) {
					if(err) {
						info = "bsMachinNew, Machin.save, Error!";console.log(err);
						Err.usError(req, res, info);
					} else {
						if(target == "bsMachinBack") {
							res.redirect('/bsMacHis')
						} else {
							res.redirect('/bsMacs')
						}
					}
				})
			} else {
				Err.usError(req, res, info);
			}
		}
	})
}
