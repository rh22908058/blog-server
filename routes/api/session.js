const router=require('koa-router')()

const {sequelize,User}=require('../../model')

router.prefix('/session')

//用户登录POST
router.post('/',async ctx=>{
    const {username,password}=ctx.request.body
    let user=await User.findOne({where:{username}})
    //用户名不存在
    if(!user){
        ctx.body={
            err:10101,
            info:"username not exists",
            data:null
        }
        return
    }
    //密码错误
    if(password!=user.password){
        ctx.body={
            err:10102,
            info:"password wrong",
            data:null
        }
        return
    }  
    //登录成功,用户名密码正确
    //将用户id保存到session中
    ctx.session.userId=user.id

    ctx.body={
        err:0,
        info:null,
        data:user
    }
})
//验证sessin，决定是否免登录
router.get('/',async ctx=>{
    //从session中获取userId，按此id在数据库中查找出user
    //这里有点问题：服务器端只有一个而客户端有很多，如果多个客户端都已经登录却用了session中相同的字段userId，会相互覆盖
    let user=await User.findById(ctx.session.userId)
    ctx.body={
        err:0,
        info:null,
        data:user
    }
})
//用户登出,删除当前用户的session
router.delete('/',async ctx=>{
    ctx.session=null
    ctx.body={
        err:10000,
        info:null,
        data:null
    }
})
module.exports=router