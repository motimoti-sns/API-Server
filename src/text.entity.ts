import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Text {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  body: string;

  @Column()
  index: number

  @Column()
  timestamp: string;
}
