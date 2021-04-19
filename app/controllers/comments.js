const Comment=require('../models/comments')

class CommentsCtl{
 async find(ctx){
   const {per_page=10,page=1}=ctx.query
   //给per_page设置默认每页10条,page设置默认页数从一开始
   const perPage=Math.max(per_page * 1,1);
   //Math.max把传入的参数值与1作比较，防止用户输入无效的页码数和每页条数如：0，-1等
   const pageNum=Math.max(page * 1,1)
  //  ctx.body=await Comment.find({name:new RegExp(`^${ctx.query.q}`)}).limit(perPage).skip((pageNum - 1) * perPage)
  const {questionId,answerId}=ctx.params
  const {rootCommentId}=ctx.query
  const q=new RegExp(ctx.query.q)
  ctx.body=await Comment.find({content:q,questionId,answerId,rootCommentId})
                .limit(perPage)
                .skip((pageNum - 1) * perPage)
                .populate('commentator replyTo')
   
   //limit方法设置每页的条数
   //skip跳过所需的条数
   //limit+skip结合使用实现分页功能
 }
 async findById(ctx){
   const {fields=''}=ctx.query
   const selectFields=fields.split(';').filter(f=>f).map(f=>" +" + f).join('')
   const comment=await Comment.findById(ctx.params.id).select(selectFields).populate('commentator')
   ctx.body=comment
 }
 async create(ctx){
   ctx.verifyParams({
content:{type:'string',required:true},
rootCommentId:{type:'string',required:false},
replyTo:{type:'string',required:false},
   })
   const commentator=ctx.state.user._id
   const {questionId,answerId}=ctx.params 
   const comment=await new Comment({...ctx.request.body,commentator,questionId,answerId}).save()
   ctx.body=comment
 }
 async update(ctx){
  ctx.verifyParams({
    content:{type:'string',required:false},

  })
  const {content}=ctx.request.body
  await ctx.state.comment.update(content)
  ctx.body=ctx.state.comment
 }
 async checkCommentExist(ctx,next){
  const comment=await Comment.findById(ctx.params.id).select('+commentator')
  if(!comment){ctx.throw(404,"此答案不存在")}
  //只有删改查答案的时候才检查此逻辑,赞/踩答案的时候不检查
  if(ctx.params.questionId && comment.questionId !== ctx.params.questionId){
    ctx.throw(404,'该问题下没有此评论')
  }
  if(ctx.params.answerId && comment.answerId !== ctx.params.answerId){
    ctx.throw(404,'该答案下没有此评论')
  }
  ctx.state.comment=comment
  await next()
}
async delete(ctx){
 await Comment.findByIdAndRemove(ctx.params.id)
  ctx.status=204
}
async checkCommentator(ctx,next){
  const {comment}=ctx.state
  if(comment.commentator.toString() !== ctx.state.user._id){
    ctx.throw(403,'没有权限')
  }
  await next()
}
}
module.exports=new CommentsCtl()