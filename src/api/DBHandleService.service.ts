import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Post } from '../userpost.entity';


@Injectable()
export class DBHandleService {
  constructor(private connection: Connection) {}
  async insert(userId: number, textBody: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let succeeded: boolean;
    succeeded = false;
    try {
      const date = new Date().toString()
      queryRunner.manager.insert(Post, {user_id: userId, timestamp: date});
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
