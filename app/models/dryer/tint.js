let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Tint';
let dbSchema = new Schema({
	firm: {type: ObjectId, ref: 'Firm'},
	creater: {type: ObjectId, ref: 'User'},
	// 录入为0, 确认为5(与pd建立联系)，完成为10
	status: Number,
	// stsPre: Number,

	code: String,	// 本公司唯一
	tner: {type: ObjectId, ref: 'Tner'},

	sizes: [Number],
	tinfirs: [{type: ObjectId, ref: 'Tinfir'}],

	note: String,

	ctAt: Date,
	fnAt: Date,
	upAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.status) this.status = 0;
		this.ctAt = this.upAt = Date.now();
	} else {
		this.upAt = Date.now();
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);