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

export class TextTransactionRelation {
  @ApiProperty()
  text_id: number;
  index: number;
  transaction_hash: string;
}
