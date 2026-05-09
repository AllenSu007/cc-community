# GitHub Publishing Checklist

以下是发布 cc-community 到 GitHub 前需要完成的全部任务。

## 1. 代码仓库准备

- [x] 项目代码已完成
- [x] 所有包通过 `pnpm build` 和 `pnpm typecheck`
- [ ] 初始化 git 仓库: `git init`
- [ ] 创建 `.gitignore`（已有，确认包含 node_modules, dist, .env）
- [ ] 完成首次 commit

## 2. GitHub 仓库创建

- [ ] 在 GitHub 上创建仓库 `cc-community/cc-community`
- [ ] 将本地代码推送到远程: `git remote add origin && git push`
- [ ] 在 package.json 中补充 repository/bugs/homepage 字段
- [ ] 在 GitHub 上设置仓库描述和 Topics

## 3. 社区健康文件

- [ ] 创建 `LICENSE` 文件（MIT）
- [ ] 创建 `CODE_OF_CONDUCT.md`
- [ ] 创建 `SECURITY.md`（漏洞报告政策）
- [ ] 完善 `CONTRIBUTING.md`（已有基础版本）

## 4. CI/CD

- [ ] 创建 GitHub Actions workflow: `.github/workflows/ci.yml`
  - 触发: push 到 main + pull request
  - Steps: pnpm install → pnpm build → pnpm typecheck

## 5. npm 发布（可选）

- [ ] 决定是否需要发布到 npm
- [ ] 如果需要，配置 `packages/api/package.json` 的 publishConfig
- [ ] 如果需要，配置 `packages/skill/package.json` 的 publishConfig
- [ ] 创建 npm token 并配置 GitHub Secrets

## 6. 文档完善

- [x] CLAUDE.md（已有）
- [x] README.md（下一步重写）
- [ ] 确认所有 API endpoint 有文档示例

## 7. 发布前本地测试

- [ ] 按照 README.md 的 Quick Start 完整走一遍
- [ ] 测试所有 Skill 命令
- [ ] 测试 API 健康检查

## 8. 发布

- [ ] 完成 README.md 最终版
- [ ] git push 到 GitHub
- [ ] 创建 GitHub Release v0.1.0
