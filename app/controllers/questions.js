const Question=require('../models/questions')

class QuestionsCtl{
 async find(ctx){
   const {per_page=10,page=1}=ctx.query
   //给per_page设置默认每页10条,page设置默认页数从一开始
   const perPage=Math.max(per_page * 1,1);
   //Math.max把传入的参数值与1作比较，防止用户输入无效的页码数和每页条数如：0，-1等
   const pageNum=Math.max(page * 1,1)
  //  ctx.body=await Question.find({name:new RegExp(`^${ctx.query.q}`)}).limit(perPage).skip((pageNum - 1) * perPage)
  const q=new RegExp(ctx.query.q)
  ctx.body=await Question.find({$or:[{title:q},{description:q}]}).limit(perPage).skip((pageNum - 1) * perPage)
   
   //limit方法设置每页的条数
   //skip跳过所需的条数
   //limit+skip结合使用实现分页功能
 }
 async findById(ctx){
   const {fields=''}=ctx.query
   const selectFields=fields.split(';').filter(f=>f).map(f=>" +" + f).join('')
   const question=await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics')
   ctx.body=question
 }
 async create(ctx){
   ctx.verifyParams({
     title:{type:'string',required:true},
    description:{type:'string',required:false},

   })
   const question=await new Question({...ctx.request.body,questioner:ctx.state.user._id}).save()
   ctx.body=question
 }
 async update(ctx){
  ctx.verifyParams({
    title:{type:'string',required:false},
    description:{type:'string',required:false},
  })
  await ctx.state.question.update(ctx.request.body)
  ctx.body=ctx.state.question
 }
 async checkQuestionExist(ctx,next){
  const question=await Question.findById(ctx.params.id).select('+questioner')
  if(!question){ctx.throw(404,"此问题题不存在")}
  ctx.state.question=question
  await next()
}
async delete(ctx){
 await Question.findByIdAndRemove(ctx.params.id)
  ctx.status=204
}
async checkQuestioner(ctx,next){
  const {question}=ctx.state
  if(question.questioner.toString() !== ctx.state.user._id){
    ctx.throw(403,'没有权限')
  }
  await next()
}
}
module.exports=new QuestionsCtl()