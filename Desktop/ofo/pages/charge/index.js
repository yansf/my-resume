// pages/charge/index.js
import { Base } from '../../utils/base.js';
var base = new Base();
Page({
  data:{
    inputValue: 0
  },
// 页面加载
  onLoad:function(options){
    console.log(options);
    this.setData({
      from: options.from
    })
    wx.setNavigationBarTitle({
      title: '充值'
    })
  },
// 存储输入的充值金额
  bindInput: function(res){
    this.setData({
      inputValue: res.detail.value
    })  
  },
// 充值
  charges: function(){
    // 必须输入大于0的数字
    var that = this;
    if(parseInt(this.data.inputValue) <= 0 || isNaN(this.data.inputValue)){
      wx.showModal({
        title: "警告",
        content: "请输入金额",
        showCancel: false,
        confirmText: "确定"
      })
    }else{
      var params = {
        url:'user/pay',
        method:'post',
        data:{
          from:this.data.from,
          price:this.data.inputValue
        },
        sCallBack:(res)=>{
          if (that.data.from == 'index') {
            wx.setStorageSync('guarantee', that.data.inputValue);
            wx.switchTab({
              url: '../index/index',
              success: function (res){
                wx.showToast({
                  title: "充值成功",
                  icon: "success",
                  duration: 2000
                });
              }
            })
          } else if (that.data.from == 'wallet') {
            var balance = wx.getStorageSync('balance');
            var price = parseFloat(that.data.inputValue) + parseFloat(balance);
            wx.setStorageSync('balance', price);
            wx.redirectTo({
              url: '../wallet/index',
              success: function (res) {
                wx.showToast({
                  title: "充值成功",
                  icon: "success",
                  duration: 2000
                });
              }
            });
          } else if (that.data.from == 'pay') {
            var balance = wx.getStorageSync('balance');
            var price = parseFloat(that.data.inputValue) + parseFloat(balance);
            wx.setStorageSync('balance', price);
            wx.showToast({
              title: "充值成功",
              icon: "success",
              duration: 10000,
              success: function (res) {
                wx.navigateBack({
                  delta: 1,
                })
              }
            });
          }
        }
      };
      //充值
      base.request(params);
    }
  },
  /*
    * 拉起微信支付
    * params:
    * norderNumber - {int} 订单id
    * return：
    * callback - {obj} 回调方法 ，返回参数 可能值 0:商品缺货等原因导致订单不能支付;  1: 支付失败或者支付取消； 2:支付成功；
    * */
  execPay(orderNumber, callback) {
    var allparams = {
      url: 'pay/pre_order',
      type: 'post',
      data: { id: orderNumber },
      sCallBack: function (res) {
        console.log(res);
        var timeStamp = res.timeStamp;
        if (timeStamp) {
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: res.nonceStr,
            package: res.package,
            signType: res.signType,
            paySign: res.paySign,
            success: function () {
              callback && callback(2);
            },
            fail: function () {
              callback && callback(1);
            }
          });
        } else {
          callback && callback(0);
        }
      }
    }

    this.request(allparams);
  },
  charge: function(){
    var that = this;
    wx.request({
      url: 'https://gongxiang.shier.com.cn/index.php/api/v1/user/pay',
      method:'post',
      data:{
        from: this.data.from,
        price: this.data.inputValue
      },
      header: {
        'content-type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success:function(res) {
        console.log(res);
        var res = res.data;
        var timeStamp = res.timeStamp;
        if (timeStamp) {
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: res.nonceStr,
            package: res.package,
            signType: res.signType,
            paySign: res.paySign,
            success: function (res){
              if (that.data.from == 'index') {
                wx.setStorageSync('guarantee', that.data.inputValue);
                wx.switchTab({
                  url: '../index/index',
                  success: function (res) {
                    wx.showToast({
                      title: "充值成功",
                      icon: "success",
                      duration: 2000
                    });
                  }
                })
              } else if (that.data.from == 'wallet') {
                var balance = wx.getStorageSync('balance');
                var price = parseFloat(that.data.inputValue) + parseFloat(balance);
                wx.setStorageSync('balance', price);
                wx.redirectTo({
                  url: '../wallet/index',
                  success: function (res) {
                    wx.showToast({
                      title: "充值成功",
                      icon: "success",
                      duration: 2000
                    });
                  }
                });
              } else if (that.data.from == 'pay') {
                var balance = wx.getStorageSync('balance');
                var price = parseFloat(that.data.inputValue) + parseFloat(balance);
                wx.setStorageSync('balance', price);
                wx.showToast({
                  title: "充值成功",
                  icon: "success",
                  duration: 10000,
                  success: function (res) {
                    wx.navigateBack({
                      delta: 1,
                    })
                  }
                });
              }
            },
            fail: function () {
              wx.showToast({
                title: "充值失败",
                icon: "error",
                duration: 10000,
                success: function (res) {
                  wx.navigateBack({
                    delta: 1,
                  })
                }
              });
            }
          });
        } else {
          wx.showToast({
            title: "充值失败",
            icon: "error",
            duration: 10000,
            success: function (res) {
              wx.navigateBack({
                delta: 1,
              })
            }
          });
        }
      }
    });
  },
// 页面销毁，更新本地金额，（累加）
  onUnload:function(){
    wx.getStorage({
      key: 'overage',
      success: (res) => {
        wx.setStorage({
          key: 'overage',
          data: {
            overage: parseInt(this.data.inputValue) + parseInt(res.data.overage)
          }
        })
      },
      // 如果没有本地金额，则设置本地金额
      fail: (res) => {
        wx.setStorage({
          key: 'overage',
          data: {
            overage: parseInt(this.data.inputValue)
          },
        })
      }
    }) 
  }
})