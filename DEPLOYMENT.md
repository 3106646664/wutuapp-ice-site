# 服务器部署

服务器：47.122.112.12。网站为独立 Nginx 静态站，不依赖本地电脑运行。

- 当前文件：`/var/www/wudaoapp/current`
- 本次版本：`/var/www/wudaoapp/releases/20261001-layout3`
- 配置：`/etc/nginx/conf.d/wudaoapp.conf`
- 日志：`/var/log/nginx/access.log`、`/var/log/nginx/error.log`
- 服务已开机启动：`systemctl status nginx`

临时访问：http://47.122.112.12/

正式域名：https://wutuapp.com/ 。域名使用华为云 DNS，根域名 A 记录已指向 47.122.112.12。网站中全部域名显示和链接已更新。

www.wutuapp.com 同样支持 HTTPS。证书续期模拟验证已通过。中文修复版资源版本为 20261001-cn2，禁用了仅适用于原站英文字体图集的 UV 字形切换，同时保留透明度显现动画。

最新布局修复版本：20261001-layout3。原生声音控件 resize 时测量其顶部边界，通过 --sound-row-top 将该边界提供给收藏链接和关于信息区；两者至少在声音区域上方保留 24px 间距。CSS 与模块均携带新版本参数以避免旧缓存。

HTTPS 已启用，HTTP 自动跳转至 HTTPS。证书目录为 `/etc/letsencrypt/live/wutuapp.com/`。每天由 `wudaoapp-cert-renew.timer` 检查续期，成功后自动重载 Nginx。服务器内部目录和服务名称沿用首次部署名称，不影响实际域名。

后续更新：将新静态文件上传到新的 releases 子目录，检查后将 current 符号链接指向新版本。需要回退时，将 current 指回上一版目录。切换网站文件无需停止 OpenClaw。

源码目录中的 deploy-server.sh 为本次首次部署脚本，后续发布请使用新的版本目录，不要覆盖已有版本。
