const Topic=require('../models/topics')
const User=require('../models/users')
const Question=require('../models/questions')
class TopicsCtl{
 async find(ctx){
   const {per_page=10,page=1}=ctx.query
   //给per_page设置默认每页10条,page设置默认页数从一开始
   const perPage=Math.max(per_page * 1,1);
   //Math.max把传入的参数值与1作比较，防止用户输入无效的页码数和每页条数如：0，-1等
   const pageNum=Math.max(page * 1,1)
  //  ctx.body=await Topic.find({name:new RegExp(`^${ctx.query.q}`)}).limit(perPage).skip((pageNum - 1) * perPage)
  ctx.body=await Topic.find({name:new RegExp(ctx.query.q)}).limit(perPage).skip((pageNum - 1) * perPage)
   
   //limit方法设置每页的条数
   //skip跳过所需的条数
   //limit+skip结合使用实现分页功能
 }
 async findById(ctx){
   const {fields=''}=ctx.query
   const selectFields=fields.split(';').filter(f=>f).map(f=>" +" + f).join('')
   const topic=await Topic.findById(ctx.params.id).select(selectFields)
   ctx.body=topic
 }
 async create(ctx){
   ctx.verifyParams({
     name:{type:'string',required:true},
     icon_url:{type:'string',required:false},
     introduction:{type:'string',required:false},
   })
   const topic=await new Topic(ctx.request.body).save()
   ctx.body=topic
 }
 async update(ctx){
  ctx.verifyParams({
    name:{type:'string',required:false},
    icon_url:{type:'string',required:false},
    introduction:{type:'string',required:false},
  })
  const topic=await Topic.findByIdAndUpdate(ctx.params.id,ctx.request.body)
  ctx.body=topic
 }
 async checkTopicExist(ctx,next){
  const topic=await Topic.findById(ctx.params.id)
  if(!topic){ctx.throw(404,"此话题不存在")}
  await next()
}
async listTopicFollowers(ctx){
  const users=await User.find({followingTopics:{$elemMatch:{$eq:ctx.params.id}}})
  ctx.body=users
}
async listQuestions(ctx){
  const questions=await Question.find({topics:{$elemMatch:{$eq:ctx.params.id}}})
  ctx.body=questions
}
}
module.exports=new TopicsCtl()