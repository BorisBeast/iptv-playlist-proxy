import { ChildProcess, spawn } from 'child_process';
import { Request, Response } from 'express';
import fs from 'fs';
import request from 'request-promise-native';

import { logger } from '../util/logger';

class PlaylistController {
  constructor() {
    this.get = this.get.bind(this);
  }

  get(req: Request, res: Response) {
    logger.info('===== requesting playlist from %s', process.env.PLAYLIST_URL);
    request({
      uri: process.env.PLAYLIST_URL,
      simple: true,
      resolveWithFullResponse: true
    })
      .then(response => {
        logger.info('playlist request successful');
        return this.diffAndSendFile(response.body, res);
      })
      .catch(error => {
        logger.error(
          'playlist request failed %o', JSON.parse(JSON.stringify(error))
        );
        return this.diffAndSendFile(undefined, res);
      })
      .then(() => {
        logger.info('===== done');
      });
  }

  async diffAndSendFile(fileContent: string, response: Response) {
    const cachedFilePath = process.env.OUTPUT_DIR + '/tv_channels.m3u';
    let cachedFileContent: string;
    let shouldCache = false;

    if (!fileContent) {
      try {
        logger.info('reading cached file');
        cachedFileContent = fs.readFileSync(cachedFilePath).toString();
      } catch (err) {
        logger.error('reading cached file failed %o', err);
        response.status(404).send('File not found');
        return;
      }
    }

    response
      .header({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="tv_channels.m3u"'
      })
      .send(fileContent || cachedFileContent);

    if (fileContent) {
      if (fs.existsSync(cachedFilePath)) {
        logger.info('calculating diff');
        let changes = '';
        try {
          const diffProcess = spawn('diff', ['-u', cachedFilePath, '-']);
          diffProcess.stdin.write(fileContent, () => diffProcess.stdin.end());

          changes = await this.onDiffExit(diffProcess);
        } catch (err) {
          logger.error('calculating diff failed %o', err);
        }

        if (changes) {
          shouldCache = true;

          try {
            const diffPath =
              process.env.OUTPUT_DIR + '/tv_channels_' + Date.now() + '.diff';
            logger.info('writing diff file %s', diffPath);
            fs.writeFileSync(diffPath, changes);
          } catch (err) {
            logger.error('writing diff file failed %o', err);
          }
        } else {
          logger.info("playlist didn't change");
        }
      } else {
        shouldCache = true;
      }
    }

    if (shouldCache) {
      try {
        logger.info('caching file');
        fs.writeFileSync(cachedFilePath, fileContent);
      } catch (err) {
        logger.error('caching failed %o', err);
      }
    }
  }

  private onDiffExit(childProcess: ChildProcess): Promise<string> {
    return new Promise((resolve, reject) => {
      let out = '';
      childProcess.once('exit', (code: number, signal: string) => {
        if (code === 0 || code === 1) {
          resolve(out);
        } else {
          reject(new Error('Exit with error code: ' + code));
        }
      });
      childProcess.once('error', (err: Error) => {
        reject(err);
      });
      childProcess.stdout.on('data', chunk => (out += chunk));
    });
  }
}

export const playlistController = new PlaylistController();
