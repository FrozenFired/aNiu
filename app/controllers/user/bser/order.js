let Err = require('../aaIndex/err');
let Conf = require('../../../confile/conf');
let SaveOrderPre = require('../../../confile/middle/saveOrderPre');

let Order = require('../../../models/client/order');
let Ordfir = require('../../../models/client/ordfir');
let Ordsec = require('../../../models/client/ordsec');
let Ordthd = require('../../../models/client/ordthd');

let Pdfir = require('../../../models/material/pdfir');
let Pdsec = require('../../../models/material/pdsec');
let Pdthd = require('../../../models/material/pdthd');

let User = require('../../../models/login/user');
let Cter = require('../../../models/client/cter');

let _ = require('underscore')
let moment = require('moment')

/* ------------------------------- 添加订单时的产品操作 ------------------------------- */
// 模糊查找出产品
exports.bsOrderProdsAjax = function(req, res) {
	let crUser = req.session.crUser;
	let keyword = ' x x x ';
	if(req.query.keyword) {
		keyword = String(req.query.keyword);
		keyword = keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyword = new RegExp(keyword + '.*');
	}
	Pdfir.find({'firm': crUser.firm,'code':  keyword,})
	.populate({path: 'pdsecs', populate: {path: 'pdthds'}})
	.populate({path: 'pdsezs', populate: {path: 'pdthds'}})
	.limit(10)
	.exec(function(err, pdfirs) { if(err) {
		res.json({success: 0, info: "bsProdsAjax, Order.find, Error"})
	} else {
		res.json({success: 1, pdfirs: pdfirs})
	} })
}
// orderAdd 操作 order中的 pd
exports.bsOrderNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	Order.findOne({_id: obj.order, 'firm': crUser.firm})
	.populate({path: 'ordfirs', populate: {path: 'ordsecs', populate: {path: 'ordthds'}}})
	.exec(function(err, order) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsOrderNewPdAjax, Order.findOne, Error!"})
		} else if(!order) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			let flag = 0;
			let ordfir = ordsec = null;
			for(let ifir = 0; ifir < order.ordfirs.length; ifir++) {
				ordfir = order.ordfirs[ifir];
				if(obj.pdfir == ordfir.pdfir) {										// 订单中有了此产品
					flag = 1;
					for(let isec = 0; isec < ordfir.ordsecs.length; isec++) {
						ordsec = ordfir.ordsecs[isec];
						if(obj.pdsec == ordsec.pdsec) {							// 订单中有了此颜色
							flag = 2;
							break;
						}
						ordsec = null;
					}
					break;
				}
				ordfir = null;
			}
			if(flag == 0) {				// 订单中还没有此产品
				let ordfirObj = new Object();
				ordfirObj.order = obj.order;
				ordfirObj.pdfir = obj.pdfir;
				ordfirObj.code = obj.code;
				ordfirObj.nome = obj.nome;
				ordfirObj.price = parseFloat(obj.price);
				let _ordfir = new Ordfir(ordfirObj);

				let ordsecObj = new Object();
				ordsecObj.order = obj.order;
				ordsecObj.ordfir = _ordfir._id;
				ordsecObj.pdsec = obj.pdsec;
				ordsecObj.color = obj.color;
				let _ordsec = new Ordsec(ordsecObj);

				let ordthdObj = new Object();
				ordthdObj.order = obj.order;
				ordthdObj.ordfir = _ordfir._id;
				ordthdObj.ordsec = _ordsec._id;
				ordthdObj.pdthd = obj.pdthd;
				ordthdObj.size = obj.size;
				ordthdObj.quot = obj.quot;
				let _ordthd = new Ordthd(ordthdObj);
				_ordthd.save(function(err, ordthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=1, _ordthd.Save, Error!"})
					} else {
						_ordsec.ordthds.push(ordthdSave._id);
						_ordsec.save(function(err, ordsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=1, _ordsec.Save, Error!"})
							} else {
								_ordfir.ordsecs.push(ordsecSave._id);
								_ordfir.save(function(err, ordfirSave) {
									if(err) {
										console.log(err);
										res.json({success: 0, info: "flag=1, _ordfir.Save, Error!"})
									} else {
										order.ordfirs.push(ordfirSave);
										order.save(function(err, orderSave) {
											if(err) {
												console.log(err);
												res.json({success: 0, info: "flag=1, order.Save, Error!"})
											} else {
												res.json({success: 1, ordthdId: ordthdSave._id})
											}
										})
									}
								})
							}
						})
					}
				})
			} else if(flag == 1) {		// 订单中有此产品但是没有此颜色
				let ordsecObj = new Object();
				ordsecObj.order = obj.order;
				ordsecObj.ordfir = ordfir._id;
				ordsecObj.pdsec = obj.pdsec;
				ordsecObj.color = obj.color;
				let _ordsec = new Ordsec(ordsecObj);

				let ordthdObj = new Object();
				ordthdObj.order = obj.order;
				ordthdObj.ordfir = ordfir._id;
				ordthdObj.ordsec = _ordsec._id;
				ordthdObj.pdthd = obj.pdthd;
				ordthdObj.size = obj.size;
				ordthdObj.quot = obj.quot;
				let _ordthd = new Ordthd(ordthdObj);
				_ordthd.save(function(err, ordthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=1, _ordthd.Save, Error!"})
					} else {
						_ordsec.ordthds.push(ordthdSave._id);
						_ordsec.save(function(err, ordsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=1, _ordsec.Save, Error!"})
							} else {
								ordfir.ordsecs.push(ordsecSave._id);
								ordfir.save(function(err, ordfirSave) {
									if(err) {
										console.log(err);
										res.json({success: 0, info: "flag=1, ordfir.Save, Error!"})
									} else {
										res.json({success: 1, ordthdId: ordthdSave._id})
									}
								})
							}
						})
					}
				})
			} else if(flag == 2) {		// 订单中有了此产品，也有此产品的此颜色
				let ordthdObj = new Object();
				ordthdObj.order = obj.order;
				ordthdObj.ordfir = ordfir._id;
				ordthdObj.ordsec = ordsec._id;
				ordthdObj.pdthd = obj.pdthd;
				ordthdObj.size = obj.size;
				ordthdObj.quot = obj.quot;
				let _ordthd = new Ordthd(ordthdObj);
				ordsec.ordthds.push(_ordthd._id);
				_ordthd.save(function(err, ordthdSave) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "flag=2, _ordthd.Save, Error!"})
					} else {
						ordsec.save(function(err, ordsec) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "flag=2, ordsec.Save, Error!"})
							} else {
								res.json({success: 1, ordthdId: ordthdSave._id})
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

exports.bsOrderUpdPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let ordthdId = obj.ordthdId
	let quot = parseInt(req.body.obj.quot)
	if(isNaN(quot)) {
		res.json({success: 0, info: "数字输入不正确!"})
	} else {
		Ordthd.findOne({_id: ordthdId})
		.exec(function(err, ordthd) {
			if(err) {
				console.log(err);
				res.json({success: 0, info: "bsOrderUpdPdAjax, Ordthd.findOne, Error!"})
			} else if(!ordthd) {
				res.json({success: 0, info: "没有找到数据, 请刷新重试!"})
			} else {
				ordthd.quot = quot;
				ordthd.save(function(err, ordthdSv) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "bsOrderUpdPdAjax, ordthd.save, Error!"})
					} else {
						res.json({success: 1, ordthdId: ordthdId})
					}
				})
			}
		})
	}
}
exports.bsOrderDelPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let ordthdId = obj.ordthdId
	let order = req.body.obj.order
	
	Ordthd.findOne({_id: ordthdId})
	.populate({path: 'ordsec', populate: {path: 'ordfir', populate: {path: 'order'}}})
	.exec(function(err, ordthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsOrderDelPdAjax, Ordthd.findOne, Error!"})
		} else {
			let ordsec = ordthd.ordsec;
			let ordsecId = ordsec._id;
			Ordthd.deleteOne({_id: ordthd._id}, function(err, ordthdRm) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsOrderDelPdAjax, Ordthd.deleteOne, Error!"})
				} else {
					if(ordsec.ordthds.length > 1) {
						ordsec.ordthds.remove(ordthdId)
						ordsec.save(function(err, ordsecSave) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsOrderDelPdAjax, ordsec.save, Error!"})
							} else {
								res.json({success: 1})
							}
						})
					} else {
						let ordfir = ordsec.ordfir;
						let ordfirId = ordfir._id;
						Ordsec.deleteOne({_id: ordsecId}, function(err, ordsecRm) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsOrderDelPdAjax, Ordsec.deleteOne, Error!"})
							} else {
								if(ordfir.ordsecs.length > 1) {
									ordfir.ordsecs.remove(ordsecId)
									ordfir.save(function(err, ordfirSave) {
										if(err) {
											console.log(err);
											res.json({success: 0, info: "bsOrderDelPdAjax, ordfir.save, Error!"})
										} else {
											res.json({success: 1})
										}
									})
								} else {
									let order = ordfir.order;
									Ordfir.deleteOne({_id: ordfirId}, function(err, ordfirRm) {
										if(err) {
											console.log(err);
											res.json({success: 0, info: "bsOrderDelPdAjax, ordfir.deleteOne, Error!"})
										} else {
											order.ordfirs.remove(ordfirId);
											order.save(function(err, orderSave) {
												if(err) {
													console.log(err);
													res.json({success: 0, info: "bsOrderDelPdAjax, order.save, Error!"})
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

/* ------------------------------- 添加订单时的产品操作 ------------------------------- */


/* ------------------------------- 添加订单时的客户操作 ------------------------------- */
exports.bsOrderConnCterAjax = function(req, res) {
	let crUser = req.session.crUser;
	let orderId = req.query.orderId;
	let cterId = req.query.cterId;

	Cter.findOne({'_id': cterId, 'firm': crUser.firm})
	.exec(function(err, cter) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsOrderConnCterAjax, orderId, Cter.findOne, Error!"})
		} else if(!cter) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			Order.findOne({'_id': orderId, 'firm': crUser.firm})
			.exec(function(err, order) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsOrderConnCterAjax, orderId, Order.findOne, Error!"})
				} else if(!order) {
					res.json({success: 0, info: "操作错误, 请刷新重试!"})
				} else {
					order.cter = cter._id;
					// console.log(order)
					order.save(function(err, orderSave) {
						if(err) console.log(err);
						orderSave.cter = cter
						res.json({success: 1, order: orderSave})
					})
				}
			})
		}
	})
}
/* ------------------------------- 添加订单时的客户操作 ------------------------------- */

// YYMMDDXXNUM   190205KL0012
let bsOrderGetCode = function(order, userCd) {
	let today =parseInt(moment(Date.now()).format('YYMMDD')) // 计算今天的日期
	let preDate = 0, dayNum = 0;

	if(order && order.code){ // 找出上个订单的日期和序列号
		preDate = parseInt(order.code.slice(0,6))
		dayNum = parseInt(order.code.slice(8,12))
	}
	if(today == preDate) {	// 判断上个订单的日期是否是今天
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











exports.bsOrderFilter = function(req, res, next) {
	let id = req.params.id
	Order.findOne({_id: id})
	.populate('firm')
	.populate('cter')
	.populate({path:'ordfirs', populate: [
		{path: 'pdfir', populate:{path: 'pdsecs', populate:{path: 'pdthds'}}}, 
		{path: 'ordsecs', populate: {path: 'ordthds', populate: {path: 'pdthd'}}}
	] })
	.exec(function(err, order) { if(err) {
		info = "bs查看订单时, 订单数据库错误, 请联系管理员";
		Err.usError(req, res, info);
	} else if(!order) {
		info = "order 数据已经被删除，请刷新查看";
		Err.usError(req, res, info);
	} else if(!order.firm){
		info = "bs查看订单时, 本公司数据不存在, 请联系管理员";
		Err.usError(req, res, info);
	} else {
		req.body.order = order;
		next()
	} })
}

exports.bsOrder = function(req, res) {
	let crUser = req.session.crUser;

	let order = req.body.order;
	let objBody = new Object();
	objBody.order = order;
	objBody.firm = order.firm;
	objBody.title = '订单';
	objBody.crUser = crUser;
	objBody.thisAct = "/bsOrder";
	res.render('./user/bser/order/detail/detail', objBody);
}









exports.bsOrderUp = function(req, res) {
	let crUser = req.session.crUser;

	let object = req.body.object;
	res.redirect('/bsOrderAdd?orderId='+object._id)
}






exports.bsOrderDel = function(req, res) {
	let crUser = req.session.crUser;
	let id = req.params.id
	Order.findOne({_id: id, 'firm': crUser.firm})
	.populate({path: 'ordfirs', populate: [
		{path: 'pdfir'},
		{path: 'ordsecs', populate: {path: 'ordthds', populate: {path: 'pdthd'}}},
	]})
	.populate('cter')
	.exec(function(err, order) {
		if(err) {
			console.log(err);
			info = "bsOrderDel, Order.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!order) {
			info = "订单已经不存在, 请刷新查看!";
			Err.usError(req, res, info);
		} else {
			// 删除订单时 pd和ord解除关联
			SaveOrderPre.pdRelOrderDel(order, 'bsOrderDel');
			Order.deleteOne({_id: id}, function(err, orderRm) {
				if(err) {
					info = "bsOrderDel, Order.deleteOne, Error!";
					Err.usError(req, res, info);
				} else {
					res.redirect("/bsOrds");
				}
			})
		}
	})
}




















































exports.bsOrderExcel = function(req, res) {
	let order = req.body.object;

	let cter = new Object();
	if(order.cter) cter = order.cter;
	let firm = new Object();
	if(order.firm) firm = order.firm;

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
	// 第三行 地址和订单号
	rw++;
	ws.cell(rw,1).string('地址');
	if(firm && firm.addr) ws.cell(rw,2, rw,3, true).string(String(firm.addr));
	ws.cell(rw, 4, rw, 6, true).string(' ')
	ws.cell(rw,7).string('No:');
	if(order.code) ws.cell(rw,8, rw,9, true).string(String(order.code));
	// 第四行 电话和日期
	rw++;
	ws.cell(rw,1).string('电话');
	if(firm && firm.tel) ws.cell(rw,2, rw,3, true).string(String(firm.tel));
	ws.cell(rw, 4, rw, 6, true).string(' ')
	ws.cell(rw,7).string('Date:');
	if(order.code) ws.cell(rw,8, rw,9, true).string(moment(order.ctAt).format('MM/DD/YYYY'));
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

	if(order.sells) {
		let len = order.sells.length;
		for(let i=0; i<len; i++){
			let sell = order.sells[i];
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
		ws.cell((rw), 7).string('Tot: '+ order.pieces +'pz');
		ws.cell((rw), 9).string('IMP: '+ Math.round(order.imp * 100)/100);
		rw++;
	}

	if(order.note) {
		ws.row(rw).setHeight(30);
		ws.cell(rw, 1, rw, 6, true).string('Note: ' + order.note)
	}

	wb.write(order.code + '.xlsx', res);
}



exports.bsOrderPDF = function(req, res) {
	let bsRoot = require('path').join(__dirname, "../../../");
	let order = req.body.object;
	let cter = new Object();
	if(order.cter) cter = order.cter;
	let firm = new Object();
	if(order.firm) firm = order.firm;

	let pug = require('pug');
	let hc = require('pug').renderFile(bsRoot + 'views/zzPdf/order/aaPdf.pug', {
		static: "file://"+bsRoot + 'static',
		moment : require('moment'),
		// title: 'order PDF',

		order: order,
		firm: firm,
		cter: cter,
	});
	res.pdfFromHTML({
		filename: order.code + '.pdf',
		htmlContent: hc
	});
}