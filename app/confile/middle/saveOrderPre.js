let Order = require('../../models/client/order');
let Ordfir = require('../../models/client/ordfir');
let Ordsec = require('../../models/client/ordsec');
let Ordthd = require('../../models/client/ordthd');


/* =========================== 库存中的pd与ord中的pd相关联 =========================== */
/* ======================= 创建订单 ======================= */
exports.pdRelOrderNew = function(order, checkCode) {
	let dbs = new Array();
	let ordfirs = order.ordfirs;
	for(let i=0; i < ordfirs.length; i++) {
		let ordfir = ordfirs[i];
		let pdfir = ordfir.pdfir;
		pdfir.ordfirs.push(ordfir._id);
		dbs.push(pdfir)

		for(let j=0; j<ordfir.ordsecs.length; j++) {
			let ordsec = ordfir.ordsecs[j];
			for(let k=0; k<ordsec.ordthds.length; k++) {
				let ordthd = ordsec.ordthds[k];
				let pdthd = ordthd.pdthd;
				pdthd.ordthds.push(ordthd._id);
				dbs.push(pdthd)
			}
		}
	}
	let cter = order.cter;
	cter.orders.push(order._id);
	dbs.push(cter);
	bsProductsSave(dbs, 0);
}
/* ======================= 创建订单 ======================= */

/* ======================= 删除订单 ======================= */
exports.pdRelOrderDel = function(order, checkCode) {
	let dbs = new Array();
	let ordfirs = order.ordfirs;
	for(let i=0; i < ordfirs.length; i++) {
		let ordfir = ordfirs[i];
		let pdfir = ordfir.pdfir;
		let fordfirs = hordfirs = new Array();
		for(let m=0; m<pdfir.ordfirs.length; m++) {
			if(String(pdfir.ordfirs[m]) == String(ordfir._id)) continue;
			fordfirs.push(pdfir.ordfirs[m])
		}
		pdfir.ordfirs = fordfirs;
		if(order.status == 10) {
			for(let m=0; m<pdfir.hordfirs.length; m++) {
				if(String(pdfir.hordfirs[m]) == String(ordfir._id)) continue;
				hordfirs.push(pdfir.hordfirs[m])
			}
			pdfir.hordfirs = hordfirs;
		}
		dbs.push(pdfir)

		for(let j=0; j<ordfir.ordsecs.length; j++) {
			let ordsec = ordfir.ordsecs[j];
			for(let k=0; k<ordsec.ordthds.length; k++) {
				let ordthd = ordsec.ordthds[k];
				let pdthd = ordthd.pdthd;
				let ordthds = hordthds = new Array();
				for(let m=0; m<pdthd.ordthds.length; m++) {
					if(String(pdthd.ordthds[m]) == String(ordthd._id)) continue;
					ordthds.push(pdthd.ordthds[m])
				}
				pdthd.ordthds = ordthds;
				if(order.status == 10) {
					for(let m=0; m<pdthd.hordthds.length; m++) {
						if(String(pdthd.hordthds[m]) == String(ordthd._id)) continue;
						hordthds.push(pdthd.hordthds[m])
					}
					pdthd.hordthds = hordthds;
				}
				dbs.push(pdthd)
			}
		}
	}
	let cter = order.cter;
	let orders = new Array();
	for(let i=0; i<cter.orders.length; i++) {
		if(String(cter.orders[i]) == String(order._id)) continue;
		orders.push(cter.orders[i]);
	}
	cter.orders = orders;
	dbs.push(cter);
	bsProductsSave(dbs, 0);
}
/* ======================= 删除订单 ======================= */

