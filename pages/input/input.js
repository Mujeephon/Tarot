// input.js
const cozeApi = require('../../utils/cozeApi');

Page({
  data: {
    birthday: '',
    gender: ['男', '女'],
    genderIndex: 0,
    city: '',
    question: '',
    today: new Date().toISOString().split('T')[0] // 设置日期选择器的最大值为今天
  },

  // 生日选择器变化事件
  bindBirthdayChange: function(e) {
    this.setData({
      birthday: e.detail.value
    })
  },

  // 性别选择器变化事件
  bindGenderChange: function(e) {
    this.setData({
      genderIndex: e.detail.value
    })
  },

  // 城市输入事件
  bindCityInput: function(e) {
    this.setData({
      city: e.detail.value
    })
  },

  // 问题输入事件
  bindQuestionInput: function(e) {
    this.setData({
      question: e.detail.value
    })
  },

  // 提交表单，进行占卜
  submitForm: function() {
    const { birthday, gender, genderIndex, city, question } = this.data;
    
    // 表单验证
    if (!birthday) {
      wx.showToast({
        title: '请选择生日',
        icon: 'none'
      });
      return;
    }
    
    if (!city) {
      wx.showToast({
        title: '请输入出生城市',
        icon: 'none'
      });
      return;
    }
    
    if (!question) {
      wx.showToast({
        title: '请输入占卜问题',
        icon: 'none'
      });
      return;
    }
    
    // 准备传递给结果页面的数据，确保所有字段都是字符串类型
    const formData = {
      birthday: String(birthday),
      gender: String(this.data.gender[genderIndex]),
      city: String(city),
      question: String(question)
    };
    
    // 显示加载提示
    wx.showLoading({
      title: '正在占卜中...',
      mask: true
    });
    
    // 调用Coze工作流API
    cozeApi.runTarotWorkflow(formData)
      .then(result => {
        console.log('占卜结果:', result);
        
        // 将API结果添加到表单数据中
        formData.apiResult = result;
        
        // 导航到结果页面，并传递数据
        wx.navigateTo({
          url: '../result/result',
          success: function(res) {
            // 通过eventChannel向被打开页面传送数据
            res.eventChannel.emit('acceptDataFromInputPage', formData);
          }
        });
      })
      .catch(error => {
        console.error('占卜API调用失败:', error);
        wx.showToast({
          title: '占卜失败，请稍后再试',
          icon: 'none'
        });
      })
      .finally(() => {
        // 隐藏加载提示
        wx.hideLoading();
      });
  }
})