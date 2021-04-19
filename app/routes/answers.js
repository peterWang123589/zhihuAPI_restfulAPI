const Router=require('koa-router')
// const jsonwebtoken=require('jsonwebtoken')
const jwt=require('koa-jwt')
const router=new Router({prefix:'/questions/:questionId/answers'})
const {secretkey}=require('../config')
 const {delete:del,checkAnswerExist,checkAnswerer,create,findById,find,update}=require('../controllers/answers')

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

router.get('/:id',checkAnswerExist,findById)

router.post('/',auth,create)


router.patch('/:id',auth,checkAnswerExist,checkAnswerer,update)
router.delete('/:id',auth,checkAnswerExist,checkAnswerer,del)

module.exports=router