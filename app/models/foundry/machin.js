let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Machin';
let dbSchema = new Schema({
	firm: {type: ObjectId, ref: 'Firm'},
	creater: {type: ObjectId, ref: 'User'},
	// 录入为0, 确认为5(与pd建立联系)，完成为10
	status: Number,
	// stsPre: Number,

	code: String,	// 本公司唯一
	fder: {type: ObjectId, ref: 'Fder'},

	sizes: [Number],
	macfirs: [{type: ObjectId, ref: 'Macfir'}],

	note: String,

	ctAt: Date,		// 创建时间
	fnAt: Date, 	// 收货时间
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.status) this.status = 0;
		this.ctAt = Date.now();
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);