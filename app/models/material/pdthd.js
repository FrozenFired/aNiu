let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pdthd';
let dbSchema = new Schema({
	color: String,
	size: Number,
	pdfir: {type: ObjectId, ref: 'Pdfir'},
	pdsec: {type: ObjectId, ref: 'Pdsec'},
	pdsez: {type: ObjectId, ref: 'Pdsez'},

	// reserve: Number, // reserve 是设置的值不是变量
	// stock: Number,  // stock 不能小于 -reserve
	stock: Number,  // stock 不能小于 0

	ordthds: [{type: ObjectId, ref: 'Ordthd'}],
	hordthds: [{type: ObjectId, ref: 'Ordthd'}],

	/* ------------------ 成品 ------------------ */
	macthds: [{type: ObjectId, ref: 'Macthd'}],
	hmacthds: [{type: ObjectId, ref: 'Macthd'}],
	/* ------------------ 成品 ------------------ */
	/* ------------------ 半成品 ------------------ */
	tinthds: [{type: ObjectId, ref: 'Tinthd'}],
	htinthds: [{type: ObjectId, ref: 'Tinthd'}],
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