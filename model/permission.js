const {Sequelize,sequelize}=require('./base')


const Permission=sequelize.define('permission',{
    id:{
        primaryKey:true,
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false
    },
    name:{
        type:Sequelize.STRING,
        allowNull:true
    },
    /*管理API路由*/
    path:{
        type:Sequelize.STRING,
        defaultValue:0
    },
    /*POST/GET/DELETE/PUT请求*/
    methods:{
        type:Sequelize.TEXT
    }
})


module.exports=Permission