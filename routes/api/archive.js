const router=require('koa-router')()

//model路径下默认指定了index.js文件作为入口文件
//所有需要的对象全部从index.js中解构出来
const {sequelize,Article}=require('../../model')

router.prefix('/archive')

router.get('/',async ctx=>{
    let res=await sequelize.query(`
        SELECT
            date_format(createdAt,'%Y-%m') as date,count(*) as articleNum
        FROM
            articles
        GROUP BY
            date_format(createdAt,'%Y-%m')
    `,{type:sequelize.QueryTypes.SELECT})
    ctx.body={
        err:0,
        info:null,
        data:res.map(i=>{
            let arr=i.date.split('-')
            i.year=+arr[0]
            i.month=+arr[1]
            return i
        })
    }
})
module.exports=router