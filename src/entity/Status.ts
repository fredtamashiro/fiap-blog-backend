import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
