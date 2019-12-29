var siege = require('siege')
siege('node server.js')// node server.js为服务启动脚本
.wait(3000)//延迟时间 
.on(3000)//被压测的服务端口
.concurrent(100)//并发数
.for(100).times //或者.seconds 
.get('/')//需要压测的页面
.attack()//执行压测