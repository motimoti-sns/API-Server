import { Body, Controller, Post, Req } from '@nestjs/common';
import { UserPost } from './ApiProps';

@Controller('api')
export class ApiController {
  @Post('/post')
  createPost(@Body() body: UserPost) {
    return `user_id: ${body.user_id}, text: ${body.text}`
  }
}
