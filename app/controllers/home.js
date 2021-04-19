const path=require('path')
class HomeCtl{
  index(ctx){
    // ctx.body='123456789'
    ctx.body='<h1>这是主页</h1>'
  }
  upload(ctx){
  const file=ctx.request.files.myfile
  const basebname=path.basename(file.path)
  ctx.body={url:`${ctx.origin}/uploads/${basebname}`}
  }
}
module.exports=new HomeCtl()