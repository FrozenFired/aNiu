let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Tner';
let dbSchema = new Schema({
	firm: {type: ObjectId, ref: 'Firm'},
	code: String,
	nome: String,
	tel: String,
	iva: String,
	cf: String,
	doct: String,
	addr: String,
	city: String,
	post: String,

	note: String,

	tints: [{type: ObjectId, ref: 'Tint'}],
	ctAt: Date,
	upAt: Date,
});
dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.upAt = this.ctAt = Date.now();
	} else {
		this.upAt = Date.now();
	}
	next();
});

module.exports = mongoose.model(colection, dbSchema);