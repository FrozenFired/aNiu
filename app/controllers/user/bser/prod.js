let Err = require('../aaIndex/err')

let MdPicture = require('../../../middle/middlePicture');
let Conf = require('../../../../conf');

let Pdfir = require('../../../models/material/pdfir');
let Pdsec = require('../../../models/material/pdsec');
let Pdsez = require('../../../models/material/pdsez');
let Pdthd = require('../../../models/material/pdthd');
let Firm = require('../../../models/login/firm');

let _ = require('underscore');

exports.bsProdImg = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	Pdfir.findOne({_id: obj._id})
	.exec(function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "bsProdImg, Pdfir.findOne Error！";
			Err.usError(req, res, info);
		} else if(!pdfir) {
			info = "此模特不存在, 请刷新重试!";
			Err.usError(req, res, info);
		} else {
			let _pdfir = _.extend(pdfir, obj)
			_pdfir.save(function(err, firSv) {
				if(err) {
					console.log(err);
					info = "bsProdImg, _pdfir.save Error！";
					Err.usError(req, res, info);
				} else {
					res.redirect("/bsProduct/"+firSv._id);
				}
			})
		}
	})
}

exports.bsProdNewColor = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	let color = String(obj.color).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	// console.log('|'+color+'|')
	Pdfir.findOne({_id: obj.pdfir})
	.populate('pdsezs')
	.exec(function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "bsProdNewColor, Pdfir.findOne Error！";
			Err.usError(req, res, info);
		} else if(!pdfir) {
			info = "错做错误请重试， 没有找到相应产品";
			Err.usError(req, res, info);
		} else {
			let i=0;
			for(; i<pdfir.colors.length; i++) {
				if(pdfir.colors[i] == color) {
					break;
				}
			}
			if(i == pdfir.colors.length) {
				let dbs = new Array();			// 把所有需要创建的数据库放入一个数组可以递归保存

				let pdsecObj = new Object();
				pdsecObj.pdfir = pdfir._id;
				pdsecObj.color = color;
				let _pdsec = new Pdsec(pdsecObj);
				pdfir.colors.push(color);
				pdfir.pdsecs.push(_pdsec._id);
				dbs.push(_pdsec);

				for(let j=0; j<pdfir.pdsezs.length; j++) {
					let pdsez = pdfir.pdsezs[j];
					let pdthdObj = new Object();
					pdthdObj.color = color;
					pdthdObj.size = pdsez.size;
					pdthdObj.pdfir = pdfir._id;
					pdthdObj.pdsec = _pdsec._id;
					pdthdObj.pdsez = pdsez._id;
					let _pdthd = new Pdthd(pdthdObj);
					dbs.push(_pdthd);
					pdsez.pdthds.push(_pdthd._id);
					dbs.push(pdsez)

					_pdsec.pdthds.push(_pdthd._id);
					pdfir.pdthds.push(_pdthd._id);
				}
				bsProdSave(req, res, pdfir, dbs, 0);
			} else {
				info = "颜色添加重复";
				Err.usError(req, res, info);
			}
		}
	})
}

exports.bsProdNewSize = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	let size = parseInt(obj.size);
	// console.log('|'+color+'|')
	Pdfir.findOne({_id: obj.pdfir})
	.populate('pdsecs')
	.exec(function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "bsProdNewColor, Pdfir.findOne Error！";
			Err.usError(req, res, info);
		} else if(!pdfir) {
			info = "错做错误请重试， 没有找到相应产品";
			Err.usError(req, res, info);
		} else {
			let post = null;
			if(pdfir.sizes.length == 0) {
				post = 'push';
			} else if(size+1 == pdfir.sizes[0]) {
				post = 'unshift';
			} else if(size-1 == pdfir.sizes[pdfir.sizes.length-1]) {
				post = 'push';
			}
			if(post) {
				let dbs = new Array();			// 把所有需要创建的数据库放入一个数组可以递归保存
				let pdsezObj = new Object();
				pdsezObj.pdfir = pdfir._id;
				pdsezObj.size = size;
				let _pdsez = new Pdsez(pdsezObj);
				if(post == 'unshift') {
					pdfir.sizes.unshift(size)
					pdfir.pdsezs.unshift(_pdsez._id);
				}
				else{
					pdfir.sizes.push(size);
					pdfir.pdsezs.push(_pdsez._id);
				}
				dbs.push(_pdsez);

				for(let j=0; j<pdfir.pdsecs.length; j++) {
					let pdsec = pdfir.pdsecs[j];
					let pdthdObj = new Object();
					pdthdObj.color = pdsec.color;
					pdthdObj.size = size;
					pdthdObj.pdfir = pdfir._id;
					pdthdObj.pdsec = pdsec._id;
					pdthdObj.pdsez = _pdsez._id;
					let _pdthd = new Pdthd(pdthdObj);
					dbs.push(_pdthd);
					if(post == 'unshift') {
						pdsec.pdthds.unshift(_pdthd._id);
					} else {
						pdsec.pdthds.push(_pdthd._id);
					}
					dbs.push(pdsec)

					_pdsez.pdthds.push(_pdthd._id);
					pdfir.pdthds.push(_pdthd._id);
				}
				bsProdSave(req, res, pdfir, dbs, 0);
			} else {
				info = "尺寸添加重复";
				Err.usError(req, res, info);
			}
		}
	})
}

