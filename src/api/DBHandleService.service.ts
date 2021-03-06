import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Post } from '../userpost.entity';
import { Text } from '../text.entity';
import { PostTextRelation } from '../postTextRelation.entity';
import * as dotenv from 'dotenv';
dotenv.config()
import axios from 'axios';

@Injectable()
export class DBHandleService {
  constructor(private connection: Connection) {}
  async insertPost(userId: number, textBody: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let succeeded: boolean;
    succeeded = false;
    try {
      const date = new Date().getTime().toString()
      queryRunner.manager.insert(Post, {user_id: userId, timestamp: date});
      const insertedPost = await queryRunner.manager.findOne(Post, {user_id: userId, timestamp: date});
      const previousText = await queryRunner.manager.findOne(Text, {user_id: userId}, {order: {id: 'DESC'}});
      let index: number;
      index = 0
      if (previousText) {
        index = previousText.index + 1
      }
      queryRunner.manager.insert(Text, {user_id: userId, body: textBody, index: index, timestamp: date});
      const insertedText =  await queryRunner.manager.findOne(Text, {user_id: userId, body: textBody, index: index, timestamp: date})
      queryRunner.manager.insert(PostTextRelation, {user_id: userId, text_id: insertedText.id, post_id: insertedPost.id})
      queryRunner.commitTransaction();
      succeeded = true
    } catch (e) {
      console.log(e)
      queryRunner.rollbackTransaction();
    } finally {
      return succeeded
    }
  }
}
