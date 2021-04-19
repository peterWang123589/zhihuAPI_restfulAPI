const  jsonwebtoken=require('jsonwebtoken')
const users = require('../models/users')
const User=require('../models/users')
const Question=require('../models/questions')
const Answer=require('../models/answers')
const {secretkey}=require('../config')

// const db=[
//   {name:'peter'},{name:'lucy'}
// ]
class UserCtl{
 async find(ctx){
    // a.b
    // a是未定义的
    //会出一个500错误
    const {per_page=10,page=1}=ctx.query
    const perPage=Math.max(per_page * 1,1);
    const pageNum=Math.max(page * 1,1)
    ctx.body=await User.find().limit(perPage).skip((pageNum - 1) * perPage )
  }
 async findById(ctx){
    // if(ctx.params.id * 1 >=db.length ){
    //   //报先决条件错误
    //   ctx.throw(412,'先决条件失败：id大于等于数组长度')
    // }
    const {fields=''}=ctx.query
    const selectFields=fields.split(';').filter(f=>f).map(f=>" +" + f).join('')
    const populateStr=fields.split(';').filter(f=>f).map(f=>{
      if(f ==='employments'){
        return "employments.company employments.job"
      }
      if(f ==='educations'){
        return "educations.school educations.major"
      }
      return f
    }).join(' ')
    console.log(selectFields)
    // const user=await User.findById(ctx.params.id).select('+business +educations')
    const user=await User.findById(ctx.params.id).select(selectFields).populate(populateStr)
    //populateStr相当于populate("following educations.school education.major locations business employments.company employments.job")
    if(!user){ctx.throw(404,'用户不存在')}
    ctx.body=user
    
  }
  async create(ctx){
    ctx.verifyParams({
      name:{type:'string',required:true},
      age:{type:'number',required:false},
      password:{type:'string',required:true}
    })
    // db.push(ctx.request.body)
    const {name}=ctx.request.body
    const repeatedUser=await User.findOne({name})
if(repeatedUser){ctx.throw(409,"用户已经存在")}
   const user= await new User(ctx.request.body).save()
  ctx.body=user
  }
  async update(ctx){
    // if(ctx.params.id * 1 >=db.length ){
    //   //报先决条件错误
    //   ctx.throw(412,'先决条件失败：id大于等于数组长度')
    // }
    ctx.verifyParams({
      name:{type:'string',required:false},
      age:{type:'number',required:false},
      password:{type:'string',required:false},
      avatar_url:{type:"string",required:false},
      gender:{type:'string',required:false},
      headline:{type:'string',required:false},
      locations:{type:'array',itemType:'string',required:false},
      business:{type:'string',required:false},
      employments:{type:'array',itemType:'object',required:false},
      educations:{type:'array',itemType:'object',required:false},
    })
    const user=await User.findByIdAndUpdate(ctx.params.id,ctx.request.body)
   if(!user){
     ctx.throw(404)
   }
   ctx.body=user
  }
  async delete(ctx){
    // if(ctx.params.id * 1 >=db.length ){
    //   //报先决条件错误
    //   ctx.throw(412,'先决条件失败：id大于等于数组长度')
    // }
    const user=await User.findByIdAndRemove(ctx.params.id)
    if(!user){
      ctx.throw(404)
    }
    ctx.status=204
  }
  async login(ctx){
    ctx.verifyParams({
      name:{type:'string',required:true},
      password:{type:'string',required:true}
    })
    const user=await User.findOne(ctx.request.body)
    if(!user){
      ctx.throw(401,'用户名或密码不正确')
    }
    const {_id,name}=user
    const token=jsonwebtoken.sign({_id,name},secretkey,{expiresIn:'1d'})
    ctx.body={token}
 
  }
  async checkOwner(ctx,next){
    if(ctx.params.id !== ctx.state.user._id){ctx.throw(403,'没有权限')}
    await next()
  }
  async listFollowing(ctx){
    const user=await User.findById(ctx.params.id).select("+following").populate('following')
    if(!user){ctx.throw(404)}
    ctx.body=user.following
  }
  async listFollowers(ctx){
    const users=await User.find({following:{$elemMatch:{$eq:ctx.params.id}}})
    ctx.body=users
  }
  async follow(ctx){
    const me=await User.findById(ctx.state.user._id).select('+following')
   if(!me.following.map(id=>id.toString()).includes(ctx.params.id)){
    me.following.push(ctx.params.id)
    me.save()
   }
   ctx.status=204
  }
  async unfollow(ctx){
    const me=await User.findById(ctx.state.user._id).select('+following')
    const index=me.following.map(id=>id.toString()).indexOf(ctx.params.id)
   if(index > -1){
    me.following.splice(index,1)
    me.save()
   }
   ctx.status=204
  }

