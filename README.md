# 美颜相机 · AI Beauty Camera

一个面向 AI 美颜相机产品提案的响应式宣传网站。页面以“自然、不假面、保留真实质感”为核心，展示实时美颜、审美记忆、滤镜风格、用户路径、产品路线图与可信 AI 设计。

## 在线体验

https://quj7897-tech.github.io/glow-lens-ai-beauty-camera/

## 主要功能

- 首屏美颜相机交互演示
- 自然、清透、胶片、氛围四种图片效果切换
- AI 自然美颜前后对比滑杆
- 滚动渐显、章节转场与模块交互
- 产品体验路径、增长指标与落地路线图
- 桌面端与移动端响应式适配
- 支持 `prefers-reduced-motion` 无障碍动效偏好

## 本地运行

项目是纯静态网页，不需要安装依赖：

```bash
python3 -m http.server 4173 --directory dist
```

然后访问 `http://127.0.0.1:4173`。

## 项目结构

```text
dist/
├── index.html
└── assets/
    ├── app.js
    ├── interactions.css
    ├── sections.css
    ├── beauty-camera-logo.png
    └── glow-portrait.jpg
```

## GitHub Pages

仓库已包含 `.github/workflows/pages.yml`。推送到 `main` 分支后，GitHub Actions 会自动发布 `dist` 目录；后续每次更新 `main` 都会重新部署。

## 开源协议

本项目使用 [MIT License](LICENSE)。
