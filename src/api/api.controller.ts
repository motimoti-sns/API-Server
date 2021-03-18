import {
  Body,
  Headers,
  Controller,
  Post,
  Get,
  Param,
  Res
} from '@nestjs/common';
import {
  TextTransactionRelation,
  UserData,
  LoginData,
  LogData
} from './ApiProps';
import { APIService } from './apiservice.service';
import { createToken, verifyToken } from './../utils/Auth';
import { Response } from 'express';

@Controller('api')
export class ApiController {

  constructor(private readonly handleService: APIService) {}

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
    if (typeof result === 'number') {
      return createToken({email: body.email, userId: result});
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
  async insertTextRelation(@Body() body: TextTransactionRelation) {
    console.log('post: /relation/texthash')
    const result = await this.handleService.textTransactionInsert(body.transaction_hash, body.text_id, body.index);
    return result
  }

  /**
   * 将来的にはブロックチェーンのサーバーのみがアクセス可能になるようにする
   */
  @Post('/relation/log')
  async insertLogRelation(@Body() Body: LogData) {
    console.log('post: /relation/log')
    const result = await this.handleService.logTransactionInsert(
      Body.user_id,
      Body.operation,
      Body.transaction_hash,
      Body.timestamp
    );
    return result
  }
}
