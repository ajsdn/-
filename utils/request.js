//发送ajax请求
import config from './config'
export default (url,data={},method='GET') => {
  return new Promise( (resolve,reject) => {
    wx.request({
      url:config.host + url,
      data,
      method,
      data:{type:2},
      success:(res) =>{
        // console.log("请求成功:",res);
        resolve(res.data) //修改Promise的状态为成功状态
      },
      fail:(err) =>{
        // console.log("请求失败:",err);
        reject(err) //修改Promise的状态为失败状态
      }
    })
  })
}