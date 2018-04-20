const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

//路由
const index = require('./routes/index')
const users = require('./routes/users')
const apiRouter = require('./routes/api/index')


const session = require('koa-session')

// error handler
onerror(app)

//session
app.keys=['blog']
app.use(session({
  key:'blog:sess',
  maxAge: 86400000
}, app))

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})
//设置跨域中间件
app.use(async (ctx,next)=>{
  //设置response的响应头
  ctx.set({
    //当设置了Access-Control-Allow-Credentials字段为true允许跨域发送cookie后，
    //Access-Control-Allow-Origin不允许设置为*，可以用ctx.request.header.origin获取请求域名即客户端域名，在服务端设置其允许跨域
    'Access-Control-Allow-Origin':ctx.request.header.origin,
    'Access-Control-Allow-Methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers':'Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With',
    'Access-Control-Allow-Credentials':true
  }) 
  if(ctx.method=='OPTIONS'){
    ctx.body=''
  }else{
    /*next调用下一个中间件，必须调用，而且这是一个异步方法，必须用await */
    await next()
  }
})


// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(apiRouter.routes(), apiRouter.allowedMethods())

module.exports = app
