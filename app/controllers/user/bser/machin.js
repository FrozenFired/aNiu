let Err = require('../aaIndex/err');
let Conf = require('../../../confile/conf');
let SaveMachinPre = require('../../../confile/middle/saveMachinPre');

let Machin = require('../../../models/foundry/machin');
let Macfir = require('../../../models/foundry/macfir');
let Macsec = require('../../../models/foundry/macsec');
let Macthd = require('../../../models/foundry/macthd');

let Pdfir = require('../../../models/material/pdfir');
let Pdsec = require('../../../models/material/pdsec');
let Pdthd = require('../../../models/material/pdthd');

let User = require('../../../models/login/user');
let Fder = require('../../../models/foundry/fder');

let _ = require('underscore')
let moment = require('moment')


/* ------------------------------- 添加生产单时的产品操作 ------------------------------- */
// 模糊查找出产品
exports.bsMachinProdsAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keywmac = ' x x x ';
	if(req.query.keywmac) {
		keywmac = String(req.query.keywmac);
		keywmac = keywmac.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keywmac = new RegExp(keywmac + '.*');
	}
	Pdfir.find({'firm': crUser.firm,'code':  keywmac,})
	.populate({path: 'pdsecs', populate: {path: 'pdthds'}})
	.limit(10)
	.exec(function(err, pdfirs) { if(err) {
		res.json({success: 0, info: "bsProdsAjax, Machin.find, Error"})
	} else {
		res.json({success: 1, pdfirs: pdfirs})
	} })
}
// machinAdd 操作 machin中的 pd
exports.bsMachinNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	Machin.findOne({_id: obj.machin, 'firm': crUser.firm})
	.populate({path: 'macfirs', populate: {path: 'macsecs', populate: {path: 'macthds'}}})
	.exec(function(err, machin) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMachinNewPdAjax, Machin.findOne, Error!"})
		} else if(!machin) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			let flag = 0;
			let macfir = macsec = null;
			for(let ifir = 0; ifir < machin.macfirs.length; ifir++) {
				macfir = machin.macfirs[ifir];
				if(obj.pdfir == macfir.pdfir) {										// 生产单中有了此产品
					flag = 1;
					for(let isec = 0; isec < macfir.macsecs.length; isec++) {
						macsec = macfir.macsecs[isec];
						if(obj.pdsec == macsec.pdsec) {							// 生产单中有了此颜色
							flag = 2;
							break;
						}
						macsec = null;
					}
					break;
				}
				macfir = null;
			}
			if(flag == 0) {				// 生产单中还没有此产品
				let macfirObj = new Object();
				macfirObj.machin = obj.machin;
				macfirObj.pdfir = obj.pdfir;
				macfirObj.code = obj.code;
				macfirObj.nome = obj.nome;
				macfirObj.price = parseFloat(obj.price);
				let _macfir = new Macfir(macfirObj);

				let macsecObj = new Object();
				macsecObj.machin = obj.machin;
				macsecObj.macfir = _macfir._id;
				macsecObj.pdsec = obj.pdsec;
				macsecObj.color = obj.color;
				let _macsec = new Macsec(macsecObj);

				let macthdObj = new Object();
				macthdObj.machin = obj.machin;
				macthdObj.macfir = _macfir._id;
				macthdObj.macsec = _macsec._id;
				macthdObj.pdthd = obj.pdthd;
				macthdObj.size = obj.size;
				macthdObj.quot = obj.quot;
				let _macthd = new Macthd(macthdObj);
				_macthd.save(function(err, macthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=1, _macthd.Save, Error!"})
					} else {
						_macsec.macthds.push(macthdSave._id);
						_macsec.save(function(err, macsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=1, _macsec.Save, Error!"})
							} else {
								_macfir.macsecs.push(macsecSave._id);
								_macfir.save(function(err, macfirSave) {
									if(err) {
										console.log(err);
										res.json({success: 0, info: "flag=1, _macfir.Save, Error!"})
									} else {
										machin.macfirs.push(macfirSave);
										machin.save(function(err, machinSave) {
											if(err) {
												console.log(err);
												res.json({success: 0, info: "flag=1, machin.Save, Error!"})
											} else {
												res.json({success: 1, macthdId: macthdSave._id})
											}
										})
									}
								})
							}
						})
					}
				})
			} else if(flag == 1) {		// 生产单中有此产品但是没有此颜色
				let macsecObj = new Object();
				macsecObj.machin = obj.machin;
				macsecObj.macfir = macfir._id;
				macsecObj.pdsec = obj.pdsec;
				macsecObj.color = obj.color;
				let _macsec = new Macsec(macsecObj);

				let macthdObj = new Object();
				macthdObj.machin = obj.machin;
				macthdObj.macfir = macfir._id;
				macthdObj.macsec = _macsec._id;
				macthdObj.pdthd = obj.pdthd;
				macthdObj.size = obj.size;
				macthdObj.quot = obj.quot;
				let _macthd = new Macthd(macthdObj);
				_macthd.save(function(err, macthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=1, _macthd.Save, Error!"})
					} else {
						_macsec.macthds.push(macthdSave._id);
						_macsec.save(function(err, macsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=1, _macsec.Save, Error!"})
							} else {
								macfir.macsecs.push(macsecSave._id);
								macfir.save(function(err, macfirSave) {
									if(err) {
										console.log(err);
										res.json({success: 0, info: "flag=1, macfir.Save, Error!"})
									} else {
										res.json({success: 1, macthdId: macthdSave._id})
									}
								})
							}
						})
					}
				})
			} else if(flag == 2) {		// 生产单中有了此产品，也有此产品的此颜色
				let macthdObj = new Object();
				macthdObj.machin = obj.machin;
				macthdObj.macfir = macfir._id;
				macthdObj.macsec = macsec._id;
				macthdObj.pdthd = obj.pdthd;
				macthdObj.size = obj.size;
				macthdObj.quot = obj.quot;
				let _macthd = new Macthd(macthdObj);
				macsec.macthds.push(_macthd._id);
				_macthd.save(function(err, macthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=2, _macthd.Save, Error!"})
					} else {
						macsec.save(function(err, macsec) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=2, macsec.Save, Error!"})
							} else {
								res.json({success: 1, macthdId: macthdSave._id})
							}
						})
					}
				})
			} else {
				res.json({success: 0, info: "操作错误, 请刷新重试!"})
			}
		}
	})
}

