const {sequelize,Sequelize}=require('./base')

//在index中调用各个表关联的API，这样就可以避免循环引用

//引入四张表
const User=require('./user')
const Article=require('./article')
const Tag=require('./tag')
const Tagging=require('./tagging')
const Permission=require('./permission')
const UserPermission=require('./userPermission')

//执行关联API
//用api设置关联关系，会自动添加对应字段，不必在define中手动指定
//作者表和文章表是一对多关系
//一关系表必须在多关系表之前调用
User.hasMany(Article)
//文章表和作者表是多对一关系
Article.belongsTo(User)
//对文章表和标签表做多对多关联，对应中间表为Tagging
Article.belongsToMany(Tag,{through:Tagging})
//把关联关系放到同一个文件里做，防止了循环引用问题
Tag.belongsToMany(Article,{through:Tagging})

/*权限表permission和用户表user也是多对多关系 */
Permission.belongsToMany(User,{through:UserPermission})
User.belongsToMany(Permission,{through:UserPermission})
//同步四张表
/*同步到数据库,这是一个异步操作 */
//同步顺序必须先同步一关系表再同步多关系表，也就是说创建一个表，其中外键对应表必须先行存在

User.sync()
Tag.sync()
//对表的字段修改直接在数据库中操作
Article.sync()
Tagging.sync()
Permission.sync()
UserPermission.sync()


//最后数据库中的表结果是Tagging双外键(article,tag)
//多表中保存有一表的外键(article表中有user外键)
//article和tag表都没有tagging外键

//以对象方式全部导出
module.exports={
    User,
    Article,
    Tag,
    Tagging,
    Permission,
    UserPermission,
    sequelize,
    Sequelize
}