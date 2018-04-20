//api的根router，只起分发作用
const router=require('koa-router')()
//引入子router
const articleRouter=require('./article')
const archiveRouter=require('./archive')
const tagRouter=require('./tag')
const userRouter=require('./user')
const sessionRouter=require('./session')
router.prefix('/api')

//session路由涉及到登录注册登出功能，并无关权限，必须提到权限管理之前;user路由涉及到用户注册，也必须提前
router.use(sessionRouter.routes(),sessionRouter.allowedMethods())
router.use(userRouter.routes(),userRouter.allowedMethods())
/*判断是否有权限访问 */
const {User}=require('../../model')
router.use(async (ctx,next)=>{
    const {method,url}=ctx.request
    //获取session，如果不存在，则是id为1的匿名用户
    let userId=ctx.session.userId||1

    let user=await User.findById(userId)

    //获取当前登录用户下的所有权限记录
    let permissions=await user.getPermissions()

    //遍历当前用户的权限记录，如果有一条记录的method和path符合当前请求，也就是说用户具备当前请求的权限，则继续中间件
    if(permissions.some(i=>
        i.methods==method&&new RegExp(i.path).test(url)
    )){
        await next()
    }else{
        ctx.body={
            err:10015,
            info:'no permission',
            data:null
        }
    }
})



/*判断权限 */
//将子router以中间件形式嵌套给根router，这样就可以路由到/api/article
router.use(articleRouter.routes(),articleRouter.allowedMethods())
router.use(archiveRouter.routes(),archiveRouter.allowedMethods())
router.use(tagRouter.routes(),tagRouter.allowedMethods())



/*
const Permission=require('../../model/permission')
router.use(async (ctx,next)=>{
    const {method,url}=ctx.request
    //获取session，如果不存在，则是id为1的匿名用户
    let userId=ctx.session.userId|1
    console.log("++++++++++")
    console.log(userId)
    let user=await User.findById(userId)
    console.log("++++++++++")
    console.log(user)
    //获取当前登录用户下的所有权限记录
    let permissions=await user.getPermissions()
    console.log("++++++++++")
    console.log(permissions)
    //遍历当前用户的权限记录，如果有一条记录的method和path符合当前请求，也就是说用户具备当前请求的权限，则继续中间件
    if(permissions.some(i=>
        i.methods==method&&new RegExp(i.path).test(url)
    )){
        await next()
    }else{
        ctx.body={
            err:10015,
            info:'no permission',
            data:null
        }
    }
})
*/

module.exports=router

/*
fs.readdirSync(__dirname).filter(i=>i!='index.js').forEach(i=>{
    let module=require(`./${i}`)
    router.use(module.routes())
})
*/