let Err = require('../../aaIndex/err');
let Conf = require('../../../../confile/conf');
let SaveTintpre = require('../../../../confile/middle/saveTintPre');

let moment = require('moment')

let Tint = require('../../../../models/dryer/tint');
let Tinfir = require('../../../../models/dryer/tinfir');
let Tinsec = require('../../../../models/dryer/tinsec');
let Tinthd = require('../../../../models/dryer/tinthd');

let Pdfir = require('../../../../models/material/pdfir');

exports.bsTins = function(req, res) {
	let crUser = req.session.crUser;

	/* ---------- Tner 筛选 ------------- */
	let randId = '1d5e744e6a5a830c1a469cee'
	let symTner = "$ne";
	let condTner = randId;
	if(req.query.tner && req.query.tner.length == 24){
		symTner = "$eq";
		condTner = req.query.tner;
	}
	/* ---------- Tner 筛选 ------------- */

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

	Tint.find({
		'firm': crUser.firm,
		'tner': {[symTner]: condTner},
		'status': 5,
	})
	.populate('tner', 'nome')
	.populate({path: 'tinfirs', populate: [
		{path: 'pdfir'},
		{path: 'tinsecs', populate: [
			{path: 'pdsec'},
			{path: 'tinthds', populate: {path: 'pdthd'}},
		]}
	]})
	.sort({[sortCond]: sortVal})
	.exec(function(err, tints) {
		if(err) {
			info = "bsTints, User.find, Error";
			Err.usError(req, res, info);
		} else {

			Pdfir.find({
				'firm': crUser.firm,
			})
			.populate({path: 'pdsecs', populate: [
				{path: 'pdthds', populate: [
					{path: 'ordthds'},
					{path: 'tinthds'},
					// {path: 'macthds'},
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
				let products = bsTinGetProducts(pdfirs);
				res.render('./user/bser/tint/tint5', {
					title : '染洗单',
					crUser: crUser,
					tints : tints,
					products : products,

					sortCond: sortCond,
					sortVal : sortVal,
				});
			} })

		}
	})
}
let bsTinGetProducts = function(pdfirs) {
	let products = new Array();
	for(let i=0; i<pdfirs.length; i++) {
		let pdfir = pdfirs[i];
		let needTin = 0;
		let canTin = 0;
		let selColors = new Array();
		if(pdfir.semi == 1) {
			for(let j=0; j<pdfir.pdsezs.length; j++) {
				let pdsez = pdfir.pdsezs[j];
				let ndsezTin = 0;
				let quotTthds = 0;
				for (let k=0; k<pdsez.pdthds.length; k++) {
					let pdthd = pdsez.pdthds[k];
					let quotOthd = shipOthd = lessOthd = 0;
					let quotTthd = shipTthd = lessTthd= 0;
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
					quotTthds += quotTthd;
					let ndthdTin = lessOthd - showThdStock - lessTthd;
					if(ndthdTin <= 0) {
						ndthdTin = 0;
					} else {
						/* ========== 添加需要染的颜色 ============ */
						let m=0;
						for(; m<selColors.length; m++) {
							if(selColors[m] == pdthd.color) break;
						}
						if(m == selColors.length) {
							selColors.push(pdthd.color)
						}
						/* ========== 添加需要染的颜色 ============ */
					}
					ndsezTin += ndthdTin;
					needTin += ndthdTin;
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
				let showSezStock = parseInt(pdsez.stock) + shipMsez - quotTthds;
				let tinz = ndsezTin;
				if(showSezStock < ndsezTin) tinz = showSezStock;
				canTin += tinz;
			}
		}
		if(needTin > 0) {
			pdfir.needTin = needTin;
			pdfir.canTin = canTin;
			pdfir.selColors = selColors;
			products.push(pdfir);
		}
	}
	return products;
}

exports.bsTinHis = function(req, res) {
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

	/* ---------- Tner 筛选 ------------- */
	let randId = '1d5e744e6a5a830c1a469cee'
	let symTner = "$ne";
	let condTner = randId;
	if(req.query.tner && req.query.tner.length == 24){
		symTner = "$eq";
		condTner = req.query.tner;
	}
	/* ---------- Tner 筛选 ------------- */

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

	Tint.find({
		'firm': crUser.firm,
		'tner': {[symTner]: condTner},
		'status': 10,
		'ctAt': {[symAtFm]: condAtFm, [symAtTo]: condAtTo}
	})
	.populate('tner', 'nome')
	.populate({path: 'tinfirs', populate: [
		{path: 'pdfir'},
		{path: 'tinsecs', populate: [
			{path: 'pdsec'},
			{path: 'tinthds', populate: {path: 'pdthd'}},
		]}
	]})
	.sort({"status": 1, [sortCond]: sortVal})
	.exec(function(err, tints) {
		if(err) {
			info = "bsTints, User.find, Error";
			Err.usError(req, res, info);
		} else {
			res.render('./user/bser/tint/tint10', {
				title : '染洗单记录',
				crUser: crUser,
				tints : tints,

				atFm  : condAtFm,
				atTo  : condAtTo,
				sortCond: sortCond,
				sortVal : sortVal,
			});
		}
	})
}



exports.bsTintSend = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	let thds = obj.thds;
	let tins = new Array();
	for(i in thds) {
		if(thds[i].shiping > 0) {
			tins.push(thds[i])
		}
	}
	bsTinthdSend(req, res, obj.tintId, tins, 0)
}
let bsTinthdSend = function(req, res, tintId, tins, n) {
	if(n == tins.length) {
		bsTintSend(req, res, tintId);
	} else {
		let tin = tins[n];
		let shiping = parseInt(tin.shiping);
		let tinthdId = tin.tinthdId;
		Tinthd.findOne({_id: tinthdId})
		.populate('pdthd')
		.exec(function(err, tinthd) {
			if(err) console.log(err);
			let pdthd = tinthd.pdthd
			tinthd.ship = parseInt(tinthd.ship) + shiping;
			tinthd.save(function(err, tinthdSave) {
				if(err) console.log(err);
				bsTinthdSend(req, res, tintId, tins, n+1)
			})
		})
	}
}
let bsTintSend = function(req, res, tintId) {
	Tint.findOne({_id: tintId}, function(err, tint) {
		if(err) {
			console.log(err);
			info = "bsTintSend, Tint.findOne, Error";
			Err.usError(req, res, info);
		} else if(!tint) {
			info = "bsTintSend, !tint, Error";
			Err.usError(req, res, info);
		} else {
			tint.save(function(err, tintSv) {
				if(err) {
					console.log(err);
					info = "bsTintSend, tint.save, Error";
					Err.usError(req, res, info);
				} else {
					return res.redirect('/bsTins');
				}
			})
		}
	})
}

exports.bsTinNew = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	Pdfir.findOne({_id: obj.pdfirId}, function(err, pdfir) {
		if(err) {
			info = "bsTintNew, Pdfir.findOne, Error!";
			Err.usError(req, res, info);
			console.log(err)
		} else {
			let dbs = new Array();

			/* ====== 创建生产单数据库 ====== */
			let tintObj = new Object();
			tintObj.firm = crUser.firm;
			tintObj.creater = crUser._id;
			tintObj.status = 5;
			tintObj.code = moment(Date.now()).format('YYMMDD');
			tintObj.tner = obj.tnerId;
			tintObj.sizes = pdfir.sizes
			let _tint = new Tint(tintObj);
			/* ====== 创建生产单数据库 ====== */

			/* ====== 创建tinfir数据库 ====== */
			let tinfirObj = new Object();
			tinfirObj.tint = _tint._id;
			tinfirObj.pdfir = obj.pdfirId;
			tinfirObj.tinCost = pdfir.tinCost;
			let _tinfir = new Tinfir(tinfirObj);
			/* ====== 创建tinfir数据库 ====== */

			/* =============== 创建tinsec数据库 =============== */
			for(let j in obj.secs) {
				let sec = obj.secs[j];
				let tinsecObj = new Object();
				tinsecObj.tint = _tint._id;
				tinsecObj.tinfir = _tinfir._id;
				tinsecObj.pdsec = sec.pdsecId;
				tinsecObj.color = sec.color;
				let _tinsec = new Tinsec(tinsecObj);
				/* =========== 创建tinthd数据库 =========== */
				for(let k in sec.thds) {
					let thd = sec.thds[k];
					if(parseInt(thd.quot) > 0) {	// 如果有数据再创建
						let tinthdObj = new Object();
						tinthdObj.tint = _tint._id;
						tinthdObj.tinfir = _tinfir._id;
						tinthdObj.tinsec = _tinsec._id;
						tinthdObj.pdthd = thd.pdthdId;
						tinthdObj.size = parseInt(thd.size);
						tinthdObj.quot = parseInt(thd.quot);
						let _tinthd = new Tinthd(tinthdObj);

						_tinsec.tinthds.push(_tinthd._id)
						dbs.push(_tinthd);
					}
				}
				/* =========== 创建tinthd数据库 =========== */
				if(_tinsec.tinthds.length > 0) {	// 如果sec中有thd就加入到fir
					_tinfir.tinsecs.push(_tinsec._id);
					dbs.push(_tinsec)
				}
			}
			if(_tinfir.tinsecs.length > 0) {	// 如果fir中有sec则加入到tint
				_tint.tinfirs.push(_tinfir._id);
				dbs.push(_tinfir);
			}
			/* =============== 创建tinsec数据库 =============== */
			if(_tint.tinfirs.length > 0) {
				bsTinSave(req, res, _tint, dbs, 0);
			} else {
				info = "请添加模特数量";
				Err.usError(req, res, info);
			}
		}
	})
}
let bsTinSave = function(req, res, tint, dbs, n) {
	if(n == dbs.length) {
		tint.save(function(err, tintSv) {
			if(err) {
				info = "bsTintNew, Tint.save, Error!";console.log(err);
				Err.usError(req, res, info);
			} else {
				/* =============== 重新找到此生产单，做保存前的操作 =============== */
				Tint.findOne({_id: tintSv._id})
				.populate({path: 'tinfirs', populate: [
					{path: 'pdfir'},
					{path: 'tinsecs', populate: {path: 'tinthds', populate: {
						path: 'pdthd', populate: {path: 'pdsez'}
					}}},
				]})
				.populate('tner')
				.exec(function(err, tint) {
					if(err) {
						console.log(err);
					} else {
						// 状态从无到5时， 把pd和tin关联起来
						SaveTintpre.pdRelTintNew(tint, "bsTintNew")
					}
					res.redirect('/bsTins?preUrl=bsTinNew')
				})
				/* =============== 重新找到此生产单，做保存前的操作 =============== */
			}
		})
	} else {
		let savedb = dbs[n];
		savedb.save(function(err, dbSave) {
			if(err) console.log(err);
			bsTinSave(req, res, tint, dbs, n+1)
		})
	}
}

exports.bsTinChangeSts = function(req, res) {
	let crUser = req.session.crUser;
	let tintId = req.body.tintId;
	let target = req.body.target;

	Tint.findOne({_id: tintId, 'firm': crUser.firm})
	.populate({path: 'tinfirs', populate: [
		{path: 'pdfir'},
		{path: 'tinsecs', populate: {path: 'tinthds', populate: {
			path: 'pdthd', populate: {path: 'pdsez'}
		}}},
	]})
	.exec(function(err, tint) {
		let info = 'T';
		if(err) {
			console.log(err);
			info = "bsTintNew, Tint.findOne, Error!";
		} else if(!tint) {
			info = "数据错误，请重试";
		} else {
			if(target == "bsTintFinish") {
				tint.status = 10;
				tint.fnAt = Date.now();
				// 染洗单状态从5变为10的时候 解除 pd与tin的联系
				SaveTintpre.pdRelTintFinish(tint, 'bsTintFinish')
			} else if(target == "bsTintBack") {
				tint.status = 5;
				tint.fnAt = null;
				// 染洗单状态从10变为5的时候 链接 pd与tin的联系
				SaveTintpre.pdRelTintBack(tint, 'bsTintBack')
			} else {
				info = "操作错误，请重试"
			}
			if(info == 'T') {
				tint.save(function(err, tintSv) {
					if(err) {
						info = "bsTintNew, Tint.save, Error!";console.log(err);
						Err.usError(req, res, info);
					} else {
						if(target == "bsTintBack") {
							res.redirect('/bsTinHis')
						} else {
							res.redirect('/bsTins')
						}
					}
				})
			} else {
				Err.usError(req, res, info);
			}
		}
	})
}
