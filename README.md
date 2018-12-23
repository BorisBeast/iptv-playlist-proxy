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
