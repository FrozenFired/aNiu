let Err = require('../../aaIndex/err');

let Ordsec = require('../../../../models/client/ordsec');
let Ordthd = require('../../../../models/client/ordthd');

let _ = require('underscore')

// orderAdd 操作 order中的 pd
exports.bsOrderNewPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	Ordsec.findOne({_id: obj.ordsec})
	.exec(function(err, ordsec) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsOrderNewPdAjax, Ordsec.findOne, Error!"})
		} else if(!ordsec) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			let _ordthd = new Ordthd(obj)
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
		}
	})
}

exports.bsOrderUpdPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let ordthdId = req.body.ordthdId
	if(obj.quot) obj.quot = parseInt(obj.quot);
	if(obj.ship) obj.ship = parseInt(obj.ship);
	Ordthd.findOne({_id: ordthdId})
	.exec(function(err, ordthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsOrderUpdPdAjax, Ordthd.findOne, Error!"})
		} else if(!ordthd) {
			res.json({success: 0, info: "没有找到数据, 请刷新重试!"})
		} else {
			let _ordthd = _.extend(ordthd, obj)
			_ordthd.save(function(err, ordthdSv) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsOrderUpdPdAjax, _ordthd.save, Error!"})
				} else {
					res.json({success: 1, ordthdId: ordthdId})
				}
			})
		}
	})
}

exports.bsOrderDelPdAjax = function(req, res) {
	let crUser = req.session.crUser;
	let obj = req.body.obj
	let ordthdId = req.body.ordthdId
	let orderId = req.body.orderId

	Ordthd.findOne({_id: ordthdId})
	.populate({path: 'ordsec', populate: {path: 'ordfir', populate: {path: 'order'}}})
	.exec(function(err, ordthd) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsOrderDelPdAjax, Ordthd.findOne, Error!"})
		} else {
			let ordsec = ordthd.ordsec;
			// 如果ordsec中有多个ordthd 可以直接删除
			if(ordsec.ordthds.length > 1) {
				ordsec.ordthds.remove(ordthd._id);
				Ordthd.deleteOne({_id: ordthd._id}, function(err, thdRm) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "bsOrderDelPdAjax, Ordthd.deleteOne, Error!"})
					} else {
						ordsec.save(function(err, secSv) {
							if(err) {
								console.log(err);
								res.json({success: 0, info: "bsOrderDelPdAjax, ordsec.save, Error!"})
							} else {
								res.json({success: 1})
							}
						})
					}
				})
			}
			// 否则 要判断是否能够删除ordsec或者不能删除
			else {
				let ordfir = ordsec.ordfir;
				// 如果ordfir中有多个ordsec 可以直接删除
				if(ordfir.ordsecs.length > 1) {
					ordfir.ordsecs.remove(ordsec._id);
					Ordthd.deleteOne({_id: ordthd._id}, function(err, thdRm) {
						if(err) console.log(err);
					})
					Ordsec.deleteOne({_id: ordsec._id}, function(err, secRm) {
						if(err) console.log(err);
					})
					ordfir.save(function(err, firSv) {
						if(err) {
							console.log(err);
							res.json({success: 0, info: "bsOrderDelPdAjax, ordfir.save, Error!"})
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