exports.bsMachinUpdPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let macthdId = obj.macthdId
	let quot = parseInt(req.body.obj.quot)
	if(isNaN(quot)) {
		res.json({success: 0, info: "数字输入不正确!"})
	} else {
		Macthd.findOne({_id: macthdId})
		.exec(function(err, macthd) {
			if(err) {
				console.log(err);
				res.json({success: 0, info: "bsMachinUpdPdAjax, Macthd.findOne, Error!"})
			} else if(!macthd) {
				res.json({success: 0, info: "没有找到数据, 请刷新重试!"})
			} else {
				macthd.quot = quot;
				macthd.save(function(err, macthdSv) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "bsMachinUpdPdAjax, macthd.save, Error!"})
					} else {
						res.json({success: 1, macthdId: macthdId})
					}
				})
			}
		})
	}
}
exports.bsMachinDelPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let macthdId = obj.macthdId
	let machin = req.body.obj.machin
	
	Macthd.findOne({_id: macthdId})
	.populate({path: 'macsec', populate: {path: 'macfir', populate: {path: 'machin'}}})
	.exec(function(err, macthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMachinDelPdAjax, Macthd.findOne, Error!"})
		} else {
			let macsec = macthd.macsec;
			let macsecId = macsec._id;
			Macthd.deleteOne({_id: macthd._id}, function(err, macthdRm) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsMachinDelPdAjax, Macthd.deleteOne, Error!"})
				} else {
					if(macsec.macthds.length > 1) {
						macsec.macthds.remove(macthdId)
						macsec.save(function(err, macsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsMachinDelPdAjax, macsec.save, Error!"})
							} else {
								res.json({success: 1})
							}
						})
					} else {
						let macfir = macsec.macfir;
						let macfirId = macfir._id;
						Macsec.deleteOne({_id: macsecId}, function(err, macsecRm) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsMachinDelPdAjax, Macsec.deleteOne, Error!"})
							} else {
								if(macfir.macsecs.length > 1) {
									macfir.macsecs.remove(macsecId)
									macfir.save(function(err, macfirSave) {
										if(err) {
											console.log(err);
											res.json({success: 0, info: "bsMachinDelPdAjax, macfir.save, Error!"})
										} else {
											res.json({success: 1})
										}
									})
								} else {
									let machin = macfir.machin;
									Macfir.deleteOne({_id: macfirId}, function(err, macfirRm) {
										if(err) {
											console.log(err);
											res.json({success: 0, info: "bsMachinDelPdAjax, macfir.deleteOne, Error!"})
										} else {
											machin.macfirs.remove(macfirId);
											machin.save(function(err, machinSave) {
												if(err) {
													console.log(err);
													res.json({success: 0, info: "bsMachinDelPdAjax, machin.save, Error!"})
												} else {
													res.json({success: 1})
												}
											})
										}
									})
								}
							}
						})
					}
				}
			})
		}
	})
}

