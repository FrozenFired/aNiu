let Err = require('../../aaIndex/err');

let Tint = require('../../../../models/dryer/tint');
let Tinsec = require('../../../../models/dryer/tinsec');
let Tinthd = require('../../../../models/dryer/tinthd');

let Pdsec = require('../../../../models/material/pdsec');

let _ = require('underscore')

// tintAdd 操作 tint中的 pd
exports.bsTinthdNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	Tinsec.findOne({_id: obj.tinsec})
	.exec(function(err, tinsec) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsTinthdNewPdAjax, Tinsec.findOne, Error!"})
		} else if(!tinsec) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			let _tinthd = new Tinthd(obj)
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
		}
	})
}

exports.bsTinthdUpdPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let tinthdId = req.body.tinthdId
	if(obj.quot) obj.quot = parseInt(obj.quot);
	if(obj.ship) obj.ship = parseInt(obj.ship);
	Tinthd.findOne({_id: tinthdId})
	.exec(function(err, tinthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsTinthdUpdPdAjax, Tinthd.findOne, Error!"})
		} else if(!tinthd) {
			res.json({success: 0, info: "没有找到数据, 请刷新重试!"})
		} else {
			let _tinthd = _.extend(tinthd, obj)
			_tinthd.save(function(err, tinthdSv) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsTinthdUpdPdAjax, _tinthd.save, Error!"})
				} else {
					res.json({success: 1, tinthdId: tinthdId})
				}
			})
		}
	})
}

exports.bsTinthdDelPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let tinthdId = req.body.tinthdId
	let tintId = req.body.tintId

	Tinthd.findOne({_id: tinthdId})
	.populate({path: 'tinsec', populate: {path: 'tinfir', populate: {path: 'tint'}}})
	.exec(function(err, tinthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsTinthdDelPdAjax, Tinthd.findOne, Error!"})
		} else {
			let tinsec = tinthd.tinsec;
			// 如果tinsec中有多个tinthd 可以直接删除
			if(tinsec.tinthds.length > 1) {
				tinsec.tinthds.remove(tinthd._id);
				Tinthd.deleteOne({_id: tinthd._id}, function(err, thdRm) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "bsTinthdDelPdAjax, Tinthd.deleteOne, Error!"})
					} else {
						tinsec.save(function(err, secSv) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsTinthdDelPdAjax, tinsec.save, Error!"})
							} else {
								res.json({success: 1})
							}
						})
					}
				})
			}
			// 否则 要判断是否能够删除tinsec或者不能删除
			else {
				let tinfir = tinsec.tinfir;
				// 如果tinfir中有多个tinsec 可以直接删除
				if(tinfir.tinsecs.length > 1) {
					tinfir.tinsecs.remove(tinsec._id);
					Tinthd.deleteOne({_id: tinthd._id}, function(err, thdRm) {
						if(err) console.log(err);
					})
					Tinsec.deleteOne({_id: tinsec._id}, function(err, secRm) {
						if(err) console.log(err);
					})
					tinfir.save(function(err, firSv) {
						if(err) {
							console.log(err);
							res.json({success: 0, info: "bsTinthdDelPdAjax, tinfir.save, Error!"})
						} else {
							res.json({success: 1})
						}
					})
				}
				// 否则 不能删除
				else {
					res.json({success: 0, info: "您是要删除订单吗?"})
				}
			}
		}
	})
}



exports.bsTinsecNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let tintId = req.query.tint;
	let pdsecId = req.query.pdsec;
	Pdsec.findOne({_id: pdsecId})
	.exec(function(err, pdsec) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsTinsecNewPdAjax, Pdsec.findOne, Error!"})
		} else if(!pdsec) {
			res.json({success: 0, info: "bsTinsecNewPdAjax, 操作错误, 请刷新重试!"})
		} else {
			Tint.findOne({_id: tintId})
			.populate({path: 'tinfirs'})
			.exec(function(err, tint) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsTinsecNewPdAjax, Tint.findOne, Error!"})
				} else if(!tint) {
					res.json({success: 0, info: "bsTinsecNewPdAjax, 操作错误, 请刷新重试!"})
				} else {
					let tinfir = tint.tinfirs[0];
					let tinsecObj = new Object();
					tinsecObj.tint = tint._id;
					tinsecObj.tinfir = tinfir._id;
					tinsecObj.pdsec = pdsec._id;
					tinsecObj.color = pdsec.color;
					let _tinsec = new Tinsec(tinsecObj);
					tinfir.tinsecs.push(_tinsec._id);
					_tinsec.save(function(err, secSv) {
						if(err) {
							console.log(err);
							res.json({success: 0, info: "bsTinsecNewPdAjax, Tint.findOne, Error!"})
						} else {
							tinfir.save(function(err, firSv) {
								if(err) {
									console.log(err);
									res.json({success: 0, info: "bsTinsecNewPdAjax, Tint.findOne, Error!"})
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
