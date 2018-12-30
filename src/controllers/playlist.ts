import { Request, Response } from 'express';
import request from 'request-promise-native';

class PlaylistController {
  constructor() {
    this.get = this.get.bind(this);
  }

  get(req: Request, res: Response) {
    request({
      uri: process.env.PLAYLIST_URL,
      simple: true,
      resolveWithFullResponse: true
    })
      .then(response => {
        res
          .header({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename="tv_channels.m3u"'
          })
          .send(response.body);
      })
      .catch(error => {
        const response = error.response;
        if (response) {
          res.status(response.statusCode).send(response.body);
        } else {
          res.status(500).send(error.message);
        }
      });
  }
}

export const playlistController = new PlaylistController();
