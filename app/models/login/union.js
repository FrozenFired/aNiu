let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const colection = 'Union';
let dbSchema = new Schema({		// Wholesaler group 批发商所属公司
	code: {			// name
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