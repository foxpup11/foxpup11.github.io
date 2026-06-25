#!/bin/bash
# GitHub Pages 保护规则配置脚本
# 使用 GitHub CLI (gh) 导入 Rulesets
# 仓库: foxpup11/foxpup11.github.io

set -e

REPO="foxpup11/foxpup11.github.io"
RULESET_FILE=".github/rules/pages-protection.json"

echo "=========================================="
echo "  GitHub Pages 保护规则配置"
echo "  仓库: $REPO"
echo "=========================================="
echo ""

# 检查 gh CLI 是否安装
if ! command -v gh &> /dev/null; then
    echo "❌ 错误: 未安装 GitHub CLI (gh)"
    echo ""
    echo "请先安装 GitHub CLI:"
    echo "  Windows: winget install GitHub.cli"
    echo "  macOS:   brew install gh"
    echo "  Linux:   sudo apt install gh"
    echo ""
    echo "安装后运行: gh auth login"
    exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
    echo "❌ 错误: 未登录 GitHub CLI"
    echo ""
    echo "请先运行: gh auth login"
    exit 1
fi

# 检查规则文件是否存在
if [ ! -f "$RULESET_FILE" ]; then
    echo "❌ 错误: 找不到规则文件 $RULESET_FILE"
    exit 1
fi

echo "📋 规则内容预览:"
echo "------------------------------------------"
cat "$RULESET_FILE"
echo ""
echo "------------------------------------------"
echo ""

read -p "确认导入以上规则? (y/n): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "已取消操作"
    exit 0
fi

echo ""
echo "🚀 正在导入规则..."

# 读取 JSON 并通过 API 导入
RULESET_JSON=$(cat "$RULESET_FILE")

# 使用 gh api 导入 Ruleset
echo "$RULESET_JSON" | gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    "/repos/$REPO/rulesets" \
    --input - \
    2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 规则导入成功!"
    echo ""
    echo "📌 已配置的保护规则:"
    echo "  • 强制通过 PR 合并到 main/master/gh-pages"
    echo "  • 至少需要 1 个审批人"
    echo "  • 新提交会自动撤销之前的审批"
    echo "  • 强制线性历史 (rebase/squash)"
    echo "  • 禁止非快进推送"
    echo "  • 提交邮箱必须匹配 GitHub noreply 邮箱"
    echo ""
    echo "🔗 查看配置: https://github.com/$REPO/settings/rules"
else
    echo ""
    echo "❌ 导入失败，请检查错误信息"
    exit 1
fi
