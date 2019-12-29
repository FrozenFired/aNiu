let UsErr = require('../../controllers/user/aaIndex/err');

let MiddleUpExl = {
	readExcel : function(req, res, next) {
		if(req.files) {
			let fileData = req.files.excel;
			let filePath = fileData.path;
			if(filePath) {
				let arrs = filePath.split('.');
				let type = arrs[arrs.length -1]
				// console.log(type)
				if(type == 'xlsx') {
					let excel = require('node-xlsx').parse(filePath)[0];
					req.body.excelDate = excel.data;
					next();
				} else {
					info = "The File must excel [***.xlsx]";
					UsErr.usError(req, res, info);
				}
			}
			else{
				info = "Upload the File Error";
				UsErr.usError(req, res, info);
			}
		} else {
			info = "Please Upload the File";
			UsErr.usError(req, res, info);
		}
	},
};

module.exports = MiddleUpExl;