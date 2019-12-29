let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const colection = 'Ader';
let dbSchema = new Schema({
	code: {
		unique: true,
		type: String
	},
	pwd: String,
});

module.exports = mongoose.model(colection, dbSchema);