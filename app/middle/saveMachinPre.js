let Machin = require('../models/foundry/machin');
let Macfir = require('../models/foundry/macfir');
let Macsec = require('../models/foundry/macsec');
let Macthd = require('../models/foundry/macthd');


/* =========================== 库存中的pd与mac中的pd相关联 =========================== */

/* ======================= 创建订单 ======================= */
exports.pdRelMachinNew = function(machin, checkCode) {
	let macfirs = machin.macfirs;
	let dbs = new Array();
	for(let i=0; i < macfirs.length; i++) {
		let macfir = macfirs[i];

		let pdfir = macfir.pdfir;
		let fmacfirs = hmacfirs = new Array();
		pdfir.macfirs.push(macfir._id);
		dbs.push(pdfir)
		if(pdfir.semi == 1) {
			for(let j=0; j<macfir.macsezs.length; j++) {
				let macsez = macfir.macsezs[j];
				let pdsez = macsez.pdsez;
				pdsez.macsezs.push(macsez._id);
				dbs.push(pdsez)
			}
		} else {
			for(let j=0; j<macfir.macsecs.length; j++) {
				let macsec = macfir.macsecs[j];
				for(let k=0; k<macsec.macthds.length; k++) {
					let macthd = macsec.macthds[k];
					let pdthd = macthd.pdthd;
					pdthd.macthds.push(macthd._id);
					dbs.push(pdthd)
				}
			}
		}
	}
	let fder = machin.fder;
	if(fder) {
		fder.machins.push(machin._id);
		dbs.push(fder);
	}
	bsProductsSave(dbs, 0);
}
/* ======================= 创建订单 ======================= */

/* =========================== 删除订单 =========================== */
exports.pdRelMachinDel = function(machin, checkCode) {
	let macfirs = machin.macfirs;
	let dbs = new Array();
	for(let i=0; i < macfirs.length; i++) {
		let macfir = macfirs[i];

		let pdfir = macfir.pdfir;
		let fmacfirs = hmacfirs = new Array();

		for(let m=0; m<pdfir.macfirs.length; m++) {
			if(String(pdfir.macfirs[m]) == String(macfir._id)) continue;
			fmacfirs.push(pdfir.macfirs[m])
		}
		pdfir.macfirs = fmacfirs;
		if(machin.status == 10) {
			for(let m=0; m<pdfir.hmacfirs.length; m++) {
				if(String(pdfir.hmacfirs[m]) == String(macfir._id)) continue;
				hmacfirs.push(pdfir.hmacfirs[m])
			}
			pdfir.hmacfirs = hmacfirs;
		}
		dbs.push(pdfir)
		if(pdfir.semi == 1) {
			for(let j=0; j<macfir.macsezs.length; j++) {
				let macsez = macfir.macsezs[j];
				let pdsez = macsez.pdsez;
				let macsezs = hmacsezs = new Array();

				for(let m=0; m<pdsez.macsezs.length; m++) {
					if(String(pdsez.macsezs[m]) == String(macsez._id)) continue;
					macsezs.push(pdsez.macsezs[m])
				}
				pdsez.macsezs = macsezs;
				if(machin.status == 10) {
					for(let m=0; m<pdsez.hmacsezs.length; m++) {
						if(String(pdsez.hmacsezs[m]) == String(macsez._id)) continue;
						hmacsezs.push(pdsez.hmacsezs[m])
					}
					pdsez.hmacsezs = hmacsezs;
				}
				dbs.push(pdsez)
			}
		} else {
			for(let j=0; j<macfir.macsecs.length; j++) {
				let macsec = macfir.macsecs[j];
				for(let k=0; k<macsec.macthds.length; k++) {
					let macthd = macsec.macthds[k];
					let pdthd = macthd.pdthd;
					let macthds = hmacthds = new Array();

					for(let m=0; m<pdthd.macthds.length; m++) {
						if(String(pdthd.macthds[m]) == String(macthd._id)) continue;
						macthds.push(pdthd.macthds[m])
					}
					pdthd.macthds = macthds;
					if(machin.status == 10) {
						for(let m=0; m<pdthd.hmacthds.length; m++) {
							if(String(pdthd.hmacthds[m]) == String(macthd._id)) continue;
							hmacthds.push(pdthd.hmacthds[m])
						}
						pdthd.hmacthds = hmacthds;
					}
					dbs.push(pdthd)
				}
			}
		}
	}
	if(machin.fder) {
		let fder = machin.fder;
		let machins = new Array();
		for(let i=0; i<fder.machins.length; i++) {
			if(String(fder.machins[i]) == String(machin._id)) continue;
			machins.push(fder.machins[i]);
		}
		fder.machins = machins;
		dbs.push(fder);
	}
	bsProductsSave(dbs, 0);
}
/* =========================== 删除订单 =========================== */

