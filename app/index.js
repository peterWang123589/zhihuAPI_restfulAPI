const koa=require('koa')
const mongoose=require('mongoose')
const koaBody=require('koa-body')
const koaStatic=require('koa-static')
const path=require('path')
const app=new koa()
const routing=require('./routes')
const error=require('koa-json-error')
const parameter=require('koa-parameter')
const {connectionStr}=require('./config')

mongoose.connect(connectionStr,{ useNewUrlParser: true,useUnifiedTopology: true },()=>{
  console.log('MongoDB连接成功了')
})
mongoose.set('useFindAndModify',false)
mongoose.connection.on('error',console.error)
// const auth=async (ctx,next)=>{
//   if(ctx.url!=='/users'){
// ctx.throw(401)
//   }
//   await next()
// }

app.use(koaStatic(path.join(__dirname,'/public')))
app.use(error({
  postFormat:(e,{stack,...rest})=>{
  return  process.env.NODE_ENV==='production' ? rest : {stack,...rest}
  }
}))

//自定义错误处理，可以满足手动抛出错误以及服务器运行错误，而且返回的是json格式，虽然捕获不到404错误
//因为404错误不走中间件，但这已经足够强大
// app.use(async (ctx,next)=>{
//   try{
//     await next()
//   }catch(err){
//     ctx.status=err.status ||err.statusCode  || 500
//     ctx.body={
//       message:err.message
//     }
//   }
// })
app.use(
 koaBody({
   multipart:true,
   formidable:{
     uploadDir:path.join(__dirname,'/public/uploads'),
     keepExtensions:true
   }
 })
)
app.use(parameter(app))
routing(app)


// app.use(async (ctx)=>{
//   if(ctx.url === '/'){
//    ctx.body='这是主页'
//   }else if(ctx.url ==='/users'){
//     if(ctx.method==='GET'){
//       ctx.body='这是用户列表页'
//     }else if(ctx.method==='POST'){
//       ctx.body='创建用户'
//     }else{
//       ctx.status=405
//     }
    
//   }else if(ctx.url.match(/\/users\/\w+/)){
//     const userId=ctx.url.match(/\/users\/(\w+)/)[1]
//     ctx.body=`这是用户${userId}`
//   }  
  
//   else{
//     ctx.status=404
//   }
// })
// //第一层中间件
// app.use(async (ctx,next)=>{
//   console.log(1)
//   await next()
//   console.log(2)
//   ctx.body='Hello Zhihu API'
// })
// //第二层中间件
// app.use(async (ctx,next)=>{
//   console.log(3)
//   await next()
//   console.log(4)

// })
// //第三层中间件
// app.use(async (ctx,next)=>{

//   console.log(5)

// })
app.listen(4000,()=>{
  console.log('程序启动在4000端口了')
})