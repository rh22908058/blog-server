const {sequelize,Sequelize}=require('./base')

/*定义article表并导出Model类型的表 */
/*建表会对表名自动加s */
let Article=sequelize.define('article',{
    id:{
        primaryKey: true,//是主键
        type:Sequelize.INTEGER,//整形
        autoIncrement: true,//自增长
        allowNull: false//不许为空
    },
    title:{
        type:Sequelize.STRING,//字符串
        allowNull: false
    },
    clickTimes:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    content:{
        type:Sequelize.TEXT//比varchar长度长的字符串
    },
})


module.exports=Article