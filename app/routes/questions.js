const Router=require('koa-router')
// const jsonwebtoken=require('jsonwebtoken')
const jwt=require('koa-jwt')
const router=new Router({prefix:'/questions'})
const {secretkey}=require('../config')
 const {delete:del,checkQuestionExist,checkQuestioner,create,findById,find,update}=require('../controllers/questions')
const { checkTopicExist } = require('../controllers/topics')
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

router.get('/:id',checkQuestionExist,findById)

router.post('/',auth,create)


router.patch('/:id',auth,checkQuestionExist,checkQuestioner,update)
router.delete('/:id',auth,checkQuestionExist,checkQuestioner,del)

module.exports=router