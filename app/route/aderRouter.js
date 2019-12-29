let Index = require('../controllers/ader/index');

let Ader = require('../controllers/ader/ader'); // ct control
let Firm = require('../controllers/ader/firm')
let User = require('../controllers/ader/user')

let MdBcrypt = require('../confile/middle/middleBcrypt')
let MdRole = require('../confile/middle/middleRole')

let multipart = require('connect-multiparty')
let postForm = multipart();

module.exports = function(app){

	/* index --------------- Ader 首页 登录页面 登录 登出---------------------- */
	app.get('/ader', Index.aderHome)
	app.get('/aderLogin', Index.aderLogin)
	app.post('/loginAder', Index.loginAder)
	app.get('/aderLogout', Index.aderLogout)

	/* index -------------------- 添加删除(后期要关闭) ----------------------------- */
	app.get('/aderAdd', Ader.aderAdd)
	app.post('/aderNew', postForm, MdBcrypt.rqBcrypt, Ader.aderNew)
	app.delete('/aderDelAjax', MdRole.aderIsLogin, Ader.aderDelAjax)
	
	/* ader ---------------------- Ader ---------------------------------- */
	app.get('/aders', MdRole.aderIsLogin, Ader.aders)
	app.get('/ader/:id', MdRole.aderIsLogin, Ader.ader)


	/* Firm ---------------------- Firm ---------------------------------- */
	app.get('/adFirms', MdRole.aderIsLogin, Firm.adFirms)
	app.get('/adFirm/:id', MdRole.aderIsLogin, Firm.adFirmFilter, Firm.adFirm)
	app.get('/adFirmDel/:id', MdRole.aderIsLogin, Firm.adFirmFilter, Firm.adFirmDel)
	
	app.post('/adFirmUp', MdRole.aderIsLogin, postForm, Firm.adFirmUp)

	app.get('/adFirmAdd', MdRole.aderIsLogin, Firm.adFirmAdd)
	app.post('/adFirmNew', MdRole.aderIsLogin, postForm, Firm.adFirmNew)
	
	app.delete('/adFirmDelAjax', MdRole.aderIsLogin, Firm.adFirmDelAjax)

	/* user ---------------------- user ---------------------------------- */
	app.get('/adUsers', MdRole.aderIsLogin, User.adUsers)
	app.get('/adUser/:id', MdRole.aderIsLogin, User.adUserFilter, User.adUser)
	app.get('/adUserDel/:id', MdRole.aderIsLogin, User.adUserFilter, User.adUserDel)
	
	app.post('/adUserUpInfo', MdRole.aderIsLogin, postForm, User.adUserUp)
	app.post('/adUserUpPw', MdRole.aderIsLogin, postForm, MdBcrypt.rqBcrypt, User.adUserUp)

	app.get('/adUserAdd', MdRole.aderIsLogin, User.adUserAdd)
	app.post('/adUserNew', MdRole.aderIsLogin, postForm, MdBcrypt.rqBcrypt, User.adUserNew)
}