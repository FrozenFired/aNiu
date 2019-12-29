let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Tinfir';
let dbSchema = new Schema({
	tint: {type: ObjectId, ref: 'Tint'},

	pdfir: {type: ObjectId, ref: 'Pdfir'},
	tincost: Float,		// 产品单价	//获取

	tinsecs: [{type: ObjectId, ref: 'Tinsec'}],
});

module.exports = mongoose.model(colection, dbSchema);