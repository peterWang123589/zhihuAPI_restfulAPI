const Answer=require('../models/answers')

class AnswersCtl{
 async find(ctx){
   const {per_page=10,page=1}=ctx.query
   //给per_page设置默认每页10条,page设置默认页数从一开始
   const perPage=Math.max(per_page * 1,1);
   //Math.max把传入的参数值与1作比较，防止用户输入无效的页码数和每页条数如：0，-1等
   const pageNum=Math.max(page * 1,1)
  //  ctx.body=await Answer.find({name:new RegExp(`^${ctx.query.q}`)}).limit(perPage).skip((pageNum - 1) * perPage)
  const q=new RegExp(ctx.query.q)
  ctx.body=await Answer.find({content:q,questionId:ctx.params.questionId}).limit(perPage).skip((pageNum - 1) * perPage)
   
   //limit方法设置每页的条数
   //skip跳过所需的条数
   //limit+skip结合使用实现分页功能
 }
 async findById(ctx){
   const {fields=''}=ctx.query
   const selectFields=fields.split(';').filter(f=>f).map(f=>" +" + f).join('')
   const answer=await Answer.findById(ctx.params.id).select(selectFields).populate('answerer')
   ctx.body=answer
 }
 async create(ctx){
   ctx.verifyParams({
content:{type:'string',required:true},

   })
   const answerer=ctx.state.user._id
   const {questionId}=ctx.params 
   const answer=await new Answer({...ctx.request.body,answerer,questionId}).save()
   ctx.body=answer
 }
 async update(ctx){
  ctx.verifyParams({
    content:{type:'string',required:false},

  })
  await ctx.state.answer.update(ctx.request.body)
  ctx.body=ctx.state.answer
 }
 async checkAnswerExist(ctx,next){
  const answer=await Answer.findById(ctx.params.id).select('+answerer')
  if(!answer){ctx.throw(404,"此答案不存在")}
  //只有删改查答案的时候才检查此逻辑,赞/踩答案的时候不检查
  if(ctx.params.questionId && answer.questionId !== ctx.params.questionId){
    ctx.throw(404,'该问题下没有此答案')
  }
  ctx.state.answer=answer
  await next()
}
async delete(ctx){
 await Answer.findByIdAndRemove(ctx.params.id)
  ctx.status=204
}
async checkAnswerer(ctx,next){
  const {answer}=ctx.state
  if(answer.answerer.toString() !== ctx.state.user._id){
    ctx.throw(403,'没有权限')
  }
  await next()
}
}
module.exports=new AnswersCtl()