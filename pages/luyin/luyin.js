// pages/luyin/luyin.js
const db1 = wx.cloud.database().collection("userInfo")
const db = wx.cloud.database().collection("musicList")
const innerAudioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()
Page({

    /**
     * 页面的初始数据
     */
    data: {
    minute: '0' + 0,   // 分
    second: '0' + 0,    // 秒
    Inputtitle:'',
    Inputcontent:'',
    title:'',
    context:'',
    isbofangurl:false,
    bofangurl:'',
    isbofang:'',
    isSpeaking:false,
    userInfoprofilephoto:'',
    nickName:'',
    openid:'',
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getDatabd1()
        this.getopenid()
        this.jianting()
    },
    //监听
    jianting(){
        innerAudioContext.onEnded(()=>{
            this.setData({
                isbofang:false
            })
            })
            innerAudioContext.onStop(()=>{
                this.setData({
                    isbofang:false
                })
            })
                innerAudioContext.onPause(()=>{
                this.setData({
                    isbofang:false
                })
            })
            
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
                // console.log(that.data.openid)
            },
            fail(err){
                console.log("openid失败",err)
            }
        })

    },   
    //获取数据库数据
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
    //录音计时器
    setInterval: function () {
        const that = this
        var second = that.data.second
        var minute = that.data.minute
        //归零     
        setInterval(function () {  // 设置定时器
            if(that.data.isSpeaking == true){
              if(minute < 2 ){
                second++
                if (second >= 60 ) {
                    second = 0  //  大于等于60秒归零
                    minute++
                    if (minute < 10) {
                        // 少于10补零
                        that.setData({
                            minute: '0' + minute
                        })
                    } else {
                        that.setData({
                            minute: minute
                        })
                    }
                }
                if (second < 10 ) {
                    // 少于10补零
                    that.setData({
                        second: '0' + second
                    })
                } else {
                    that.setData({
                        second: second
                    })
                }
              }else if(minute >=2){
                second = '0' + 0
              }
            }else if(that.data.isSpeaking == false){
                second = '0' + 0
            }
        }, 1000)
    },
    //录音 播放本地录音 上传
luyin:function(e){
    innerAudioContext.stop()
    if(this.data.isSpeaking == false){
        //初始化定时器
        this.setData({
            bofangurl:'',
            minute: '0' + 0,   // 分
            second: '0' + 0,    // 秒
         })
        // console.log("开始录音")
        const options = {
            duration:120000,//录音时长2分钟 单位ms 最大值10分钟
            sampleRate:16000, //采样率
            numberOfChannels:1,//录音通道数 默认为2
            encodeBitRate:96000,//编码码率 默认48000
            format:'mp3',//音频格式 默认aac
            frameSize:50//指定帧大小 单位KB
        };
        recorderManager.start(options);//开始录音
        this.setInterval()
        this.setData({
            isSpeaking:true
        })
    }else if(this.data.isSpeaking == true){
         // console.log("结束录音")
         var that = this;
         recorderManager.stop();//结束录音
         this.setData({
             isSpeaking:false
         })
     recorderManager.onStop((res) => { //监听录音停止的事件
         // console.log("监听录音结束的事件",res)
         if(res.duration < 3000){
             wx.showToast({
               title: '录音时间太短',
               icon: 'none',
               duration: 1000
             })
                   //初始化定时器
        this.setData({
            minute: '0' + 0,   // 分
            second: '0' + 0,    // 秒
         })
             return;
         } else {
             
            var  s = (res.duration/1000).toFixed(0);
            var duration = ''
            var m = 0
           if(s>=60 && s<70){
           s= s-60
           m=1
           duration = "0"+[m]+":"+"0"+s
           }else if(s>=70 && s<120){
           duration = "0"+[m]+":"+s
           }else if(s>=120){
             m=2
             duration = "0"+[m]+":"+"0"+"0"
           }
           else if(s<10){
          duration = "0"+[m]+":"+"0"+s
          }else if(s>=10){
          duration ="0"+[m]+":"+s
          }
             this.setData({
                 bofangurl:res.tempFilePath,
                 duration:duration,
                 isbofang:false,
             })
         }
     })
    }
},
kaishibofang:function(e){
    if(this.data.bofangurl != '' ){
    innerAudioContext.src = this.data.bofangurl
    if(this.data.isbofang == false){
    // console.log("开始播放",e)
    this.setData({
        isbofang:true
    })
    innerAudioContext.play()
    }else if(this.data.isbofang == true){
        this.setData({
            isbofang:false
        })
        innerAudioContext.pause()
    }
    }else if(this.data.bofangurl == ''){
        wx.showToast({
          title: '没有什么可以播放~',
          icon:'none'
        })
    }
},
uploadMusic(){
    if (this.data.bofangurl !='') {
        if (this.data.openid  !='' && this.data.userInfoprofilephoto !='' && this.data.nickName !='') {
           if(this.data.title != '' )
           {
            wx.showLoading({
                title: '上传中...',
              });
            wx.cloud.uploadFile({
                cloudPath:'luyin/' + new Date().getTime() +'music.mp3',
                filePath:this.data.bofangurl,
                
                success: res => {
                     this.setData({
                        cloudPath:res.fileID,
                     })
                    //  console.log("a",this.data.bofangurl)
                     //上传数据库
                    this.addData()
                    this.setData({
                        minute: '0' + 0,   // 分
                        second: '0' + 0,    // 秒
                        bofangurl:'',
                        title:'',
                        content:'',
                        duration:'',
                        Inputcontent:'',
                        Inputtitle:'',
                    })
                    wx.hideLoading();
                    wx.showToast({
                        title:'上传成功',
                        icon: 'success',
                        duration: 2000
                    })
                },
                fail: err =>{
                    wx.showToast({
                        title: '上传失败，请检查网络',
                        icon: 'none',
                        duration: 2000
                      });
                }
                
            })
           }else{
            wx.showToast({
                title: '标题不能为空',
                icon: 'none',
                duration: 2000
              });
           }
        } else{
            wx.showToast({
                title: '您还没有登录~',
                icon: 'none',
                duration: 2000
              });
        }
    }else{
        wx.showToast({
            title: '您还没有录音，没有什么可以上传~',
            icon: 'none',
            duration: 2000
          });
    }
    
    
},

//添加到数据库  头像 昵称 录音ID
addData(){
           let that = this
            db.add({
            data:{
                "userInfoprofilephoto":that.data.userInfoprofilephoto,
                "nickName":that.data.nickName,
                "ID":that.data.cloudPath,
                "pinglun":[],
                "thumbs":0,
                "zhuanfanum":0,
                "bofangisPlay":false,
                "thumbslist":[],
                "duration":that.data.duration,
                "currentTime":'00:00',
                "currentWidth":0,
                "title":that.data.title,
                "content":that.data.content,
                "searchNum":0,      
             }
            })
        
},
getTitleContent(res){
    this.setData({
        title:res.detail.value
    })
},
getContent(res){
    this.setData({
        content:res.detail.value
    })
},
//跳转到搜索页面
toSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
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
        this.getDatabd1()
        this.getopenid()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        innerAudioContext.pause()
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