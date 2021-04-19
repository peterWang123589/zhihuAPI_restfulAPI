const Router=require('koa-router')
// const jsonwebtoken=require('jsonwebtoken')
const jwt=require('koa-jwt')
const router=new Router({prefix:'/users'})
const {secretkey}=require('../config')
 const {uncollectAnswer,collectAnswer,listCollectingAnswers,undislikeAnswer,dislikeAnswer,listdisLikingAnswers,unlikeAnswer,likeAnswer,listLikingAnswers,listQuestions,listFollowingTopic,unfollowTopic,followTopic,listFollowers,unfollow,follow,listFollowing,login,find,findById,create,update,delete:del,checkOwner}=require('../controllers/users')
 const auth=jwt({secret:secretkey})
 const {checkTopicExist}=require('../controllers/topics')
 const {checkAnswerExist, checkAnswerer}=require('../controllers/answers')
//  const auth=async (ctx,next)=>{
//    const {authorization=''}=ctx.request.header
//    const token=authorization.replace('Bearer ','')
//    try{
//      const user=jsonwebtoken.verify(token,secretkey)
//      ctx.state.user=user
//     }catch(err){
//    ctx.throw(401,err.message)
//    }
//    await next()
   
//  }
router.get('/',find)
router.post('/',create)
router.delete('/:id',auth,checkOwner,del)
router.patch('/:id',auth,checkOwner,update)
router.get('/:id',findById)
router.post('/login',login)
//特定用户的关注者列表接口
router.get('/:id/following',listFollowing)
//特定用户的粉丝列表接口
router.get('/:id/followers',listFollowers)
//关注接口
router.put('/following/:id',auth,follow)
//取消关注接口
router.delete('/following/:id',auth,unfollow)
//特定用户的关注话题列表接口
router.get('/:id/followingTopics',listFollowingTopic)
//关注话题接口
router.put('/followingTopics/:id',auth,checkTopicExist,followTopic)
//取消关注话题接口
router.delete('/followingTopics/:id',auth,checkTopicExist,unfollowTopic)
//特定用户所发布的问题接口
router.get('/:id/questions',listQuestions)

//获取某用户所赞过的答案列表
router.get('/:id/likingAnswers',listLikingAnswers)
//用户点赞某个答案
router.put('/likingAnswers/:id',auth,checkAnswerExist,likeAnswer,undislikeAnswer) //赞的时候取消踩
//用户取消点赞某个答案
router.delete('/likingAnswers/:id',auth,checkAnswerExist,unlikeAnswer)

//获取某用户所踩过的答案列表
router.get('/:id/dislikingAnswers',listdisLikingAnswers)
//用户踩某个答案
router.put('/dislikingAnswers/:id',auth,checkAnswerExist,dislikeAnswer,unlikeAnswer) //踩的时候取消赞
//用户取消踩某个答案
router.delete('/dislikingAnswers/:id',auth,checkAnswerExist,undislikeAnswer)

//获取某用户所收藏的答案列表
router.get('/:id/collectingAnswers',listCollectingAnswers)
//用户收藏某个答案
router.put('/collectingAnswers/:id',auth,checkAnswerExist,collectAnswer)
//用户取消收藏某个答案
router.delete('/collectingAnswers/:id',auth,checkAnswerExist,uncollectAnswer)
module.exports=router