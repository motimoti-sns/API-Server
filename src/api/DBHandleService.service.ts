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
      //テキストを追加
      queryRunner.manager.insert(Text, {user_id: userId, body: textBody, index: index, timestamp: date});
      const insertedText =  await queryRunner.manager.findOne(Text, {user_id: userId, body: textBody, index: index, timestamp: date})
      //投稿を追加
      queryRunner.manager.insert(Post, {user_id: userId, text_id: insertedText.id, timestamp: date});
      const insertedPost = await queryRunner.manager.findOne(Post, {user_id: userId, timestamp: date});
      queryRunner.manager.insert(PostTextRelation, {user_id: userId, text_id: insertedText.id, post_id: insertedPost.id});
      queryRunner.commitTransaction();
      succeeded = true
      await createHashChain(userId, textBody, insertedText.index, insertedText.id);
    } catch (e) {
      console.log(e)
      queryRunner.rollbackTransaction();
    }
    queryRunner.release();
    return succeeded
  }

  async selectPosts () {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect()
    const result: Array<{
      user_id: number,
      post_id: number,
      text_body: string,
      timestamp: string,
    }> = []
    const posts = await queryRunner.manager.find(Post, {is_deleted: false});
    for (const post of posts) {
      try {
        const textBody = await (await queryRunner.manager.findOne(Text, {id: post.text_id})).body;
        result.push({
          user_id: post.user_id,
          post_id: post.id,
          text_body: textBody,
          timestamp: post.timestamp,
        })
      } catch (e) {
        console.error(e)
      }
    }
    queryRunner.release();
    return result
  }

  async updatePost(userId: number, postId: number, textBody: string) {
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
      //テキストを追加
      queryRunner.manager.insert(Text, {user_id: userId, body: textBody, index: index, timestamp: date});
      const insertedText =  await queryRunner.manager.findOne(Text, {user_id: userId, body: textBody, index: index, timestamp: date});
      //投稿を更新
      queryRunner.manager.update(Post, postId, {text_id: insertedText.id});
      queryRunner.manager.insert(PostTextRelation, {user_id: userId, text_id: insertedText.id, post_id: postId});
      queryRunner.commitTransaction();
      succeeded = true
      await createHashChain(userId, textBody, insertedText.index, insertedText.id);
    } catch (e) {
      console.error(e);
      queryRunner.rollbackTransaction();
    }
    queryRunner.release();
    return succeeded
  }

  async transactionInsert (transactionHash: string, textId: number, index: number): Promise<string> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      queryRunner.manager.insert(TextTransactionRelation, {text_id: textId, transaction_hash: transactionHash, index: index});
      queryRunner.commitTransaction();
      queryRunner.release();
      return 'success'
    } catch (e) {
      console.error(e)
      queryRunner.rollbackTransaction();
      queryRunner.release();
      return 'failed'
    }
  }
}
