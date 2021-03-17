import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Logs {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  user_id: number;

  @Column()
  transaction_hash: string;

  /**
   * apiのurl
   */
  @Column()
  operation: string;

  @Column()
  timestamp: string;
}