let Err = require('../../aaIndex/err');

let Machin = require('../../../../models/foundry/machin');
let Macfir = require('../../../../models/foundry/macfir');
let Macsez = require('../../../../models/foundry/macsez');
let Macsec = require('../../../../models/foundry/macsec');
let Macthd = require('../../../../models/foundry/macthd');

let Pdsec = require('../../../../models/material/pdsec');

let _ = require('underscore')

// machinAdd 操作 machin中的 pd
exports.bsMacthdNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	Macsec.findOne({_id: obj.macsec})
	.exec(function(err, macsec) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMacthdNewPdAjax, Macsec.findOne, Error!"})
		} else if(!macsec) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			let _macthd = new Macthd(obj)
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
		}
	})
}

exports.bsMacthdUpdPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let macthdId = req.body.macthdId
	if(obj.quot) obj.quot = parseInt(obj.quot);
	if(obj.ship) obj.ship = parseInt(obj.ship);
	Macthd.findOne({_id: macthdId})
	.exec(function(err, macthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMacthdUpdPdAjax, Macthd.findOne, Error!"})
		} else if(!macthd) {
			res.json({success: 0, info: "没有找到数据, 请刷新重试!"})
		} else {
			let _macthd = _.extend(macthd, obj)
			_macthd.save(function(err, macthdSv) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsMacthdUpdPdAjax, _macthd.save, Error!"})
				} else {
					res.json({success: 1, macthdId: macthdId})
				}
			})
		}
	})
}

exports.bsMacthdDelPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let macthdId = req.body.macthdId
	let machinId = req.body.machinId

	Macthd.findOne({_id: macthdId})
	.populate({path: 'macsec', populate: {path: 'macfir', populate: {path: 'machin'}}})
	.exec(function(err, macthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMacthdDelPdAjax, Macthd.findOne, Error!"})
		} else {
			let macsec = macthd.macsec;
			// 如果macsec中有多个macthd 可以直接删除
			if(macsec.macthds.length > 1) {
				macsec.macthds.remove(macthd._id);
				Macthd.deleteOne({_id: macthd._id}, function(err, thdRm) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "bsMacthdDelPdAjax, Macthd.deleteOne, Error!"})
					} else {
						macsec.save(function(err, secSv) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsMacthdDelPdAjax, macsec.save, Error!"})
							} else {
								res.json({success: 1})
							}
						})
					}
				})
			}
			// 否则 要判断是否能够删除macsec或者不能删除
			else {
				let macfir = macsec.macfir;
				// 如果macfir中有多个macsec 可以直接删除
				if(macfir.macsecs.length > 1) {
					macfir.macsecs.remove(macsec._id);
					Macthd.deleteOne({_id: macthd._id}, function(err, thdRm) {
						if(err) console.log(err);
					})
					Macsec.deleteOne({_id: macsec._id}, function(err, secRm) {
						if(err) console.log(err);
					})
					macfir.save(function(err, firSv) {
						if(err) {
							console.log(err);
							res.json({success: 0, info: "bsMacthdDelPdAjax, macfir.save, Error!"})
						} else {
							res.json({success: 1})
						}
					})
				}
				// 否则 不能删除
				else {
					res.json({success: 0, info: "您是要删除生产单吗?"})
				}
			}
		}
	})
}


exports.bsMacsezNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	Macfir.findOne({_id: obj.macfir})
	.exec(function(err, macfir) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMacthdNewPdAjax, Macsec.findOne, Error!"})
		} else if(!macfir) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			let _macsez = new Macsez(obj)
			macfir.macsezs.push(_macsez._id);
			_macsez.save(function(err, macsezSave) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "flag=2, _macsez.Save, Error!"})
				} else {
					macfir.save(function(err, macfir) {
						if(err) {
							console.log(err);
							res.json({success: 0, info: "flag=2, macfir.Save, Error!"})
						} else {
							res.json({success: 1, macsezId: macsezSave._id})
						}
					})
				}
			})
		}
	})
}

exports.bsMacsezUpdPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let macsezId = req.body.macsezId
	if(obj.quot) obj.quot = parseInt(obj.quot);
	if(obj.ship) obj.ship = parseInt(obj.ship);
	Macsez.findOne({_id: macsezId})
	.exec(function(err, macsez) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMacsezUpdPdAjax, Macsez.findOne, Error!"})
		} else if(!macsez) {
			res.json({success: 0, info: "没有找到数据, 请刷新重试!"})
		} else {
			let _macsez = _.extend(macsez, obj)
			_macsez.save(function(err, macsezSv) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsMacsezUpdPdAjax, _macsez.save, Error!"})
				} else {
					res.json({success: 1, macsezId: macsezId})
				}
			})
		}
	})
}

exports.bsMacsezDelPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let macsezId = req.body.macsezId
	let machinId = req.body.machinId

	Macsez.findOne({_id: macsezId})
	.populate({path: 'macfir', populate: {path: 'machin'}})
	.exec(function(err, macsez) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMacsezDelPdAjax, Macsez.findOne, Error!"})
		} else {
			let macfir = macsez.macfir;
			// 如果macfir中有多个macsez 可以直接删除
			if(macfir.macsezs.length > 1) {
				macfir.macsezs.remove(macsez._id);
				Macsez.deleteOne({_id: macsez._id}, function(err, sezRm) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "bsMacsezDelPdAjax, Macsez.deleteOne, Error!"})
					} else {
						macfir.save(function(err, secSv) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsMacsezDelPdAjax, macfir.save, Error!"})
							} else {
								res.json({success: 1})
							}
						})
					}
				})
			}
			else {
				res.json({success: 0, info: "您是要删除生产单吗?"})
			}
		}
	})
}



exports.bsMacsecNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let machinId = req.query.machin;
	let pdsecId = req.query.pdsec;
	Pdsec.findOne({_id: pdsecId})
	.exec(function(err, pdsec) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsMacsecNewPdAjax, Pdsec.findOne, Error!"})
		} else if(!pdsec) {
			res.json({success: 0, info: "bsMacsecNewPdAjax, 操作错误, 请刷新重试!"})
		} else {
			Machin.findOne({_id: machinId})
			.populate({path: 'macfirs'})
			.exec(function(err, machin) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsMacsecNewPdAjax, Machin.findOne, Error!"})
				} else if(!machin) {
					res.json({success: 0, info: "bsMacsecNewPdAjax, 操作错误, 请刷新重试!"})
				} else {
					let macfir = machin.macfirs[0];
					let macsecObj = new Object();
					macsecObj.machin = machin._id;
					macsecObj.macfir = macfir._id;
					macsecObj.pdsec = pdsec._id;
					macsecObj.color = pdsec.color;
					let _macsec = new Macsec(macsecObj);
					macfir.macsecs.push(_macsec._id);
					_macsec.save(function(err, secSv) {
						if(err) {
							console.log(err);
							res.json({success: 0, info: "bsMacsecNewPdAjax, Machin.findOne, Error!"})
						} else {
							macfir.save(function(err, firSv) {
								if(err) {
									console.log(err);
									res.json({success: 0, info: "bsMacsecNewPdAjax, Machin.findOne, Error!"})
								} else {
									res.json({success: 1})
								}
							})
						}
					})
				}
			})
		}
	})
}
