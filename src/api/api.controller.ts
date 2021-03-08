import { Body, Controller, Post, Get } from '@nestjs/common';
import { UserPost, TextTransactionRelation } from './ApiProps';
import { DBHandleService } from './DBHandleService.service';

@Controller('api')
export class ApiController {

  constructor(private readonly handleService: DBHandleService) {}

  @Post('/post')
  async createPost(@Body() body: UserPost) {
    const result = await this.handleService.insertPost(body.user_id, body.text)
    let msg: string;
    if (result) {
      msg = 'success'
    } else {
      msg = 'failed'
    }
    return msg
  }

  /**
   * 将来的にはブロックチェーンのサーバーのみがアクセス可能になるようにする
   */
  @Post('/relation/texthash')
  async insertRelation(@Body() body: TextTransactionRelation) {
    const result = await this.handleService.transactionInsert(body.transaction_hash, body.text_id, body.index);
    return result
  }
}
