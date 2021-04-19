const mongoose=require('mongoose')
const {Schema,model}=mongoose

const userSchema=new Schema({
  name:{type:String,required:true},
  age:{type:Number,required:false},
  password:{type:String,required:true,select:false},
  __v:{type:Number,select:false},
  avatar_url:{type:String},
  gender:{type:String,enum:['男','女'],default:'男',required:true},
  headline:{type:String},
  locations:{type:[{type:Schema.Types.ObjectId,ref:'Topic'}],select:false},
  business:{type:Schema.Types.ObjectId,ref:'Topic' ,select:false},
  employments:{
    type:[{
      company:{type:Schema.Types.ObjectId,ref:'Topic'},
      job:{type:Schema.Types.ObjectId,ref:'Topic'}
    }],
    select:false
  },
   educations:{
     type:[{
       school:{type:Schema.Types.ObjectId,ref:'Topic'},
       major:{type:Schema.Types.ObjectId,ref:'Topic'},
       diploma:{type:Number,enum:[1,2,3,4,5]},
       entrance_year:{type:Number},
       graduation_year:{type:Number}
     }],
     select:false
   },
   following:{
     type:[{type:Schema.Types.ObjectId,ref:"User"}],
     select:false
   },
   followingTopics:{
    type:[{type:Schema.Types.ObjectId,ref:"Topic"}],
    select:false
  },
  likingAnswers:{
    type:[{type:Schema.Types.ObjectId,ref:"Answer"}],
    select:false
  },
  dislikingAnswers:{
    type:[{type:Schema.Types.ObjectId,ref:"Answer"}],
    select:false
  },
 collectingAnswers:{
    type:[{type:Schema.Types.ObjectId,ref:"Answer"}],
    select:false
  }
},{timestamps:true})
//select为false，数据库查询的时候不会显示该字段
module.exports=model('User',userSchema)