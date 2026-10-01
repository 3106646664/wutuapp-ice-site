#!/usr/bin/env bash
set -euo pipefail
resolved=$(getent ahostsv4 wutuapp.com | awk 'NR==1{print $1}')
if [ "$resolved" != '47.122.112.12' ]; then
    echo "DNS still points to $resolved; HTTPS setup deferred."
    exit 1
fi
/opt/wudaoapp-certbot/bin/certbot certonly --webroot -w /var/www/acme -d wutuapp.com -d www.wutuapp.com --non-interactive --agree-tos --register-unsafely-without-email
cp /etc/nginx/conf.d/wudaoapp.conf /etc/nginx/wudaoapp-http.backup
python3 - <<'PY'
from pathlib import Path
p = Path('/etc/nginx/conf.d/wudaoapp.conf')
text = p.read_text()
text = text.replace('listen 80;', 'listen 443 ssl;').replace('listen [::]:80;', 'listen [::]:443 ssl;')
text = text.replace('server_name wutuapp.com 47.122.112.12;', '''server_name wutuapp.com www.wutuapp.com;
    ssl_certificate /etc/letsencrypt/live/wutuapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wutuapp.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:WudaoSSL:10m;
    http2 on;''')
http = '''server {
    listen 80;
    listen [::]:80;
    server_name wutuapp.com www.wutuapp.com;
    location ^~ /.well-known/acme-challenge/ { root /var/www/acme; }
    location / { return 301 https://wutuapp.com$request_uri; }
}
server {
    listen 80;
    server_name 47.122.112.12;
    root /var/www/wudaoapp/current;
    location / { try_files $uri $uri/ /index.html; }
}
'''
p.write_text(http + text)
PY
nginx -t
systemctl reload nginx
cat > /etc/systemd/system/wudaoapp-cert-renew.service <<'UNIT'
[Unit]
Description=Renew wudaoapp TLS certificate
[Service]
Type=oneshot
ExecStart=/opt/wudaoapp-certbot/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
UNIT
cat > /etc/systemd/system/wudaoapp-cert-renew.timer <<'UNIT'
[Unit]
Description=Check wudaoapp certificate renewal daily
[Timer]
OnCalendar=daily
RandomizedDelaySec=3600
Persistent=true
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
systemctl enable --now wudaoapp-cert-renew.timer
curl -fsSI https://wutuapp.com/
