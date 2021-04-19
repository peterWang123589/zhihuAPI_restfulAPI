const Router=require('koa-router')
// const jsonwebtoken=require('jsonwebtoken')
const jwt=require('koa-jwt')
const router=new Router({prefix:'/questions/:questionId/answers/:answerId/comments'})
const {secretkey}=require('../config')

const { checkCommentExist,checkCommentator,update,create,find,findById,delete:del} = require('../controllers/comments')
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

router.get('/:id',checkCommentExist,findById)

router.post('/',auth,create)


router.patch('/:id',auth,checkCommentExist,checkCommentator,update)
router.delete('/:id',auth,checkCommentExist,checkCommentator,del)

module.exports=router