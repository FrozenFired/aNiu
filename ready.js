let InitSet = require('./initSet');

let ip = InitSet.ip;
let portHttp = InitSet.portHttp;
let portHttps = InitSet.portHttps;

function getHttpUrl() {
	let url;
	if(portHttp == 80) {
		url = "http://"+ip;
	} else {
		url = "http://"+ip+":" + portHttp;
	}
	return url;
}
function getHttpsUrl() {
	let url;
	if(portHttps == 443) {
		url = "https://"+ip;
	} else {
		url = "https://"+ip+":" + portHttps;
	}
	return url;
}
let dbUrl = InitSet.dbServer + InitSet.dbName;
// let dbUrl = 'mongodb://' + InitSet.ip + '/' + InitSet.dbName;

let InitConf = {
	cdn: InitSet.cdn,
	dns: InitSet.dns,
	portHttp: portHttp,
	portHttps: portHttps,
	dbName: InitSet.dbName,
	dbUrl : dbUrl,
	httpUrl : getHttpUrl(),
	httpsUrl : getHttpsUrl(),
}

module.exports = InitConf