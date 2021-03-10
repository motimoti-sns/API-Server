import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()

  password: string;

  @Column({default: false})
  loggedIn: boolean;

  @Column({default: 0})
  post_count: number;
}

