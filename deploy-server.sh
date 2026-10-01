#!/usr/bin/env bash
set -euo pipefail
echo 'b22fbc48176ea87d17cc19d6c6a5dd6634b4d57a1ab035ed90b642caf8844346  /tmp/wutuapp-site.tar.gz' | sha256sum -c -
release=/var/www/wudaoapp/releases/20261001-wutuapp
mkdir -p "$release" /var/www/acme
tar -xzf /tmp/wutuapp-site.tar.gz -C "$release"
chmod -R a+rX "$release"
ln -sfn "$release" /var/www/wudaoapp/current
if [ -f /etc/nginx/conf.d/wudaoapp.conf ]; then cp /etc/nginx/conf.d/wudaoapp.conf /etc/nginx/conf.d/wudaoapp.conf.previous; fi
cp /tmp/wudaoapp-nginx.conf /etc/nginx/conf.d/wudaoapp.conf
nginx -t
systemctl enable --now nginx
systemctl reload nginx
curl -fsSI -H 'Host: wutuapp.com' http://127.0.0.1/
curl -fsSI -H 'Host: wutuapp.com' http://127.0.0.1/portfolio/experiments
getenforce || true
