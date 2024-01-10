import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Users {
  @PrimaryColumn("integer")
  user_id: number;

  @Column("varchar", { length: 18 })
  username: string;

  @Column("varchar", { length: 60 })
  password: string;

  @Column("varchar", { length: 255, nullable: true })
  email: string;
}
