// pages/search/search.js
const db = wx.cloud.database().collection("musicList")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        musicList:[],
        placeholderContentr:'',//placeholder默认
        hotList:[],//热搜榜数据
        searchContent:'',//用户输入的表单项数据   搜索内容
        searchList:[],//用户搜索结果列表  关键字模糊撇配数据结果
        historyList:[],//用户搜索历史记录
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getdata()
        this.getSearchhistory()
    },
    //获取本地历史搜索记录
    getSearchhistory(){
      let historyList =   wx.getStorageSync('searchHistory')
      if(historyList){
        this.setData({
            historyList
        })
      }
    },
    //获取数据库数据  乐库数据  热搜榜数据
    getdata(){
        let that = this;
        db.limit(20).orderBy("searchNum",'desc').get({
            success(res){
                that.setData({
                    hotList:res.data
                })
            }
        })
        db.orderBy("thumbs",'desc').get({
            success(res){
                that.setData({
                    musicList:res.data
                })
            }
        })
    },
    //表单项内容发生改变的回调
    handleInputChange(event){
        //更新searchContent
        this.setData({
            searchContent:event.detail.value.trim()
        })
        //获取关键字模糊匹配数据
        if(this.data.searchContent != ''){
        const db = wx.cloud.database()
        var that = this
        db.collection('musicList').where({
        //使用正则查询，实现对搜索的模糊查询
        title: db.RegExp({
            regexp: event.detail.value,
            //从搜索栏中获取的value作为规则进行匹配。
            options: 'i',
            //大小写不区分
        }),
        
        }).limit(10).get({
        success: res => {
            that.setData({
                searchList:res.data
            })
        }
        })
    }else{
        this.setData({
            searchList:[]
        })
    }
    },   
    //返回乐库页面
    back(){
        wx.navigateBack()
    },
    //删除搜索历史记录
    deleteHistory(){
        wx.showModal({
            content:'删除搜索记录',
            success:(res)=>{
                if(res.confirm){
                    this.setData({
                        historyList:[]
                    })
                    wx.removeStorageSync('searchHistory')
                }
            }
        })
    },
    //点击热搜榜内容跳转
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
    //点击搜索到的内容跳转
    goDetail1(event){
        //添加记录到本地
        let {historyList} = this.data
        historyList.unshift({
            "title":this.data.searchList[event.currentTarget.dataset.index].title,
            "_id":event.currentTarget.dataset.id
        });          
        this.setData({
            historyList
        })
        wx.setStorageSync('searchHistory',historyList)
        //收集搜索信息
        wx.cloud.callFunction({
            name:"yunhanshu",
            data:{
                action:"search+",
                id:event.currentTarget.dataset.id
            },
            success(res){
             console.log("+成功")
          
            },
            fail(err){
                console.log("+失败",err)
            }
        })
        //跳转页面
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