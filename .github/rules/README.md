# GitHub Pages 保护规则配置

本目录包含 GitHub Pages 个人网站的仓库保护规则配置。

## 📁 文件说明

```
.github/
├── rules/
│   ├── pages-protection.json   # Rulesets 规则定义 (JSON)
│   └── README.md               # 本说明文档
└── scripts/
    └── setup-rules.sh          # 自动化配置脚本
```

## 🛡️ 规则内容

| 规则类型 | 说明 |
|---------|------|
| 强制 PR 合并 | 禁止直接 push 到 main/master/gh-pages |
| 至少 1 个审批 | 需要至少一个人 review 才能合并 |
| 自动撤销过期审批 | 新提交后，之前的审批自动失效 |
| 线性历史 | 只允许 rebase 或 squash，禁止 merge commit |
| 禁止非快进推送 | 保护分支历史不被覆盖 |
| 邮箱验证 | 提交必须使用 GitHub noreply 邮箱 |

## 🚀 快速配置

### 方法一：使用自动化脚本 (推荐)

```bash
# 1. 确保已安装 GitHub CLI
# Windows: winget install GitHub.cli
# macOS:   brew install gh

# 2. 登录 GitHub
gh auth login

# 3. 运行配置脚本
cd foxpup11.github.io
bash .github/scripts/setup-rules.sh
```

### 方法二：手动导入

1. 打开仓库页面: https://github.com/foxpup11/foxpup11.github.io

2. 进入 **Settings** → **Branches** → **Add branch protection rule**

3. 参照 `pages-protection.json` 中的配置填写

4. 保存规则

### 方法三：通过 GitHub API

```bash
# 使用 curl 导入
curl -X POST \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/foxpup11/foxpup11.github.io/rulesets \
  -d @.github/rules/pages-protection.json
```

## ⚙️ 自定义配置

如需修改规则，编辑 `pages-protection.json`:

### 调整审批人数
```json
"required_approving_review_count": 2
```

### 添加受保护分支
```json
"include": [
  "refs/heads/main",
  "refs/heads/master",
  "refs/heads/gh-pages",
  "refs/heads/develop"
]
```

### 允许管理员绕过
```json
"bypass_actors": [
  {
    "actor_id": 0,
    "actor_type": "Team",
    "bypass_mode": "always"
  }
]
```

### 添加 Status Checks
```json
{
  "type": "required_status_checks",
  "parameters": {
    "required_status_checks": [
      {"context": "build"},
      {"context": "lint"}
    ],
    "strict_required_status_checks_policy": true
  }
}
```

## 🔐 安全建议

1. **保护 Secrets**: API Key、Token 等放在 Settings → Secrets
2. **最小权限**: GitHub Actions 的 Token 权限最小化
3. **定期审查**: 定期检查谁有仓库写权限
4. **启用 2FA**: 确保所有协作者开启双因素认证

## 📝 常见问题

### Q: 管理员被规则限制了怎么办？
A: 在 `bypass_actors` 中添加管理员，但建议日常开发不要绕过规则。

### Q: 如何测试规则是否生效？
A: 尝试直接 push 到 main 分支，应该会被拒绝。

### Q: 规则影响 GitHub Pages 部署吗？
A: 不影响。GitHub Actions 部署使用的是 GITHUB_TOKEN，有特殊权限。

## 🔗 参考文档

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule)
- [GitHub Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets-for-a-repository)
- [GitHub Pages](https://docs.github.com/en/pages)
