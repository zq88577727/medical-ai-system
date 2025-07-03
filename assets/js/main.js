// 医学智能检索系统 - 主要功能脚本

// 全局配置
const CONFIG = {
    FASTGPT_API_URL: 'https://api.fastgpt.cn/api/v1/chat/completion',
    API_KEY: 'your-fastgpt-api-key-here', // 需要在实际部署时替换
    MAX_QUERY_LENGTH: 1000,
    REQUEST_TIMEOUT: 30000,
    RATE_LIMIT: {
        maxRequests: 10,
        timeWindow: 60000
    }
};

// 工具类：速率限制器
class RateLimiter {
    constructor(maxRequests = 10, timeWindow = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }

    isAllowed() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            return false;
        }
        
        this.requests.push(now);
        return true;
    }

    getWaitTime() {
        if (this.requests.length === 0) return 0;
        const oldestRequest = Math.min(...this.requests);
        return Math.max(0, this.timeWindow - (Date.now() - oldestRequest));
    }
}

// 工具类：错误处理器
class ErrorHandler {
    static handle(error, context = '') {
        console.error(`错误 [${context}]:`, error);
        
        let userMessage = '发生未知错误，请稍后重试';
        
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
            userMessage = '网络连接错误，请检查网络后重试';
        } else if (error.message.includes('rate limit')) {
            userMessage = '请求过于频繁，请稍后再试';
        } else if (error.message.includes('timeout')) {
            userMessage = '请求超时，请稍后重试';
        } else if (error.message.includes('API key')) {
            userMessage = 'API配置错误，请联系管理员';
        }
        
        this.showError(userMessage);
    }

    static showError(message) {
        // 移除现有的错误提示
        const existingError = document.querySelector('.error-alert');
        if (existingError) {
            existingError.remove();
        }

        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-alert status-error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px;
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid #dc3545;
            border-radius: 8px;
            color: #dc3545;
            font-weight: 600;
            z-index: 1000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }
}

// 工具类：输入验证器
class InputValidator {
    static validateQuery(query) {
        if (!query || typeof query !== 'string') {
            throw new Error('查询内容不能为空');
        }

        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length === 0) {
            throw new Error('查询内容不能为空');
        }

        if (trimmedQuery.length > CONFIG.MAX_QUERY_LENGTH) {
            throw new Error(`查询内容不能超过${CONFIG.MAX_QUERY_LENGTH}个字符`);
        }

        // 检查是否包含医学相关内容的基本词汇
        const medicalKeywords = [
            '症状', '诊断', '治疗', '药物', '疾病', '医学', '临床', '病例',
            '患者', '医生', '医院', '手术', '检查', '化验', '病理'
        ];
        
        const hasMedicalContent = medicalKeywords.some(keyword => 
            trimmedQuery.includes(keyword)
        );

        return {
            query: trimmedQuery,
            hasMedicalContent,
            isValid: true
        };
    }

    static sanitizeInput(input) {
        // 基本的XSS防护
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
}

// 主要应用类
class MedicalAIApp {
    constructor() {
        this.rateLimiter = new RateLimiter(
            CONFIG.RATE_LIMIT.maxRequests,
            CONFIG.RATE_LIMIT.timeWindow
        );
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.showWelcomeMessage();
    }

