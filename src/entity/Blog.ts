import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Status } from './Status';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  statusId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @CreateDateColumn({ type: 'timestamp' })
  createdDateTime: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDateTime: Date;
}
