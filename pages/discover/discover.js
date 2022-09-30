// pages/discover/discover.js
const db1= wx.cloud.database().collection("userInfo")
const db = wx.cloud.database().collection("musicList")
const backgroundAudioManager = wx.getBackgroundAudioManager();
let lenn =0
let totalnum = -1;
const app = getApp()
Page({
    data:{
        isDenglu:false,
        stop:false,
        bofangindex:'',
        openid:'',
        musicList:[],
        ID:'',
        isTriggered:false //标识下拉刷新是否被触发
    }, 
    //开始就执行一次  用于初始化
    onLoad: function (options) {
        
        this.getDatabd1()
    },
    //页面被隐藏
    onHide: function() {
       
        this.setData({
            isBofang:false,
            stop:true
        })
        backgroundAudioManager.pause()
      },
    //页面被显示
      onShow: function () {
        lenn = 0
        totalnum = -1
        this.setData({
            musicList:[]
        })
        this.getDatadb()
    },
  
   //获取用户openid
    getopenid(){
        let that = this
        wx.cloud.callFunction({
            name:"yunhanshu",
            data:{
                action:"getopenid",
            },
            success(res){
                that.setData({
                    openid:res.result.openid
                })
                that.xuanrandianzan()
                // console.log(that.data.openid)
            },
            fail(err){
                console.log("openid失败",err)
            }
        })

    },   
    //获取数据库数据
    getDatadb(){
        let that = this;
        let lenn = that.data.musicList.length
        if(totalnum < lenn){
        wx.showLoading({
            title: '加载中...',
          })
        db
        .orderBy("_id",'desc')
        .skip(lenn)
        .limit(10)
        .get({
            success(res){
                that.setData({
                    musicList:that.data.musicList.concat(res.data),
                    isTriggered:false,
                })
                wx.hideLoading({
                  success: (res) => {},
                })
                that.getopenid()
            },
            fail(res){
                console.log("请求失败",res)
            }
        })   
    }else if(totalnum >= lenn){
        wx.showToast({
          title: '暂时没有更多啦',
          icon:'none'
        })
    }
        
       
    },
    getDatabd1(){
        let that = this;
        db1.get({
            success(res){
                that.setData({
                    userInfoprofilephoto:res.data[0].userInfo.avatarUrl,
                    nickName:res.data[0].userInfo.nickName,
                })
            },
            fail(res){
                console.log("请求失败",res)
            }
        })
    },

    //渲染点赞信息
    xuanrandianzan(){
        for(var i=0;i<this.data.musicList.length;i++){
            for(var j=0;j<this.data.musicList[i].thumbslist.length;j++)
            
            if(this.data.openid == this.data.musicList[i].thumbslist[j].openid){
                var isthumbs = 'musicList['+i+'].isthumbs'; 
                this.setData({
                    [isthumbs]:true
                })
                
            }
        }
    },
    //评论按钮--跳转详情页
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
    //跳转到搜索页面
    toSearch(){
        wx.navigateTo({
          url: '/pages/search/search',
        })
    },
    //点赞按钮--点赞功能
    thumbs(event){
    if (this.data.openid !=''  && this.data.userInfoprofilephoto !='' && this.data.nickName !='') {
      let that = this
       let index = event.currentTarget.dataset.index
        var thumbslist = that.data.musicList[index].thumbslist
         var isthumbs = false;
        for(var i=0;i<thumbslist.length;i++){
            if(that.data.openid == thumbslist[i].openid){
            isthumbs = true;
            var isthumbs = 'musicList['+index+'].isthumbs'; 
                this.setData({
                    [isthumbs]:false
                })
            thumbslist.splice(i,1)
            wx.cloud.callFunction({
                name:"yunhanshu",
                data:{
                    action:"thumbs-",
                    id:event.currentTarget.dataset.id,
                    thumbslist:thumbslist
                }
            }).then(res=>{
                db.doc(event.currentTarget.dataset.id).get({
                    success(res){
                        var height = 'musicList['+index+'].thumbs';  
                        //动态改变点赞数值
                        that.setData({  
                        [height]: res.data.thumbs
                        })
                    },
                    fail(res){
                        console.log("请求失败",res)
                    }
                })
            }).catch(res=>{
                wx.showToast({
                  title: '取消点赞失败，请检查网络',
                    icon:'none'
                })
            })
            // console.log(thumbslist)
            break;
            }
        }
        if(!isthumbs){
            thumbslist.push({openid:that.data.openid})
            var isthumbs = 'musicList['+index+'].isthumbs'; 
            this.setData({
                [isthumbs]:true
            })
            isthumbs = false;
            // console.log(thumbslist)
            wx.cloud.callFunction({
                name:"yunhanshu",
                data:{
                    action:"thumbs+",
                    id:event.currentTarget.dataset.id,
                    thumbslist:thumbslist
                }
            }).then(res=>{
                db.doc(event.currentTarget.dataset.id).get({
                    success(res){
                        var height = 'musicList['+index+'].thumbs';  
                        //动态改变点赞数值
                        that.setData({  
                        [height]: res.data.thumbs
                        })
                    },
                    fail(res){
                        console.log("请求失败",res)
                    }
                })
            }).catch(res=>{
                wx.showToast({
                  title: '点赞失败，请检查网络',
                    icon:'none'
                })
            })
        }
       
        }else{
            wx.showToast({
                title: '您还没有登录~',
                icon: 'none',
                duration: 2000
              });
            return
        }
    },
    //转发按钮--下载并转发功能
    zhuanfa(e){
        wx.showLoading({
          title: '下载中...',
        })
        var index = e.currentTarget.dataset.index
        let that = this
        wx.cloud.downloadFile({
            fileID: that.data.musicList[index].ID, // 下载url
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
                            // console.log('用户点击确定');
                               // 下载完成后转发
                            wx.shareFileMessage({
                                fileName:'清唱大师最新发布--'+that.data.musicList[index].nickName+"--"+that.data.musicList[index].title+".mp3",
                                filePath: event.tempFilePath,
                                success() {
                                    wx.cloud.callFunction({
                                        name:"yunhanshu",
                                        data:{
                                            action:"zhuanfa",
                                            id:e.currentTarget.dataset.id,
                                        }
                                    }).then(res=>{
                                        db.doc(e.currentTarget.dataset.id).get({
                                            success(res){
                                                var height = 'musicList['+index+'].zhuanfanum';  
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
                            console.log('用户点击取消');
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
    onShareAppMessage: function (ops) {
        if (ops.from === 'button') {
        }
        return {
          title: '快来听听这个~超好听~',
          path: 'pages/discover/discover?id=123&age=18',  // 路径，传递参数到指定页面。
          imageUrl:'' // 分享的封面图

        }
     
       },
    //
    onShareTimeline:function(){
        return {
            title: '快来唱歌吧~',
            path: 'pages/discover/discover?id=123&age=18',  // 路径，传递参数到指定页面。
            imageUrl:'' // 分享的封面图
  
          }
    },
    //自定义下拉刷新 scorll-view
       handleRefresher(){
    this.getDatadb()
    this.setData({
        isBofang:false,
    })
    backgroundAudioManager.pause()

},
    //监听播放状态
    jianting(){
    

        //////////监听系统任务栏操作
        backgroundAudioManager.onPlay(()=>{
            var bofangisPlay = 'musicList['+this.data.bofangindex+'].bofangisPlay'; 
            this.setData({
                [bofangisPlay]:true,
                stop:false,
  
            })
        })
        backgroundAudioManager.onTimeUpdate((res)=>{
            var  s = (backgroundAudioManager.currentTime).toFixed(0);
            var currentTime = ''
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
           
            var CurrentTime = 'musicList['+this.data.bofangindex+'].currentTime'; 
            var CurrentWidth = 'musicList['+this.data.bofangindex+'].currentWidth'; 
            let currentWidth = backgroundAudioManager.currentTime/backgroundAudioManager.duration * 410
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
            var CurrentWidth = 'musicList['+this.data.bofangindex+'].currentWidth'; 
            var CurrentTime = 'musicList['+this.data.bofangindex+'].currentTime'; 
            this.setData({
                stop:true,
                [CurrentWidth]:0,
                [CurrentTime]:'00:00',

            })
          
        })
        backgroundAudioManager.onPause(()=>{
            var bofangisPlay = 'musicList['+this.data.bofangindex+'].bofangisPlay'; 
        
            this.setData({
                [bofangisPlay]:false,

            })
       
        })
        backgroundAudioManager.onEnded(()=>{
            var CurrentTime = 'musicList['+this.data.bofangindex+'].currentTime'; 
            var bofangisPlay = 'musicList['+this.data.bofangindex+'].bofangisPlay'; 
            var CurrentWidth = 'musicList['+this.data.bofangindex+'].currentWidth'; 
            this.setData({
                [CurrentTime]:"00:00",
                [bofangisPlay]:false,
                [CurrentWidth]:0,
 
            })
        })
        backgroundAudioManager.onWaiting(()=>{
           backgroundAudioManager.pause()
        })
    
        ///////////////////////////
    },


    


   

   
 



kaishibofang1:function(e){
    var index = e.currentTarget.dataset.index
    var bofangisPlay = 'musicList['+index+'].bofangisPlay'; 
    
    if(this.data.musicList[index].bofangisPlay == false && this.data.bofangindex === '')
    {
    this.setData({
        [bofangisPlay]:true,
        isBofang:true
    })
    this.setData({
        bofangindex:index
    })
    this.jianting()
    backgroundAudioManager.src =this.data.musicList[index].ID
    backgroundAudioManager.title = this.data.musicList[index].title
    backgroundAudioManager.singer = this.data.musicList[index].nickName 
    backgroundAudioManager.coverImgUrl = this.data.musicList[index].userInfoprofilephoto
     }else if(this.data.musicList[index].bofangisPlay == true && this.data.bofangindex == index){
        this.jianting()
        backgroundAudioManager.stop()
        this.setData({
            [bofangisPlay]:false,
            isBofang:false,
            
        })
    }else  if(this.data.musicList[index].bofangisPlay == false && this.data.bofangindex == index)
    {

    this.setData({
        [bofangisPlay]:true,
        isBofang:true
    })
    this.setData({
        bofangindex:index
    })
    this.jianting()
    backgroundAudioManager.src =this.data.musicList[index].ID
    backgroundAudioManager.title = this.data.musicList[index].title
    backgroundAudioManager.singer = this.data.musicList[index].nickName 
    backgroundAudioManager.coverImgUrl = this.data.musicList[index].userInfoprofilephoto
    }
    else if(this.data.musicList[index].bofangisPlay == false && this.data.bofangindex != index){
         var bofangisPlay1 = 'musicList['+this.data.bofangindex+'].bofangisPlay'; 
         var CurrentWidth = 'musicList['+this.data.bofangindex+'].currentWidth'; 
         var CurrentTime = 'musicList['+this.data.bofangindex+'].currentTime'; 
        this.setData({
            [bofangisPlay1]:false,
            isBofang:false,
            stop:true,
            [CurrentWidth]:0,
            [CurrentTime]:'00:00',
        })
                this.setData({
                    [bofangisPlay]:true,
                    isBofang:true,
                    bofangindex:index
                })
                backgroundAudioManager.stop()
                this.jianting()
                backgroundAudioManager.src =this.data.musicList[index].ID
                backgroundAudioManager.title = this.data.musicList[index].title
                backgroundAudioManager.singer = this.data.musicList[index].nickName 
                backgroundAudioManager.coverImgUrl = this.data.musicList[index].userInfoprofilephoto
           
     
       
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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        console.log("1")
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        db.count().then(res=>{
            totalnum = res.total
        })
        this.getDatadb()
    },
           


})