    bindEvents() {
        // 查询表单提交
        const queryForm = document.getElementById('query-form');
        if (queryForm) {
            queryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuery();
            });
        }

        // 回车键提交
        const queryInput = document.getElementById('query-input');
        if (queryInput) {
            queryInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.handleQuery();
                }
            });
        }

        // 清空结果
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearResults();
            });
        }
    }

    async handleQuery() {
        if (this.isLoading) {
            return;
        }

        try {
            const queryInput = document.getElementById('query-input');
            const rawQuery = queryInput.value;

            // 验证输入
            const validation = InputValidator.validateQuery(rawQuery);
            const sanitizedQuery = InputValidator.sanitizeInput(validation.query);

            // 检查速率限制
            if (!this.rateLimiter.isAllowed()) {
                const waitTime = Math.ceil(this.rateLimiter.getWaitTime() / 1000);
                throw new Error(`请求过于频繁，请等待${waitTime}秒后重试`);
            }

            // 显示加载状态
            this.showLoading();
            this.isLoading = true;

            // 发送查询请求
            const response = await this.sendQuery(sanitizedQuery);
            
            // 显示结果
            this.displayResult(response, sanitizedQuery);

        } catch (error) {
            ErrorHandler.handle(error, '查询处理');
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }

    async sendQuery(query) {
        // 注意：这里使用模拟响应，实际部署时需要替换为真实的FastGPT API调用
        return this.simulateAPICall(query);
    }

    // 模拟API调用（用于演示）
    async simulateAPICall(query) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

        // 模拟响应
        return {
            answer: `基于您查询的"${query}"，以下是相关的医学信息：

这是一个模拟响应示例。在实际部署中，这里会显示基于FastGPT和医学知识库生成的专业回答。

系统会通过以下步骤提供准确信息：
1. 理解您的医学查询意图
2. 在权威医学文献中搜索相关信息
3. 基于循证医学原则生成回答
4. 提供明确的文献引用和来源

请注意：本系统提供的信息仅供参考，不能替代专业医学诊断。如有健康问题，请咨询合格的医疗专业人员。`,
            
            references: [
                {
                    id: 1,
                    title: "临床医学指南 - 相关章节",
                    source: "中华医学会",
                    url: "#",
                    confidence: 0.95
                },
                {
                    id: 2,
                    title: "循证医学文献综述",
                    source: "医学期刊数据库",
                    url: "#",
                    confidence: 0.88
                }
            ],
            
            queryTime: new Date().toISOString(),
            processingTime: "1.2s"
        };
    }

    showLoading() {
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) return;

        resultsSection.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <span>正在检索医学信息...</span>
            </div>
        `;
        resultsSection.style.display = 'block';
    }

    hideLoading() {
        // Loading state will be replaced by results or cleared
    }

    displayResult(response, query) {
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) return;

        const resultHTML = `
            <div class="result-card">
                <div class="result-header">
                    <h3>查询结果</h3>
                    <div class="status-indicator status-success">
                        ✓ 已完成
                    </div>
                </div>
                
                <div class="result-content">
                    <p><strong>查询内容：</strong>${query}</p>
                    <div class="answer-content">
                        ${this.formatAnswer(response.answer)}
                    </div>
                </div>
                
                <div class="result-references">
                    <h4>参考文献</h4>
                    ${this.formatReferences(response.references)}
                </div>
                
                <div class="result-meta">
                    <small>
                        处理时间：${response.processingTime} | 
                        查询时间：${new Date(response.queryTime).toLocaleString('zh-CN')}
                    </small>
                </div>
            </div>
        `;

        resultsSection.innerHTML = resultHTML;
        resultsSection.style.display = 'block';

        // 滚动到结果区域
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    formatAnswer(answer) {
        // 将换行符转换为HTML段落
        return answer
            .split('\n\n')
            .map(paragraph => paragraph.trim())
            .filter(paragraph => paragraph.length > 0)
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');
    }

    formatReferences(references) {
        if (!references || references.length === 0) {
            return '<p>暂无相关文献引用</p>';
        }

        return references.map(ref => `
            <div class="reference-item">
                <span class="reference-number">[${ref.id}]</span>
                <span class="reference-title">${ref.title}</span>
                <span class="reference-source">- ${ref.source}</span>
                <span class="reference-confidence">(置信度: ${(ref.confidence * 100).toFixed(1)}%)</span>
            </div>
        `).join('');
    }

    clearResults() {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.style.display = 'none';
            resultsSection.innerHTML = '';
        }

        const queryInput = document.getElementById('query-input');
        if (queryInput) {
            queryInput.value = '';
            queryInput.focus();
        }
    }

    showWelcomeMessage() {
        console.log('医学智能检索系统已启动');
        console.log('支持自然语言医学查询，基于FastGPT和权威医学文献');
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否支持现代JavaScript特性
    if (!window.fetch || !window.Promise) {
        alert('您的浏览器版本过低，请升级到现代浏览器以获得最佳体验');
        return;
    }

    // 初始化应用
    window.medicalApp = new MedicalAIApp();
    
    // 添加性能监控
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`页面加载时间: ${loadTime}ms`);
        });
    }
});

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MedicalAIApp,
        InputValidator,
        ErrorHandler,
        RateLimiter
    };
} 