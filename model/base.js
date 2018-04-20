const Sequelize=require('sequelize')
/*连接数据库，返回一个sequelize实例 */
/*用解构语法将Sequelize类和对象都导出 */
module.exports={
    Sequelize,
    sequelize:new Sequelize('blog', 'root', 'root',{
        host:'localhost',
        dialect:'mysql',
        pool:{
            max:5,
            min:0,
            idle:10000
        }   
    })
}