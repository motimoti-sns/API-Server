import { Body, Controller, Post, Req } from '@nestjs/common';
import { UserPost } from './ApiProps';
import { DBHandleService } from './DBHandleService.service';

@Controller('api')
export class ApiController {

  constructor(private readonly handleService: DBHandleService) {}

  @Post('/post')
  async createPost(@Body() body: UserPost) {
    const result = await this.handleService.insert(body.user_id, body.text)
    let msg: string;
    if (result) {
      msg = 'success'
    } else {
      msg = 'failed'
    }
    return msg
  }
}
