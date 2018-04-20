const router=require('koa-router')()
//model路径下默认指定了index.js文件作为入口文件
//所有需要的对象全部从index.js中解构出来
const {sequelize,Article,Tag}=require('../../model')

router.prefix('/tag')
//查询全部标签
router.get('/',async ctx=>{
    let tags=await Tag.findAll()
    ctx.body={
        err:0,
        info:null,
        data:tags
    }
})
//查询单个标签下的所有article,并做分页
router.get('/:id',async ctx=>{
    let {id}=ctx.params
    let tag=await Tag.findOne({where:{id}})
    if(!tag){
        ctx.body={
            err:10003,
            info:"tag not exists",
            data:null
        }
        return
    }
    //解析GET参数，包括排序，偏移量，每页记录数
    let {sort=[],offset=0,pageSize=10}=ctx.request.query
    if(typeof sort=='string'){
        sort=JSON.parse(sort)
    }

    //对getArticles添加参数做条件查询，跟article中的方式相同
    let articles=await tag.getArticles({
        order:sort.length==0?null:[sort],
        offset:+offset,
        limit:+pageSize,
        //join关联表tag中的数据
        include:[{model:Tag}]
    })
    
    //let total=await Article.count()
    //响应数据包括分页器字段
    //这里查询出tag下全部articles再计数，应该优化
    let total=await tag.getArticles().length
    let nextOffset=(+offset+ +pageSize)>=total?null:(+offset+ +pageSize)
    ctx.body={
        err:0,
        info:null,
        pagination:{
            count:articles.length,
            total,
            offset:+offset,
            nextOffset,
            pageSize:+pageSize
        },
        data:articles
    }  
})
//添加标签
router.post('/',async ctx=>{
    //从POST请求参数中解构出Tag表需要的字段
    const {name,desc}=ctx.request.body
    let tag
    //创建一条tag记录并进行错误捕获，如不可以重复添加相同名字的标签
    try{
        tag=await Tag.create({name,desc})
    }catch(e){
        ctx.body={
            err:10002,
            info:"tag is already exists",
            data:null
        }
        return
    }   
    ctx.body={
        err:0,
        info:null,
        data:tag
    }
})

router.delete('/:id',async ctx=>{
    //查询出待删除记录
    let tag=await Tag.findOne({where:{id:ctx.params.id}})
    //获取标签下的articles，如果有，则不可以删除
    let articles=await tag.getArticles()

    if(articles.length==0){
        //删除记录
        await tag.destroy()
        ctx.body={
            err:0,
            info:null
        }
    }else{
        ctx.body={
            err:10006,
            info:'标签下有文章'
        }
    }   
})
module.exports=router