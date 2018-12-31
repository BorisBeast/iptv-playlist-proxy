import { Request, Response } from 'express';
import fs from 'fs';
import request from 'request-promise-native';

import { logger } from '../util/logger';

class PlaylistController {
  constructor() {
    this.get = this.get.bind(this);
  }

  get(req: Request, res: Response) {
    logger.info('requesting playlist from ' + process.env.PLAYLIST_URL);
    request({
      uri: process.env.PLAYLIST_URL,
      simple: true,
      resolveWithFullResponse: true
    })
      .then(response => {
        logger.info('request successful');
        this.sendFile(response.body, res);
      })
      .catch(error => {
        // const response = error.response;
        // if (response) {
        //   res.status(response.statusCode).send(response.body);
        // } else {
        //   res.status(500).send(error.message);
        // }
        logger.error('request failed %o', error);
        this.sendFile(undefined, res);
      });
  }

  sendFile(fileContent: string, response: Response) {
    if (fileContent) {
      try {
        fs.writeFileSync(process.env.OUTPUT_DIR + '/tv_channels.m3u', fileContent);
      } catch (err) {
        response.status(500).send(err.message);
        return;
      }
    } else {
      try {
        fileContent = fs.readFileSync(process.env.OUTPUT_DIR + '/tv_channels.m3u').toString();
      } catch (err) {
        if (err.code === 'ENOENT') {
          response.status(404).send('File not found');
        } else {
          response.status(500).send(err.message);
        }
        return;
      }
    }
    response
    .header({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="tv_channels.m3u"'
    })
    .send(fileContent);
  }
}

export const playlistController = new PlaylistController();
