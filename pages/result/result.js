// result.js
Page({
  data: {
    userInfo: {},
    cards: [],
    interpretation: '',
    loading: true,
    apiResult: null
  },

  onLoad: function(options) {
    const eventChannel = this.getOpenerEventChannel();
    // 监听acceptDataFromInputPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromInputPage', (data) => {
      this.setData({
        userInfo: data,
        apiResult: data.apiResult || null
      }, () => {
        // 如果有API结果，直接使用API结果
        if (this.data.apiResult) {
          this.processApiResult();
        } else {
          // 否则使用本地生成的结果
          this.generateTarotReading();
        }
      });
    });
  },

  // 处理图片加载错误
  handleImageError: function(e) {
    const index = e.currentTarget.dataset.index;
    const defaultCards = this.getDefaultCards();
    const fallbackImage = defaultCards[index % defaultCards.length].image;
    
    // 更新出错的图片
    const cards = this.data.cards;
    cards[index].image = fallbackImage;
    
    this.setData({
      cards: cards
    });
  },

  // 处理API返回的结果
  processApiResult: function() {
    try {
      const apiResult = this.data.apiResult;
      
      // 检查API返回结果中是否包含parsedData
      if (apiResult && apiResult.parsedData) {
        const parsedData = apiResult.parsedData;
        
        // 提取新的输出格式：text和taroPictures
        if (parsedData.text && parsedData.taroPictures) {
          // 处理taroPictures，可能是换行符分隔的字符串或数组
          let imageUrls = [];
          
          if (typeof parsedData.taroPictures === 'string') {
            // 如果是字符串，按换行符拆分
            imageUrls = parsedData.taroPictures.split('\n').filter(url => url.trim() !== '');
          } else if (Array.isArray(parsedData.taroPictures)) {
            // 如果已经是数组，直接使用
            imageUrls = parsedData.taroPictures;
          }
          
          // 确保只使用前三个URL
          imageUrls = imageUrls.slice(0, 3);
          
          // 如果URL不足三个，使用默认图片补充
          while (imageUrls.length < 3) {
            const defaultCards = this.getDefaultCards();
            imageUrls.push(defaultCards[imageUrls.length].image);
          }
          
          // 构建卡片数据
          const cards = imageUrls.map((url, index) => {
            return {
              name: ['过去', '现在', '未来'][index],
              image: url,
              meaning: ''
            };
          });
          
          this.setData({
            cards: cards,
            interpretation: parsedData.text,
            loading: false
          });
          return;
        }
      }
      
      // 如果没有找到新格式的数据，尝试旧格式
      if (apiResult && apiResult.data) {
        const result = apiResult.data;
        
        // 提取卡牌信息
        let cards = [];
        if (result.cards && Array.isArray(result.cards)) {
          cards = result.cards;
        } else {
          // 如果API没有返回卡牌信息，使用默认卡牌
          const allCards = this.getDefaultCards();
          cards = this.getRandomCards(allCards, 3);
        }
        
        // 提取解读文本
        let interpretation = '';
        if (result.interpretation) {
          interpretation = result.interpretation;
        } else {
          // 如果API没有返回解读文本，使用本地生成的解读
          interpretation = this.interpretCards(cards, this.data.userInfo);
        }
        
        this.setData({
          cards: cards,
          interpretation: interpretation,
          loading: false
        });
      } else {
        console.error('API返回结果格式不正确:', apiResult);
        // 如果API结果格式不正确，回退到本地生成
        this.generateTarotReading();
      }
    } catch (error) {
      console.error('处理API结果出错:', error);
      // 出错时回退到本地生成
      this.generateTarotReading();
    }
  },

  // 生成塔罗牌阅读结果
  generateTarotReading: function() {
    // 模拟加载过程
    setTimeout(() => {
      // 获取默认塔罗牌数组
      const allCards = this.getDefaultCards();
      
      // 随机选择三张牌
      const selectedCards = this.getRandomCards(allCards, 3);
      
      // 根据用户信息和选择的牌生成解读
      const interpretation = this.interpretCards(selectedCards, this.data.userInfo);
      
      this.setData({
        cards: selectedCards,
        interpretation: interpretation,
        loading: false
      });
    }, 2000); // 模拟2秒的加载时间
  },
  
  // 获取默认塔罗牌数组
  getDefaultCards: function() {
    return [
      { name: '愚者', image: 'https://img.icons8.com/color/96/tarot-card-the-fool.png', meaning: '新的开始，冒险，自发性' },
      { name: '魔术师', image: 'https://img.icons8.com/color/96/tarot-card-the-magician.png', meaning: '创造力，技能，意志力' },
      { name: '女祭司', image: 'https://img.icons8.com/color/96/tarot-card-high-priestess.png', meaning: '直觉，潜意识，神秘' },
      { name: '女皇', image: 'https://img.icons8.com/color/96/tarot-card-the-empress.png', meaning: '丰收，母性，创造力' },
      { name: '皇帝', image: 'https://img.icons8.com/color/96/tarot-card-the-emperor.png', meaning: '权威，结构，控制' },
      { name: '教皇', image: 'https://img.icons8.com/color/96/tarot-card-hierophant.png', meaning: '传统，信仰，教育' },
      { name: '恋人', image: 'https://img.icons8.com/color/96/tarot-card-the-lovers.png', meaning: '爱情，和谐，选择' },
      { name: '战车', image: 'https://img.icons8.com/color/96/tarot-card-the-chariot.png', meaning: '决心，意志力，胜利' },
      { name: '力量', image: 'https://img.icons8.com/color/96/tarot-card-strength.png', meaning: '勇气，耐心，影响力' },
      { name: '隐士', image: 'https://img.icons8.com/color/96/tarot-card-the-hermit.png', meaning: '内省，寻找，指导' }
    ];
  },
  
  // 随机选择指定数量的塔罗牌
  getRandomCards: function(cards, count) {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },
  
  // 解读塔罗牌
  interpretCards: function(cards, userInfo) {
    // 根据用户信息和牌的组合生成解读
    const { birthday, gender, city, question } = userInfo;
    
    // 简单的解读逻辑，实际应用中可以更复杂
    let interpretation = `亲爱的${gender === '男' ? '先生' : '女士'}，您出生于${birthday}，来自${city}。\n\n`;
    interpretation += `关于您的问题："${question}"\n\n`;
    interpretation += '塔罗牌为您揭示的信息是：\n\n';
    
    // 为每张牌添加解读
    cards.forEach((card, index) => {
      const position = ['过去', '现在', '未来'][index];
      interpretation += `${position}：${card.name} - ${card.meaning}\n`;
      
      // 根据不同的牌添加更详细的解读
      switch(card.name) {
        case '愚者':
          interpretation += '这表明您正在经历或即将开始一段新的旅程。保持开放的心态，接受新的可能性。\n\n';
          break;
        case '魔术师':
          interpretation += '您拥有实现目标所需的所有资源和技能。现在是采取行动的时候了。\n\n';
          break;
        case '女祭司':
          interpretation += '倾听您的直觉，答案就在您的内心深处。这是一个反思和内省的时期。\n\n';
          break;
        case '女皇':
          interpretation += '这是丰收和创造力的时期。关注您的项目和关系，它们将繁荣发展。\n\n';
          break;
        case '皇帝':
          interpretation += '建立结构和秩序将帮助您实现目标。这可能是领导力和权威的象征。\n\n';
          break;
        case '教皇':
          interpretation += '传统和精神指导对您很重要。寻求智慧和教育将带来好处。\n\n';
          break;
        case '恋人':
          interpretation += '您可能面临重要的选择，特别是在关系方面。跟随您的心。\n\n';
          break;
        case '战车':
          interpretation += '通过决心和意志力，您将克服障碍并取得胜利。保持专注。\n\n';
          break;
        case '力量':
          interpretation += '内在的力量和勇气将帮助您度过困难时期。温和但坚定地面对挑战。\n\n';
          break;
        case '隐士':
          interpretation += '这是反思和独处的时期。寻找内在的智慧，它将指引您前进的道路。\n\n';
          break;
        default:
          interpretation += '这张牌在您的生活中有特殊的意义，反思它如何与您的问题相关。\n\n';
      }
    });
    
    interpretation += '记住，塔罗牌提供的是指导，最终的选择和行动仍在您手中。';
    
    return interpretation;
  },
  
  // 返回输入页面
  goBack: function() {
    wx.navigateBack();
  },
  
  // 分享结果
  shareResult: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  }
})