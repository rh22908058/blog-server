const {sequelize,Sequelize}=require('./base')

//中间表含有Permission表和User表两个外键，调用API方法自动生成两个外键
const UserPermission=sequelize.define('userPermission',{
})
module.exports=UserPermission