import { ApiProperty } from '@nestjs/swagger'

export class UserPost {
  @ApiProperty()
  user_id: number;
  text: string;
} 
