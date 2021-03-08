import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TextTransactionRelation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text_id: number;

  @Column()

  transaction_hash: string;

  @Column()
  index: number
}

