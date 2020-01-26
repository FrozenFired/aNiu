let Tint = require('../models/dryer/tint');
let Tinfir = require('../models/dryer/tinfir');
let Tinsec = require('../models/dryer/tinsec');
let Tinthd = require('../models/dryer/tinthd');


/* ======================= 库存中的pd与tinh中的pd相关联 ======================= */
/* ==================== 确认染洗单 ==================== */
exports.pdRelTintNew = function(tint, checkCode) {
	let tinfirs = tint.tinfirs;
	let dbs = new Array();
	for(let i=0; i < tinfirs.length; i++) {
		let tinfir = tinfirs[i];
		let pdfir = tinfir.pdfir;
		pdfir.tinfirs.push(tinfir._id);
		dbs.push(pdfir)

		for(let j=0; j<tinfir.tinsecs.length; j++) {
			let tinsec = tinfir.tinsecs[j];
			for(let k=0; k<tinsec.tinthds.length; k++) {
				let tinthd = tinsec.tinthds[k];
				let pdthd = tinthd.pdthd;
				pdthd.tinthds.push(tinthd._id);
				dbs.push(pdthd)
			}
		}
	}
	let tner = tint.tner;
	tner.tints.push(tint._id);
	dbs.push(tner);
	bsProductsSave(dbs, 0);
}
/* ==================== 确认染洗单 ==================== */

/* =========================== 删除染洗单 =========================== */
exports.pdRelTintDel = function(tint, checkCode) {
	let tinfirs = tint.tinfirs;
	let dbs = new Array();
	for(let i=0; i < tinfirs.length; i++) {
		let tinfir = tinfirs[i];

		let pdfir = tinfir.pdfir;
		let ftinfirs = htinfirs = new Array();
		for(let m=0; m<pdfir.tinfirs.length; m++) {
			if(String(pdfir.tinfirs[m]) == String(tinfir._id)) continue;
			ftinfirs.push(pdfir.tinfirs[m])
		}
		pdfir.tinfirs = ftinfirs;
		if(tint.status == 10) {
			for(let m=0; m<pdfir.htinfirs.length; m++) {
				if(String(pdfir.htinfirs[m]) == String(tinfir._id)) continue;
				htinfirs.push(pdfir.htinfirs[m])
			}
			pdfir.htinfirs = htinfirs;
		}
		dbs.push(pdfir)

		for(let j=0; j<tinfir.tinsecs.length; j++) {
			let tinsec = tinfir.tinsecs[j];
			for(let k=0; k<tinsec.tinthds.length; k++) {
				let tinthd = tinsec.tinthds[k];
				let pdthd = tinthd.pdthd;
				let tinthds = htinthds = new Array();
				for(let m=0; m<pdthd.tinthds.length; m++) {
					if(String(pdthd.tinthds[m]) == String(tinthd._id)) continue;
					tinthds.push(pdthd.tinthds[m])
				}
				pdthd.tinthds = tinthds;
				if(tint.status == 10) {
					for(let m=0; m<pdthd.htinthds.length; m++) {
						if(String(pdthd.htinthds[m]) == String(tinthd._id)) continue;
						htinthds.push(pdthd.htinthds[m])
					}
					pdthd.htinthds = htinthds;
				}
				dbs.push(pdthd)
			}
		}
	}
	let tner = tint.tner;
	let tints = new Array();
	for(let i=0; i<tner.tints.length; i++) {
		if(String(tner.tints[i]) == String(tint._id)) continue;
		tints.push(tner.tints[i]);
	}
	tner.tints = tints;
	dbs.push(tner);
	bsProductsSave(dbs, 0);
}
/* =========================== 删除染洗单 =========================== */

