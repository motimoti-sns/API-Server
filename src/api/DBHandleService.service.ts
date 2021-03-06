import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Post } from '../entities/userpost.entity';
import { Text } from '../entities/text.entity';
import { PostTextRelation } from '../entities/postTextRelation.entity';
import { TextTransactionRelation} from '../entities/textTransactionRelation.entity';
import { createHash } from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config()
import axios from 'axios';

function stashHash (previousHash: string, currentHash: string) {
  return createHash('sha256')
    .update(previousHash + currentHash)
    .digest('hex')
}

function hash (toHash: string) {
  return createHash('sha256')
    .update(toHash)
    .digest('hex')
}

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
      queryRunner.manager.insert(PostTextRelation, {user_id: userId, text_id: insertedText.id, post_id: insertedPost.id});
      const previousTransactionHash = await queryRunner.manager.findOne(TextTransactionRelation, {text_id: previousText.id});
      queryRunner.commitTransaction();
      succeeded = true
      if (previousTransactionHash) {
        try {
          const prevTransactionBody = await axios.get(`${process.env.BLOCKCHAIN_ADDRESS}/api/transaction/${previousTransactionHash.transaction_hash}`);
          const currentHash = stashHash(prevTransactionBody.data.hash, hash(textBody));
          await axios.post(`${process.env.BLOCKCHAIN_ADDRESS}/api/post`, {
            user_id: userId,
            previous_hash: prevTransactionBody.data.hash,
            hash: currentHash,
            index: index,
          });
        } catch (e) {
          console.log(e)
        }
      } else {
        await axios.post(`${process.env.BLOCKCHAIN_ADDRESS}/api/post`, {
          user_id: userId,
          previous_hash: hash('genesis'),
          hash: stashHash(hash('genesis'), hash(textBody)),
          index: index,
        });
      }
    } catch (e) {
      console.log(e)
      queryRunner.rollbackTransaction();
    } finally {
      return succeeded
    }
  }
}
