// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    if(event.action == "getlist"){
  return  cloud.database().collection("musicList").get({
       success(res){
        return res
       },
       fail(err){
        return err
       },
   })
    }else if(event.action == "gettuijianlist"){
        return  cloud.database().collection("musicList").limit(50).orderBy("thumbs",'desc').where({
            thumbs :cloud.database().command.gt(1000)
        }).get({
            success(res){
             return res
            },
            fail(err){
             return err
            },
        })
    }else if(event.action == "getlistself"){
        return  cloud.database().collection("musicList").where({
            "_openid":event.openid
        }).orderBy("_id",'desc').get({
             success(res){
              return res
             },
             fail(err){
              return err
             },
         })
          }
}