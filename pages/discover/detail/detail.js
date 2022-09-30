// pages/detail/detail.js
const db1= wx.cloud.database().collection("userInfo")
const db = wx.cloud.database().collection("musicList")
const backgroundAudioManager = wx.getBackgroundAudioManager();
const _ = db.Command;
let content = '';
let pinglun = [];
let id = '';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bofangisPlay:false,
        stop:false,
        isthumbs:false,
        inputcontent:'',
        isTriggered:false, 
        detail:'',
        nickName:'',
        openid:'',
        propfilephoto:''
    },

    /**
     * 生命周期函数--监听页面加载
     */

    onLoad: function (options) {

    this.getUser()
    this.getPage(options)
    }, 
    //获取当前用户信息 昵称 头像 Openid
    getUser(){
        let that = this
        db1.get().then(res=>{
            that.setData({
                nickName:res.data[0].userInfo.nickName,
                openid:res.data[0]._openid,
                profilephoto:res.data[0].userInfo.avatarUrl
            })
        })
        
    },
    //页面下拉
    handleRefresher(){
        this.getPage1()
    },
    //页面销毁
    onUnload: function() {
        backgroundAudioManager.stop()
        this.setData({
            bofangisPlay:false,
            stop:true
        })
      },
    //转发按钮 下载转发
    zhuanfa(e){
        wx.showLoading({
          title: '下载中...',
        })
        let that = this
        wx.cloud.downloadFile({
            fileID: that.data.detail.ID, // 下载url
            success (event) {
                wx.hideLoading({
                  success: (res) => {
                wx.showModal({
                    title: '温馨提示',
                    content: '您将以文件的形式直接转发此录音文件给您选择的好友',
                    confirmText:"确定",
                    cancelText:"取消",
                    success: function (res) {
                   
                        if (res.confirm) {
                               // 下载完成后转发
                            wx.shareFileMessage({
                                fileName:'清唱大师--'+that.data.detail.nickName+"--"+that.data.detail.title+".mp3",
                                filePath: event.tempFilePath,
                                success() {
                                    wx.cloud.callFunction({
                                        name:"yunhanshu",
                                        data:{
                                            action:"zhuanfa",
                                            id:that.data.detail._id,
                                        }
                                    }).then(res=>{
                                        db.doc(that.data.detail._id).get({
                                            success(res){
                                                var height = 'detail.zhuanfanum';  
                                                //动态改变点赞数值
                                                that.setData({  
                                                [height]: res.data.zhuanfanum
                                                })
                                            },
                                            fail(res){
                                                console.log("请求失败",res)
                                            }
                                        })
                                    }).catch(res=>{
                                        wx.showToast({
                                          title: '转发失败，请检查网络',
                                            icon:'none'
                                        })
                                    })
                               
                                },
                                fail() {
                                    wx.showToast({
                                        title: '您取消了分享',
                                        icon: 'none',
                                        duration: 2000
                                    });
                                },
                            })
                    
                        } else if (res.cancel) {
                            ///显示第二个弹说明一下
                          wx.showToast({
                            title: '您取消了此次分享',
                            icon:'none'
                          })
                        }
                    }
                });
                    },
                })
            },
            fail: console.error,
          })
    },
    //获取页面详情信息
    getPage(options){
        db
        .doc(options.id)
        .get().
        then(res=>{
         this.setData({
             detail:res.data,
         })
         id = options.id
         if(res.data.pinglun){
             pinglun = res.data.pinglun
         }
        })
        .catch(res=>{
         console.log("详情页失败",res)
        })
    },
    //下拉刷新页面详情、
    getPage1(){
        db
        .doc(id)
        .get().
        then(res=>{
         this.setData({
             detail:res.data,
             isTriggered : false
         })
         if(res.data.pinglun){
             pinglun = res.data.pinglun
         }
        })
        .catch(res=>{
         console.log("详情页失败",res)
        })
    },
    //获取用户输入内容
    getContent(event){
        content = event.detail.value
    },
    //发表评论
    fabiao(){
        if(this.data.openid != ''){
            console.log(this.data.openid)
            let that = this
        if(content.length < 1){
            wx.showToast({
              title: '您什么也没有写，没什么可以发表',
              icon:'none',
            })
            return
        }
            let pinglunItem = {}
            pinglunItem.name = this.data.nickName
            pinglunItem.content = content
            pinglunItem.openid = this.data.openid
            pinglunItem.profilephoto = this.data.profilephoto
            pinglun.push(pinglunItem)
            wx.cloud.callFunction({
                name:"yunhanshu",
                data:{
                    action:"pinglun",
                    id:id,
                    pinglun:pinglun
                }
            }).then(res=>{
                that.setData({
                    inputcontent:''
                })
                content = ''
                wx.showToast({
                    title: '评论成功',
                    icon:'success',
                  })
            }).catch(res=>{
                console.log("评论失败",res)
            })
        }else {
            wx.showToast({
              title: '您还没有登录~',
              icon:'none'
            })
        }
        
    },

    jianting(){
    

        //////////监听系统任务栏操作
        backgroundAudioManager.onPlay(()=>{
            this.setData({
                bofangisPlay:true,
                stop:false,
            })
        })
        backgroundAudioManager.onTimeUpdate((res)=>{
            var currentTime =''
            var CurrentTime = 'detail.currentTime'; 
            var CurrentWidth = 'detail.currentWidth'; 
            let currentWidth = backgroundAudioManager.currentTime/backgroundAudioManager.duration * 410 
            let    s = (backgroundAudioManager.currentTime).toFixed(0);
            var m = 0
            if(s>=60 && s<70){
            s= s-60
            m=1
            currentTime = "0"+[m]+":"+"0"+s
            }else if(s>=70 && s<120){
            m=1
            s= s-60
            currentTime = "0"+[m]+":"+s
            }else if(s>=120){
              m=2
              currentTime = "0"+[m]+":"+"0"+"0"
            }
            else if(s<10){
           currentTime = "0"+[m]+":"+"0"+s
           }else if(s>=10){
           currentTime ="0"+[m]+":"+s
           }
            if(!this.data.stop){
                this.setData({
                    [CurrentTime]:currentTime,
                    [CurrentWidth]:currentWidth
                })
            }else{
                this.setData({
                    [CurrentTime]:"00:00",
                    [CurrentWidth]:0
                })
            }
            
   
        })
        backgroundAudioManager.onStop(()=>{
            var CurrentWidth = 'detail.currentWidth'; 
            var CurrentTime = 'detail.currentTime'; 
            this.setData({
                stop:true,
                [CurrentWidth]:0,
                [CurrentTime]:'00:00',
                
            })
          
        })
        backgroundAudioManager.onPause(()=>{

        
            this.setData({
                bofangisPlay:false,

            })
       
        })
        backgroundAudioManager.onEnded(()=>{
            var CurrentTime = 'detail.currentTime'; 
            var bofangisPlay = 'detail.bofangisPlay'; 
            var CurrentWidth = 'detail.currentWidth'; 
            this.setData({
                [CurrentTime]:"00:00",
                bofangisPlay:false,
                [CurrentWidth]:0,
 
            })
        })
    
        ///////////////////////////
    },
    onShareTimeline:function(){
        return {
            title: '快来唱歌吧~',
            path: 'pages/detai/detail?id=123&age=18',  // 路径，传递参数到指定页面。
            imageUrl:'' // 分享的封面图
  
          }
    },


    


   

   
 



kaishibofang:function(e){
    this.jianting()

    if(this.data.bofangisPlay == false){
        this.setData({
            bofangisPlay:true,
        })
    backgroundAudioManager.src = this.data.detail.ID
    backgroundAudioManager.title = this.data.detail.title
    backgroundAudioManager.singer = this.data.detail.nickName 
    backgroundAudioManager.coverImgUrl = this.data.detail.userInfoprofilephoto
    }else if(this.data.bofangisPlay ==true){
        this.setData({
            bofangisPlay:false,
        })
        backgroundAudioManager.stop()
    }
    
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