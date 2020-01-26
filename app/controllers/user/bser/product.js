let Err = require('../aaIndex/err')

let MdPicture = require('../../../middle/middlePicture');
let Conf = require('../../../../conf');

let Pdfir = require('../../../models/material/pdfir');
let Pdsec = require('../../../models/material/pdsec');
let Pdsez = require('../../../models/material/pdsez');
let Pdthd = require('../../../models/material/pdthd');
let Firm = require('../../../models/login/firm');

let _ = require('underscore');

exports.bsProducts = function(req, res) {
	let crUser = req.session.crUser;

	let keySymb = '$ne';
	let keyword = ' x ';
	if(req.query.keyword) {
		keySymb = '$in';
		keyword = String(req.query.keyword);
		keyword = keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyword = new RegExp(keyword + '.*');
	}

	let sortCond = 'sellQuot';
	if(req.query.sortCond) sortCond = req.query.sortCond;

	let sortVal = 1;
	if(req.query.sortVal && !isNaN(parseInt(req.query.sortVal))) {
		sortVal = parseInt(req.query.sortVal);
	}

	Pdfir.countDocuments({
		'firm': crUser.firm,
		$or:[
			{'code': {[keySymb]: keyword}},
			{'nome': {[keySymb]: keyword}},
		],
	}, function(err, keyCount) {
		if(err) {
			console.log(err);
			info = "bsProducts, Pdfir.countDocuments， Error！";
			Err.usError(req, res, info);
		} else {
			// console.log(keyCount)
			Pdfir.find({
				'firm': crUser.firm,
				$or:[
					{'code': {[keySymb]: keyword}},
					{'nome': {[keySymb]: keyword}},
				],
			})
			.populate({path: 'pdsecs', populate: {path: 'pdthds', populate: [
				{path: 'ordthds'}, {path: 'hordthds'},
				{path: 'macthds'},
				{path: 'tinthds'},
				{path: 'pdsez'},
			]}})
			.populate({path: 'pdsezs', populate: [
				{path: 'pdthds', populate: [
					{path: 'ordthds'}, {path: 'hordthds'},
					{path: 'macthds'},
					{path: 'tinthds'},
					{path: 'pdsez'},
				]},
				{path: 'macsezs'},
			]})
			.sort({[sortCond]: sortVal})
			.exec(function(err, products) { if(err) {
				console.log(err);
				info = "bsProducts, Pdfir.find， Error！";
				Err.usError(req, res, info);
			} else {
				res.render('./user/bser/product/list', {
					title: '模特库',
					crUser : crUser,
					products: products,
				})
			} })
		}
	})
}





exports.bsProductAdd =function(req, res) {
	let crUser = req.session.crUser;

	Firm.findOne({_id: crUser.firm}, function(err, company) {
		if(err) console.log(err);
		res.render('./user/bser/product/add', {
			title: '新模特',
			crUser : crUser,
			thisAct: "/bsProd",
			colors: company.colors,
		})
	})
}


