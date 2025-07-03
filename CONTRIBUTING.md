# 贡献指南

感谢您对医学智能检索与决策支持助手项目的关注！我们欢迎所有形式的贡献。

## 📋 如何贡献

### 1. 报告问题（Issues）

如果您发现了问题或有新功能建议：

1. 搜索已有的 [Issues](https://github.com/zq88577727/medical-ai-system/issues) 避免重复
2. 创建新的 Issue，请提供：
   - 清晰的标题和描述
   - 重现步骤（如果是 bug）
   - 预期行为和实际行为
   - 截图或错误信息
   - 您的环境信息（浏览器、操作系统等）

### 2. 提交代码（Pull Requests）

#### 准备工作
```bash
# 1. Fork 本仓库
# 2. 克隆您的 fork
git clone https://github.com/YOUR_USERNAME/medical-ai-system.git
cd medical-ai-system

# 3. 创建分支
git checkout -b feature/your-feature-name
```

#### 开发规范
- 遵循现有的代码风格
- 确保代码注释清晰
- 医学术语使用准确
- 添加必要的测试

#### 提交规范
```bash
# 提交格式
git commit -m "类型: 简短描述

详细说明（可选）

相关 Issue: #123"
```

**提交类型：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 3. 医学内容贡献

#### 医学文献贡献
- 提供权威来源的医学文献
- 确保文献的准确性和时效性
- 标注文献类型和适用范围

#### 医学知识验证
- 具备医学背景的贡献者可以帮助验证内容准确性
- 参与医学术语标准化工作
- 协助制定医学知识质量标准

## 🔍 代码审查

所有 PR 都需要经过代码审查：

1. **自检清单**：
   - [ ] 代码功能正常
   - [ ] 医学术语准确
   - [ ] 注释清晰完整
   - [ ] 无明显的性能问题
   - [ ] 符合项目编码规范

2. **医学内容审查**：
   - [ ] 医学信息准确性
   - [ ] 引用来源可靠
   - [ ] 符合循证医学原则
   - [ ] 不提供诊断建议

## 📚 开发指南

### 技术栈
- **前端**: HTML5, CSS3, JavaScript
- **AI 平台**: FastGPT
- **AI 模型**: OpenAI GPT-4o-mini, text-embedding-3-large
- **部署**: GitHub Pages

### 本地开发
```bash
# 启动本地服务器
python -m http.server 8000

# 访问
http://localhost:8000
```

### 文件结构
```
medical-ai-system/
├── index.html          # 主页面
├── README.md          # 项目说明
├── LICENSE            # 许可证
├── assets/            # 静态资源
├── docs/              # 文档
└── medical-docs/      # 医学文献（不上传）
```

## 🏥 医学内容标准

### 内容质量要求
1. **权威性**: 来源于权威医学机构或期刊
2. **准确性**: 医学信息必须准确无误
3. **时效性**: 优先使用最新的医学指南
4. **完整性**: 提供完整的引用信息

### 禁止内容
- 未经验证的医学信息
- 个人诊断或治疗建议
- 虚假或误导性内容
- 版权保护的文献全文

## 🚫 行为准则

参与项目的所有人员都应：

- 保持友善和专业的态度
- 尊重不同观点和经验水平
- 专注于建设性反馈
- 维护医学内容的严谨性
- 保护患者隐私和医学伦理

## 📞 联系方式

- **GitHub Issues**: [项目 Issues](https://github.com/zq88577727/medical-ai-system/issues)
- **讨论**: [GitHub Discussions](https://github.com/zq88577727/medical-ai-system/discussions)

## 🙏 致谢

感谢所有为项目做出贡献的开发者、医学专家和用户！

---

**注意**: 本项目提供的医学信息仅供参考，不能替代专业医学诊断和治疗。请在专业医生指导下使用相关信息。 