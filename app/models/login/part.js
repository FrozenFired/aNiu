let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const colection = 'Part';
let dbSchema = new Schema({
	code: {
		unique: true,
		type: String
	},
	nome: String,

	ctAt: Date,
});
dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.ctAt = Date.now();
	}
	next();
});

module.exports = mongoose.model(colection, dbSchema);