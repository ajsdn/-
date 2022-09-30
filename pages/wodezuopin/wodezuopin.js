// pages/wodezuopin/wodezuopin.js
const db = wx.cloud.database().collection("userInfo")
const db1 = wx.cloud.database().collection("musicList")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        total:0,
        openid:'',
        musicList:[],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       this.getopenid()
    },
    //获取用户openid 和数据
    getopenid(event){
        let that = this
        wx.showLoading({
          title: '加载中...',
        })
        wx.cloud.callFunction({
            name:"yunhanshu",
            data:{
                action:"getopenid",
            },
            success(res){
                that.setData({
                    openid:res.result.openid
                })
                 wx.cloud.callFunction({
                    name:"getlist",
                    data:{
                        action:"getlistself",
                        openid:that.data.openid
                    },
                    success(res){
                        that.setData({
                            musicList:res.result.data,
                            total:res.result.data.length
                        })
                        wx.hideLoading({
                          success: (res) => {},
                        })
                    },
                    fail(res){
                        console.log("请求失败",res)
                    }
                })   
            },
            fail(err){
                console.log("openid失败",err)
            }
            
        })
       
                 

    },   
    //跳转详情页
    goDetail(event){
        if (this.data.openid  !='' && this.data.userInfoprofilephoto !='' && this.data.nickName !='') {
            wx.navigateTo({
                url: '/pages/discover/detail/detail?id=' + event.currentTarget.dataset.id,
              })
            
        }else{
               wx.showToast({
               title: '您还没有登录~',
              icon: 'none',
               duration: 2000
                });
            return
    
          }
        },
    //删除歌曲
    delete(e){
        console.log(e.currentTarget)
        wx.showModal({
            content:'删除这个作品',
            success:(res)=>{
                if(res.confirm){
                   // 删除数组中指定下标
                    db1.doc(e.currentTarget.dataset.id._id).remove().then(res=>{
                    wx.showLoading({
                      title: '删除中...',
                    })
                    //云储存中同步删除
                    wx.cloud.deleteFile({
                        fileList: [e.currentTarget.dataset.id.ID]
                      }).then(res => {
                        // handle success
                        console.log(res.fileList)
                      }).catch(error => {
                        // handle error
                      })
                    this.getopenid()
                    wx.hideLoading({
                      success: (res) => {
                          wx.showToast({
                            title: '删除成功',
                          })
                      },
                    })
                })

           
                }
            }
        })
    },
    //提示暂未开放
    zanweikaifang(){
        wx.showToast({
          title: '暂未开放 敬请期待',
          icon:'none'
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})