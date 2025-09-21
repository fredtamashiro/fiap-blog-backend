import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Status } from './Status';
import { Usuario } from './Usuario';

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

  @Column()
  usuarioId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @CreateDateColumn()
  createdDateTime: Date;

  @UpdateDateColumn()
  updatedDateTime: Date;
}