/* =========================== 完成订单 =========================== */
exports.pdRelMachinFinish = function(machin, checkCode) {
	let macfirs = machin.macfirs;
	let dbs = new Array();
	for(let i=0; i < macfirs.length; i++) {
		let macfir = macfirs[i];

		let pdfir = macfir.pdfir;
		let fmacfirs = hmacfirs = new Array();
		for(let m=0; m<pdfir.macfirs.length; m++) {
			if(String(pdfir.macfirs[m]) == String(macfir._id)) continue;
			fmacfirs.push(pdfir.macfirs[m])
		}
		pdfir.macfirs = fmacfirs;
		pdfir.hmacfirs.unshift(macfir._id)
		dbs.push(pdfir)
		if(pdfir.semi == 1) {
			for(let j=0; j<macfir.macsezs.length; j++) {
				let macsez = macfir.macsezs[j];
				let pdsez = macsez.pdsez;
				let macsezs = hmacsezs = new Array();

				for(let m=0; m<pdsez.macsezs.length; m++) {
					if(String(pdsez.macsezs[m]) == String(macsez._id)) continue;
					macsezs.push(pdsez.macsezs[m])
				}
				pdsez.stock = parseInt(pdsez.stock) + parseInt(macsez.ship);
				pdsez.macsezs = macsezs;
				pdsez.hmacsezs.unshift(macsez._id)
				dbs.push(pdsez)
			}
		} else {
			for(let j=0; j<macfir.macsecs.length; j++) {
				let macsec = macfir.macsecs[j];
				for(let k=0; k<macsec.macthds.length; k++) {
					let macthd = macsec.macthds[k];
					let pdthd = macthd.pdthd;
					let macthds = hmacthds = new Array();

					for(let m=0; m<pdthd.macthds.length; m++) {
						if(String(pdthd.macthds[m]) == String(macthd._id)) continue;
						macthds.push(pdthd.macthds[m])
					}
					pdthd.stock = parseInt(pdthd.stock) + parseInt(macthd.ship);
					pdthd.macthds = macthds;
					pdthd.hmacthds.unshift(macthd._id)
					dbs.push(pdthd)
				}
			}
		}
	}
	bsProductsSave(dbs, 0);
}
/* =========================== 完成订单 =========================== */

/* =========================== 返回订单 =========================== */
exports.pdRelMachinBack = function(machin, checkCode) {
	let macfirs = machin.macfirs;
	let dbs = new Array();
	for(let i=0; i < macfirs.length; i++) {
		let macfir = macfirs[i];

		let pdfir = macfir.pdfir;
		let fmacfirs = hmacfirs = new Array();

		for(let m=0; m<pdfir.hmacfirs.length; m++) {
			if(String(pdfir.hmacfirs[m]) == String(macfir._id)) continue;
			hmacfirs.push(pdfir.hmacfirs[m])
		}
		pdfir.hmacfirs = hmacfirs;
		pdfir.macfirs.unshift(macfir._id)
		dbs.push(pdfir)

		if(pdfir.semi == 1) {
			for(let j=0; j<macfir.macsezs.length; j++) {
				let macsez = macfir.macsezs[j];
				let pdsez = macsez.pdsez;
				let macsezs = hmacsezs = new Array();

				for(let m=0; m<pdsez.hmacsezs.length; m++) {
					if(String(pdsez.hmacsezs[m]) == String(macsez._id)) continue;
					hmacsezs.push(pdsez.hmacsezs[m])
				}
				pdsez.stock = parseInt(pdsez.stock) - parseInt(macsez.ship);
				pdsez.hmacsezs = hmacsezs;
				pdsez.macsezs.unshift(macsez._id)
				dbs.push(pdsez)
			}
		} else {
			for(let j=0; j<macfir.macsecs.length; j++) {
				let macsec = macfir.macsecs[j];
				for(let k=0; k<macsec.macthds.length; k++) {
					let macthd = macsec.macthds[k];
					let pdthd = macthd.pdthd;
					let macthds = hmacthds = new Array();

					for(let m=0; m<pdthd.hmacthds.length; m++) {
						if(String(pdthd.hmacthds[m]) == String(macthd._id)) continue;
						hmacthds.push(pdthd.hmacthds[m])
					}
					pdthd.stock = parseInt(pdthd.stock) - parseInt(macthd.ship);
					pdthd.hmacthds = hmacthds;
					pdthd.macthds.unshift(macthd._id)
					dbs.push(pdthd)
				}
			}
		}
	}
	bsProductsSave(dbs, 0);
}
/* =========================== 返回订单 =========================== */
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
/* =========================== 库存中的pd与mac中的pd相关联 =========================== */




/* ================ 删除machin时， 同时删除mac相关Fir sec thd ================ */
exports.bsMachinDelPre= function(machinId) {
	Macfir.deleteMany({machin: machinId}, function(err, objRm) {
		if(err) console.log(err);
	})
	Macsec.deleteMany({machin: machinId}, function(err, objRm) {
		if(err) console.log(err);
	})
	Macthd.deleteMany({machin: machinId}, function(err, objRm) {
		if(err) console.log(err);
	})
	return;
}
/* ================ 删除machin时， 同时删除mac相关Fir sec thd ================ */