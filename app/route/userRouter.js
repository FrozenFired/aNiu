let Index = require('../controllers/user/bser/index');

let User = require('../controllers/user/bser/user');
let Firm = require('../controllers/user/bser/firm');

let Product = require('../controllers/user/bser/product');
let Prod = require('../controllers/user/bser/prod');
// let Pdsez = require('../controllers/user/bser/pdsez');
let Pdthd = require('../controllers/user/bser/pdthd');

let Cter = require('../controllers/user/bser/order/cter');
let Ord = require('../controllers/user/bser/order/ord');
let Order = require('../controllers/user/bser/order/order');
let Ordthd = require('../controllers/user/bser/order/ordthd');

let Fder = require('../controllers/user/bser/machin/fder');
let Mac = require('../controllers/user/bser/machin/mac');
let Machin = require('../controllers/user/bser/machin/machin');
let Macthd = require('../controllers/user/bser/machin/macthd');

let Tner = require('../controllers/user/bser/tint/tner');
let Tin = require('../controllers/user/bser/tint/tin');
let Tint = require('../controllers/user/bser/tint/tint');
let Tinthd = require('../controllers/user/bser/tint/tinthd');

let MdBcrypt = require('../confile/middle/middleBcrypt');
let MdRole = require('../confile/middle/middleRole');
let MdPicture = require('../confile/middle/middlePicture');
let MdExcel = require('../confile/middle/middleExcel');

let multipart = require('connect-multiparty');
let postForm = multipart();