exports.bsProdDelColor = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	let pdfirId = obj.pdfir;
	let pdsecId = obj.pdsec;
	Pdfir.findOne({_id: pdfirId})
	.exec(function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "bsProdNewColor, Pdfir.findOne Error！";
			Err.usError(req, res, info);
		} else if(!pdfir) {
			info = "错做错误请重试， 没有找到相应产品";
			Err.usError(req, res, info);
		} else {
			let i = 0;
			for(; i<pdfir.pdsecs.length; i++) {
				if(pdsecId == String(pdfir.pdsecs[i])) {
					break;
				}
			}
			if(i == pdfir.pdsecs.length) {
				info = "产品后台无此颜色, 请重试！";
				Err.usError(req, res, info);
			} else {
				Pdsec.findOne({'_id': pdsecId})
				.populate({path: 'pdthds', populate: [
					{path: 'pdsez'},
					{path: 'ordthds'}, {path: 'hordthds'},
					{path: 'tinthds'}, {path: 'htinthds'},
					{path: 'macthds'}, {path: 'hmacthds'},
				]})
				.exec(function(err, pdsec) {
					if(err) {
						console.log(err);
						info = "bsProdNewColor, Pdthd.find Error！";
						Err.usError(req, res, info);
					} else {
						let dbs = new Array();
						let k=0;
						for(; k<pdsec.pdthds.length; k++) {
							let pdthd = pdsec.pdthds[k];
							if(pdthd.ordthds && pdthd.ordthds.length > 0) break;
							if(pdthd.tinthds && pdthd.tinthds.length > 0) break;
							if(pdthd.macthds && pdthd.macthds.length > 0) break;
							if(pdthd.hordthds && pdthd.hordthds.length > 0) break;
							if(pdthd.htinthds && pdthd.htinthds.length > 0) break;
							if(pdthd.hmacthds && pdthd.hmacthds.length > 0) break;
							// console.log(pdthd.ordthds);
							// console.log(pdthd.tinthds);
							// console.log(pdthd.macthds);
							// console.log(pdthd.hordthds);
							// console.log(pdthd.htinthds);
							// console.log(pdthd.hmacthds);
							let pdsez = pdthd.pdsez;
							pdsez.pdthds.remove(pdthd._id);
							dbs.push(pdsez);
							pdfir.pdthds.remove(pdthd._id);
						}
						if(k != pdsec.pdthds.length) {
							info = "有出售记录, 请先删除出售记录！";
							Err.usError(req, res, info);
						} else {
							pdfir.pdsecs.remove(pdsec._id);
							pdfir.colors.remove(pdsec.color);
							Pdthd.deleteMany({'pdsec': pdsecId}, function(err, pdthdRm) {
								if(err) {
									console.log(err);
									console.log("Pdthd.deleteMany Error！")
								}
							})
							Pdsec.deleteOne({'_id': pdsecId}, function(err, pdsecRm) {
								if(err) {
									console.log(err);
									console.log("Pdsec.deleteOne Error！")
								}
							})
							bsProdSave(req, res, pdfir, dbs, 0);
						}
						
					}
				})
			}
		}
	})
}
exports.bsProdDelSize = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	let pdfirId = obj.pdfir;
	let pdsezId = obj.pdsez;
	Pdfir.findOne({_id: pdfirId})
	.exec(function(err, pdfir) {
		if(err) {
			console.log(err);
			info = "bsProdNewColor, Pdfir.findOne Error！";
			Err.usError(req, res, info);
		} else if(!pdfir) {
			info = "错做错误请重试， 没有找到相应产品";
			Err.usError(req, res, info);
		} else {
			let i = 0;
			for(; i<pdfir.pdsezs.length; i++) {
				if(pdsezId == String(pdfir.pdsezs[i])) {
					break;
				}
			}
			if(i == pdfir.pdsezs.length) {
				info = "产品后台无此颜色, 请重试！";
				Err.usError(req, res, info);
			} else {
				Pdsez.findOne({'_id': pdsezId})
				.populate({path: 'pdthds', populate: [
					{path: 'pdsec'},
					{path: 'ordthds'}, {path: 'hordthds'},
					{path: 'tinthds'}, {path: 'htinthds'},
					{path: 'macthds'}, {path: 'hmacthds'},
				]})
				.exec(function(err, pdsez) {
					if(err) {
						console.log(err);
						info = "bsProdNewColor, Pdthd.find Error！";
						Err.usError(req, res, info);
					} else if(!pdsez) {
						info = "此尺寸已经被删除, 请刷新查看！";
						Err.usError(req, res, info);
					} else {
						let dbs = new Array();
						let k=0;
						for(; k<pdsez.pdthds.length; k++) {
							let pdthd = pdsez.pdthds[k];
							if(pdthd.ordthds && pdthd.ordthds.length > 0) break;
							if(pdthd.tinthds && pdthd.tinthds.length > 0) break;
							if(pdthd.macthds && pdthd.macthds.length > 0) break;
							if(pdthd.hordthds && pdthd.hordthds.length > 0) break;
							if(pdthd.htinthds && pdthd.htinthds.length > 0) break;
							if(pdthd.hmacthds && pdthd.hmacthds.length > 0) break;
							// console.log(pdthd.ordthds);
							// console.log(pdthd.tinthds);
							// console.log(pdthd.macthds);
							// console.log(pdthd.hordthds);
							// console.log(pdthd.htinthds);
							// console.log(pdthd.hmacthds);
							let pdsec = pdthd.pdsec;
							pdsec.pdthds.remove(pdthd._id);
							dbs.push(pdsec);
							pdfir.pdthds.remove(pdthd._id);
						}
						if(k != pdsez.pdthds.length) {
							info = "有出售记录, 请先删除出售记录！";
							Err.usError(req, res, info);
						} else {
							pdfir.pdsezs.remove(pdsez._id)
							pdfir.sizes.remove(pdsez.size)
							Pdthd.deleteMany({'pdsez': pdsezId}, function(err, pdthdRm) {
								if(err) {
									console.log(err);
									console.log("Pdthd.deleteMany Error！")
								}
							})
							Pdsez.deleteOne({'_id': pdsezId}, function(err, pdsezRm) {
								if(err) {
									console.log(err);
									console.log("Pdsez.deleteOne Error！")
								}
							})
							bsProdSave(req, res, pdfir, dbs, 0);
						}
						
					}
				})
			}
		}
	})
}
let bsProdSave = function(req, res, pdfir, dbs, n) {
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
			bsProdSave(req, res, pdfir, dbs, n+1);
		})
	}
}


