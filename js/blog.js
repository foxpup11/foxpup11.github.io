/**
 * CSDN 博客展示组件 (Clean Grid Style)
 * Apple / Google 风格网格布局
 */

class BlogViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.maxArticles = options.maxArticles || 8;
    this.showCategory = options.showCategory !== false;
    this.dataUrl = options.dataUrl || 'data/articles.json';

    if (this.container) {
      this.init();
    }
  }

  async init() {
    this.showLoading();

    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      this.render(data);
    } catch (error) {
      console.error('Blog load error:', error);
      this.renderFallback();
    }
  }

  renderFallback() {
    const fallbackData = {
      username: 'qq_51605551',
      updatedAt: new Date().toISOString(),
      articles: [
        { title: 'MCP协议', link: '#', pubDate: new Date().toISOString(), description: 'MCP 的本质，就是将 AI 与数据的连接标准化...', category: 'AI' },
        { title: 'GitHub实战指南', link: '#', pubDate: new Date().toISOString(), description: 'GitHub 全流程实战教程...', category: 'GitHub' },
        { title: 'Agent面试题', link: '#', pubDate: new Date().toISOString(), description: 'Agent 开发常见面试问题...', category: 'Agent' },
      ],
    };
    this.render(fallbackData);
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="blog-loading">
        <div class="blog-spinner"></div>
        <p>加载中...</p>
      </div>
    `;
  }

  render(data) {
    const articles = data.articles?.slice(0, this.maxArticles) || [];

    if (articles.length === 0) {
      this.container.innerHTML = `
        <div class="blog-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>暂无文章</p>
        </div>
      `;
      return;
    }

    const cardsHTML = articles.map(article => this.renderCard(article)).join('');

    this.container.innerHTML = `
      <div class="blog-grid">
        ${cardsHTML}
      </div>
    `;
  }

  renderCard(article) {
    const tag = this.showCategory && article.category
      ? `<span class="blog-card-tag">${article.category}</span>`
      : '';

    return `
      <a href="${article.link}" target="_blank" class="blog-card">
        <div class="blog-card-header">
          ${tag}
          <span class="blog-card-date">${this.formatDate(article.pubDate)}</span>
        </div>
        <h4 class="blog-card-title">${article.title}</h4>
        ${article.description ? `<p class="blog-card-desc">${article.description}</p>` : ''}
        <div class="blog-card-footer">
          <span class="blog-card-link">
            阅读全文
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </div>
      </a>
    `;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      if (days === 0) return '今天';
      if (days === 1) return '昨天';
      return `${days}天前`;
    }

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blog-container')) {
    new BlogViewer('blog-container', {
      maxArticles: 8,
      showCategory: true,
    });
  }
});
