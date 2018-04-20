const router=require('koa-router')()
//model路径下默认指定了index.js文件作为入口文件
//所有需要的对象全部从index.js中解构出来
const {sequelize,User,UserPermission,Permission}=require('../../model')
//const crypto=require('crypto')
router.prefix('/user')
//获取全部用户
router.get('/',async ctx=>{
    let users=await User.findAll({
        //join关联表permission中的数据
        include:[{model:Permission}]
    })
    ctx.body={
        err:0,
        info:null,
        data:users
    }
})
//删除用户(未登录)
router.delete('/:id',async ctx=>{
    //查询出待删除记录
    let user=await User.findOne({where:{id:ctx.params.id}})
    if(user.id!=ctx.session.userId){
        //删除记录
        await user.destroy()
        ctx.body={
            err:0,
            info:null
        }
    }else{
        ctx.body={
            err:10016,
            info:'不能删除已登录用户'
        }
    }    
})
//管理员添加
router.post('/admin',async ctx=>{
    const {username,password}=ctx.request.body
    //let md5password=crypto.createHash('md5').update(password).digest('hex')
    let user
    try{
        //user=await User.create({username,password:md5password})
        user=await User.create({username,password})
        //给管理员添加所有权限
        await UserPermission.create({userId:user.id,permissionId:1})
        await UserPermission.create({userId:user.id,permissionId:2})
        await UserPermission.create({userId:user.id,permissionId:3})
        await UserPermission.create({userId:user.id,permissionId:4})
        await UserPermission.create({userId:user.id,permissionId:5})
        await UserPermission.create({userId:user.id,permissionId:6})
        await UserPermission.create({userId:user.id,permissionId:7})
        await UserPermission.create({userId:user.id,permissionId:8})
    }catch(e){
        ctx.body={
            err:10002,
            info:"name exsit",
            data:null
        }
        return
    }
    ctx.body={
        err:0,
        info:null,
        data:user
    }
})
//普通用户注册
router.post('/',async ctx=>{
    const {username,password,passwordRpt,email}=ctx.request.body
    let user
    try{
        user=await User.create({username,password,email})
        //默认所有用户都具有article,tag,archive路由的GET权限和添加文章的权限
        await UserPermission.create({userId:user.id,permissionId:1})
        await UserPermission.create({userId:user.id,permissionId:3})
        await UserPermission.create({userId:user.id,permissionId:5})
        await UserPermission.create({userId:user.id,permissionId:8})
    }catch(e){
        ctx.body={
            err:10002,
            info:"name exsit",
            data:null
        }
        return
    }
    ctx.body={
        err:0,
        info:null,
        data:user
    }
})
module.exports=router