let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Ordthd';
let dbSchema = new Schema({
	order: {type: ObjectId, ref: 'Order'},
	ordfir: {type: ObjectId, ref: 'Ordfir'},
	ordsec: {type: ObjectId, ref: 'Ordsec'},

	pdthd: {type: ObjectId, ref: 'Pdthd'},
	color : String,
	size : Number,

	quot : Number,
	ship: Number,	// 发货量
});

dbSchema.pre('save', function(next) {
	if(this.isNew) {
		if(!this.quot) this.quot = 0;
		if(!this.ship) this.ship = 0;
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);