exports.bsProductNew = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	obj.nome = obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	obj.firm = crUser.firm;
	obj.creater = crUser._id;

	/* ================= 数字转化 =================== */
	if(obj.price) obj.price = parseFloat(obj.price);
	if(obj.cost) obj.cost = parseFloat(obj.cost);
	if(obj.tincost) obj.tincost = parseFloat(obj.tincost);
	/* ================= 数字转化 =================== */


	/* ========= 判断此产品的尺寸 =========== */
	let sizes = new Array();
	if(obj.sizes instanceof Array) {
		for(i=0; i<obj.sizes.length; i++) {
			sizes.push(obj.sizes[i]);
		}
	} else if(obj.sizes) {
		sizes.push(obj.sizes);
	}
	obj.sizes = sizes;
	/* ========= 判断此产品的尺寸 =========== */

	/* =============== 判断此产品的颜色 ================= */
	let colors = new Array();
	if(obj.colors instanceof Array) {
		for(i=0; i<obj.colors.length; i++) {
			if(obj.colors[i].length > 0) {
				colors.push(obj.colors[i].toUpperCase());
			}
		}
	} else if(obj.colors) {
		colors.push(obj.colors.toUpperCase());
	}
	obj.colors = colors;
	/* =============== 判断此产品的颜色 ================= */

	if(!obj.code || !obj.nome || isNaN(obj.price) || isNaN(obj.cost)) {
		info = "数据输入有误！";
		Err.usError(req, res, info);
	} else {
		// console.log(obj)

		/* =========== 公司不能出现同一个型号的模特 ============= */
		Pdfir.findOne({code: obj.code, 'firm': crUser.firm})
		.exec(function(err, pdfirSame) {
			if(err) {
				console.log(err);
				info = "bsProductNew, Pdfir.findOne, Error!";
				Err.usError(req, res, info);
			} else if(pdfirSame) {
				info = "此产品号已经存在，请重新填写";
				Err.usError(req, res, info);
			} else {

				let _pdfir = new Pdfir(obj);	// 创建pdfir
				let dbs = new Array();			// 把所有需要创建的数据库放入一个数组可以递归保存
				/* ========== 先把尺寸创建好========== */
				let pdsezs = new Array();
				for(let i in obj.sizes) {
					let pdsezObj = new Object();
					pdsezObj.pdfir = _pdfir._id;
					pdsezObj.size = obj.sizes[i];
					let _pdsez = new Pdsez(pdsezObj);
					pdsezs.push(_pdsez);
					_pdfir.pdsezs.push(_pdsez._id);
					dbs.push(_pdsez);
				}
				/* ========== 先把尺寸创建好========== */

				/* ========== 再把颜色创建好========== */
				let pdsecs = new Array();
				for(let i in obj.colors) {
					let pdsecObj = new Object();
					pdsecObj.pdfir = _pdfir._id;
					pdsecObj.color = obj.colors[i];
					let _pdsec = new Pdsec(pdsecObj);

					pdsecs.push(_pdsec);
					_pdfir.pdsecs.push(_pdsec._id);
					dbs.push(_pdsec);
				}
				/* ========== 再把颜色创建好========== */

				/* ========== 最后创建pdthd========== */
				for(let i in pdsecs) {
					let pdsec = pdsecs[i];
					for(let j in pdsezs) {
						let pdsez = pdsezs[j];
						let pdthdObj = new Object();
						pdthdObj.color = pdsec.color;
						pdthdObj.size = pdsez.size;
						pdthdObj.pdfir = _pdfir._id;
						pdthdObj.pdsec = pdsec._id;
						pdthdObj.pdsez = pdsez._id;
						let _pdthd = new Pdthd(pdthdObj);

						pdsez.pdthds.push(_pdthd._id);
						pdsec.pdthds.push(_pdthd._id);
						_pdfir.pdthds.push(_pdthd._id);
						dbs.push(_pdthd);
					}
				}
				bsProductSave(res, _pdfir, dbs, 0);
			}
		})
	}
}
let bsProductSave = function(res, pdfir, dbs, n) {
	if(n==dbs.length) {
		pdfir.save(function(err, pdfirSave) {
			if(err) {
				console.log(err);
				info = "添加新产品时，数据库保存出错, 请联系管理员";
				Err.usError(req, res, info);
			} else {
				res.redirect('/bsProduct/'+pdfirSave._id)
			}
		})
		return;
	} else {
		let thisdb = dbs[n];
		// console.log(thisdb)
		thisdb.save(function(err, dbSave) {
			if(err) {
				console.log(err);
				console.log(n);
			}
			bsProductSave(res, pdfir, dbs, n+1);
		})
	}
}




exports.bsProductUpd = function(req, res, next) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	if(obj.price) obj.price = parseFloat(obj.price);
	if(obj.macCost) obj.macCost = parseFloat(obj.macCost);
	if(obj.tinCost) obj.tinCost = parseFloat(obj.tinCost);
	Pdfir.findOne({_id: obj._id}, function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "bsProductUpd, Pdfir.findOne, Error！";
			Err.usError(req, res, info);
		} else if(!pdfir) {
			info = "数据库中没有此模特, 刷新查看";
			Err.usError(req, res, info);
		} else {
			let _pdfir = _.extend(pdfir, obj)
			_pdfir.save(function(err, pdfirSave) {
				if(err) {
					console.log(err);
					info = "bsProductUpd, _pdfir.save, Error！";
					Err.usError(req, res, info);
				} else {
					res.redirect('/bsProduct/'+pdfirSave._id)
				}
			})
		}
	})
}




exports.bsProdFilter = function(req, res, next) {
	let crUser = req.session.crUser;
	let id = req.params.id;
	Pdfir.findOne({_id: id, 'firm': crUser.firm})
	.populate({path: 'pdsecs', populate: {path: 'pdthds', populate: [
		{path: 'ordthds'}, {path: 'hordthds'},
		{path: 'macthds'},
		{path: 'tinthds'},
		{path: 'pdsez'},
	]}})
	.populate({path: 'pdsezs', populate: [
		{path: 'pdthds', populate: [
			{path: 'ordthds'}, {path: 'hordthds'},
			{path: 'macthds'},
			{path: 'tinthds'},
			{path: 'pdsez'},
		]},
		{path: 'macsezs'},
	]})
	.populate({path: 'ordfirs', populate: [
		{path: 'order'},
		{path: 'ordsecs', populate: {path: 'ordthds'}}
	]})
	// .populate({path: 'hordfirs', populate: [
	// 	{path: 'order'},
	// 	{path: 'ordsecs', populate: {path: 'ordthds'}}
	// ]})
	.populate({path: 'macfirs', populate: [
		{path: 'machin'},
		{path: 'macsecs', populate: {path: 'macthds'}}
	]})
	.populate({path: 'tinfirs', populate: [
		{path: 'tinhin'},
		{path: 'tinsecs', populate: {path: 'tinthds'}}
	]})
	.exec(function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "查看产品信息时，数据库查找出错, 请联系管理员";
			Err.usError(req, res, info);
		} else if(!pdfir) {
			info = "此产品已经被删除";
			Err.usError(req, res, info);
		} else if(pdfir.firm != crUser.firm) {
			info = "您只能查看自己公司的产品";
			Err.usError(req, res, info);
		} else {
			// console.log(pdfir.pdsezs[0])
			req.body.pdfir = pdfir;
			next();
		}
	})
}

