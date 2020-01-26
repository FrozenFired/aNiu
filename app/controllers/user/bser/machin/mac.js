let Err = require('../../aaIndex/err');
let Conf = require('../../../../../conf');
let SaveMachinpre = require('../../../../middle/saveMachinPre');

let moment = require('moment')

let Machin = require('../../../../models/foundry/machin');
let Macfir = require('../../../../models/foundry/macfir');
let Macsec = require('../../../../models/foundry/macsec');
let Macsez = require('../../../../models/foundry/macsez');
let Macthd = require('../../../../models/foundry/macthd');

let Pdfir = require('../../../../models/material/pdfir');

exports.bsMacs = function(req, res) {
	let crUser = req.session.crUser;

	/* ---------- 排序 ------------- */
	let sortCond = "ctAt";
	let sortVal = -1;
	if(req.query.sortCond == "upAt"){
		sortCond = "upAt";
	}
	if(req.query.sortVal == 1){
		sortVal = 1;
	}
	/* ---------- 排序 ------------- */

	Machin.find({
		'firm': crUser.firm,
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
	.sort({[sortCond]: sortVal})
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
			// .populate({path: 'ordfirs', populate: {path: 'order', populate: {path: 'cter'}}})
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

					sortCond: sortCond,
					sortVal : sortVal,
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
					let quotOthd = shipOthd = lessOthd = 0;
					let quotTthd = shipTthd = lessTthd = 0;
					for(let m=0; m<pdthd.ordthds.length; m++) {
						let ordthd = pdthd.ordthds[m];
						let quot = parseInt(ordthd.quot);
						let ship = parseInt(ordthd.ship);
						quotOthd += quot; shipOthd += ship;
						if(quot - ship > 0) {
							lessOthd += (quot - ship)
						}
					}
					for(let m=0; m<pdthd.tinthds.length; m++) {
						let tinthd = pdthd.tinthds[m];
						let quot = parseInt(tinthd.quot);
						let ship = parseInt(tinthd.ship);
						quotTthd += quot; shipTthd += ship;
						if(quot - ship > 0) {
							lessTthd += (quot - ship)
						}
					}
					let showThdStock = parseInt(pdthd.stock) + shipTthd - shipOthd;
					let needTthd = lessOthd - lessTthd - showThdStock;
					if(needTthd < 0) needTthd = 0;
					needTthds += needTthd;
					quotTthds += quotTthd;	// 正在染色的
				}
				let quotMsez = shipMsez = lessMsez = 0;
				for(let m=0; m<pdsez.macsezs.length; m++) {
					let macsez = pdsez.macsezs[m];
					let quot = parseInt(macsez.quot);
					let ship = parseInt(macsez.ship);
					quotMsez += quot; shipMsez += ship;
					if(quot - ship > 0) {
						lessMsez += (quot - ship)
					}
				}
				let stock = parseInt(pdsez.stock);
				let showSezStock = stock + shipMsez - quotTthds
				needMac += needTthds - showSezStock - lessMsez;
			}
			// console.log(needMac)
		} else {
			for(let j=0; j<pdfir.pdsecs.length; j++) {
				let pdsec = pdfir.pdsecs[j];
				let ndsecMac = 0;
				for(let k=0; k<pdsec.pdthds.length; k++) {
					let pdthd = pdsec.pdthds[k];
					let quotOthd = shipOthd = lessOthd = 0;
					let quotMthd = shipMthd = lessMthd = 0;
					for(let m=0; m<pdthd.ordthds.length; m++) {
						let ordthd = pdthd.ordthds[m];
						let quot = parseInt(ordthd.quot);
						let ship = parseInt(ordthd.ship);
						quotOthd += quot; shipOthd += ship;
						if(quot - ship > 0) {
							lessOthd += (quot - ship)
						}
					}
					for(let m=0; m<pdthd.macthds.length; m++) {
						let macthd = pdthd.macthds[m];
						let quot = parseInt(macthd.quot);
						let ship = parseInt(macthd.ship);
						quotMthd += quot; shipMthd += ship;
						if(quot - ship > 0) {
							lessMthd += (quot - ship)
						}
					}
					let showStock = parseInt(pdthd.stock) + shipMthd - shipOthd;
					let ndthdMac = lessOthd - lessMthd - showStock;
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
	let symAtTo = "$lte";
	let condAtTo = new Date(new Date().setHours(23, 59, 59, 0))
	let condAtFm = (condAtTo - Conf.hisDays*24*60*60*1000)
	if(req.query.atFm && req.query.atFm.length == 10){
		symAtFm = "$gte";   // $ ne eq gte gt lte lt
		condAtFm = new Date(req.query.atFm).setHours(0,0,0,0);
	}
	if(req.query.atTo && req.query.atTo.length == 10){
		symAtTo = "$lte";
		condAtTo = new Date(req.query.atTo).setHours(23,59,59,0);
	}

	/* ---------- 排序 ------------- */
	let sortCond = "ctAt";
	let sortVal = -1;
	if(req.query.sortCond == "fnAt"){
		sortCond = "fnAt";
	}
	if(req.query.sortVal == 1){
		sortVal = 1;
	}
	/* ---------- 排序 ------------- */

	Machin.find({
		'firm': crUser.firm,
		'status': 10,
		'ctAt': {[symAtFm]: condAtFm, [symAtTo]: condAtTo}
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
	.sort({"status": 1, [sortCond]: sortVal})
	.exec(function(err, machins) {
		if(err) {
			info = "bsMachins, User.find, Error";
			Err.usError(req, res, info);
		} else {
			res.render('./user/bser/machin/machin10', {
				title : '生产单记录',
				crUser: crUser,
				machins : machins,

				atFm  : condAtFm,
				atTo  : condAtTo,
				sortCond: sortCond,
				sortVal : sortVal,
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
		bsMacsezSend(req, res, obj.machinId, macs, 0)
	} else {
		bsMacthdSend(req, res, obj.machinId, macs, 0)
	}
}
let bsMacsezSend = function(req, res, machinId, macs, n) {
	if(n == macs.length) {
		bsMachinSend(req, res, machinId);
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
				bsMacsezSend(req, res, machinId, macs, n+1)
			})
		})
	}
}
let bsMacthdSend = function(req, res, machinId, macs, n) {
	if(n == macs.length) {
		bsMachinSend(req, res, machinId);
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
				bsMacthdSend(req, res, machinId, macs, n+1)
			})
		})
	}
}
let bsMachinSend = function(req, res, machinId) {
	Machin.findOne({_id: machinId}, function(err, machin) {
		if(err) {
			console.log(err);
			info = "bsMachinSend, Machin.findOne, Error";
			Err.usError(req, res, info);
		} else if(!machin) {
			info = "bsMachinSend, !machin, Error";
			Err.usError(req, res, info);
		} else {
			machin.save(function(err, machinSv) {
				if(err) {
					console.log(err);
					info = "bsMachinSend, machin.save, Error";
					Err.usError(req, res, info);
				} else {
					return res.redirect('/bsMacs');
				}
			})
		}
	})
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
			if(obj.fderId) machinObj.fder = obj.fderId;
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
			if(target == "bsMachinFinish") { // 生产单状态从5变为10的时候 解除 pd与mac的联系
				if(machin.status != 5) {
					info = "machin 5->10 页面已过期, 不可重复操作, 请刷新页面查看!"
				} else {
					machin.status = 10;
					machin.fnAt = Date.now();
					SaveMachinpre.pdRelMachinFinish(machin, 'bsMachinFinish')
				}
			} else if(target == "bsMachinBack") { // 生产单状态从10变为5的时候 链接 pd与mac的联系
				if(machin.status != 10) {
					info = "machin 10->5 页面已过期, 不可重复操作, 请刷新页面查看!"
				} else {
					machin.status = 5;
					machin.fnAt = null;
					SaveMachinpre.pdRelMachinBack(machin, 'bsMachinBack');
				}
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
