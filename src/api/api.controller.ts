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
  TextTransactionRelation,
  UserPostDiff,
  UserPost2Del,
  UserData,
  LoginData
} from './ApiProps';
import { DBHandleService } from './DBHandleService.service';
import { createToken, verifyToken } from './Auth';
import { Response } from 'express';

@Controller('api')
export class ApiController {

  constructor(private readonly handleService: DBHandleService) {}

  @Post('/post')
  async createPost(
    @Body() body: UserPost,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('post: /api/post')
    const verification = await verifyToken(token);
    if (verification === 'ok') {
      const result = await this.handleService.insertPost(body.user_id, body.text)
      if (result) {
        return 'success'
      } else {
        res.status(500).send('failed')
      }
    } else {
      res.status(401).send('not authorized')
    }
  }

  @Get('/posts/:offset/:limit')
  async getPosts(
    @Param('offset') offset: string,
    @Param('limit') limit: string,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('get: /api/post')
    const verification = await verifyToken(token);
    if (verification === 'ok') {
      if (parseInt(offset) >= 1 && parseInt(limit) === 0) {
        return '"limit" cannot be 0 when "offset" is more than 1'
      }
      const result = await this.handleService.selectPosts(parseInt(offset), parseInt(limit));
      return result
    } else {
      res.status(401).send('not authorized')
    }
  }

  /**
   * 指定された投稿の更新差分を取得する
  */
  @Get('/post/history/:postId')
  async getPostHistory(
    @Param('postId') postId: string,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('get: /post/history/')
    const veryfication = await verifyToken(token);
    if (veryfication === 'ok') {
      const result = await this.handleService.selectPostsHistory(parseInt(postId));
      return result
    } else {
      res.status(401).send('not authorized')
    }
  }

  @Put('/post')
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
        res.status(404).send('resource not found')
      } else {
        return result
      }
    } else {
      res.status(401).send('not authorized')
    }
  }

  @Delete('/post')
  async deletePost(
    @Body() body: UserPost2Del,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('delete: /api/post')
    const verification = await verifyToken(token);
    if (verification === 'ok') {
      const result = await this.handleService.deletePost(body.post_id)
      if (result) {
        return 'success'
      } else {
        res.status(500).send('failed')
      }
    } else {
      res.status(401).send('not authorized')
    }
  }

  @Get('/validate/:userId')
  async validate(
    @Param('userId') userId: string,
    @Headers('Authorization') token: string,
    @Res() res: Response
  ) {
    console.log('get: /validate/:userId')
    const verification = await verifyToken(token);
    if (verification === 'ok') {
      const result = await this.handleService.validateHashChain(parseInt(userId))
      return result
    } else {
      res.status(401).send('not authorized')
    }
  }

  @Post('/register')
  async register(@Body() body: UserData) {
    console.log('post: /register')
    const result = await this.handleService.register(body.email, body.name, body.password);
    if (result) {
      return 'success'
    } else {
      return 'failed'
    }
  }

  @Post('/login')
  async login(@Body() body: LoginData) {
    console.log('post: /login')
    const result = await this.handleService.signup(body.email, body.password);
    if (result === 'success') {
      return createToken(body.email);
    }
    return result
  }

  /**
   * 将来的にはブロックチェーンのサーバーのみがアクセス可能になるようにする
   */
  @Post('/relation/texthash')
  async insertRelation(@Body() body: TextTransactionRelation) {
    console.log('post: /relation/texthash')
    const result = await this.handleService.transactionInsert(body.transaction_hash, body.text_id, body.index);
    return result
  }
}