/* =========================== 完成染洗单 =========================== */
exports.pdRelTintFinish = function(tint, checkCode) {
	let tinfirs = tint.tinfirs;
	let dbs = new Array();
	for(let i=0; i < tinfirs.length; i++) {
		let tinfir = tinfirs[i];

		let pdfir = tinfir.pdfir;
		let ftinfirs = htinfirs = new Array();
		for(let m=0; m<pdfir.tinfirs.length; m++) {
			if(String(pdfir.tinfirs[m]) == String(tinfir._id)) continue;
			ftinfirs.push(pdfir.tinfirs[m])
		}
		pdfir.tinfirs = ftinfirs;
		pdfir.htinfirs.unshift(tinfir._id)
		dbs.push(pdfir)

		let sezs = new Array();
		for(let j=0; j<tinfir.tinsecs.length; j++) {
			let tinsec = tinfir.tinsecs[j];
			for(let k=0; k<tinsec.tinthds.length; k++) {
				let tinthd = tinsec.tinthds[k];
				let pdthd = tinthd.pdthd;
				/* ============ 找到对应的pdsez ============ */
				let n=0;
				for(; n<sezs.length; n++) {
					if(sezs[n].pdsez._id == pdthd.pdsez._id) {
						sezs[n].quot += parseInt(tinthd.quot)
						break;
					}
				}
				if(n == sezs.length) {
					let sez = new Object();
					sez.quot = parseInt(tinthd.quot);
					sez.pdsez = pdthd.pdsez;
					sezs.push(sez)
				}
				/* ============ 找到对应的pdsez ============ */
				let tinthds = htinthds = new Array();
				for(let m=0; m<pdthd.tinthds.length; m++) {
					if(String(pdthd.tinthds[m]) == String(tinthd._id)) continue;
					tinthds.push(pdthd.tinthds[m])
				}
				pdthd.tinthds = tinthds;
				pdthd.htinthds.unshift(tinthd._id)
				pdthd.stock = parseInt(pdthd.stock) + parseInt(tinthd.ship);
				dbs.push(pdthd)
			}
		}
		for(let j=0; j<sezs.length; j++) {
			let quot = parseInt(sezs[j].quot);
			let pdsez = sezs[j].pdsez;
			pdsez.stock = parseInt(pdsez.stock) - quot;
			dbs.push(pdsez);
		}
	}
	bsProductsSave(dbs, 0);
}
/* =========================== 完成染洗单返回 =========================== */

/* =========================== 返回染洗单 =========================== */
exports.pdRelTintBack = function(tint, checkCode) {
	let tinfirs = tint.tinfirs;
	let dbs = new Array();
	for(let i=0; i < tinfirs.length; i++) {
		let tinfir = tinfirs[i];

		let pdfir = tinfir.pdfir;
		let ftinfirs = htinfirs = new Array();
		for(let m=0; m<pdfir.htinfirs.length; m++) {
			if(String(pdfir.htinfirs[m]) == String(tinfir._id)) continue;
			htinfirs.push(pdfir.htinfirs[m])
		}
		pdfir.htinfirs = htinfirs;
		pdfir.tinfirs.unshift(tinfir._id)
		dbs.push(pdfir)

		let sezs = new Array();
		for(let j=0; j<tinfir.tinsecs.length; j++) {
			let tinsec = tinfir.tinsecs[j];
			for(let k=0; k<tinsec.tinthds.length; k++) {
				let tinthd = tinsec.tinthds[k];
				let pdthd = tinthd.pdthd;
				/* ============ 找到对应的pdsez ============ */
				let n=0;
				for(; n<sezs.length; n++) {
					if(sezs[n].pdsez._id == pdthd.pdsez._id) {
						sezs[n].quot += parseInt(tinthd.quot)
						break;
					}
				}
				if(n == sezs.length) {
					let sez = new Object();
					sez.quot = parseInt(tinthd.quot);
					sez.pdsez = pdthd.pdsez;
					sezs.push(sez)
				}
				/* ============ 找到对应的pdsez ============ */
				let tinthds = htinthds = new Array();
				for(let m=0; m<pdthd.htinthds.length; m++) {
					if(String(pdthd.htinthds[m]) == String(tinthd._id)) continue;
					htinthds.push(pdthd.htinthds[m])
				}
				pdthd.htinthds = htinthds;
				pdthd.tinthds.unshift(tinthd._id)
				pdthd.stock = parseInt(pdthd.stock) - parseInt(tinthd.ship);
				dbs.push(pdthd)
			}
		}
		for(let j=0; j<sezs.length; j++) {
			let quot = parseInt(sezs[j].quot);
			let pdsez = sezs[j].pdsez;
			pdsez.stock = parseInt(pdsez.stock) + quot;
			dbs.push(pdsez);
		}
	}
	bsProductsSave(dbs, 0);
}
/* =========================== 返回染洗单 =========================== */
let bsProductsSave = function(dbs, n) {
	if(n == dbs.length) {
		return;
	} else {
		let product = dbs[n];
		product.save(function(err, pdfirSave) {
			if(err) console.log(err);
			bsProductsSave(dbs, n+1);
		})
	}
}
/* ================= 库存中的pd与tinh中的pd相关联 ================= */




/* =========================== 删除tint时， 同时删除tinh相关pd =========================== */
exports.bsTintDelPre= function(tintId) {
	Tinfir.deleteMany({tint: tintId}, function(err, objRm) {
		if(err) console.log(err);
	})
	Tinsec.deleteMany({tint: tintId}, function(err, objRm) {
		if(err) console.log(err);
	})
	Tinthd.deleteMany({tint: tintId}, function(err, objRm) {
		if(err) console.log(err);
	})
	return;
}