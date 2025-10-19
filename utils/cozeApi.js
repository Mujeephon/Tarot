// cozeApi.js
// Coze工作流API调用工具类

/**
 * 调用Coze工作流API进行塔罗占卜
 * @param {Object} data - 占卜所需的用户数据
 * @param {String} data.birthday - 用户生日
 * @param {String} data.gender - 用户性别
 * @param {String} data.city - 用户出生城市
 * @param {String} data.question - 用户占卜问题
 * @returns {Promise} - 返回API调用结果的Promise
 */
function runTarotWorkflow(data) {
  // API密钥和工作流ID（需要替换为实际值）
  const API_KEY = 'pat_ZKIu2EmSi1h82Ekm0ZnoDb3Jiyj3sMqAMRNh6a7uCwL85pEFI84WBNSgO3rGZtqR'; // 请替换为您的实际API密钥
  const WORKFLOW_ID = '7562126322059837481'; // 请替换为您的实际工作流ID
  
  // 构建请求参数 - 根据API文档修改格式
  const requestData = {
    workflow_id: WORKFLOW_ID,
    parameters: {
      birthday: data.birthday,
      gender: data.gender,
      city: data.city,
      question: data.question
    }
  };
  
  // 返回Promise以便异步处理
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://api.coze.cn/v1/workflow/run',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: requestData,
      success: (res) => {
        console.log('工作流调用成功:', res);
        // 检查API返回的状态码和响应码
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          // 处理返回的data字段，它是JSON序列化字符串
          try {
            const parsedData = res.data.data ? JSON.parse(res.data.data) : null;
            // 将解析后的数据放回res.data中
            res.data.parsedData = parsedData;
            resolve(res.data);
          } catch (error) {
            console.error('解析API返回数据失败:', error);
            resolve(res.data); // 即使解析失败也返回原始数据
          }
        } else {
          const errorMsg = res.data && res.data.msg ? res.data.msg : `API调用失败，状态码: ${res.statusCode}`;
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        console.error('工作流调用失败:', err);
        reject(err);
      }
    });
  });
}

module.exports = {
  runTarotWorkflow
};