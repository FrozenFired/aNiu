let Err = require('../../aaIndex/err');
let Conf = require('../../../../confile/conf');
let SaveOrderPre = require('../../../../confile/middle/saveOrderPre');

let moment = require('moment')

let Order = require('../../../../models/client/order');
let Ordfir = require('../../../../models/client/ordfir');
let Ordsec = require('../../../../models/client/ordsec');
let Ordthd = require('../../../../models/client/ordthd');

let Pdfir = require('../../../../models/material/pdfir');

exports.bsOrds = function(req, res) {
	let crUser = req.session.crUser;

	/* ---------- Cter 筛选 ------------- */
	let randId = '1d5e744e6a5a830c1a469cee'
	let symCter = "$ne";
	let condCter = randId;
	if(req.query.cter && req.query.cter.length == 24){
		symCter = "$eq";
		condCter = req.query.cter;
	}
	/* ---------- Cter 筛选 ------------- */

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

	Order.find({
		'firm': crUser.firm,
		'cter': {[symCter]: condCter},
		'status': { '$in': [0, 5]},
	})
	.populate('cter', 'nome')
	.populate({path: 'ordfirs', populate: [
		{path: 'pdfir'},
		{path: 'ordsecs', populate: [
			{path: 'pdsec', populate: {path: 'pdthds'}},
			{path: 'ordthds', populate: {
				path: 'pdthd', populate: [
					{path: 'ordthds'},
					{path: 'macthds'},
					{path: 'tinthds'},
				]}
			}
		]}
	]})
	.sort({[sortCond]: sortVal})
	.exec(function(err, orders) {
		if(err) {
			info = "bsOrders, User.find, Error";
			Err.usError(req, res, info);
		} else {
			res.render('./user/bser/order/order5', {
				title   : '订单',
				crUser  : crUser,
				orders  : orders,

				sortCond: sortCond,
				sortVal : sortVal,
			});
		}
	})
}

exports.bsOrdHis = function(req, res) {
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

	/* ---------- Cter 筛选 ------------- */
	let randId = '1d5e744e6a5a830c1a469cee'
	let symCter = "$ne";
	let condCter = randId;
	if(req.query.cter && req.query.cter.length == 24){
		symCter = "$eq";
		condCter = req.query.cter;
	}
	/* ---------- Cter 筛选 ------------- */

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

	Order.find({
		'firm': crUser.firm,
		'cter': {[symCter]: condCter},
		'status': 10,
		'ctAt': {[symAtFm]: condAtFm, [symAtTo]: condAtTo}
	})
	.populate('cter', 'nome')
	.populate({path: 'ordfirs', populate: [
		{path: 'pdfir'},
		{path: 'ordsecs', populate: {path: 'ordthds', populate: {path: 'pdthd'}}}
	]})
	.sort({"status": 1, [sortCond]: sortVal})
	.exec(function(err, orders) {
		if(err) {
			info = "bsOrders, User.find, Error";
			Err.usError(req, res, info);
		} else {
			// console.log(orders.length)
			res.render('./user/bser/order/order10', {
				title : '订单记录',
				crUser: crUser,
				orders: orders,

				atFm  : condAtFm,
				atTo  : condAtTo,
				sortCond: sortCond,
				sortVal : sortVal,
			});
		}
	})
}



exports.bsOrderSend = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	let thds = obj.thds;
	let ords = new Array();
	for(i in thds) {
		if(thds[i].shiping > 0) {
			ords.push(thds[i])
		}
	}
	
	bsOrdthdSend(req, res, obj.orderId, ords, 0)
}
let bsOrdthdSend = function(req, res, orderId, ords, n) {
	if(n == ords.length) {
		bsOrderSend(req, res, orderId);
	} else {
		let ord = ords[n];
		let shiping = parseInt(ord.shiping);
		let ordthdId = ord.ordthdId;
		Ordthd.findOne({_id: ordthdId})
		.populate('pdthd')
		.exec(function(err, ordthd) {
			if(err) console.log(err);
			let pdthd = ordthd.pdthd;
			ordthd.ship = parseInt(ordthd.ship) + shiping;
			ordthd.save(function(err, ordthdSave) {
				if(err) console.log(err);
				pdthd.save(function(err, pdthdSave) {
					if(err) console.log(err);
					bsOrdthdSend(req, res, orderId, ords, n+1);
				})
			})
		})
	}
}
let bsOrderSend = function(req, res, orderId) {
	Order.findOne({_id: orderId}, function(err, order) {
		if(err) {
			console.log(err);
			info = "bsOrderSend, Order.findOne, Error";
			Err.usError(req, res, info);
		} else if(!order) {
			info = "bsOrderSend, !order, Error";
			Err.usError(req, res, info);
		} else {
			order.save(function(err, orderSv) {
				if(err) {
					console.log(err);
					info = "bsOrderSend, order.save, Error";
					Err.usError(req, res, info);
				} else {
					return res.redirect('/bsOrds');
				}
			})
		}
	})
}





