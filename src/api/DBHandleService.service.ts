import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Post } from '../entities/userpost.entity';
import { Text } from '../entities/text.entity';
import { PostTextRelation } from '../entities/postTextRelation.entity';
import { TextTransactionRelation} from '../entities/textTransactionRelation.entity';
import { Users } from '../entities/users.entity';
import { createHashChain, stackHash, hash } from './BlockChain';
import * as md5 from 'md5';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config()

const blockChainAddr = process.env.BLOCKCHAIN_ADDRESS

@Injectable()
export class DBHandleService {
  constructor(private connection: Connection) {}

  async register(email: string, name: string, password: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let succeeded: boolean;
    succeeded = false;
    try {
      const encryptedPassword = md5(password)
      await queryRunner.manager.insert(Users, {name: name, email: email, password: encryptedPassword});
      await queryRunner.commitTransaction();
      succeeded = true
      await queryRunner.release();
    } catch (e) {
      console.error(e);
      queryRunner.rollbackTransaction();
    }
    return succeeded
  }

  async signup (email: string, password: string): Promise<string> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const user = await queryRunner.manager.findOne(Users, {email: email});
      await queryRunner.release();
      if (user) {
        if (user.password === md5(password)) {
          return 'success'
        } else {
          return 'invalid'
        }
      } else {
        return 'invalid'
      }
    } catch (e) {
      console.error(e);
      return 'failed'
    }
  }

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

  async selectPosts (offset?: number, limit?: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect()
    const result: Array<{
      user_id: number,
      post_id: number,
      text_body: string,
      timestamp: string,
    }> = []
    const posts = await queryRunner.manager.find(Post, { where: { is_deleted: false }, take: limit, skip: offset});
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
    const post = await queryRunner.manager.findOne(Post, { where: {id: postId,}});
    let msg: string;
    if (post) {
      await queryRunner.startTransaction();
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
        msg = 'success'
        await createHashChain(userId, textBody, insertedText.index, insertedText.id);
      } catch (e) {
        console.error(e);
        queryRunner.rollbackTransaction();
        msg = 'failed'
      }
    } else {
      msg = 'resource not found'
    }
    queryRunner.release();
    return msg
  }

  async deletePost(postId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    const post = await queryRunner.manager.findOne(Post, {where: {id: postId}});
    let msg: string;
    if (post && !post.is_deleted) {
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.update(Post, postId, {is_deleted: true});
        await queryRunner.commitTransaction();
        msg = 'success'
      } catch (e) {
        console.error(e)
        await queryRunner.rollbackTransaction();
        msg = 'failed'
      }
    } else {
      return 'resource not found'
    }
    await queryRunner.release()
    return msg
  }

  async selectPostsHistory(postId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect()
    try {
      const rels = await queryRunner.manager.find(PostTextRelation, {where: {post_id: postId}});
      if (rels.length === 0) {
        return 'resorce not found'
      }
      const result: Array<string> = [];
      for (const rel of rels) {
        const text = await queryRunner.manager.findOne(Text, { where: {id: rel.text_id}});
        result.push(text.body);
      }
      await queryRunner.release();
      return result
    } catch (e) {
      console.error(e);
      await queryRunner.release();
      return 'failed'
    }
  }

  async validateHashChain (userId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const texts = await queryRunner.manager.find(Text, {order: {index: 'ASC'}, where: {user_id: userId}});
      let currentHash: string;
      currentHash = hash('genesis');
      for (const text of texts) {
        const rel = await queryRunner.manager.findOne(TextTransactionRelation, {where: {text_id: text.id}});
        const hashInBlockChain = await axios.get(`${blockChainAddr}/api/transaction/${rel.transaction_hash}`);
        currentHash = stackHash(currentHash, hash(text.body))
        console.log('s: ', currentHash);
        console.log('b: ', hashInBlockChain.data.hash)
        if (currentHash !== hashInBlockChain.data.hash) {
          await queryRunner.release();
          return 'invalid'
        }
      }
    } catch (e) {
      console.error(e);
    }
    await queryRunner.release();
    return 'valid'
  }

  async getUsers () {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.manager.find(Users);
      return result
    } catch (e) {
      console.log(e)
    }
    await queryRunner.release();
  } 

  async transactionInsert (transactionHash: string, textId: number, index: number): Promise<string> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(TextTransactionRelation, {text_id: textId, transaction_hash: transactionHash, index: index});
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return 'success'
    } catch (e) {
      console.error(e)
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return 'failed'
    }
  }
}
