let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Tinthd';
let dbSchema = new Schema({
	tint: {type: ObjectId, ref: 'Tint'},
	tinfir: {type: ObjectId, ref: 'Tinfir'},
	tinsec: {type: ObjectId, ref: 'Tinsec'},

	pdthd: {type: ObjectId, ref: 'Pdthd'},
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