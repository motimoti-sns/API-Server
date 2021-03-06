import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class PostTextRelation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()

  post_id: number;

  @Column()
  text_id: number;
}
