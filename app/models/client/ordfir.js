let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Ordfir';
let dbSchema = new Schema({
	order: {type: ObjectId, ref: 'Order'},

	pdfir: {type: ObjectId, ref: 'Pdfir'},
	price: Float,		// 产品单价	//获取

	ordsecs: [{type: ObjectId, ref: 'Ordsec'}],
});

module.exports = mongoose.model(colection, dbSchema);