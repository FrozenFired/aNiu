module.exports = function(app){
	require('./aderRouter')(app);

	require('./aaRouter')(app);
	require('./userRouter')(app);
};