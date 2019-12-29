let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Macsec';
let dbSchema = new Schema({
	machin: {type: ObjectId, ref: 'Machin'},
	macfir: {type: ObjectId, ref: 'Macfir'},

	pdsec: {type: ObjectId, ref: 'Pdsec'},
	color : String,

	macthds: [{type: ObjectId, ref: 'Macthd'}],
});

module.exports = mongoose.model(colection, dbSchema);