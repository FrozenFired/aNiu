let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pdsez';
let dbSchema = new Schema({
	pdfir: {type: ObjectId, ref: 'Pdfir'},
	size: Number,
	pdthds: [{type: ObjectId, ref: 'Pdthd'}],

	// reserve: Number, // reserve 是设置的值不是变量
	// stock: Number,  // stock 不能小于 -reserve
	stock: Number,  // stock 不能小于 0

	/* ------------------ 半成品 ------------------ */
	macsezs: [{type: ObjectId, ref: 'Macsez'}],
	hmacsezs: [{type: ObjectId, ref: 'Macsez'}],
	/* ------------------ 半成品 ------------------ */
});
dbSchema.pre('save', function(next) {
	if(this.isNew) {
		// this.reserve = 0;
		this.stock = 0;
	} 
	next();
})
module.exports = mongoose.model(colection, dbSchema);