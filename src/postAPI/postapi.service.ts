import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Post } from '../entities/userpost.entity';
import { Text } from '../entities/text.entity';
import { PostTextRelation } from '../entities/postTextRelation.entity';
import { createHashChain } from './BlockChain';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PostAPIService {
  constructor(private connection: Connection) {}
  async insertPost(userId: number, textBody: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let succeeded: boolean;
    succeeded = false;
    try {
      const date = new Date().getTime().toString();
      const previousText = await queryRunner.manager.findOne(
        Text,
        { user_id: userId },
        { order: { id: 'DESC' } }
      );
      let index: number;
      index = 0;
      if (previousText) {
        index = previousText.index + 1;
      }
      //テキストを追加
      queryRunner.manager.insert(Text, {
        user_id: userId,
        body: textBody,
        index: index,
        timestamp: date,
      });
      const insertedText = await queryRunner.manager.findOne(Text, {
        user_id: userId,
        body: textBody,
        index: index,
        timestamp: date,
      });
      //投稿を追加
      queryRunner.manager.insert(Post, {
        user_id: userId,
        text_id: insertedText.id,
        timestamp: date,
      });
      const insertedPost = await queryRunner.manager.findOne(Post, {
        user_id: userId,
        timestamp: date,
      });
      queryRunner.manager.insert(PostTextRelation, {
        user_id: userId,
        text_id: insertedText.id,
        post_id: insertedPost.id,
      });
      queryRunner.commitTransaction();
      succeeded = true;
      await createHashChain(
        userId,
        textBody,
        insertedText.index,
        insertedText.id
      );
    } catch (e) {
      console.log(e);
      queryRunner.rollbackTransaction();
    }
    queryRunner.release();
    return succeeded;
  }
  async updatePost(userId: number, postId: number, textBody: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    const post = await queryRunner.manager.findOne(Post, {
      where: { id: postId },
    });
    let msg: string;
    if (post) {
      await queryRunner.startTransaction();
      try {
        const date = new Date().getTime().toString();
        const previousText = await queryRunner.manager.findOne(
          Text,
          { user_id: userId },
          { order: { id: 'DESC' } }
        );
        let index: number;
        index = 0;
        if (previousText) {
          index = previousText.index + 1;
        }
        //テキストを追加
        queryRunner.manager.insert(Text, {
          user_id: userId,
          body: textBody,
          index: index,
          timestamp: date,
        });
        const insertedText = await queryRunner.manager.findOne(Text, {
          user_id: userId,
          body: textBody,
          index: index,
          timestamp: date,
        });
        //投稿を更新
        queryRunner.manager.update(Post, postId, { text_id: insertedText.id });
        queryRunner.manager.insert(PostTextRelation, {
          user_id: userId,
          text_id: insertedText.id,
          post_id: postId,
        });
        queryRunner.commitTransaction();
        msg = 'success';
        await createHashChain(
          userId,
          textBody,
          insertedText.index,
          insertedText.id
        );
      } catch (e) {
        console.error(e);
        queryRunner.rollbackTransaction();
        msg = 'failed';
      }
    } else {
      msg = 'resource not found';
    }
    queryRunner.release();
    return msg;
  }

  async deletePost(postId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    const post = await queryRunner.manager.findOne(Post, {
      where: { id: postId },
    });
    let msg: string;
    if (post && !post.is_deleted) {
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.update(Post, postId, { is_deleted: true });
        await queryRunner.commitTransaction();
        msg = 'success';
      } catch (e) {
        console.error(e);
        await queryRunner.rollbackTransaction();
        msg = 'failed';
      }
    } else {
      return 'resource not found';
    }
    await queryRunner.release();
    return msg;
  }

  async selectPostsHistory(postId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const rels = await queryRunner.manager.find(PostTextRelation, {
        where: { post_id: postId },
      });
      if (rels.length === 0) {
        return 'resorce not found';
      }
      const result: Array<string> = [];
      for (const rel of rels) {
        const text = await queryRunner.manager.findOne(Text, {
          where: { id: rel.text_id },
        });
        result.push(text.body);
      }
      await queryRunner.release();
      return result;
    } catch (e) {
      console.error(e);
      await queryRunner.release();
      return 'failed';
    }
  }
}
