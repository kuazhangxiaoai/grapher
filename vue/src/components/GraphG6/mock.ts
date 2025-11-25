// 生成丰富的知识图谱数据
export function generateMockData() {
  return {
    nodes: [
      // 人物节点
      {
        id: "person1",
        data: {
          name: "爱因斯坦",
          description: "阿尔伯特·爱因斯坦，著名物理学家，相对论的创立者。",
          birth: "1879-03-14",
          death: "1955-04-18",
          source_id: "p001",
          entityType: "person",
          attributes: {
            nationality: "德国/美国",
            field: "物理学",
            awards: ["诺贝尔物理学奖"],
          },
        },
        style: {
          // icon: true,
          // src: "https://file.dev.agentsyun.com/ai-public-bucket/2025/05/17/0cbf6bc0-3f72-426f-aacd-6b6a81b6463a_1747467717_347aba3e-9610-4418-a8df-4da19ad4d422.jpeg",
          // iconSrc:
          // "https://file.dev.agentsyun.com/ai-public-bucket/2025/05/17/0cbf6bc0-3f72-426f-aacd-6b6a81b6463a_1747467717_347aba3e-9610-4418-a8df-4da19ad4d422.jpeg",
          // iconWidth: 48,
          // iconHeight: 48,
          // iconRadius: 50
        },
      },
      {
        id: "person2",
        data: {
          name: "居里夫人",
          description: "玛丽·居里，物理学家和化学家，放射性研究先驱。",
          birth: "1867-11-07",
          death: "1934-07-04",
          source_id: "p002",
          entityType: "person",
          attributes: {
            nationality: "波兰/法国",
            field: "物理学,化学",
            awards: ["诺贝尔物理学奖", "诺贝尔化学奖"],
          },
        },
      },
      {
        id: "person3",
        data: {
          name: "图灵",
          description: "艾伦·图灵，计算机科学和人工智能之父。",
          birth: "1912-06-23",
          death: "1954-06-07",
          source_id: "p003",
          entityType: "person",
          attributes: {
            nationality: "英国",
            field: "计算机科学,数学",
            awards: ["图灵奖以他命名"],
          },
        },
      },
      {
        id: "person4",
        data: {
          name: "霍金",
          description: "史蒂芬·霍金，理论物理学家，黑洞辐射理论提出者。",
          birth: "1942-01-08",
          death: "2018-03-14",
          source_id: "p004",
          entityType: "person",
          attributes: {
            nationality: "英国",
            field: "理论物理学,宇宙学",
            awards: ["科普利奖章", "沃尔夫物理学奖"],
          },
        },
      },

      // 理论/发现节点
      {
        id: "theory1",
        data: {
          name: "相对论",
          description:
            "由爱因斯坦提出的物理学理论，包括狭义相对论和广义相对论。",
          year: "1905-1915",
          source_id: "t001",
          entityType: "theory",
          attributes: {
            field: "物理学",
            impact: "改变了人类对时间、空间和引力的理解",
          },
        },
      },
      {
        id: "theory2",
        data: {
          name: "量子力学",
          description: "描述微观粒子行为的物理学分支。",
          year: "1920-1930",
          source_id: "t002",
          entityType: "theory",
          attributes: {
            field: "物理学",
            impact: "影响了现代科技发展，如电子学和计算机科学",
          },
        },
      },
      {
        id: "discovery1",
        data: {
          name: "镭的发现",
          description: "由皮埃尔·居里和玛丽·居里发现的放射性元素。",
          year: "1898",
          source_id: "d001",
          entityType: "discovery",
          attributes: {
            field: "化学,物理学",
            impact: "推动了放射性研究和核物理学的发展",
          },
        },
      },
      {
        id: "concept1",
        data: {
          name: "图灵机",
          description: "由图灵提出的抽象计算模型，为计算机奠定了理论基础。",
          year: "1936",
          source_id: "c001",
          entityType: "concept",
          attributes: {
            field: "计算机科学,数学",
            impact: "为计算机科学提供了理论基础",
          },
        },
      },
      {
        id: "concept2",
        data: {
          name: "图灵测试",
          description: "评估机器是否具有与人类相当的智能的测试。",
          year: "1950",
          source_id: "c002",
          entityType: "concept",
          attributes: {
            field: "人工智能",
            impact: "成为人工智能研究的重要概念",
          },
        },
      },
      {
        id: "theory3",
        data: {
          name: "霍金辐射",
          description: "霍金提出的黑洞会发出辐射并最终蒸发的理论。",
          year: "1974",
          source_id: "t003",
          entityType: "theory",
          attributes: {
            field: "理论物理学,宇宙学",
            impact: "改变了科学界对黑洞的认识",
          },
        },
      },

      // 机构节点
      {
        id: "org1",
        data: {
          name: "普林斯顿高等研究院",
          description: "位于美国的著名研究机构，爱因斯坦晚年工作的地方。",
          founded: "1930",
          source_id: "o001",
          entityType: "organization",
          attributes: {
            location: "美国,新泽西州",
            type: "研究机构",
          },
        },
      },
      {
        id: "org2",
        data: {
          name: "巴黎大学",
          description: "玛丽·居里曾在此工作和教学的著名学府。",
          founded: "1150",
          source_id: "o002",
          entityType: "organization",
          attributes: {
            location: "法国,巴黎",
            type: "大学",
          },
        },
      },
      {
        id: "org3",
        data: {
          name: "剑桥大学",
          description: "英国著名学府，图灵和霍金都曾在此学习和工作。",
          founded: "1209",
          source_id: "o003",
          entityType: "organization",
          attributes: {
            location: "英国,剑桥",
            type: "大学",
          },
        },
      },

      // 出版物节点
      {
        id: "pub1",
        data: {
          name: "狭义相对论",
          description: "爱因斯坦1905年发表的关于狭义相对论的论文。",
          year: "1905",
          source_id: "pb001",
          entityType: "publication",
          attributes: {
            type: "科学论文",
            journal: "物理学年鉴",
          },
        },
      },
      {
        id: "pub2",
        data: {
          name: "论计算数字在决断问题中的应用",
          description: "图灵1936年发表的引入图灵机概念的论文。",
          year: "1936",
          source_id: "pb002",
          entityType: "publication",
          attributes: {
            type: "科学论文",
            journal: "伦敦数学学会会报",
          },
        },
      },
      {
        id: "pub3",
        data: {
          name: "时间简史",
          description: "霍金撰写的著名科普著作，介绍宇宙学的基本概念。",
          year: "1988",
          source_id: "pb003",
          entityType: "publication",
          attributes: {
            type: "科普著作",
            publisher: "班塔姆书籍",
          },
        },
      },
    ],
    edges: [
      // 人物与理论/发现的关系
      {
        id: "edge1",
        source: "person1", // 爱因斯坦
        target: "theory1", // 相对论
        data: {
          name: "提出",
          description:
            "爱因斯坦于1905年提出了狭义相对论，并于1915年完成了广义相对论。",
          year: "1905-1915",
        },
      },
      {
        id: "edge2",
        source: "person1", // 爱因斯坦
        target: "theory2", // 量子力学
        data: {
          name: "贡献者",
          description:
            "爱因斯坦对早期量子理论做出了重要贡献，尽管他后来对量子力学的完整解释持怀疑态度。",
          year: "1905",
        },
      },
      {
        id: "edge3",
        source: "person2", // 居里夫人
        target: "discovery1", // 镭的发现
        data: {
          name: "发现者",
          description: "玛丽·居里与丈夫皮埃尔·居里一起发现了镭元素。",
          year: "1898",
        },
      },
      {
        id: "edge4",
        source: "person3", // 图灵
        target: "concept1", // 图灵机
        data: {
          name: "创立",
          description: "图灵在1936年的论文中提出了图灵机的概念。",
          year: "1936",
        },
      },
      {
        id: "edge5",
        source: "person3", // 图灵
        target: "concept2", // 图灵测试
        data: {
          name: "提出",
          description:
            "图灵在1950年提出了衡量机器智能的方法，后来被称为图灵测试。",
          year: "1950",
        },
      },
      {
        id: "edge6",
        source: "person4", // 霍金
        target: "theory3", // 霍金辐射
        data: {
          name: "提出",
          description: "霍金在1974年提出黑洞可能会发出辐射的理论。",
          year: "1974",
        },
      },

      // 人物与机构的关系
      {
        id: "edge7",
        source: "person1", // 爱因斯坦
        target: "org1", // 普林斯顿高等研究院
        data: {
          name: "任职",
          description:
            "爱因斯坦从1933年起在普林斯顿高等研究院工作，直到1955年去世。",
          year: "1933-1955",
        },
      },
      {
        id: "edge8",
        source: "person2", // 居里夫人
        target: "org2", // 巴黎大学
        data: {
          name: "任职",
          description: "玛丽·居里在巴黎大学任教并进行研究。",
          year: "1906-1934",
        },
      },
      {
        id: "edge9",
        source: "person3", // 图灵
        target: "org3", // 剑桥大学
        data: {
          name: "就读&任职",
          description: "图灵在剑桥大学国王学院学习，后来在该校担任研究员。",
          year: "1931-1939",
        },
      },
      {
        id: "edge10",
        source: "person4", // 霍金
        target: "org3", // 剑桥大学
        data: {
          name: "就读&任职",
          description:
            "霍金在剑桥大学完成学业，并在那里度过了他的学术生涯大部分时间。",
          year: "1962-2018",
        },
      },

      // 人物与出版物的关系
      {
        id: "edge11",
        source: "person1", // 爱因斯坦
        target: "pub1", // 狭义相对论论文
        data: {
          name: "作者",
          description: "爱因斯坦撰写并发表了关于狭义相对论的开创性论文。",
          year: "1905",
        },
      },
      {
        id: "edge12",
        source: "person3", // 图灵
        target: "pub2", // 图灵机论文
        data: {
          name: "作者",
          description: "图灵发表了引入图灵机概念的论文。",
          year: "1936",
        },
      },
      {
        id: "edge13",
        source: "person4", // 霍金
        target: "pub3", // 时间简史
        data: {
          name: "作者",
          description: "霍金撰写了《时间简史》这本畅销科普著作。",
          year: "1988",
        },
      },

      // 概念/理论之间的关系
      {
        id: "edge14",
        source: "theory1", // 相对论
        target: "theory2", // 量子力学
        data: {
          name: "理论冲突",
          description:
            "相对论和量子力学是现代物理学的两大支柱，但在某些方面存在理论冲突。",
          year: "1920-至今",
        },
      },
      {
        id: "edge15",
        source: "concept1", // 图灵机
        target: "concept2", // 图灵测试
        data: {
          name: "概念关联",
          description:
            "图灵机和图灵测试都是图灵在计算机科学和人工智能领域的重要贡献。",
          year: "",
        },
      },

      // 人物之间的关系
      {
        id: "edge16",
        source: "person1", // 爱因斯坦
        target: "person2", // 居里夫人
        data: {
          name: "同时代科学家",
          description: "爱因斯坦和居里夫人都是20世纪初期活跃的著名物理学家。",
          year: "",
        },
      },
      {
        id: "edge17",
        source: "person3", // 图灵
        target: "person4", // 霍金
        data: {
          name: "学术传承",
          description:
            "两人都在剑桥大学有重要贡献，代表了不同时期英国科学界的杰出成就。",
          year: "",
        },
      },

      // 出版物与理论的关系
      {
        id: "edge18",
        source: "pub1", // 狭义相对论论文
        target: "theory1", // 相对论
        data: {
          name: "阐述",
          description: "这篇论文首次系统阐述了狭义相对论的核心概念。",
          year: "1905",
        },
      },
      {
        id: "edge19",
        source: "pub2", // 图灵机论文
        target: "concept1", // 图灵机
        data: {
          name: "阐述",
          description: "这篇论文首次提出并详细描述了图灵机的概念。",
          year: "1936",
        },
      },
      {
        id: "edge20",
        source: "pub3", // 时间简史
        target: "theory3", // 霍金辐射
        data: {
          name: "普及",
          description: "《时间简史》中介绍了霍金辐射等理论物理学概念。",
          year: "1988",
        },
      },

      // 其他有趣的关联
      {
        id: "edge21",
        source: "theory1", // 相对论
        target: "theory3", // 霍金辐射
        data: {
          name: "理论基础",
          description: "霍金的黑洞理论部分建立在爱因斯坦广义相对论的基础上。",
          year: "",
        },
      },
      {
        id: "edge22",
        source: "discovery1", // 镭的发现
        target: "theory2", // 量子力学
        data: {
          name: "科学影响",
          description:
            "放射性元素的研究为早期量子理论的发展提供了重要实验基础。",
          year: "",
        },
      },
      {
        id: "edge23",
        source: "concept1", // 图灵机
        target: "org1", // 普林斯顿
        data: {
          name: "学术联系",
          description:
            "图灵在普林斯顿大学完成了他的博士学位，与该地区的高等研究院有学术联系。",
          year: "1936-1938",
        },
      },
    ],
  };
}