module.exports = function(app){
	/* ================================ Index ================================ */
	app.get('/bser', MdRole.bserIsLogin, Index.bser);
	app.get('/bsShow', MdRole.bserIsLogin, Index.bsShow);
	/* ================================ Index ================================ */

	/* =================================== User =================================== */
	app.get('/bsMyInfo', MdRole.bserIsLogin, User.bsUserFilter, User.bsMyInfo)
	app.post('/bsUserUpdInfo', MdRole.bserIsLogin, postForm, MdPicture.addNewPhoto, User.bsUserUpd)
	app.post('/bsUserUpdPwd', MdRole.bserIsLogin, postForm, MdBcrypt.rqBcrypt, User.bsUserUpd)
	/* =================================== User =================================== */

	/* =================================== Firm =================================== */
	/* ------------------------------- Basic ------------------------------- */
	app.get('/bsFirm', MdRole.bserIsLogin, Firm.bsFirm);
	app.post('/bsFirmUpd', MdRole.bserIsLogin, postForm, Firm.bsFirmUpd);
	/* ------------------------------- Color ------------------------------- */
	app.post('/bsColorNew', MdRole.bserIsLogin, postForm, Firm.bsColorNew)
	app.delete('/bsColorDelAjax', MdRole.bserIsLogin, Firm.bsColorDelAjax)
	// app.post('/bsSizeNew', MdRole.bserIsLogin, postForm, Firm.bsSizeNew)
	// app.delete('/bsSizeDelAjax', MdRole.bserIsLogin, Firm.bsSizeDelAjax)
	/* =================================== Firm =================================== */


	/* ======================================== product ======================================== */
	/* ------------------------------ product ------------------------------ */
	app.get('/bsProducts', MdRole.bserIsLogin, Product.bsProducts)
	app.get('/bsProductAdd', MdRole.bserIsLogin, Product.bsProductAdd)
	app.post('/bsProductNew', MdRole.bserIsLogin, postForm,
		MdPicture.addNewPhoto, Product.bsProductNew)

	app.post('/bsProductUpd', MdRole.bserIsLogin, postForm, Product.bsProductUpd)
		
	app.get('/bsProduct/:id', MdRole.bserIsLogin, Product.bsProdFilter, Product.bsProduct)
	/* ------------------------------ product ------------------------------ */

	/* ------------------------------ pdfir ------------------------------ */
	app.get('/bsPdfirDel/:id', MdRole.bserIsLogin, Product.bsPdfirDel)
	app.get('/bsProductsObtAjax', MdRole.bserIsLogin, Product.bsProductsObtAjax)
	/* ------------------------------ pdfir ------------------------------ */

	/* ---------------------------------------- Prod ---------------------------------------- */
	app.post('/bsProdImg', MdRole.bserIsLogin, postForm, MdPicture.addNewPhoto, Prod.bsProdImg)

	app.post('/bsProdNewColor', MdRole.bserIsLogin, postForm, Prod.bsProdNewColor)
	app.post('/bsProdDelColor', MdRole.bserIsLogin, postForm, Prod.bsProdDelColor)
	app.post('/bsProdNewSize', MdRole.bserIsLogin, postForm, Prod.bsProdNewSize)
	app.post('/bsProdDelSize', MdRole.bserIsLogin, postForm, Prod.bsProdDelSize)
	
	app.post('/bsProdUpStock', MdRole.bserIsLogin, postForm, Prod.bsProdUpStock)
	/* ------------------------------ pdthd ------------------------------ */
	app.post('/bsPdthdUpd', MdRole.bserIsLogin, postForm, Pdthd.bsPdthdUpd)

	
	app.get('/bsPdfirObtOrdersAjax', MdRole.bserIsLogin, Product.bsPdfirObtOrdersAjax)
	/* ======================================== product ======================================== */


	/* =================================== cter =================================== */
	app.get('/bsCters', MdRole.bserIsLogin, Cter.bsCters)

	app.get('/bsCter/:id', MdRole.bserIsLogin, Cter.bsCterFilter, Cter.bsCter)
	app.get('/bsCterDel/:id', MdRole.bserIsLogin, Cter.bsCterFilter, Cter.bsCterDel)
	app.delete('/bsCterDelAjax', MdRole.bserIsLogin, Cter.bsCterDelAjax)
	
	app.post('/bsCterUpd', MdRole.bserIsLogin, postForm, Cter.bsCterUpd)

	app.get('/bsCterAdd', MdRole.bserIsLogin, Cter.bsCterAdd)
	app.post('/bsCterNew', MdRole.bserIsLogin, postForm, Cter.bsCterNew)

	app.get('/bsCterIsAjax', MdRole.bserIsLogin, Cter.bsCterIsAjax)
	app.get('/bsCtersObtAjax', MdRole.bserIsLogin, Cter.bsCtersObtAjax)
	/* =================================== cter =================================== */

	/* =================================== ord =================================== */
	app.get('/bsOrds', MdRole.bserIsLogin, Ord.bsOrds);
	app.get('/bsOrdHis', MdRole.bserIsLogin, Ord.bsOrdHis);
	app.post('/bsOrdNew', MdRole.bserIsLogin, postForm, Ord.bsOrdNew);
	app.post('/bsOrdChangeSts', MdRole.bserIsLogin, postForm, Ord.bsOrdChangeSts);
	app.post('/bsOrderSend', MdRole.bserIsLogin, postForm, Ord.bsOrderSend);

	/* ======================================== order ======================================== */
	// orderAdd 模糊查询
	app.get('/bsOrderProdsAjax', MdRole.bserIsLogin, Order.bsOrderProdsAjax);

	app.get('/bsOrderUp/:id', MdRole.bserIsLogin, Order.bsOrderUp);
	
	app.get('/bsOrderRelCterAjax', MdRole.bserIsLogin, Order.bsOrderRelCterAjax);

	app.get('/bsOrder/:id', MdRole.bserIsLogin, Order.bsOrderFilter, Order.bsOrder);

	// app.get('/bsOrderPDF/:id', MdRole.bserIsLogin, Order.bsOrderFilter, Order.bsOrderPDF)
	// app.get('/bsOrderExcel/:id', MdRole.bserIsLogin, Order.bsOrderFilter, Order.bsOrderExcel)
	app.get('/bsOrderDel/:id', MdRole.bserIsLogin, Order.bsOrderDel)

	/* -------------------------------------- ordthd -------------------------------------- */
	// order添加prod
	app.post('/bsOrdthdNewPdAjax', MdRole.bserIsLogin, postForm, Ordthd.bsOrdthdNewPdAjax);
	// order更改prod
	app.post('/bsOrdthdUpdPdAjax', MdRole.bserIsLogin, postForm, Ordthd.bsOrdthdUpdPdAjax);
	// order删除prod
	app.post('/bsOrdthdDelPdAjax', MdRole.bserIsLogin, postForm, Ordthd.bsOrdthdDelPdAjax);
	/* -------------------------------------- ordthd -------------------------------------- */
	app.get('/bsOrdsecNewPdAjax', MdRole.bserIsLogin, Ordthd.bsOrdsecNewPdAjax);
	app.get('/bsOrdsecDelPdAjax', MdRole.bserIsLogin, Ordthd.bsOrdsecDelPdAjax);
	/* ======================================== order ======================================== */




	/* =================================== Fder =================================== */
	app.get('/bsFders', MdRole.bserIsLogin, Fder.bsFders)

	app.get('/bsFder/:id', MdRole.bserIsLogin, Fder.bsFderFilter, Fder.bsFder)
	app.get('/bsFderDel/:id', MdRole.bserIsLogin, Fder.bsFderFilter, Fder.bsFderDel)
	app.delete('/bsFderDelAjax', MdRole.bserIsLogin, Fder.bsFderDelAjax)
	
	app.post('/bsFderUpd', MdRole.bserIsLogin, postForm, Fder.bsFderUpd)

	app.get('/bsFderAdd', MdRole.bserIsLogin, Fder.bsFderAdd)
	app.post('/bsFderNew', MdRole.bserIsLogin, postForm, Fder.bsFderNew)

	app.get('/bsFderIsAjax', MdRole.bserIsLogin, Fder.bsFderIsAjax)
	app.get('/bsFdersObtAjax', MdRole.bserIsLogin, Fder.bsFdersObtAjax)
	/* =================================== Fder =================================== */

	/* =================================== Mac =================================== */
	app.get('/bsMacs', MdRole.bserIsLogin, Mac.bsMacs);
	app.get('/bsMacHis', MdRole.bserIsLogin, Mac.bsMacHis);
	app.post('/bsMacNew', MdRole.bserIsLogin, postForm, Mac.bsMacNew);
	app.post('/bsMacChangeSts', MdRole.bserIsLogin, postForm, Mac.bsMacChangeSts);
	app.post('/bsMachinSend', MdRole.bserIsLogin, postForm, Mac.bsMachinSend);

	/* ======================================== Machin ======================================== */
	// machinAdd 模糊查询
	app.get('/bsMachinProdsAjax', MdRole.bserIsLogin, Machin.bsMachinProdsAjax);

	app.get('/bsMachinUp/:id', MdRole.bserIsLogin, Machin.bsMachinUp);

	app.get('/bsMachinRelFderAjax', MdRole.bserIsLogin, Machin.bsMachinRelFderAjax);

	app.get('/bsMachin/:id', MdRole.bserIsLogin, Machin.bsMachinFilter, Machin.bsMachin);

	app.get('/bsMachinDel/:id', MdRole.bserIsLogin, Machin.bsMachinDel)
	/* -------------------------------------- macthd -------------------------------------- */
	// macthd添加prod
	app.post('/bsMacthdNewPdAjax', MdRole.bserIsLogin, postForm, Macthd.bsMacthdNewPdAjax);
	// macthd更改prod
	app.post('/bsMacthdUpdPdAjax', MdRole.bserIsLogin, postForm, Macthd.bsMacthdUpdPdAjax);
	// macthd删除prod
	app.post('/bsMacthdDelPdAjax', MdRole.bserIsLogin, postForm, Macthd.bsMacthdDelPdAjax);
	// macsez添加prod
	app.post('/bsMacsezNewPdAjax', MdRole.bserIsLogin, postForm, Macthd.bsMacsezNewPdAjax);
	// macsez更改prod
	app.post('/bsMacsezUpdPdAjax', MdRole.bserIsLogin, postForm, Macthd.bsMacsezUpdPdAjax);
	// macsez删除prod
	app.post('/bsMacsezDelPdAjax', MdRole.bserIsLogin, postForm, Macthd.bsMacsezDelPdAjax);
	/* -------------------------------------- macthd -------------------------------------- */
	app.get('/bsMacsecNewPdAjax', MdRole.bserIsLogin, Macthd.bsMacsecNewPdAjax);
	app.get('/bsMacsecDelPdAjax', MdRole.bserIsLogin, Macthd.bsMacsecDelPdAjax);
	/* ======================================== Machin ======================================== */



	/* =================================== Tner =================================== */
	app.get('/bsTners', MdRole.bserIsLogin, Tner.bsTners)

	app.get('/bsTner/:id', MdRole.bserIsLogin, Tner.bsTnerFilter, Tner.bsTner)
	app.get('/bsTnerDel/:id', MdRole.bserIsLogin, Tner.bsTnerFilter, Tner.bsTnerDel)
	app.delete('/bsTnerDelAjax', MdRole.bserIsLogin, Tner.bsTnerDelAjax)
	
	app.post('/bsTnerUpd', MdRole.bserIsLogin, postForm, Tner.bsTnerUpd)

	app.get('/bsTnerAdd', MdRole.bserIsLogin, Tner.bsTnerAdd)
	app.post('/bsTnerNew', MdRole.bserIsLogin, postForm, Tner.bsTnerNew)

	app.get('/bsTnerIsAjax', MdRole.bserIsLogin, Tner.bsTnerIsAjax)
	app.get('/bsTnersObtAjax', MdRole.bserIsLogin, Tner.bsTnersObtAjax)
	/* =================================== Tner =================================== */

	/* =================================== Tin =================================== */
	app.get('/bsTins', MdRole.bserIsLogin, Tin.bsTins);
	app.get('/bsTinHis', MdRole.bserIsLogin, Tin.bsTinHis);
	app.post('/bsTinNew', MdRole.bserIsLogin, postForm, Tin.bsTinNew);
	app.post('/bsTinChangeSts', MdRole.bserIsLogin, postForm, Tin.bsTinChangeSts);
	app.post('/bsTintSend', MdRole.bserIsLogin, postForm, Tin.bsTintSend);

	/* ======================================== Tint ======================================== */
	// orderAdd 模糊查询
	app.get('/bsTintProdsAjax', MdRole.bserIsLogin, Tint.bsTintProdsAjax);

	app.get('/bsTintUp/:id', MdRole.bserIsLogin, Tint.bsTintUp);

	app.get('/bsTintRelTnerAjax', MdRole.bserIsLogin, Tint.bsTintRelTnerAjax);

	app.get('/bsTint/:id', MdRole.bserIsLogin, Tint.bsTintFilter, Tint.bsTint);


	// app.get('/bsTintPDF/:id', MdRole.bserIsLogin, Tint.bsTintFilter, Tint.bsTintPDF)
	// app.get('/bsTintExcel/:id', MdRole.bserIsLogin, Tint.bsTintFilter, Tint.bsTintExcel)
	app.get('/bsTintDel/:id', MdRole.bserIsLogin, Tint.bsTintDel)
	/* -------------------------------------- tinthd -------------------------------------- */
	// order添加prod
	app.post('/bsTinthdNewPdAjax', MdRole.bserIsLogin, postForm, Tinthd.bsTinthdNewPdAjax);
	// order更改prod
	app.post('/bsTinthdUpdPdAjax', MdRole.bserIsLogin, postForm, Tinthd.bsTinthdUpdPdAjax);
	// order删除prod
	app.post('/bsTinthdDelPdAjax', MdRole.bserIsLogin, postForm, Tinthd.bsTinthdDelPdAjax);
	/* -------------------------------------- tinthd -------------------------------------- */
	app.get('/bsTinsecNewPdAjax', MdRole.bserIsLogin, Tinthd.bsTinsecNewPdAjax);
	app.get('/bsTinsecDelPdAjax', MdRole.bserIsLogin, Tinthd.bsTinsecDelPdAjax);
	/* ======================================== Tint ======================================== */

};