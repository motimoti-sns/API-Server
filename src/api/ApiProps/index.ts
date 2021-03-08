import { ApiProperty } from '@nestjs/swagger'

export class UserData {
  @ApiProperty()

  email: string;

  name: string;

  password: string;
}

export class LoginData {
  @ApiProperty()

  email: string;
  password: string;
}

export class UserPost {
  @ApiProperty()
  user_id: number;
  text: string;
} 

export class UserPostDiff {
  @ApiProperty()
  user_id: number;
  post_id: number;
  text: string;
}

export class UserPost2Del {
  @ApiProperty()
  post_id: number;
}

export class TextTransactionRelation {
  @ApiProperty()
  text_id: number;
  index: number;
  transaction_hash: string;
}
