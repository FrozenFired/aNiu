let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Ordsec';
let dbSchema = new Schema({
	order: {type: ObjectId, ref: 'Order'},
	ordfir: {type: ObjectId, ref: 'Ordfir'},

	pdsec: {type: ObjectId, ref: 'Pdsec'},
	color : String,

	ordthds: [{type: ObjectId, ref: 'Ordthd'}],
});

module.exports = mongoose.model(colection, dbSchema);