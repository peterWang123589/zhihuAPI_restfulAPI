const Router=require('koa-router')
// const jsonwebtoken=require('jsonwebtoken')
const jwt=require('koa-jwt')
const router=new Router({prefix:'/topics'})
const {secretkey}=require('../config')
 const {listQuestions,listTopicFollowers,checkTopicExist,create,findById,find,update}=require('../controllers/topics')
 const auth=jwt({secret:secretkey})
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
router.post('/',auth,create)

router.patch('/:id',auth,checkTopicExist,update)
router.get('/:id',checkTopicExist,findById)
router.get('/:id/topicFollowers',checkTopicExist,listTopicFollowers)
router.get('/:id/questions',checkTopicExist,listQuestions)
module.exports=router