/* ------------------------------- 添加生产单时的产品操作 ------------------------------- */


// YYMMDDXXNUM   190205KL0012
let bsMachinGetCode = function(machin, userCd) {
	let today =parseInt(moment(Date.now()).format('YYMMDD')) // 计算今天的日期
	let preDate = 0, dayNum = 0;

	if(machin && machin.code){ // 找出上个生产单的日期和序列号
		preDate = parseInt(machin.code.slice(0,6))
		dayNum = parseInt(machin.code.slice(8,12))
	}
	if(today == preDate) {	// 判断上个生产单的日期是否是今天
		dayNum = dayNum+1
	} else {					// 如果不是则从1开始
		dayNum = 1
	}
	for(let len = (dayNum + "").length; len < 4; len = dayNum.length) { // 序列号补0
		dayNum = "0" + dayNum;            
	}
	let code = String(today)+ userCd + String(dayNum);
	return code;
}










exports.bsMachinFilter = function(req, res, next) {
	let id = req.params.id
	Machin.findOne({_id: id})
	.populate('firm')
	.populate('fder')
	.populate({path:'macfirs', populate: [
		{path: 'pdfir', populate:{path: 'pdsecs', populate:{path: 'pdthds'}}}, 
		{path: 'macsecs', populate: {path: 'macthds', populate: {path: 'pdthd'}}}
	] })
	.exec(function(err, machin) { if(err) {
		info = "bs查看生产单时, 生产单数据库错误, 请联系管理员";
		Err.usError(req, res, info);
	} else if(!machin) {
		info = "machin 数据已经被删除，请刷新查看";
		Err.usError(req, res, info);
	} else if(!machin.firm){
		info = "bs查看生产单时, 本公司数据不存在, 请联系管理员";
		Err.usError(req, res, info);
	} else {
		req.body.machin = machin;
		next()
	} })
}

exports.bsMachin = function(req, res) {
	let crUser = req.session.crUser;

	let machin = req.body.machin;
	let objBody = new Object();
	objBody.machin = machin;
	objBody.firm = machin.firm;
	objBody.title = '生产单';
	objBody.crUser = crUser;
	objBody.thisAct = "/bsMachin";
	let detail = 'detail';
	if(machin.status == 5) {
		detail = 'detail5'
	} else if(machin.status == 10) {
		detail = 'detail10'
	}
	// console.log(detail)
	res.render('./user/bser/machin/detail/detail', objBody);
}








