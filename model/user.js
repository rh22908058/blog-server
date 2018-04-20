const {sequelize,Sequelize}=require('./base')

/*定义user表并导出Model类型的表 */
/*建表会对表名自动加s */
let User=sequelize.define('user',{
    id:{
        primaryKey: true,//是主键
        type:Sequelize.INTEGER,//整形
        autoIncrement: true,//自增长
        allowNull: false//不许为空
    },
    username:{
        type:Sequelize.STRING,//字符串
        unique: true,//唯一
        allowNull: false
    },
    password:{
        type:Sequelize.STRING,
        allowNull: false
    },
    email:{
        type:Sequelize.STRING,
    }
})

module.exports=User