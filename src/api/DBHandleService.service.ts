import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Post } from '../entities/userpost.entity';
import { Text } from '../entities/text.entity';
import { PostTextRelation } from '../entities/postTextRelation.entity';
import { TextTransactionRelation} from '../entities/textTransactionRelation.entity';
import { createHashChain } from './BlockChainFuncs';
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
      const previousText = await queryRunner.manager.findOne(Text, {user_id: userId}, {order: {id: 'DESC'}});
      let index: number;
      index = 0
      if (previousText) {
        index = previousText.index + 1
      }
      queryRunner.manager.insert(Text, {user_id: userId, body: textBody, index: index, timestamp: date});
      const insertedText =  await queryRunner.manager.findOne(Text, {user_id: userId, body: textBody, index: index, timestamp: date})
      queryRunner.manager.insert(Post, {user_id: userId, text_id: insertedText.id, timestamp: date});
      const insertedPost = await queryRunner.manager.findOne(Post, {user_id: userId, timestamp: date});
      queryRunner.manager.insert(PostTextRelation, {user_id: userId, text_id: insertedText.id, post_id: insertedPost.id});
      queryRunner.commitTransaction();
      succeeded = true
      await createHashChain(userId, textBody, insertedText.index, insertedText.id);
      return succeeded
    } catch (e) {
      console.log(e)
      queryRunner.rollbackTransaction();
    }
    return succeeded
  }

  async selectPosts () {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect()
    const result: Array<{
      userId: number,
      postId: number,
      textBody: string,
      timestamp: string,
    }> = []
    const posts = await queryRunner.manager.find(Post, {is_deleted: false});
    for (const post of posts) {
      result
    }
  }

  async transactionInsert (transactionHash: string, textId: number, index: number): Promise<string> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      queryRunner.manager.insert(TextTransactionRelation, {text_id: textId, transaction_hash: transactionHash, index: index});
      queryRunner.commitTransaction();
      return 'success'
    } catch (e) {
      console.error(e)
      queryRunner.rollbackTransaction();
      return 'failed'
    }
  }
}
