const router=require('koa-router')()
const {Article,Tag,User,Tagging}=require('../../model')
router.prefix('/article')
/*koa的response会自动设置为json格式 */

//根路由返回所有article数据，对应前端mainContent页面的请求
router.get('/',async ctx=>{
    //在数据库中获取所有article
    /*
    let articles=await Article.findAll()
    ctx.body={
        err:0,
        info:null,
        data:articles
    }
    */
    //前端GET的格式是'localhost:3000/api/article?sort=["title","desc"]&offset=5&pageSize=10&filter={"id":35}'
    //解构出sort(按XX字段升序/降序排列),offset(偏移量),pageSize(每页记录数),filter是条件查询。
    let {sort=["id","desc"],offset=0,pageSize=10,filter={}}=ctx.request.query
    //数组也是JSON
    if(typeof sort=='string'){
        sort=JSON.parse(sort)
    }
    //filter要写成json字符串的格式，也就是"xx":xx
    //比如可以按创建时间的区间进行条件查询，$lt是小于，$gte是大于等于
    //localhost:3000/api/article?filter={"createdAt":{"$lt":"2017-07-01","$ge":"2017-06-01"}}
    if(typeof filter=='string'){
        filter=JSON.parse(filter)
    }
    
    //进行分页条件查询，其中条件查询是where字段，order是排序字段，offset是偏移字段，limit是总记录数限制字段
    let articles=await Article.findAll({
        order:sort.length==0?null:[sort],
        offset:+offset,
        limit:+pageSize,
        where:filter,
        //join关联表tag,user中的数据,并对user对象进行筛选只提取username字段
        include:[{model:Tag},{model:User,attributes:['username']}]
    })

    //查询数据总数
    let total=await Article.count()
    let nextOffset=(+offset+ +pageSize)>=total?null:(+offset+ +pageSize)
    //返回数据中包含一个pagination分页器
    //offset和pageSize都是String，要转化为Number
    //分页器的规范是count当前返回记录数组长度，total总记录数，offset当前偏移量，nextOffset下一页的起始偏移量，pageSize页数
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
//post根目录，添加数据
router.post('/',async ctx=>{
    //解构获取请求中的参数对应到数据库的字段，其中tagsId对应的是标签id的数组
    let {title,tags,content}=ctx.request.body

    //解析出当前POST请求的用户的session作为user
    let userId=ctx.session.userId

    //保存数据到数据库的create方法字段也是自动解构
    let article=await Article.create({title,content,userId})

    
    //依据tagId和articleId构建tagging中间表记录，实现多对多关系
    //forEach写法添加，再查询article为何tags字段为空数组?
    
    let tagging
    tags.forEach(async function(tag){
        console.log(tag)
        tagging=await Tagging.create({tagId:tag,articleId:article.id})
        console.log(tagging)
    })
    
    //依据tagId和articleId构建tagging中间表记录，实现多对多关系
    /*
    for(let i=0;i<tags.length;i++){
        await Tagging.create({tagId:tags[i],articleId:article.id})
    }
    */
    
    //join查询article，自动展开关联的tags和user字段
    article=await Article.findOne({where:{id:article.id},include:[{model:Tag},{model:User,attributes:['username']}]})

    ctx.body={
        err:0,
        info:null,
        data:article
    }
})
//put根目录，修改数据
router.put('/:id',async ctx=>{
    //按id查询到一条article记录,同样需要关联查询tag和user
    let article=await Article.findOne({where:{id:ctx.params.id},include:[{model:Tag},{model:User,attributes:['username']}]})
    if(article){
        //解构put请求参数
        let {title,content}=ctx.request.body
        //更新article字段
        article.title=title
        article.content=content
        //更新数据库中的记录
        await article.save()
        //给前端返回修改后的article
        ctx.body={
            err:0,
            info:null,
            data:article
        }
    }else{
        ctx.body={
            err:1,
            info:'edit error',
            data:null
        }
    }
})
//动态参数:id返回指定article，对应前端detailArticle的请求
router.get('/:id',async ctx=>{
    //由上下文参数ctx.params可以获取所有的动态参数
    //参数中的include字段自动做了join操作，获取关联表Tags中的数据数组添加到article中
    //相当于是在article中添加了tags属性，值为一个保存了所有关联tag记录的数组。
    let article=await Article.findOne({where:{id:ctx.params.id},include:[{model:Tag},{model:User,attributes:['username']}]})
    if(article){
        //model中定义了article和tag的多对多关系,所以可以用article.getTags获取其对应的全部tag
        //let tags=await article.getTags()   
        article.clickTimes++
        await article.save()
        ctx.body={
            err:0,
            info:null,
            //对article和tags进行拼接，node不支持...语法，所以用Object.assign进行拼接
            //由于article和tags都是代理对象，存在循环引用，不可以直接拼接
            //data:Object.assign({},article,tags)
            //代理对象中的dataValues为真实数据，可以使用dataValues进行拼接
            //tags是一个代理对象数组，需要逐个映射出其dataValues组成新数组
            //data:Object.assign({},article.dataValues,{tags:tags.map(i=>i.dataValues)})
            data:article
        }
    }else{
        ctx.body={
            err:1,
            info:'no article',
            data:null
        }
    }
})
//删除article
router.delete('/:id',async ctx=>{
    //查询出待删除记录
    let article=await Article.findOne({where:{id:ctx.params.id}})
    //删除记录
    await article.destroy()
    ctx.body={
        err:0,
        info:null
    }
})
module.exports=router