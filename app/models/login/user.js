let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;

const colection = 'User';	// 商家使用者
let dbSchema = new Schema({
	firm: {type: ObjectId, ref: 'Firm'},
	// part: {type: ObjectId, ref: 'Part'},

	code: { unique: true, type: String },
	pwd: String,
	cd: String,		// 本公司唯一

	role: Number,
	lang: {type: Number, default: 0},

	nome: String,

	photo: { type: String, default: '/upload/avatar/user/1.jpg' },

	lgAt: Date,	// 上次登录时间

	ctAt: Date,
	upAt: Date,
});
dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.upAt = this.ctAt = this.lgAt = Date.now();
	} else {
		this.upAt = Date.now();
	}
	next();
});
module.exports = mongoose.model(colection, dbSchema);