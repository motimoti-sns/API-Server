import { Body, Controller, Post, Get, Put, Delete } from '@nestjs/common';
import { UserPost, TextTransactionRelation, UserPostDiff, UserPost2Del, UserData } from './ApiProps';
import { DBHandleService } from './DBHandleService.service';

@Controller('api')
export class ApiController {

  constructor(private readonly handleService: DBHandleService) {}

  @Post('/post')
  async createPost(@Body() body: UserPost) {
    console.log('post: /api/post')
    const result = await this.handleService.insertPost(body.user_id, body.text)
    let msg: string;
    if (result) {
      msg = 'success'
    } else {
      msg = 'failed'
    }
    return msg
  }

  @Get('/post')
  async getPosts() {
    console.log('get: /api/post')
    const result = await this.handleService.selectPosts();
    return result
  }

  @Put('/post')
  async updatePost(@Body() body: UserPostDiff) {
    console.log('put: /api/post')
    const result = await this.handleService.updatePost(body.user_id, body.post_id, body.text);
    if (result) {
      return 'success'
    } else {
      return 'failed'
    }
  }

  @Delete('/post')
  async deletePost(@Body() body: UserPost2Del) {
    console.log('delete: /api/post')
    const result = await this.handleService.deletePost(body.post_id)
    if (result) {
      return 'success'
    } else {
      return 'failed'
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
