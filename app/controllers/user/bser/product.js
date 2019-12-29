let Err = require('../aaIndex/err')

let MdPicture = require('../../../confile/middle/middlePicture');
let Conf = require('../../../confile/conf');

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
				{path: 'macthds'}
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
				let arrs = new Array();			// 把所有需要创建的数据库放入一个数组可以递归保存
				/* ========== 先把尺寸创建好========== */
				let pdsezs = new Array();
				for(let i in obj.sizes) {
					let pdsezObj = new Object();
					pdsezObj.pdfir = _pdfir._id;
					pdsezObj.size = obj.sizes[i];
					let _pdsez = new Pdsez(pdsezObj);
					pdsezs.push(_pdsez);
					_pdfir.pdsezs.push(_pdsez._id);
					arrs.push(_pdsez);
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
					arrs.push(_pdsec);
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
						arrs.push(_pdthd);
					}
				}
				bsProductSave(res, _pdfir, arrs, 0);
			}
		})
	}
}
let bsProductSave = function(res, pdfir, arrs, n) {
	if(n==arrs.length) {
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
		let thisdb = arrs[n];
		// console.log(thisdb)
		thisdb.save(function(err, dbSave) {
			if(err) {
				console.log(err);
				console.log(n);
			}
			bsProductSave(res, pdfir, arrs, n+1);
		})
	}
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
		res.render('./user/bser/product/'+detail, objBody);
	})
}





exports.bsPdfirUpd = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	if(obj.code) obj.code= obj.code.replace(/\s+/g,"").toUpperCase();
	if(obj.nome) obj.nome= obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	if(obj.price) obj.price = parseFloat(obj.price);
	if(obj.cost) {
		obj.cost = parseFloat(obj.cost);
		if(isNaN(obj.cost)) obj.cost = 0;
	}

	if(obj.stock && !isNaN(parseInt(obj.stock))) {
		obj.stock = parseInt(obj.stock);
	}

	Pdfir.findOne({_id: obj._id, 'firm': crUser.firm})
	.exec(function(err, object) {
		if(err) {
			info = "修改产品信息时，数据库查找出错, 请联系管理员";
			Err.usError(req, res, info);
		} else if(!object) {
			info = "此产品已经被删除";
			Err.usError(req, res, info);
		} else if(object.firm != crUser.firm) {
			info = "您只能修改自己公司的产品";
			Err.usError(req, res, info);
		} else {
			Pdfir.findOne({code: obj.code, 'firm': crUser.firm})
			.where('_id').ne(obj._id)
			.exec(function(err, pdfirSame) {
				if(err) console.log(err);
				if(pdfirSame) {
					info = "已经存在此编号，请重新输入编号";
					Err.usError(req, res, info);
				} else {
					let _pdfir = _.extend(object, obj);
					_pdfir.save(function(err, objSave){
						if(err) {
							console.log(err);
							info = "修改产品信息时，数据库保存出错, 请联系管理员";
							Err.usError(req, res, info);
						} else {
							res.redirect('/bsProd/'+objSave._id);
						}
					})
				}
			})
		}
	})
}


exports.bsPdfirDel = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.params.id;
	Pdfir.findOne({_id: id, 'firm': crUser.firm})
	.populate({path: 'pdsecs', populate: {path: 'pdthd'}})
	.exec(function(err, object){
		if(object.pdsecs.length == 0) {
			let orgPhoto = object.photo;
			MdPicture.deleteOldPhoto(orgPhoto, Conf.photoPath.proPhoto);
			Pdfir.deleteOne({_id: object._id}, function(err, objRm) {
				if(err) {
					info = "bsPdfirDel, Pdfir.findOne, Error!";
					Err.usError(req, res, info);
				} else {
					res.redirect('/bsProds');
				}
			})
		} else {
			info = "bsProdDel, 先删除所有颜色子元素, 请联系管理员";
			Err.usError(req, res, info);
		}
	})
}






exports.bsPdfirDelAjax = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.query.id
	Pdfir.findOne({_id: id, 'firm': crUser.firm})
	.populate('pdsecs')
	.exec(function(err, object){
		if(err) {
			info = "bsPdfirDelAjax, Pdfir.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!object){
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"})
		} else if(object.pdsecs && object.pdsecs.length > 0){
			res.json({success: 0, info: "请先删除颜色, 再删除产品"})
		} else {
			MdPicture.deleteOldPhoto(object.photo, Conf.photoPath.proPhoto)
			Pdfir.deleteOne({_id: object._id}, function(err, objRm) {
				if(err) {
					res.json({success: 0, info: "删除产品时，数据库删除出错, 请联系管理员"})
				} else {
					res.json({success: 1})
				}
			})
		}
	})
}





exports.bsPdfirAjaxOneMore = function(req, res) {
	let crUser = req.session.crUser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '');

	Pdfir.findOne({[keytype]: keyword, 'firm': crUser.firm})
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "bs获取产品时，数据库查找错误, 请联系管理员"});
		} else if(object){
			res.json({ success: 1, pdfir: object})
		} else {
			Pdfir.find({
				'firm': crUser.firm,
				[keytype]: new RegExp(keyword + '.*')
			})
			.exec(function(err, objects){
				if(err) {
					res.json({success: 0, info: "bs获取产品列表时，数据库查找错误, 请联系管理员"});
				} else if(objects && objects.length > 0){
					res.json({ success: 2, pdfirs: objects});
				} else {
					res.json({success: 0})
				}
			})
		}
	})
}


exports.bsPdfirAjaxOne = function(req, res) {
	let crUser = req.session.crUser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Pdfir.findOne({[keytype]: keyword, 'firm': crUser.firm})
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "bs获取产品时，数据库查找错误, 请联系管理员"});
		} else if(object){
			res.json({ success: 1, pdfir: object})
		} else {
			res.json({success: 0})
		}
	})
}