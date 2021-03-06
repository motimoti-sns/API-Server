import { Entity, Column } from 'typeorm';


@Entity()
export class PostTextRelation {
  @Column()
  user_id: number;

  @Column()

  post_id: number;

  @Column()
  text_id: number;
}
