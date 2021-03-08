import { ApiProperty } from '@nestjs/swagger'

export class UserPost {
  @ApiProperty()
  user_id: number;
  text: string;
} 

export class TextTransactionRelation {
  @ApiProperty()
  text_id: number;
  index: number;
  transaction_hash: string;
}