exports.bsOrdNew = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	Pdfir.findOne({_id: obj.pdfirId}, function(err, pdfir) {
		if(err) {
			info = "bsOrderNew, Pdfir.findOne, Error!";
			Err.usError(req, res, info);
			console.log(err)
		} else {
			let dbs = new Array();

			/* ====== 创建订单数据库 ====== */
			let orderObj = new Object();
			orderObj.firm = crUser.firm;
			orderObj.creater = crUser._id;
			orderObj.status = 0;
			orderObj.code = moment(Date.now()).format('YYMMDD');
			orderObj.cter = obj.cterId;
			orderObj.sizes = pdfir.sizes
			let _order = new Order(orderObj);
			/* ====== 创建订单数据库 ====== */

			/* ====== 创建ordfir数据库 ====== */
			let ordfirObj = new Object();
			ordfirObj.order = _order._id;
			ordfirObj.pdfir = obj.pdfirId;
			ordfirObj.price = pdfir.price;
			let _ordfir = new Ordfir(ordfirObj);
			/* ====== 创建ordfir数据库 ====== */

			/* =============== 创建ordsec数据库 =============== */
			for(let j in obj.secs) {
				let sec = obj.secs[j];
				let ordsecObj = new Object();
				ordsecObj.order = _order._id;
				ordsecObj.ordfir = _ordfir._id;
				ordsecObj.pdsec = sec.pdsecId;
				ordsecObj.color = sec.color;
				let _ordsec = new Ordsec(ordsecObj);

				/* =========== 创建ordthd数据库 =========== */
				for(let k in sec.thds) {
					let thd = sec.thds[k];
					if(parseInt(thd.quot) > 0) {	// 如果有数据再创建
						let ordthdObj = new Object();
						ordthdObj.order = _order._id;
						ordthdObj.ordfir = _ordfir._id;
						ordthdObj.ordsec = _ordsec._id;
						ordthdObj.pdthd = thd.pdthdId;
						ordthdObj.color = thd.color;
						ordthdObj.size = parseInt(thd.size);
						ordthdObj.quot = parseInt(thd.quot);
						let _ordthd = new Ordthd(ordthdObj);

						_ordsec.ordthds.push(_ordthd._id)
						dbs.push(_ordthd);
					}
				}
				/* =========== 创建ordthd数据库 =========== */
				if(_ordsec.ordthds.length > 0) {	// 如果sec中有thd就加入到fir
					_ordfir.ordsecs.push(_ordsec._id);
					dbs.push(_ordsec)
				}
			}
			/* =============== 创建ordsec数据库 =============== */
			if(_ordfir.ordsecs.length > 0) {	// 如果fir中有sec则加入到order
				_order.ordfirs.push(_ordfir._id);
				dbs.push(_ordfir);
			}
			if(_order.ordfirs.length > 0) {
				bsOrdSave(req, res, _order, dbs, 0);
			} else {
				info = "请添加模特数量";
				Err.usError(req, res, info);
			}
		}
	})
}
let bsOrdSave = function(req, res, order, dbs, n) {
	if(n == dbs.length) {
		order.save(function(err, orderSv) {
			if(err) {
				info = "bsOrderNew, Order.save, Error!";console.log(err);
				Err.usError(req, res, info);
			} else {
				res.redirect('/bsOrds')
			}
		})
	} else {
		let db = dbs[n];
		db.save(function(err, dbSave) {
			if(err) console.log(err);
			bsOrdSave(req, res, order, dbs, n+1)
		})
	}
}

exports.bsOrdChangeSts = function(req, res) {
	let crUser = req.session.crUser;
	let orderId = req.body.orderId;
	let target = req.body.target;

	Order.findOne({_id: orderId, 'firm': crUser.firm})
	.populate({path: 'ordfirs', populate: [
		{path: 'pdfir'},
		{path: 'ordsecs', populate: {path: 'ordthds', populate: {path: 'pdthd'}}},
	]})
	.populate('cter')
	.exec(function(err, order) {
		let info = 'T';
		if(err) {
			console.log(err);
			info = "bsOrderNew, Order.findOne, Error!";
		} else if(!order) {
			info = "数据错误，请重试";
		} else {
			if(target == "bsOrderFinish") {
				order.status = 10;
				order.fnAt = Date.now();
				// 订单状态从5变为10的时候 解除 pd与ord的联系
				SaveOrderPre.pdRelOrderFinish(order, 'bsOrderFinish')
			} else if(target == "bsOrderBack") {
				order.status = 5;
				order.fnAt = null;
				// 订单状态从10变为5的时候 链接 pd与ord的联系
				SaveOrderPre.pdRelOrderBack(order, 'bsOrderBack')
			} else if(target == "bsOrderConfirm") {
				order.status = 5;
				// 订单状态从0变为5的时候 链接 pd与ord的联系
				SaveOrderPre.pdRelOrderConfirm(order, "bsOrderConfirm")
			} else if(target == "bsOrderCancel") {
				order.status = 0;
				// 订单状态从0变为5的时候 链接 pd与ord的联系
				SaveOrderPre.pdRelOrderCancel(order, "bsOrderCancel")
			} else {
				info = "操作错误，请重试"
			}
			if(info == 'T') {
				order.save(function(err, orderSv) {
					if(err) {
						info = "bsOrderNew, Order.save, Error!";console.log(err);
						Err.usError(req, res, info);
					} else {
						if(target == "bsOrderBack") {
							res.redirect('/bsOrdHis')
						} else {
							res.redirect('/bsOrds')
						}
					}
				})
			} else {
				Err.usError(req, res, info);
			}
		}
	})
}