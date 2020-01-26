let Err = require('../aaIndex/err')

let MdPicture = require('../../../middle/middlePicture');
let Conf = require('../../../../conf');

let _ = require('underscore');

let Pdfir = require('../../../models/material/pdfir');
let Pdsec = require('../../../models/material/pdsec');
let Pdsez = require('../../../models/material/pdsez');
let Pdthd = require('../../../models/material/pdthd');

exports.bsPdthdUpd = function(req, res) {
	let pdthdId = req.body.pdthdId
	let obj = req.body.obj
	Pdthd.findOne({_id: pdthdId}, function(err, pdthd) {
		if(err) {
			console.log(err);
			info = "bsPdthdUpd, Pdthd.findOne, Error!";
			res.json({success: 0, info: info})
		} else if(!pdthd) {
			info = "数据库中没有此数据, 刷新重试!"
			res.json({success: 0, info: info})
		} else {
			let _pdthd = _.extend(pdthd, obj);
			_pdthd.save(function(err, pdthdSave){
				if(err) {
					console.log(err);
					info = "bsPdthdUpd, _pdthd.save, Error!";
					res.json({success: 0, info: info})
				} else {
					res.json({success: 1})
				}
			})
		}
	})
}