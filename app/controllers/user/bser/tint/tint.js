let Err = require('../../aaIndex/err');
let Conf = require('../../../../confile/conf');
let SaveTintPre = require('../../../../confile/middle/saveTintPre');

let Tint = require('../../../../models/dryer/tint');
let Tinfir = require('../../../../models/dryer/tinfir');
let Tinsec = require('../../../../models/dryer/tinsec');
let Tinthd = require('../../../../models/dryer/tinthd');

let Pdfir = require('../../../../models/material/pdfir');
let Pdsec = require('../../../../models/material/pdsec');
let Pdthd = require('../../../../models/material/pdthd');

let User = require('../../../../models/login/user');
let Tner = require('../../../../models/dryer/tner');

let _ = require('underscore')
let moment = require('moment')



/* ------------------------------- 添加染洗单时的产品操作 ------------------------------- */
// 模糊查找出产品
exports.bsTintProdsAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keyword = ' x x x ';
	if(req.query.keyword) {
		keyword = String(req.query.keyword);
		keyword = keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyword = new RegExp(keyword + '.*');
	}
	Pdfir.find({'firm': crUser.firm,'code':  keyword, 'semi': 1})
	.populate({path: 'pdsecs', populate: {path: 'pdthds'}})
	.populate({path: 'pdsezs', populate: {path: 'pdthds'}})
	.limit(10)
	.exec(function(err, pdfirs) { if(err) {
		res.json({success: 0, info: "bsProdsAjax, Tint.find, Error"})
	} else {
		res.json({success: 1, pdfirs: pdfirs})
	} })
}




exports.bsTintFilter = function(req, res, next) {
	let id = req.params.id
	Tint.findOne({_id: id})
	.populate('firm')
	.populate('tner')
	.populate({path:'tinfirs', populate: [
		{path: 'pdfir', populate:{path: 'pdsecs', populate:{path: 'pdthds'}}}, 
		{path: 'tinsecs', populate: [
			{path: 'tinthds', populate: {path: 'pdthd'}},
			{path: 'pdsec'}
		]}
	] })
	.exec(function(err, tint) { if(err) {
		info = "bs查看染洗单时, 染洗单数据库错误, 请联系管理员";
		Err.usError(req, res, info);
	} else if(!tint) {
		info = "tint 数据已经被删除，请刷新查看";
		Err.usError(req, res, info);
	} else if(!tint.firm){
		info = "bs查看染洗单时, 本公司数据不存在, 请联系管理员";
		Err.usError(req, res, info);
	} else {
		req.body.tint = tint;
		next()
	} })
}

exports.bsTint = function(req, res) {
	let crUser = req.session.crUser;

	let tint = req.body.tint;
	let objBody = new Object();
	objBody.tint = tint;
	objBody.firm = tint.firm;
	objBody.title = '染洗单';
	objBody.crUser = crUser;
	objBody.thisAct = "/bsTint";
	// console.log(detail)
	res.render('./user/bser/tint/detail/detail', objBody);
}








exports.bsTintUp = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.params.id
	Tint.findOne({_id: id})
	.populate('tner')
	.populate({path:'tinfirs', populate: [
		{path: 'pdfir', populate: [
			{path: 'pdsecs'}, {path: 'pdsezs'}
		]}, 
		{path: 'tinsezs', populate:{path: 'pdsez'}}, 
		{path: 'tinsecs', populate: [
			{path: 'pdsec', populate: {path: 'pdthds'}},
			{path: 'tinthds', populate: {path: 'pdthd'}}
		]}
	] })
	.exec(function(err, tint) { 
		if(err) {
			info = "bs查看生产单时, 生产单数据库错误, 请联系管理员";
			Err.usError(req, res, info);
		} else if(!tint) {
			info = "tint 数据已经被删除，请刷新查看";
			Err.usError(req, res, info);
		} else if(!tint.tinfirs && tint.tinfirs.length == 0) {
			info = "tint 中的数据已经被删除，请刷新查看";
			Err.usError(req, res, info);
		} else {
			res.render('./user/bser/tint/update/update', {
				title : '生产单更新',
				crUser: crUser,
				tint : tint,
			});
		} 
	})
}



