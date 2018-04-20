const {sequelize,Sequelize}=require('./base')

//中间表含有Article表和Tag表两个外键，调用API方法自动生成两个外键
const Tagging=sequelize.define('tagging',{
})
module.exports=Tagging