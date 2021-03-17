import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Post } from '../entities/userpost.entity';
import { Text } from '../entities/text.entity';
import { TextTransactionRelation } from '../entities/textTransactionRelation.entity';
import { Logs } from '../entities/logs.entity';
import { Users } from '../entities/users.entity';
import { stackHash, hash } from '../utils/BlockChain';
import * as md5 from 'md5';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const blockChainAddr = process.env.BLOCKCHAIN_ADDRESS;

@Injectable()
export class APIService {
  constructor(private connection: Connection) {}

  async register(email: string, name: string, password: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let succeeded: boolean;
    succeeded = false;
    try {
      const encryptedPassword = md5(password);
      await queryRunner.manager.insert(Users, {
        name: name,
        email: email,
        password: encryptedPassword,
      });
      await queryRunner.commitTransaction();
      succeeded = true;
      await queryRunner.release();
    } catch (e) {
      console.error(e);
      queryRunner.rollbackTransaction();
    }
    return succeeded;
  }

  async signin(email: string, password: string): Promise<string> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const user = await queryRunner.manager.findOne(Users, { email: email });
      await queryRunner.release();
      if (user) {
        if (user.password === md5(password)) {
          return 'success';
        } else {
          return 'invalid';
        }
      } else {
        return 'invalid';
      }
    } catch (e) {
      console.error(e);
      return 'failed';
    }
  }
  async selectPosts(offset?: number, limit?: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    const result: Array<{
      user_id: number;
      post_id: number;
      text_body: string;
      timestamp: string;
    }> = [];
    const posts = await queryRunner.manager.find(Post, {
      where: { is_deleted: false },
      take: limit,
      skip: offset,
    });
    for (const post of posts) {
      try {
        const textBody = await (
          await queryRunner.manager.findOne(Text, { id: post.text_id })
        ).body;
        result.push({
          user_id: post.user_id,
          post_id: post.id,
          text_body: textBody,
          timestamp: post.timestamp,
        });
      } catch (e) {
        console.error(e);
      }
    }
    queryRunner.release();
    return result;
  }

  async validateHashChain(userId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const texts = await queryRunner.manager.find(Text, {
        order: { index: 'ASC' },
        where: { user_id: userId },
      });
      let currentHash: string;
      currentHash = hash('genesis');
      for (const text of texts) {
        const rel = await queryRunner.manager.findOne(TextTransactionRelation, {
          where: { text_id: text.id },
        });
        const hashInBlockChain = await axios.get(
          `${blockChainAddr}/api/transaction/${rel.transaction_hash}`
        );
        currentHash = stackHash(currentHash, hash(text.body));
        console.log('s: ', currentHash);
        console.log('b: ', hashInBlockChain.data.hash);
        if (currentHash !== hashInBlockChain.data.hash) {
          await queryRunner.release();
          return 'invalid';
        }
      }
    } catch (e) {
      console.error(e);
    }
    await queryRunner.release();
    return 'valid';
  }

  async getUsers() {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const result = await queryRunner.manager.find(Users);
      await queryRunner.release();
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async textTransactionInsert(
    transactionHash: string,
    textId: number,
    index: number
  ): Promise<string> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(TextTransactionRelation, {
        text_id: textId,
        transaction_hash: transactionHash,
        index: index,
      });
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return 'success';
    } catch (e) {
      console.error(e);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return 'failed';
    }
  }
  
  async logTransactionInsert(
    userId: number,
    operation: string,
    transactionHash: string,
    timestamp: string,
  ): Promise<string> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.insert(Logs, {
        user_id: userId, 
        operation: operation,
        transaction_hash: transactionHash,
        timestamp: timestamp,
      });
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return 'success';
    } catch (e) {
      console.error(e);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return 'failed';
    }
  }
}