  async followTopic(ctx){
    const me=await User.findById(ctx.state.user._id).select('+followingTopics')
    if(!me.followingTopics.map(id=>id.toString()).includes(ctx.params.id)){
      me.followingTopics.push(ctx.params.id)
      me.save()
     }
     ctx.status=204
  }
  async unfollowTopic(ctx){
    const me=await User.findById(ctx.state.user._id).select('+followingTopics')
    const index=me.followingTopics.map(id=>id.toString()).indexOf(ctx.params.id)
   if(index > -1){
    me.followingTopics.splice(index,1)
    me.save()
   }
   ctx.status=204
  }
  async listFollowingTopic(ctx){
    const user=await User.findById(ctx.params.id).select("+followingTopics").populate('followingTopics')
    if(!user){ctx.throw(404)}
    ctx.body=user.followingTopics
  }
  async listQuestions(ctx){
    const questions=await Question.find({questioner:ctx.params.id})
    ctx.body=questions
  }
  async listLikingAnswers(ctx){
    const user=await User.findById(ctx.params.id).select("+likingAnswers").populate('likingAnswers')
    if(!user){ctx.throw(404)}
    ctx.body=user.likingAnswers
  }
  async likeAnswer(ctx,next){
    //赞
    const me=await User.findById(ctx.state.user._id).select('+likingAnswers')
    if(!me.likingAnswers.map(id=>id.toString()).includes(ctx.params.id)){
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{voteCount:1}})
     }
     ctx.status=204
     await next()
  }
  async unlikeAnswer(ctx){
     //取消赞
    const me=await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index=me.likingAnswers.map(id=>id.toString()).indexOf(ctx.params.id)
   if(index > -1){
    me.likingAnswers.splice(index,1)
    me.save()
    await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{voteCount: -1}})
   }
   ctx.status=204
  }
  async listdisLikingAnswers(ctx){
    const user=await User.findById(ctx.params.id).select("+dislikingAnswers").populate('dislikingAnswers')
    if(!user){ctx.throw(404)}
    ctx.body=user.dislikingAnswers
  }
  async dislikeAnswer(ctx,next){
    //踩
    const me=await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    if(!me.dislikingAnswers.map(id=>id.toString()).includes(ctx.params.id)){
      me.dislikingAnswers.push(ctx.params.id)
      me.save()

     }
     ctx.status=204
     await next()
  }
  async undislikeAnswer(ctx){
    //取消踩
   const me=await User.findById(ctx.state.user._id).select('+dislikingAnswers')
   const index=me.dislikingAnswers.map(id=>id.toString()).indexOf(ctx.params.id)
  if(index > -1){
   me.dislikingAnswers.splice(index,1)
   me.save()

  }
  ctx.status=204
 }
 async listCollectingAnswers(ctx){
  const user=await User.findById(ctx.params.id).select("+collectingAnswers").populate('collectingAnswers')
  if(!user){ctx.throw(404)}
  ctx.body=user.collectingAnswers
}
async collectAnswer(ctx,next){
  //收藏
  const me=await User.findById(ctx.state.user._id).select('+collectingAnswers')
  if(!me.collectingAnswers.map(id=>id.toString()).includes(ctx.params.id)){
    me.collectingAnswers.push(ctx.params.id)
    me.save()
   }
   ctx.status=204
   await next()
}
async uncollectAnswer(ctx){
  //取消收藏
 const me=await User.findById(ctx.state.user._id).select('+collectingAnswers')
 const index=me.collectingAnswers.map(id=>id.toString()).indexOf(ctx.params.id)
if(index > -1){
 me.collectingAnswers.splice(index,1)
 me.save()

}
ctx.status=204
}
}
module.exports=new UserCtl()