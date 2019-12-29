let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Macfir';
let dbSchema = new Schema({
	machin: {type: ObjectId, ref: 'Machin'},

	pdfir: {type: ObjectId, ref: 'Pdfir'},
	cost: Float,		// 产品单价	//获取

	macsecs: [{type: ObjectId, ref: 'Macsec'}],
	macsezs: [{type: ObjectId, ref: 'Macsez'}],	// 半成品采购
});

module.exports = mongoose.model(colection, dbSchema);