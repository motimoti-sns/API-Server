import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './cats/cats.controller';
import { ApiController } from './api/api.controller';
import { DBHandleService } from './api/DBHandleService.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Text } from './text.entity';
import { Post } from './userpost.entity';
import { PostTextRelation } from './postTextRelation.entity';
import * as dotenv from 'dotenv';
dotenv.config()

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER_NAME,
      password: process.env.DB_USER_PASSWORD,
      database: process.env.DATA_BASE,
      entities: [Post, Text, PostTextRelation],
      synchronize: true,
    }),
  ],
  controllers: [AppController, CatsController, ApiController],
  providers: [AppService, DBHandleService],
})
export class AppModule {}
