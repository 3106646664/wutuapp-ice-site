# Igloo 网站复刻与个人空间

可交互的个人冰雪空间，在线访问：https://wutuapp.com/ 。

## 运行

```powershell
git clone https://github.com/3106646664/wutuapp-ice-site.git
cd wutuapp-ice-site
npm.cmd run dev
```

- 个人版：http://localhost:4173/
- 参考站完整复刻版：http://localhost:4173/reference/
- 参考版详情可直接访问：`/reference/portfolio/pudgy-penguins`、`/reference/portfolio/overpass`、`/reference/portfolio/abstract`。
- 个人版详情：`/portfolio/journal`、`/portfolio/experiments`、`/portfolio/about`。

本地预览监听 127.0.0.1；公网部署信息见 DEPLOYMENT.md。

## 保留的交互

参考站的公开客户端和完整资源已落到本地，而非 iframe、网页录像或截图背景。包括雪地地形、冰屋分块拆解、冰块材质、擦霜交互、项目详情、场景过渡、空间音效、末段粒子流体扰动和形态切换。滚轮、触摸与方向键继续驱动原有场景。原生界面与文案保留在参考版。

个人版增加键盘可访问的中文导航、收藏入口和详情关闭区域：1/2/3 跳到雪境、收藏、粒子阶段，Escape 关闭详情。音乐开关默认开启，浏览器限制自动播放时会在首次交互后解锁音频。

## 个人化修改

- 使用用户提供的昵称 **借忧杂货铺**、头像、原始白色云形 LIU logo，以及 **wutuapp.com**。
- 原始 logo 矢量数据在 `source/liu-logo.json`；生成带厚度和倒角的实际三维网格，不将头像含义或昵称含义作为叙事。
- 三组收藏为记录 / 实践 / 关于，配套记录本、代码符号和个人 logo 三维模型。中文文案经过用户验收，版权区域标注复刻来源 Igloo Inc.（igloo.inc）。域名、来源名称及 LIU 标志保留原样。
- `generate-chinese-font.py` 从本机微软雅黑生成中文 SDF 字形子集，适配原有三维文字动画和逐字换行；原站参考模式仍使用其原始字体与英文文案。
- 末段 150000 个 GPU 粒子使用自行生成的 64³ 符号距离与梯度体积纹理，形成对应的个人图形，鼠标流体扰动仍然有效。
- 微调为冰蓝色调，保留原有环境、光照、材质、空间镜头和声音。
- 头像只在关于详情中作为独立署名出现。所有个人版外链均通向用户提供的博客域名。

`personal-config.json` 是可编辑的栏目与文案配置；`node build.mjs` 会重建个人运行时。原版与个人版共享资源，并以 `window.__PERSONAL__` 隔离替换逻辑。参考版使用单独路由前缀，刷新详情不会进入个人版。

`npm.cmd run build` 同时导出 `dist/` 静态目录。`public/_redirects` 为支持此格式的静态服务器提供详情页回退规则。其他服务器需把 `/portfolio/*` 回退到 `index.html`，把 `/reference/*` 回退到 `reference.html`。

## 资源与源码来源

参考网址：https://www.igloo.inc/ ，其公开页面署名为 Igloo Inc.，客户端中署名为 abeto.co。原站公开发布的客户端、几何体、纹理、字体与音效完整保存在本地；原始 HTML 与脚本快照在 `research/`。本项目包含这些参考站资源，并非全部资源均由本项目原创。

`research/assets-manifest.json` 记录 111 项公开依赖的下载地址、文件大小和原始 SHA-256。`research/local-changes.json` 记录针对运行时的明确修改锚点。字体、模型、纹理、音效和解码器都从本地加载；外部连接仅是用户点击的链接。

复刻脚本：`mirror.py`。个人几何体生成：`generate-geometry.mjs`。个人体积纹理生成：`generate-volumes.py`（使用已有 Python / NumPy / OpenCV 环境）。额外 Node 构建依赖锁定在 `package-lock.json`；运行网站只需要 Node，不需要在线 npm 安装。

## 核验

```powershell
node --check public/assets/App3D-f554a111.js
node verify-site.mjs
```

核验覆盖原始资源一致性、三维网格解码与属性、体积纹理头部及负载、全部资源的本地 HTTP 响应与 JavaScript MIME、详情深层路由。浏览器中另行核验桌面和手机布局、导航、详情开关、冰霜及粒子交互。结果保存在 `research/verification.json`，画面记录在 `research/screenshots/`。

## 构建与资源生成

预览已有网站无需安装依赖。修改并重建运行时请先执行 `npm ci`，再执行 `npm run build`；生成的 `dist/` 可用于静态部署。

重新生成个人模型：`node generate-geometry.mjs`。重新生成体积纹理：`python generate-volumes.py`。Python 依赖为 NumPy、OpenCV 和 Pillow；中文字体生成还需要 Windows 的微软雅黑粗体字体。现有模型及字形图集已包含在仓库中，常规运行和构建无需重新生成它们。

`record-browser-helper.js` 是临时浏览器录制辅助代码，依赖 html2canvas 和开发工具提供的 `window.__recordCanvas`。它不会被网站加载。实际演示视频通过滚轮、鼠标和导航按钮操作网站录制，视频文件及录制缓存不纳入源码仓库。

## 来源与使用范围

本仓库公开用于展示复刻与个人化适配的实现。Igloo Inc. / abeto 的原始客户端及美术、音频、字体资源的权利属于各自权利人；公开可访问不代表这些资源采用开源许可。本仓库未为第三方素材授予额外使用权。个人头像和 LIU 标志用于本网站身份展示。