exports.bsTintRelTnerAjax = function(req, res) {
	let crUser = req.session.crUser;
	let tintId = req.query.tintId
	let tnerId = req.query.tnerId
	
	Tint.findOne({_id: tintId}, function(err, tint){
		if(err) {
			console.log(err);
			info = "bsTintRelTnerAjax, Tint.findOne, Error!"
			res.json({success: 0, info: info})
		} else if(!tint) {
			info = "没有找到订单， 请刷新重试!"
			res.json({success: 0, info: info})
		} else {
			Tner.findOne({_id: tnerId}, function(err, tner) {
				if(err) {
					console.log(err);
					info = "bsTintRelTnerAjax, Tner.findOne, Error!"
					res.json({success: 0, info: info})
				} else if(!tner) {
					info = "没有找到选择的客户， 请刷新重试!"
					res.json({success: 0, info: info})
				} else {
					tint.tner = tner._id;
					tint.save(function(err, tintSv){
						if(err) {
							console.log(err);
							info = "bsTintRelTnerAjax, tint.save, Error!"
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




exports.bsTintDel = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.params.id
	Tint.findOne({_id: id, 'firm': crUser.firm})
	.populate({path: 'tinfirs', populate: [
		{path: 'pdfir'},
		{path: 'tinsecs', populate: {path: 'tinthds', populate: {path: 'pdthd'}}},
	]})
	.populate('tner')
	.exec(function(err, tint) {
		if(err) {
			console.log(err);
			info = "bsTintDel, Tint.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!tint) {
			info = "染洗单已经不存在, 请刷新查看!";
			Err.usError(req, res, info);
		} else {
			// 删除染洗单时 pd和tin解除关联
			SaveTintPre.pdRelTintDel(tint, 'bsTintDel');
			SaveTintPre.bsTintDelPre(tint._id);
			Tint.deleteOne({_id: id}, function(err, tintRm) {
				if(err) {
					info = "bsTintDel, Tint.deleteOne, Error!";
					Err.usError(req, res, info);
				} else {
					res.redirect("/bsTins?preUrl=bsTintDel");
				}
			})
		}
	})
}






















































exports.bsTintExcel = function(req, res) {
	let tint = req.body.object;

	let tner = new Object();
	if(tint.tner) tner = tint.tner;
	let firm = new Object();
	if(tint.firm) firm = tint.firm;

	let xl = require('excel4node');
	let wb = new xl.Workbook({
		defaultFont: {
			size: 12,
			color: '333333'
		},
		dateFormat: 'yyyy-mm-dd hh:mm:ss'
	});
	
	let ws = wb.addWorksheet('Sheet 1');
	ws.column(1).setWidth(8);
	ws.column(2).setWidth(12);
	ws.column(3).setWidth(12);
	ws.column(4).setWidth(12);
	ws.column(5).setWidth(10);
	ws.column(6).setWidth(10);
	ws.column(7).setWidth(10);
	ws.column(8).setWidth(10);
	ws.column(9).setWidth(15);

	// 第一行： 表头 自己的公司名称
	let rw = 1;
	ws.row(rw).setHeight(35);
	style = wb.createStyle({
		font: {color: '#228B22', size: 18,},
		alignment: { 
			horizontal: ['center'],
		},
	})
	ws.cell(rw, 1, rw, 9, true).string(firm.code).style(style)
	// 第二行 副标题
	rw++;
	ws.row(rw).setHeight(20);
	style = wb.createStyle({
		font: {color: '#808080', size: 15,},
		alignment: { 
			horizontal: ['center'],
			vertical: ['top']
		},
	})
	ws.cell(rw, 1, rw, 9, true).string('PREVENTIVO').style(style)
	// 第三行 地址和染洗单号
	rw++;
	ws.cell(rw,1).string('地址');
	if(firm && firm.addr) ws.cell(rw,2, rw,3, true).string(String(firm.addr));
	ws.cell(rw, 4, rw, 6, true).string(' ')
	ws.cell(rw,7).string('No:');
	if(tint.code) ws.cell(rw,8, rw,9, true).string(String(tint.code));
	// 第四行 电话和日期
	rw++;
	ws.cell(rw,1).string('电话');
	if(firm && firm.tel) ws.cell(rw,2, rw,3, true).string(String(firm.tel));
	ws.cell(rw, 4, rw, 6, true).string(' ')
	ws.cell(rw,7).string('Date:');
	if(tint.code) ws.cell(rw,8, rw,9, true).string(moment(tint.ctAt).format('MM/DD/YYYY'));
	// 第五行 空一行
	rw++;
	ws.cell(rw, 1, rw, 9, true).string(' ')
	// 第六行 table header
	rw++;
	ws.cell(rw,1).string('NB.');
	ws.cell(rw,2).string('CODICE');
	ws.cell(rw,3).string('DESC.');
	ws.cell(rw,4).string('材质');
	ws.cell(rw,5).string('门幅');
	ws.cell(rw,6).string('长度');
	ws.cell(rw,7).string('QNT');
	ws.cell(rw,8).string('PREZZO');
	ws.cell(rw,9).string('TOTAL');

	rw++;

	if(tint.sells) {
		let len = tint.sells.length;
		for(let i=0; i<len; i++){
			let sell = tint.sells[i];
			let tot = sell.quot * sell.price
			ws.row(rw).setHeight(25);
			ws.cell((rw), 1).string(String(i+1));
			if(sell.code) ws.cell((rw), 2).string(String(sell.code));
			if(sell.nome) ws.cell((rw), 3).string(String(sell.nome));
			if(sell.material) ws.cell((rw), 4).string(String(sell.material));
			if(sell.width) ws.cell((rw), 5).string(String(sell.width));
			if(sell.size) {
				ws.cell((rw), 6).string(String(sell.size));
			}
			if(!isNaN(parseInt(sell.quot))) {
				ws.cell((rw), 7).string(String(sell.quot));
			}
			if(!isNaN(parseFloat(sell.price))) {
				ws.cell((rw), 8).string((sell.price).toFixed(2) + ' €');
			}
			if(!isNaN(parseFloat(sell.total))) {
				ws.cell((rw), 9).string((tot).toFixed(2) + ' €');
			}

			rw++;
		}

		ws.row(rw).setHeight(30);
		ws.cell((rw), 2).string('T.Art: '+ len);
		ws.cell((rw), 7).string('Tot: '+ tint.pieces +'pz');
		ws.cell((rw), 9).string('IMP: '+ Math.round(tint.imp * 100)/100);
		rw++;
	}

	if(tint.note) {
		ws.row(rw).setHeight(30);
		ws.cell(rw, 1, rw, 6, true).string('Note: ' + tint.note)
	}

	wb.write(tint.code + '.xlsx', res);
}



exports.bsTintPDF = function(req, res) {
	let bsRoot = require('path').join(__dirname, "../../../");
	let tint = req.body.object;
	let tner = new Object();
	if(tint.tner) tner = tint.tner;
	let firm = new Object();
	if(tint.firm) firm = tint.firm;

	let pug = require('pug');
	let hc = require('pug').renderFile(bsRoot + 'views/zzPdf/tint/aaPdf.pug', {
		static: "file://"+bsRoot + 'static',
		moment : require('moment'),
		// title: 'tint PDF',

		tint: tint,
		firm: firm,
		tner: tner,
	});
	res.pdfFromHTML({
		filename: tint.code + '.pdf',
		htmlContent: hc
	});
}