import {
  Body,
  Headers,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Res
} from '@nestjs/common';
import {
  UserPost,
  UserPostDiff,
  UserPost2Del,
} from './ApiProps';
import { PostAPIService } from './postapi.service';
import { verifyToken } from '../utils/Auth';
import { Response } from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const blockChainAddr = process.env.BLOCKCHAIN_ADDRESS

@Controller('api/post')
export class PostApiController {

  constructor(private readonly handleService: PostAPIService) {}

  @Post()
  async createPost(
    @Body() body: UserPost,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('post: /api/post')
    const verification = await verifyToken(token);
    const date = new Date().getTime().toString();
    if (verification === 'ok') {
      const result = await this.handleService.insertPost(body.user_id, body.text, date)
      axios.post(`${blockChainAddr}/api/log`, {
        user_id: body.user_id,
        operation: 'post: /api/post',
        timestamp: date
      })
      if (result) {
        res.status(201).send('success')
      } else {
        res.status(500).send('failed')
      }
    } else {
      res.status(401).send('not authorized')
    }
  }

  /**
   * 指定された投稿の更新差分を取得する
  */
  @Get('/history/:postId')
  async getPostHistory(
    @Param('postId') postId: string,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('get: /post/history/')
    const veryfication = await verifyToken(token);
    if (veryfication === 'ok') {
      const result = await this.handleService.selectPostsHistory(parseInt(postId));
      if (result === 'resorce not found') {
        res.status(404).send(result)
      } else {
        res.status(200).send(result)
      }
    } else {
      res.status(401).send('not authorized')
    }
  }

  @Put()
  async updatePost(
    @Body() body: UserPostDiff,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('put: /api/post')
    const verification = await verifyToken(token);
    if (verification === 'ok') {
      const result = await this.handleService.updatePost(body.user_id, body.post_id, body.text);
      if (result === 'resource not found') {
        res.status(404).send(result)
      } else {
        res.status(201).send(result)
      }
    } else {
      res.status(401).send('not authorized')
    }
  }

  @Delete()
  async deletePost(
    @Body() body: UserPost2Del,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('delete: /api/post')
    const verification = await verifyToken(token);
    if (verification === 'ok') {
      const result = await this.handleService.deletePost(body.post_id)
      if (result === 'success') {
        res.status(200).send(result)
      } else if (result === 'resource not found') {
        res.status(404).send('resource not found')
      } else {
        res.status(500).send('failed')
      }
    } else {
      res.status(401).send('not authorized')
    }
  }
}
