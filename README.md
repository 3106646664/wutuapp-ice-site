# 借忧杂货铺 · 冰雪空间

一个在本地运行的可交互 3D 网站，包含雪境、收藏和粒子空间三个场景。

## 本地启动

安装 Node.js 后，在终端执行：

```bash
git clone https://github.com/3106646664/wutuapp-ice-site.git
cd wutuapp-ice-site
npm run dev
```

打开 http://localhost:4173/ 。网站资源已包含在仓库中，直接预览无需安装 npm 依赖。

Windows 下也可以双击 `launch-site.vbs`，自动启动本地服务并打开浏览器。

## 交互

- 滚动页面探索雪境，观察冰屋拆解和场景转换。
- 移动鼠标擦开收藏上的冰霜，点击进入记录、实践和关于详情。
- 在粒子空间移动鼠标扰动粒子，切换记录本、代码符号和 LIU 标志。
- 按 `1`、`2`、`3` 切换场景，按 `Escape` 关闭详情。

音乐默认开启；浏览器限制自动播放时，首次点击后开始播放。

## 修改与构建

```bash
npm ci
npm run build
```

构建结果保存在 `dist/`。

| 文件 | 用途 |
| --- | --- |
| `personal-config.json` | 栏目名称、文案和链接 |
| `public/personal/` | 页面样式、导航、头像和 Logo |
| `source/liu-logo.json` | LIU 标志的矢量数据 |
| `build.mjs` | 运行时构建 |
| `server.mjs` | 本地预览服务 |

模型和字形资源已预先生成。需要重新生成时，可使用 `generate-geometry.mjs`、`generate-volumes.py` 和 `generate-chinese-font.py`。Python 脚本需要 NumPy、OpenCV 和 Pillow；中文字体生成需要 Windows 微软雅黑粗体。

本地服务启动后，可执行 `node verify-site.mjs` 检查资源、模型和页面路由。

## 来源

视觉与交互参考 [Igloo Inc.](https://www.igloo.inc/)，原始客户端署名为 abeto.co。项目在其公开客户端和资源基础上加入中文文案、个人标志、模型及导航，页面版权行保留来源标注。

第三方代码、字体、美术和音频的权利属于各自权利人，本仓库不授予这些资源的额外使用权。