/* ======================= 完成订单 ======================= */
exports.pdRelOrderFinish = function(order, checkCode) {
	let ordfirs = order.ordfirs;
	let dbs = new Array();
	for(let i=0; i < ordfirs.length; i++) {
		let ordfir = ordfirs[i];
		let pdfir = ordfir.pdfir;
		let fordfirs = hordfirs = new Array();
		for(let m=0; m<pdfir.ordfirs.length; m++) {
			if(String(pdfir.ordfirs[m]) == String(ordfir._id)) continue;
			fordfirs.push(pdfir.ordfirs[m])
		}
		pdfir.ordfirs = fordfirs;
		pdfir.hordfirs.unshift(ordfir._id)
		dbs.push(pdfir)
		for(let j=0; j<ordfir.ordsecs.length; j++) {
			let ordsec = ordfir.ordsecs[j];
			for(let k=0; k<ordsec.ordthds.length; k++) {
				let ordthd = ordsec.ordthds[k];
				let pdthd = ordthd.pdthd;
				let ordthds = hordthds = new Array();
				for(let m=0; m<pdthd.ordthds.length; m++) {
					if(String(pdthd.ordthds[m]) == String(ordthd._id)) continue;
					ordthds.push(pdthd.ordthds[m])
				}
				pdthd.stock = parseInt(pdthd.stock) - parseInt(ordthd.ship);
				pdthd.ordthds = ordthds;
				pdthd.hordthds.unshift(ordthd._id)
				dbs.push(pdthd)
			}
		}
	}
	bsProductsSave(dbs, 0);
}
/* ======================= 完成订单 ======================= */

/* ======================= 返回订单 ======================= */
exports.pdRelOrderBack = function(order, checkCode) {
	let ordfirs = order.ordfirs;
	let dbs = new Array();
	for(let i=0; i < ordfirs.length; i++) {
		let ordfir = ordfirs[i];
		let pdfir = ordfir.pdfir;
		let fordfirs = hordfirs = new Array();
		for(let m=0; m<pdfir.hordfirs.length; m++) {
			if(String(pdfir.hordfirs[m]) == String(ordfir._id)) continue;
			hordfirs.push(pdfir.hordfirs[m])
		}
		pdfir.hordfirs = hordfirs;
		pdfir.ordfirs.unshift(ordfir._id)
		dbs.push(pdfir)

		for(let j=0; j<ordfir.ordsecs.length; j++) {
			let ordsec = ordfir.ordsecs[j];
			for(let k=0; k<ordsec.ordthds.length; k++) {
				let ordthd = ordsec.ordthds[k];
				let pdthd = ordthd.pdthd;
				let ordthds = hordthds = new Array();
				for(let m=0; m<pdthd.hordthds.length; m++) {
					if(String(pdthd.hordthds[m]) == String(ordthd._id)) continue;
					hordthds.push(pdthd.hordthds[m])
				}
				pdthd.stock = parseInt(pdthd.stock) + parseInt(ordthd.ship);
				pdthd.hordthds = hordthds;
				pdthd.ordthds.unshift(ordthd._id)
				dbs.push(pdthd)
			}
		}
	}
	bsProductsSave(dbs, 0);
}
/* ======================= 返回订单 ======================= */
/* ================= 递归保存 ================= */
let bsProductsSave = function(dbs, n) {
	if(n == dbs.length) {
		return;
	} else {
		let db = dbs[n];
		db.save(function(err, pdfirSave) {
			if(err) console.log(err);
			bsProductsSave(dbs, n+1);
		})
	}
}
/* ================= 递归保存 ================= */
/* =========================== 库存中的pd与ord中的pd相关联 =========================== */




/* ================ 删除order时， 同时删除ord相关Fir sec thd ================ */
exports.bsOrderDelPre= function(orderId) {
	Ordfir.deleteMany({order: orderId}, function(err, objRm) {
		if(err) console.log(err);
	})
	Ordsec.deleteMany({order: orderId}, function(err, objRm) {
		if(err) console.log(err);
	})
	Ordthd.deleteMany({order: orderId}, function(err, objRm) {
		if(err) console.log(err);
	})
	return;
}
/* ================ 删除order时， 同时删除ord相关Fir sec thd ================ */