exports.bsProdUpStock = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	let pdthdId = obj.pdthd;
	let pdsezId = obj.pdsez;
	if(pdthdId) {
		Pdthd.findOne({_id: pdthdId})
		.exec(function(err, pdthd) {
			if(err) {
				console.log(err);
				info = "bsProdUpStock, Pdthd.findOne, Error！"
				res.json({success: 0, info: info});
			} else {
				pdthd.stock = parseInt(pdthd.stock) + parseInt(obj.stock) - parseInt(obj.stockOrg)
				pdthd.save(function(err, pdthdSv) {
					if(err) {
						console.log(err);
						info = "bsProdUpStock, pdthd.save, Error！"
						res.json({success: 0, info: info});
					} else {
						res.json({success: 1})
					}
				})
			}
		})
	} else if(pdsezId) {
		Pdsez.findOne({_id: pdsezId})
		.exec(function(err, pdsez) {
			if(err) {
				console.log(err);
				info = "bsProdUpStock, Pdsez.findOne, Error！"
				res.json({success: 0, info: info});
			} else {
				pdsez.stock = parseInt(pdsez.stock) + parseInt(obj.stock) - parseInt(obj.stockOrg)
				pdsez.save(function(err, pdsezSv) {
					if(err) {
						console.log(err);
						info = "bsProdUpStock, pdsez.save, Error！"
						res.json({success: 0, info: info});
					} else {
						res.json({success: 1})
					}
				})
			}
		})
	} else {
		info = "数据错误"
		res.json({success: 0, info: info});
	}
}