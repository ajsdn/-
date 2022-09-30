// app.js
App({
  globalData: {
    userInfo: null,
    urls:'http://localhost:3000'
  },
  onLaunch() {
    //云开发初始化
    wx.cloud.init({
      env:"cloud1-5gimwurv2bc8ea74",
    })

  },

})
