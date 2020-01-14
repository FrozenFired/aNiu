let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Macsez';
let dbSchema = new Schema({
	machin: {type: ObjectId, ref: 'Machin'},
	macfir: {type: ObjectId, ref: 'Macfir'},

	pdsez: {type: ObjectId, ref: 'Pdsez'},
	size : Number,

	quot : Number,
	ship: Number,	// 发货量
});

dbSchema.pre('save', function(next) {
	if(this.isNew) {
		if(!this.ship) this.ship = 0;
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);