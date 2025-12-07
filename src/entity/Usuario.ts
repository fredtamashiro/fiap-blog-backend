import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 50, unique: true })
  login: string;

  @Column({ length: 255 })
  senha: string;

  @Column({
    type: "enum",
    enum: ["professor", "aluno"],
    enumName: "tipo",
    default: "aluno"
  })
  tipo: "professor" | "aluno";

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
