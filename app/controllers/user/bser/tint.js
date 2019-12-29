let Err = require('../aaIndex/err');
let Conf = require('../../../confile/conf');
let SaveTintPre = require('../../../confile/middle/saveTintPre');

let Tint = require('../../../models/dryer/tint');
let Tinfir = require('../../../models/dryer/tinfir');
let Tinsec = require('../../../models/dryer/tinsec');
let Tinthd = require('../../../models/dryer/tinthd');

let Pdfir = require('../../../models/material/pdfir');
let Pdsec = require('../../../models/material/pdsec');
let Pdthd = require('../../../models/material/pdthd');

let User = require('../../../models/login/user');
let Tner = require('../../../models/dryer/tner');

let _ = require('underscore')
let moment = require('moment')



/* ------------------------------- 添加染洗单时的产品操作 ------------------------------- */
// 模糊查找出产品
exports.bsTintProdsAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keywtin = ' x x x ';
	if(req.query.keywtin) {
		keywtin = String(req.query.keywtin);
		keywtin = keywtin.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keywtin = new RegExp(keywtin + '.*');
	}
	Pdfir.find({'firm': crUser.firm,'code':  keywtin,})
	.populate({path: 'pdsecs', populate: {path: 'pdthds'}})
	.limit(10)
	.exec(function(err, pdfirs) { if(err) {
		res.json({success: 0, info: "bsProdsAjax, Tint.find, Error"})
	} else {
		res.json({success: 1, pdfirs: pdfirs})
	} })
}
// tintAdd 操作 tint中的 pd
exports.bsTintNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	Tint.findOne({_id: obj.tint, 'firm': crUser.firm})
	.populate({path: 'tinfirs', populate: {path: 'tinsecs', populate: {path: 'tinthds'}}})
	.exec(function(err, tint) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsTintNewPdAjax, Tint.findOne, Error!"})
		} else if(!tint) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			let flag = 0;
			let tinfir = tinsec = null;
			for(let ifir = 0; ifir < tint.tinfirs.length; ifir++) {
				tinfir = tint.tinfirs[ifir];
				if(obj.pdfir == tinfir.pdfir) {										// 染洗单中有了此产品
					flag = 1;
					for(let isec = 0; isec < tinfir.tinsecs.length; isec++) {
						tinsec = tinfir.tinsecs[isec];
						if(obj.pdsec == tinsec.pdsec) {							// 染洗单中有了此颜色
							flag = 2;
							break;
						}
						tinsec = null;
					}
					break;
				}
				tinfir = null;
			}
			if(flag == 0) {				// 染洗单中还没有此产品
				let tinfirObj = new Object();
				tinfirObj.tint = obj.tint;
				tinfirObj.pdfir = obj.pdfir;
				tinfirObj.code = obj.code;
				tinfirObj.nome = obj.nome;
				tinfirObj.price = parseFloat(obj.price);
				let _tinfir = new Tinfir(tinfirObj);

				let tinsecObj = new Object();
				tinsecObj.tint = obj.tint;
				tinsecObj.tinfir = _tinfir._id;
				tinsecObj.pdsec = obj.pdsec;
				tinsecObj.color = obj.color;
				let _tinsec = new Tinsec(tinsecObj);

				let tinthdObj = new Object();
				tinthdObj.tint = obj.tint;
				tinthdObj.tinfir = _tinfir._id;
				tinthdObj.tinsec = _tinsec._id;
				tinthdObj.pdthd = obj.pdthd;
				tinthdObj.size = obj.size;
				tinthdObj.quot = obj.quot;
				let _tinthd = new Tinthd(tinthdObj);
				_tinthd.save(function(err, tinthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=1, _tinthd.Save, Error!"})
					} else {
						_tinsec.tinthds.push(tinthdSave._id);
						_tinsec.save(function(err, tinsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=1, _tinsec.Save, Error!"})
							} else {
								_tinfir.tinsecs.push(tinsecSave._id);
								_tinfir.save(function(err, tinfirSave) {
									if(err) {
										console.log(err);
										res.json({success: 0, info: "flag=1, _tinfir.Save, Error!"})
									} else {
										tint.tinfirs.push(tinfirSave);
										tint.save(function(err, tintSave) {
											if(err) {
												console.log(err);
												res.json({success: 0, info: "flag=1, tint.Save, Error!"})
											} else {
												res.json({success: 1, tinthdId: tinthdSave._id})
											}
										})
									}
								})
							}
						})
					}
				})
			} else if(flag == 1) {		// 染洗单中有此产品但是没有此颜色
				let tinsecObj = new Object();
				tinsecObj.tint = obj.tint;
				tinsecObj.tinfir = tinfir._id;
				tinsecObj.pdsec = obj.pdsec;
				tinsecObj.color = obj.color;
				let _tinsec = new Tinsec(tinsecObj);

				let tinthdObj = new Object();
				tinthdObj.tint = obj.tint;
				tinthdObj.tinfir = tinfir._id;
				tinthdObj.tinsec = _tinsec._id;
				tinthdObj.pdthd = obj.pdthd;
				tinthdObj.size = obj.size;
				tinthdObj.quot = obj.quot;
				let _tinthd = new Tinthd(tinthdObj);
				_tinthd.save(function(err, tinthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=1, _tinthd.Save, Error!"})
					} else {
						_tinsec.tinthds.push(tinthdSave._id);
						_tinsec.save(function(err, tinsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=1, _tinsec.Save, Error!"})
							} else {
								tinfir.tinsecs.push(tinsecSave._id);
								tinfir.save(function(err, tinfirSave) {
									if(err) {
										console.log(err);
										res.json({success: 0, info: "flag=1, tinfir.Save, Error!"})
									} else {
										res.json({success: 1, tinthdId: tinthdSave._id})
									}
								})
							}
						})
					}
				})
			} else if(flag == 2) {		// 染洗单中有了此产品，也有此产品的此颜色
				let tinthdObj = new Object();
				tinthdObj.tint = obj.tint;
				tinthdObj.tinfir = tinfir._id;
				tinthdObj.tinsec = tinsec._id;
				tinthdObj.pdthd = obj.pdthd;
				tinthdObj.size = obj.size;
				tinthdObj.quot = obj.quot;
				let _tinthd = new Tinthd(tinthdObj);
				tinsec.tinthds.push(_tinthd._id);
				_tinthd.save(function(err, tinthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=2, _tinthd.Save, Error!"})
					} else {
						tinsec.save(function(err, tinsec) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=2, tinsec.Save, Error!"})
							} else {
								res.json({success: 1, tinthdId: tinthdSave._id})
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

exports.bsTintUpdPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let tinthdId = obj.tinthdId
	let quot = parseInt(req.body.obj.quot)
	if(isNaN(quot)) {
		res.json({success: 0, info: "数字输入不正确!"})
	} else {
		Tinthd.findOne({_id: tinthdId})
		.exec(function(err, tinthd) {
			if(err) {
				console.log(err);
				res.json({success: 0, info: "bsTintUpdPdAjax, Tinthd.findOne, Error!"})
			} else if(!tinthd) {
				res.json({success: 0, info: "没有找到数据, 请刷新重试!"})
			} else {
				tinthd.quot = quot;
				tinthd.save(function(err, tinthdSv) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "bsTintUpdPdAjax, tinthd.save, Error!"})
					} else {
						res.json({success: 1, tinthdId: tinthdId})
					}
				})
			}
		})
	}
}
exports.bsTintDelPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let tinthdId = obj.tinthdId
	let tint = req.body.obj.tint
	
	Tinthd.findOne({_id: tinthdId})
	.populate({path: 'tinsec', populate: {path: 'tinfir', populate: {path: 'tint'}}})
	.exec(function(err, tinthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsTintDelPdAjax, Tinthd.findOne, Error!"})
		} else {
			let tinsec = tinthd.tinsec;
			let tinsecId = tinsec._id;
			Tinthd.deleteOne({_id: tinthd._id}, function(err, tinthdRm) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsTintDelPdAjax, Tinthd.deleteOne, Error!"})
				} else {
					if(tinsec.tinthds.length > 1) {
						tinsec.tinthds.remove(tinthdId)
						tinsec.save(function(err, tinsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsTintDelPdAjax, tinsec.save, Error!"})
							} else {
								res.json({success: 1})
							}
						})
					} else {
						let tinfir = tinsec.tinfir;
						let tinfirId = tinfir._id;
						Tinsec.deleteOne({_id: tinsecId}, function(err, tinsecRm) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsTintDelPdAjax, Tinsec.deleteOne, Error!"})
							} else {
								if(tinfir.tinsecs.length > 1) {
									tinfir.tinsecs.remove(tinsecId)
									tinfir.save(function(err, tinfirSave) {
										if(err) {
											console.log(err);
											res.json({success: 0, info: "bsTintDelPdAjax, tinfir.save, Error!"})
										} else {
											res.json({success: 1})
										}
									})
								} else {
									let tint = tinfir.tint;
									Tinfir.deleteOne({_id: tinfirId}, function(err, tinfirRm) {
										if(err) {
											console.log(err);
											res.json({success: 0, info: "bsTintDelPdAjax, tinfir.deleteOne, Error!"})
										} else {
											tint.tinfirs.remove(tinfirId);
											tint.save(function(err, tintSave) {
												if(err) {
													console.log(err);
													res.json({success: 0, info: "bsTintDelPdAjax, tint.save, Error!"})
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

/* ------------------------------- 添加染洗单时的产品操作 ------------------------------- */



// YYMMDDXXNUM   190205KL0012
let bsTintGetCode = function(tint, userCd) {
	let today =parseInt(moment(Date.now()).format('YYMMDD')) // 计算今天的日期
	let preDate = 0, dayNum = 0;

	if(tint && tint.code){ // 找出上个染洗单的日期和序列号
		preDate = parseInt(tint.code.slice(0,6))
		dayNum = parseInt(tint.code.slice(8,12))
	}
	if(today == preDate) {	// 判断上个染洗单的日期是否是今天
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







exports.bsTintFilter = function(req, res, next) {
	let id = req.params.id
	Tint.findOne({_id: id})
	.populate('firm')
	.populate('tner')
	.populate({path:'tinfirs', populate: [
		{path: 'pdfir', populate:{path: 'pdsecs', populate:{path: 'pdthds'}}}, 
		{path: 'tinsecs', populate: {path: 'tinthds', populate: {path: 'pdthd'}}}
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
	let detail = 'detail';
	if(tint.status == 5) {
		detail = 'detail5'
	} else if(tint.status == 10) {
		detail = 'detail10'
	}
	// console.log(detail)
	res.render('./user/bser/tint/detail/'+detail, objBody);
}








exports.bsTintUp = function(req, res) {
	let crUser = req.session.crUser;

	let object = req.body.object;
	res.redirect('/bsTintAdd?tintId='+object._id)
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