# IPTV playlist proxy

This is an express app that serves as a proxy for IPTV playlists. On every request it fetches the playlist from backend, modifies it and sends it to clients. It also logs changes to the backend playlist between requests.

## Build and run the project
```
npm run build
npm start
```

## Run project in watch mode
```
npm run watch-debug
```

## Docker
### Build:
```
sudo docker build -t beast/iptv-playlist-proxy .
```

### Run:
```
sudo docker run -p 8000:8080 --volume=/home/beast/iptv-playlist-proxy/log:/usr/src/app/log --volume=/home/beast/iptv-playlist-proxy/output:/usr/src/app/output -d --rm beast/iptv-playlist-proxy
```

## Autostart on Libreelec:
copy `autostart.sh` to `/storage/.config/`

(iptv-playlist-proxy.docker.service doesn't work, it starts after kodi)

## Run in CoreELEC without Docker
- copy `iptv-playlist-proxy.service` to `/storage/.config/system.d/` and enable it with systemctl
- set `Before=kodi-autostart.service` in that file instead of `Before=kodi.service`
- add
```
sleep 10
curl localhost:8000
```
to `/storage/.config/autostart.sh`
