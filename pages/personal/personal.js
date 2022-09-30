

// pages/personal/personal.js
const db = wx.cloud.database().collection("userInfo")
const db1 = wx.cloud.database().collection("musicList")
let startY = 0;//手指起始坐标
let moveY = 0;//手指移动坐标
let moveDistance = 0;//手指移动距离
Page({

    /**
     * 页面的初始数据
     */
    data: {
        islogin:false,
        coverTransform:'translateY(0)',
        coverTransition:'',
        isLoginData:false,
        userInfo:'',
        openid:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getdatauserinfo()
    },
    //获取用户数据
    getdatauserinfo(){
        let that = this
        db.get({
            success(res){
                that.setData({
                    userInfo:res.data[0].userInfo,
                    openid:res.data[0]._openid,
                    islogin:true,
                })
                that.getthumbsNum()
            }
        })        
    },
    //获取总获赞数 和 作品总数 并更新到数据库 最多100个作品
    getthumbsNum(event){
        let that = this
        wx.cloud.callFunction({
            name:"getlist",
            data:{
                openid:that.data.openid,
                action:"getlistself",
            },
            success(res){
          

                var thumbsnum = 0
                for(var i=0; i<res.result.data.length;i++){
                     thumbsnum += res.result.data[i].thumbs
                }
                var thumbsNum = 'userInfo.thumbsNum';  
                var compositionNum = 'userInfo.compositionNum';  
                that.setData({
                    [thumbsNum]:thumbsnum,
                    [compositionNum]:res.result.data.length,
                })
                wx.cloud.callFunction({
                    name:"yunhanshu",
                    data:{
                        action:"gengxingerenshuju",
                        openid:that.data.openid,
                        thumbsNum:that.data.userInfo.thumbsNum,
                        compositionNum:that.data.userInfo.compositionNum
                    },
                    success(res){
                        // console.log("更新成功",res)
                    },
                    fail(err){
                        console.log("更新失败",err)
                    }
                })   
      
            },
            fail(err){
               
            }
        })
 

    },
    //跳转到我的作品界面
    toZuopin(){
        if(this.data.islogin == true){
        wx.navigateTo({
          url: '/pages/wodezuopin/wodezuopin',
        })
        }else{
            wx.showToast({
              title: '请点击头像登录',
              icon:'none'
            })
        }
    },
    // 用户登录并获取用户信息
     toLogin(){
            let that = this
                if(!this.data.islogin){
                wx.getUserProfile({
                    desc: '获取用户头像 昵称',
                    success(res){
                       //添加用户信息到数据库
                      db.add({
                      data:{
                      "userInfo":res.userInfo,
                      "thumbsNum":0,
                      "compositionNum":0,
                      }
                    })
                  that.setData({
                      islogin:true
                  })
                  that.setData({
                    userInfo:res.userInfo,
                    openid:res._openid,
                    islogin:true,
                })
                that.getdatauserinfo()
                    },
                    fail(){
                        wx.showToast({
                          title: '登陆失败',
                          icon:'error'
                        })
                    }
                  })
            }else{
                that.getdatauserinfo()
            }
            
    },
    handleTouchStart(event){
        this.setData({
            coverTransition:'transform 0.3s linear'
        })
        //获取手指起始坐标
        startY = event.touches[0].clientY;
    },
    handleTouchMove(event){
        moveY = event.touches[0].clientY;
        moveDistance = moveY - startY;
        //动态更新coverTransform的状态值
        if(moveDistance <= 0){
            return;
        }
        if(moveDistance >= 80){
            moveDistance = 80;
        }
        this.setData({
            coverTransform:`translateY(${moveDistance}rpx)`
        })
    },
    handleTouchEnd(){
        this.setData({
            coverTransform:`translateY(0)rpx`,
            coverTransition:'transform 0.5s linear'
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
        this.getthumbsNum()
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