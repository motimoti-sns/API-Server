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
      res.status(200).send(result)
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
      res.status(200).send(result)
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
    const result = await this.handleService.signin(body.email, body.password);
    if (result === 'success') {
      return createToken(body.email);
    }
    return result
  }

  @Get('/users')
  async getUsers() {
    console.log('get: /users')
    const result = await this.handleService.getUsers();
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
