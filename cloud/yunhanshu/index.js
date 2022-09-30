//云函数入口文件
const cloud = require('wx-server-sdk')
// const db = cloud.database()
cloud.init({
    env:'cloud1-5gimwurv2bc8ea74'
})

// 云函数入口函数
exports.main = async (event, context) => {
        if(event.action == "getopenid"){
            const wxContext = cloud.getWXContext()
            return{
                event,
                openid: wxContext.OPENID,
                appid:wxContext.APPID,
                unionid:wxContext.UNIONID
            }
        }else if(event.action == "pinglun"){
        return await cloud.database().collection("musicList").doc(event.id)
        .update({
            data:{
                pinglun:event.pinglun
            }
        })
        .then(res=>{
            console.log("评论成功",res)
            return res
        })
        .catch(res=>{
            console.log("评论失败",res)
            return res
        })
     }
     else if(event.action == "thumbs+"){
        return await cloud.database().collection("musicList").doc(event.id)
        .update({
            data:{
                thumbs:cloud.database().command.inc(1),
                thumbslist:event.thumbslist
            }
        })
        .then(res=>{
            console.log("点赞成功",res)
            return res
        })
        .catch(res=>{
            console.log("点赞失败",res)
            return res
        })
    }
    else if(event.action == "thumbs-"){
        return await cloud.database().collection("musicList").doc(event.id)
        .update({
            data:{
                thumbs:cloud.database().command.inc(-1),
                thumbslist:event.thumbslist
            }
        })
        .then(res=>{
            console.log("取消点赞成功",res)
            return res
        })
        .catch(res=>{
            console.log("取消点赞失败",res)
            return res
        })
    }
    else if(event.action == "zhuanfa"){
        return await cloud.database().collection("musicList").doc(event.id)
        .update({
            data:{
                zhuanfanum:cloud.database().command.inc(1),
            }
        })
        .then(res=>{
            console.log("转发成功",res)
            return res
        })
        .catch(res=>{
            console.log("转发失败",res)
            return res
        })
    } else if(event.action == "search+"){
        return await cloud.database().collection("musicList").doc(event.id)
        .update({
            data:{
                searchNum:cloud.database().command.inc(1),
            }
        })
        .then(res=>{
            console.log("记录搜索成功",res)
            return res
        })
        .catch(res=>{
            console.log("记录搜索失败",res)
            return res
        })
    }else if(event.action == "gengxingerenshuju"){
        return await cloud.database().collection("userInfo").where({
            "_openid":event.openid
        })
        .update({
            data:{
                thumbsNum:event.thumbsNum,
                compositionNum:event.compositionNum
            }
        })
        .then(res=>{
            console.log("更新成功",res)
            return res
        })
        .catch(err=>{
            console.log("更新失败",err)
            return err
        })
    }
}