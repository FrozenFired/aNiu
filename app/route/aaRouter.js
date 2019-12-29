let Index = require('../controllers/user/aaIndex/index');

module.exports = function(app){

	// index -------- Vder 首页 登录页面 登录 登出 -----------
	app.get('/', Index.index);
	app.get('/login', Index.login);
	app.post('/loginUser', Index.loginUser);
	app.get('/logout', Index.logout);

};