import { spawn } from 'child_process';
import { Request, Response } from 'express';
import fs from 'fs';
import request from 'request-promise-native';
import util from 'util';

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
          'playlist request failed %o',
          JSON.parse(JSON.stringify(error))
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
    const readFile = util.promisify(fs.readFile);
    const writeFile = util.promisify(fs.writeFile);
    const fileExists = util.promisify(fs.exists);

    if (!fileContent) {
      try {
        logger.info('reading cached file');
        cachedFileContent = await readFile(cachedFilePath, 'utf8');
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
      if (await fileExists(cachedFilePath)) {
        logger.info('calculating diff');
        let changes = '';
        try {
          changes = await this.calculateDiff(fileContent, cachedFilePath);
        } catch (err) {
          logger.error('calculating diff failed %o', err);
        }

        if (changes) {
          shouldCache = true;

          try {
            const diffPath =
              process.env.OUTPUT_DIR + '/tv_channels_' + Date.now() + '.diff';
            logger.info('writing diff file %s', diffPath);
            await writeFile(diffPath, changes);
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
        await writeFile(cachedFilePath, fileContent);
      } catch (err) {
        logger.error('caching failed %o', err);
      }
    }
  }

  private calculateDiff(
    fileContent: string,
    cachedFilePath: string
  ): Promise<string> {
    const diffProcess = spawn('diff', ['-u', cachedFilePath, '-']);
    diffProcess.stdin.write(fileContent, () => diffProcess.stdin.end());

    return new Promise((resolve, reject) => {
      let out = '';
      diffProcess.once('exit', (code: number, signal: string) => {
        if (code === 0 || code === 1) {
          resolve(out);
        } else {
          reject(new Error('Exit with error code: ' + code));
        }
      });
      diffProcess.once('error', (err: Error) => {
        reject(err);
      });
      diffProcess.stdout.on('data', chunk => (out += chunk));
    });
  }
}

export const playlistController = new PlaylistController();