// 生成AI领域的知识图谱数据
export function generateAIKnowledgeGraph() {
  return {
    nodes: [
      // 人物节点
      {
        id: "person1",
        data: {
          name: "约翰·麦卡锡",
          description: "人工智能领域的创始人之一，提出了'人工智能'这一术语。",
          birth: "1927-09-04",
          death: "2011-10-24",
          source_id: "p001",
          entityType: "person",
          attributes: {
            nationality: "美国",
            field: "计算机科学,人工智能",
            awards: ["图灵奖"],
          },
        },
      },
      {
        id: "person2",
        data: {
          name: "杰弗里·辛顿",
          description: "深度学习的先驱，神经网络研究的领军人物。",
          birth: "1947-12-06",
          death: "2023-05-02",
          source_id: "p002",
          entityType: "person",
          attributes: {
            nationality: "英国/加拿大",
            field: "机器学习,深度学习",
            awards: ["图灵奖", "IEEE神经网络先驱奖"],
          },
        },
      },
      {
        id: "person3",
        data: {
          name: "安德鲁·吴",
          description: "AI研究者，百度前首席科学家，在深度学习领域有重要贡献。",
          birth: "1976-10-27",
          death: "",
          source_id: "p003",
          entityType: "person",
          attributes: {
            nationality: "美国",
            field: "机器学习,深度学习",
            awards: ["麻省理工科技评论35岁以下创新者"],
          },
        },
      },
      {
        id: "person4",
        data: {
          name: "姚期智",
          description: "计算机科学家，量子计算和计算复杂性理论专家。",
          birth: "1946-12-24",
          death: "",
          source_id: "p004",
          entityType: "person",
          attributes: {
            nationality: "中国",
            field: "量子计算,算法理论",
            awards: ["图灵奖", "国家最高科学技术奖"],
          },
        },
      },
      {
        id: "person5",
        data: {
          name: "李飞飞",
          description: "计算机视觉专家，ImageNet创建者。",
          birth: "1976-10-16",
          death: "",
          source_id: "p005",
          entityType: "person",
          attributes: {
            nationality: "美国/中国",
            field: "计算机视觉,人工智能",
            awards: ["IEEE技术成就奖"],
          },
        },
      },

      // 理论/技术节点
      {
        id: "theory1",
        data: {
          name: "机器学习",
          description: "使计算机系统能够基于经验自动提高性能的研究领域。",
          year: "1959-至今",
          source_id: "t001",
          entityType: "theory",
          attributes: {
            field: "人工智能",
            impact: "为AI系统提供了从数据中学习的能力",
          },
        },
      },
      {
        id: "theory2",
        data: {
          name: "深度学习",
          description: "基于多层人工神经网络的机器学习子领域。",
          year: "2006-至今",
          source_id: "t002",
          entityType: "theory",
          attributes: {
            field: "机器学习",
            impact: "彻底改变了计算机视觉、自然语言处理等领域",
          },
        },
      },
      {
        id: "theory3",
        data: {
          name: "强化学习",
          description: "通过与环境交互学习最优策略的机器学习方法。",
          year: "1980s-至今",
          source_id: "t003",
          entityType: "theory",
          attributes: {
            field: "机器学习",
            impact: "在游戏AI、机器人控制等领域有重要应用",
          },
        },
      },
      {
        id: "technology1",
        data: {
          name: "大型语言模型",
          description: "基于Transformer架构的大规模预训练语言模型。",
          year: "2018-至今",
          source_id: "tech001",
          entityType: "technology",
          attributes: {
            field: "自然语言处理",
            impact: "革命性地改变了人机交互和信息处理方式",
          },
        },
      },
      {
        id: "technology2",
        data: {
          name: "计算机视觉",
          description: "使计算机能够理解和处理视觉信息的技术。",
          year: "1960s-至今",
          source_id: "tech002",
          entityType: "technology",
          attributes: {
            field: "人工智能",
            impact: "在医疗诊断、自动驾驶等领域有广泛应用",
          },
        },
      },
      {
        id: "concept1",
        data: {
          name: "神经网络",
          description: "受人脑结构启发的计算模型，由连接的节点层组成。",
          year: "1943-至今",
          source_id: "c001",
          entityType: "concept",
          attributes: {
            field: "人工智能,机器学习",
            impact: "为深度学习奠定了基础",
          },
        },
      },
      {
        id: "concept2",
        data: {
          name: "图灵测试",
          description: "由图灵提出的评估机器是否具有与人类相当智能的测试。",
          year: "1950",
          source_id: "c002",
          entityType: "concept",
          attributes: {
            field: "人工智能",
            impact: "为人工智能研究提供了目标和评估标准",
          },
        },
      },

      // 应用节点
      {
        id: "application1",
        data: {
          name: "ChatGPT",
          description: "由OpenAI开发的大型语言模型，能够进行自然对话。",
          year: "2022",
          source_id: "a001",
          entityType: "application",
          attributes: {
            field: "自然语言处理",
            developer: "OpenAI",
            impact: "引发了生成式AI的广泛应用热潮",
          },
        },
      },
      {
        id: "application2",
        data: {
          name: "自动驾驶",
          description: "使用AI技术实现的车辆自主导航和控制系统。",
          year: "2010s-至今",
          source_id: "a002",
          entityType: "application",
          attributes: {
            field: "机器人学,计算机视觉",
            developer: "多家企业",
            impact: "正在改变交通和运输行业",
          },
        },
      },
      {
        id: "application3",
        data: {
          name: "AlphaGo",
          description: "由DeepMind开发的围棋AI，首次击败人类世界冠军。",
          year: "2016",
          source_id: "a003",
          entityType: "application",
          attributes: {
            field: "强化学习,深度学习",
            developer: "DeepMind",
            impact: "展示了AI在复杂决策任务中的能力",
          },
        },
      },

      // 机构节点
      {
        id: "org1",
        data: {
          name: "OpenAI",
          description: "致力于安全友好的通用人工智能研究的组织。",
          founded: "2015",
          source_id: "o001",
          entityType: "organization",
          attributes: {
            location: "美国,旧金山",
            type: "研究公司",
          },
        },
      },
      {
        id: "org2",
        data: {
          name: "DeepMind",
          description: "专注于AI研究和应用的公司，现为Alphabet子公司。",
          founded: "2010",
          source_id: "o002",
          entityType: "organization",
          attributes: {
            location: "英国,伦敦",
            type: "研究公司",
          },
        },
      },
      {
        id: "org3",
        data: {
          name: "斯坦福大学AI实验室",
          description: "世界顶级的AI研究机构之一。",
          founded: "1962",
          source_id: "o003",
          entityType: "organization",
          attributes: {
            location: "美国,加利福尼亚",
            type: "大学研究机构",
          },
        },
      },
      {
        id: "org4",
        data: {
          name: "清华大学人工智能研究院",
          description: "中国顶级的人工智能研究机构。",
          founded: "2018",
          source_id: "o004",
          entityType: "organization",
          attributes: {
            location: "中国,北京",
            type: "大学研究机构",
          },
        },
      },

      // 出版物节点
      {
        id: "pub1",
        data: {
          name: "Attention Is All You Need",
          description:
            "介绍Transformer架构的论文，为现代大型语言模型奠定基础。",
          year: "2017",
          source_id: "pb001",
          entityType: "publication",
          attributes: {
            type: "科学论文",
            publisher: "NeurIPS",
          },
        },
      },
      {
        id: "pub2",
        data: {
          name: "深度学习",
          description:
            "由Ian Goodfellow、Yoshua Bengio和Aaron Courville撰写的深度学习教科书。",
          year: "2016",
          source_id: "pb002",
          entityType: "publication",
          attributes: {
            type: "教科书",
            publisher: "MIT出版社",
          },
        },
      },
      {
        id: "pub3",
        data: {
          name: "ImageNet Classification with Deep CNNs",
          description:
            "介绍AlexNet的论文，被认为是深度学习在计算机视觉领域突破的标志。",
          year: "2012",
          source_id: "pb003",
          entityType: "publication",
          attributes: {
            type: "科学论文",
            publisher: "NeurIPS",
          },
        },
      },
    ],
    edges: [
      // 人物与理论/技术的关系
      {
        id: "edge1",
        source: "person1", // 约翰·麦卡锡
        target: "theory1", // 机器学习
        data: {
          relationship: "奠基人之一",
          description:
            "麦卡锡是AI领域早期的重要开拓者，对机器学习概念的发展有贡献。",
          year: "1950s-1960s",
        },
      },
      {
        id: "edge2",
        source: "person2", // 杰弗里·辛顿
        target: "theory2", // 深度学习
        data: {
          relationship: "先驱研究者",
          description:
            "辛顿是深度学习的主要推动者之一，特别是在2006年通过深度信念网络重振神经网络研究。",
          year: "2006",
        },
      },
      {
        id: "edge3",
        source: "person2", // 杰弗里·辛顿
        target: "concept1", // 神经网络
        data: {
          relationship: "重要贡献者",
          description: "辛顿在神经网络理论和实践方面做出了诸多重要贡献。",
          year: "1980s-2020s",
        },
      },
      {
        id: "edge4",
        source: "person3", // 安德鲁·吴
        target: "theory2", // 深度学习
        data: {
          relationship: "重要研究者",
          description:
            "吴在深度学习领域做出重要贡献，尤其是在自动驾驶和语音识别方面。",
          year: "2010s",
        },
      },
      {
        id: "edge5",
        source: "person5", // 李飞飞
        target: "technology2", // 计算机视觉
        data: {
          relationship: "领军人物",
          description:
            "李飞飞通过创建ImageNet数据集，对计算机视觉领域发展做出了重大贡献。",
          year: "2009-至今",
        },
      },

      // 人物与机构的关系
      {
        id: "edge6",
        source: "person3", // 安德鲁·吴
        target: "org1", // OpenAI
        data: {
          relationship: "联合创始人之一",
          description: "吴是OpenAI的早期重要成员。",
          year: "2015",
        },
      },
      {
        id: "edge7",
        source: "person5", // 李飞飞
        target: "org3", // 斯坦福大学AI实验室
        data: {
          relationship: "教授/主任",
          description: "李飞飞在斯坦福大学AI实验室担任重要职务。",
          year: "2013-至今",
        },
      },
      {
        id: "edge8",
        source: "person4", // 姚期智
        target: "org4", // 清华大学人工智能研究院
        data: {
          relationship: "创始主任",
          description:
            "姚期智作为清华大学交叉信息研究院院长，在AI研究领域有重要影响。",
          year: "2018-至今",
        },
      },

      // 技术与应用的关系
      {
        id: "edge9",
        source: "technology1", // 大型语言模型
        target: "application1", // ChatGPT
        data: {
          relationship: "技术支撑",
          description: "ChatGPT是基于大型语言模型技术开发的应用。",
          year: "2022",
        },
      },
      {
        id: "edge10",
        source: "theory3", // 强化学习
        target: "application3", // AlphaGo
        data: {
          relationship: "核心技术",
          description: "AlphaGo使用强化学习作为其核心算法之一。",
          year: "2016",
        },
      },
      {
        id: "edge11",
        source: "technology2", // 计算机视觉
        target: "application2", // 自动驾驶
        data: {
          relationship: "关键技术",
          description: "计算机视觉是自动驾驶系统的关键组成部分。",
          year: "2010s-至今",
        },
      },

      // 理论与概念的关系
      {
        id: "edge12",
        source: "theory1", // 机器学习
        target: "theory2", // 深度学习
        data: {
          relationship: "包含关系",
          description: "深度学习是机器学习的一个子领域。",
          year: "",
        },
      },
      {
        id: "edge13",
        source: "theory1", // 机器学习
        target: "theory3", // 强化学习
        data: {
          relationship: "包含关系",
          description: "强化学习是机器学习的一个重要分支。",
          year: "",
        },
      },
      {
        id: "edge14",
        source: "concept1", // 神经网络
        target: "theory2", // 深度学习
        data: {
          relationship: "基础技术",
          description: "神经网络是深度学习的基础。",
          year: "",
        },
      },

      // 组织与应用的关系
      {
        id: "edge15",
        source: "org1", // OpenAI
        target: "application1", // ChatGPT
        data: {
          relationship: "开发者",
          description: "OpenAI开发了ChatGPT。",
          year: "2022",
        },
      },
      {
        id: "edge16",
        source: "org2", // DeepMind
        target: "application3", // AlphaGo
        data: {
          relationship: "开发者",
          description: "DeepMind开发了AlphaGo。",
          year: "2016",
        },
      },

      // 出版物与理论/技术的关系
      {
        id: "edge17",
        source: "pub1", // Attention Is All You Need
        target: "technology1", // 大型语言模型
        data: {
          relationship: "奠基论文",
          description:
            "该论文介绍的Transformer架构成为现代大型语言模型的基础。",
          year: "2017",
        },
      },
      {
        id: "edge18",
        source: "pub2", // 深度学习教科书
        target: "theory2", // 深度学习
        data: {
          relationship: "系统阐述",
          description: "该书系统地阐述了深度学习的理论和实践。",
          year: "2016",
        },
      },
      {
        id: "edge19",
        source: "pub3", // ImageNet Classification with Deep CNNs
        target: "technology2", // 计算机视觉
        data: {
          relationship: "重要突破",
          description: "该论文展示了深度学习在计算机视觉领域的突破性进展。",
          year: "2012",
        },
      },

      // 人物与人物的关系
      {
        id: "edge20",
        source: "person2", // 杰弗里·辛顿
        target: "person3", // 安德鲁·吴
        data: {
          relationship: "导师-学生",
          description: "吴曾是辛顿的学生，后来成为深度学习领域的重要研究者。",
          year: "2000s",
        },
      },

      // 人物与出版物的关系
      {
        id: "edge21",
        source: "person2", // 杰弗里·辛顿
        target: "pub2", // 深度学习教科书
        data: {
          relationship: "贡献者",
          description: "辛顿对深度学习领域的贡献在该书中有详细介绍。",
          year: "2016",
        },
      },
      {
        id: "edge22",
        source: "person5", // 李飞飞
        target: "pub3", // ImageNet论文
        data: {
          relationship: "相关研究者",
          description: "李飞飞创建的ImageNet数据集是该论文研究的基础。",
          year: "2012",
        },
      },
    ],
  };
}