exports.bsProduct = function(req, res) {
	let crUser = req.session.crUser;
	Firm.findOne({_id: crUser.firm}, function(err, company) {
		if(err) console.log(err);

		let pdfir = req.body.pdfir;
		// console.log(pdfir);
		let objBody = new Object();
		objBody.colors = company.colors;
		objBody.crUser = crUser;
		objBody.pdfir = pdfir;
		objBody.thisAct = "/bsProd";
		objBody.title = '模特信息';
		let detail = 'detail'+pdfir.semi;
		res.render('./user/bser/product/detail/'+detail, objBody);
	})
}






exports.bsPdfirDel = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.params.id;
	Pdfir.findOne({_id: id, 'firm': crUser.firm})
	.populate({path: 'pdsecs'})
	.exec(function(err, pdfir){
		if(err) {
			console.log(err);
			info = "bsPdfirDel, Pdfir.findOne, Error！";
			Err.usError(req, res, info);
		} else if(!pdfir) {
			info = "此产品已经被删除, 请刷新查看!";
			Err.usError(req, res, info);
		} else if(pdfir.pdsecs.length > 0 || pdfir.pdsezs.length >0) {
			res.redirect('/bsProduct/'+id);
		} else {
			let orgPhoto = pdfir.photo;
			MdPicture.deleteOldPhoto(orgPhoto, Conf.photoPath.proPhoto);
			Pdfir.deleteOne({_id: pdfir._id}, function(err, objRm) {
				if(err) {
					info = "bsPdfirDel, Pdfir.findOne, Error!";
					Err.usError(req, res, info);
				} else {
					res.redirect('/bsProducts');
				}
			})
		}
	})
}

exports.bsProductsObtAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keyword = ' x '
	if(req.query.keyword) {
		keyword = String(req.query.keyword);
		keyword = keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	Pdfir.findOne({'firm': crUser.firm, 'code': keyword})
	.exec(function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "bsProductsObtAjax, Pdfir.findOne, Error！";
			res.json({success: 0, info: info});
		} else if(!pdfir) {
			let keywordReg = new RegExp(keyword + '.*');
			Pdfir.find({'firm': crUser.firm, 'code': {'$in': keywordReg}}, {code: 1})
			.exec(function(err, pdfirs){
				if(err) {
					console.log(err);
					info = "bsProductsObtAjax, Pdfir.find, Error！";
					res.json({success: 0, info: info});
				} else {
					res.json({success: 1, pdfirs: pdfirs});
				}
			})
		} else {
			res.json({success: 2, pdfir: pdfir});
		}
	})
}

exports.bsPdfirObtOrdersAjax = function(req, res) {
	let crUser = req.session.crUser;
	let pdfirId = req.query.pdfirId;
	Pdfir.findOne({'firm': crUser.firm, '_id': pdfirId})
	.populate({path: 'ordfirs', populate: [
		{path: 'order', populate: {path: 'cter'}},
		{path: 'ordsecs', populate: {path: 'ordthds'}},
	]})
	.exec(function(err, pdfir) { 
		if(err) {
			console.log(err);
			res.json({success: 0, info: 'Pdfir.findOne, Error！'})
		} else if(!pdfir) {
			res.json({success: 0, info: '刷新页面重试, 没有找到模特'})
		} else {
			let ordfirs = new Array();
			for(let i=0; i<pdfir.ordfirs.length; i++) {
				let ordfir = pdfir.ordfirs[i];
				let j=0;
				let quot = 0;
				for(;j<ordfir.ordsecs.length; j++) {
					let ordsec = ordfir.ordsecs[j];
					let k=0;
					for(; k<ordsec.ordthds.length; k++) {
						let ordthd = ordsec.ordthds[k];
						if(ordthd.ship != 0) break;
						if(!isNaN(parseInt(ordthd.quot))) {
							quot += parseInt(ordthd.quot);
						}
					}
					if(k != ordsec.ordthds.length) break;
				}
				let ord = new Object();
				ord.ordfir = ordfir
				if(j != ordfir.ordsecs.length) {
					ord.cancel = 0;
				} else {
					ord.cancel = 1;
					ord.quot = quot;
				}
				ordfirs.push(ord);
			}
			res.json({success: 1, ordfirs: ordfirs})
		}
	})
}