let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pdsec';
let dbSchema = new Schema({
	pdfir: {type: ObjectId, ref: 'Pdfir'},
	color: String,

	pdthds: [{type: ObjectId, ref: 'Pdthd'}],
});

module.exports = mongoose.model(colection, dbSchema);