exports.bsMachinUp = function(req, res) {
	let crUser = req.session.crUser;

	let object = req.body.object;
	res.redirect('/bsMachinAdd?machinId='+object._id)
}






exports.bsMachinDel = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.params.id
	Machin.findOne({_id: id, 'firm': crUser.firm})
	.populate({path: 'macfirs', populate: [
		{path: 'pdfir'},
		{path: 'macsezs', populate: {path: 'pdsez'}},
		{path: 'macsecs', populate: {path: 'macthds', populate: {path: 'pdthd'}}},
	]})
	.populate('fder')
	.exec(function(err, machin) {
		if(err) {
			console.log(err);
			info = "bsMachinDel, Machin.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!machin) {
			info = "生产单已经不存在, 请刷新查看!";
			Err.usError(req, res, info);
		} else {
			// 删除生产单时 pd和mac解除关联
			SaveMachinPre.pdRelMachinDel(machin, 'bsMachinDel');
			SaveMachinPre.bsMachinDelPre(machin._id);
			Machin.deleteOne({_id: id}, function(err, machinRm) {
				if(err) {
					info = "bsMachinDel, Machin.deleteOne, Error!";
					Err.usError(req, res, info);
				} else {
					res.redirect("/bsMacs?preUrl=bsMachinDel");
				}
			})
		}
	})
}


















exports.bsMachinExcel = function(req, res) {
	let machin = req.body.object;

	let fder = new Object();
	if(machin.fder) fder = machin.fder;
	let firm = new Object();
	if(machin.firm) firm = machin.firm;

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
	// 第三行 地址和生产单号
	rw++;
	ws.cell(rw,1).string('地址');
	if(firm && firm.addr) ws.cell(rw,2, rw,3, true).string(String(firm.addr));
	ws.cell(rw, 4, rw, 6, true).string(' ')
	ws.cell(rw,7).string('No:');
	if(machin.code) ws.cell(rw,8, rw,9, true).string(String(machin.code));
	// 第四行 电话和日期
	rw++;
	ws.cell(rw,1).string('电话');
	if(firm && firm.tel) ws.cell(rw,2, rw,3, true).string(String(firm.tel));
	ws.cell(rw, 4, rw, 6, true).string(' ')
	ws.cell(rw,7).string('Date:');
	if(machin.code) ws.cell(rw,8, rw,9, true).string(moment(machin.ctAt).format('MM/DD/YYYY'));
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

	if(machin.sells) {
		let len = machin.sells.length;
		for(let i=0; i<len; i++){
			let sell = machin.sells[i];
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
		ws.cell((rw), 7).string('Tot: '+ machin.pieces +'pz');
		ws.cell((rw), 9).string('IMP: '+ Math.round(machin.imp * 100)/100);
		rw++;
	}

	if(machin.note) {
		ws.row(rw).setHeight(30);
		ws.cell(rw, 1, rw, 6, true).string('Note: ' + machin.note)
	}

	wb.write(machin.code + '.xlsx', res);
}



exports.bsMachinPDF = function(req, res) {
	let bsRoot = require('path').join(__dirname, "../../../");
	let machin = req.body.object;
	let fder = new Object();
	if(machin.fder) fder = machin.fder;
	let firm = new Object();
	if(machin.firm) firm = machin.firm;

	let pug = require('pug');
	let hc = require('pug').renderFile(bsRoot + 'views/zzPdf/machin/aaPdf.pug', {
		static: "file://"+bsRoot + 'static',
		moment : require('moment'),
		// title: 'machin PDF',

		machin: machin,
		firm: firm,
		fder: fder,
	});
	res.pdfFromHTML({
		filename: machin.code + '.pdf',
		htmlContent: hc
	});
}