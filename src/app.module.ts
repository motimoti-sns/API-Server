import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './cats/cats.controller';
import { ApiController } from './api/api.controller';
import { APIService } from './api/apiservice.service';
import { PostApiController } from './postAPI/postapi.controller';
import { PostAPIService } from './postAPI/postapi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Text } from './entities/text.entity';
import { Post } from './entities/userpost.entity';
import { PostTextRelation } from './entities/postTextRelation.entity';
import { TextTransactionRelation } from './entities/textTransactionRelation.entity';
import { Users } from './entities/users.entity';
import * as dotenv from 'dotenv';
dotenv.config()

interface Shar {
  lastHash: {
    [userId: number]: string
  }
}
class SharData {
  data: Shar
  constructor(data: Shar) {
    this.data = data
  }

  setLastHash (lastHash: {
    [userId: number]: string
  }) {
    this.data.lastHash = lastHash
  }
}

export const sharing = new SharData({lastHash: {}})

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER_NAME,
      password: process.env.DB_USER_PASSWORD,
      database: process.env.DATA_BASE,
      entities: [Users, Post, Text, PostTextRelation, TextTransactionRelation],
      synchronize: true,
    }),
  ],
  controllers: [AppController, CatsController, ApiController, PostApiController],
  providers: [AppService, APIService, PostAPIService],
})
export class AppModule {}
