let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Pdfir';
let dbSchema = new Schema({
	/* ------------------ 创建时 ------------------ */
	code: String,	// 本公司唯一
	nome: String,
	photo: { type: String, default: '/upload/product/1.jpg' },
	material: String,
	// assists : [{type: ObjectId, ref: 'Assist'}],
	price: Float,
	macCost: {type: Float, default: 0},	// 生产价格
	tinCost: {type: Float, default: 0},	// 染色的价格
	note: String,

	semi: Number,	// 是否是半成品

	sizes: [{type: Number}],		// null 均码
	colors: [{type: String}],
	pdsecs: [{type: ObjectId, ref: 'Pdsec'}],
	pdsezs: [{type: ObjectId, ref: 'Pdsez'}],
	pdthds: [{type: ObjectId, ref: 'Pdthd'}],

	/* ------------------ 创建时 ------------------ */

	/* ------------------ 自动生成 ------------------ */
	firm: {type: ObjectId, ref: 'Firm'},
	creater: {type: ObjectId, ref: 'User'},
	ctAt: Date,
	/* ------------------ 自动生成 ------------------ */

	ordfirs: [{type: ObjectId, ref: 'Ordfir'}],	// 未完成的订单
	hordfirs: [{type: ObjectId, ref: 'Ordfir'}],

	macfirs: [{type: ObjectId, ref: 'Macfir'}],	// 未完成的生产单
	hmacfirs: [{type: ObjectId, ref: 'Macfir'}],

	tinfirs: [{type: ObjectId, ref: 'Tinfir'}],	// 未完成的染洗单
	htinfirs: [{type: ObjectId, ref: 'Tinfir'}],
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.ctAt = Date.now();
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);