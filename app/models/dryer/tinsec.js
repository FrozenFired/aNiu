let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Tinsec';
let dbSchema = new Schema({
	tint: {type: ObjectId, ref: 'Tint'},
	tinfir: {type: ObjectId, ref: 'Tinfir'},

	pdsec: {type: ObjectId, ref: 'Pdsec'},
	color : String,

	tinthds: [{type: ObjectId, ref: 'Tinthd'}],
});

module.exports = mongoose.model(colection, dbSchema);