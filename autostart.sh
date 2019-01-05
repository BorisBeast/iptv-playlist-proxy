/storage/.kodi/addons/service.system.docker/bin/docker run --rm -d --name=iptv-playlist-proxy --hostname=libreelec-iptv-playlist-proxy --volume=/storage/iptv-playlist-proxy/output:/usr/src/app/output --volume=/storage/iptv-playlist-proxy/log:/usr/src/app/log --publish=8000:8080 beast/iptv-playlist-proxy
sleep 10
