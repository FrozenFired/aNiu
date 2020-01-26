let bcrypt = require('bcryptjs');
let SALT_WORK_FACTOR = 10;

exports.rqBcrypt = function(req, res, next) {
	if(req.body.obj && req.body.obj.pwd){
		let pwd = req.body.obj.pwd.replace(/(\s*$)/g, "").replace( /^\s*/, '');
		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
			if(err) return next(err);
			bcrypt.hash(pwd, salt, function(err, hash) {
				if(err) return next(err);
				req.body.obj.pwd = hash;
				next();
			});
		});
	} else {
		next();
	}
};