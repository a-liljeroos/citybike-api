import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Station {
  @PrimaryColumn("integer")
  station_id: number;

  @Column("varchar", { length: 50 })
  station_nimi: string;

  @Column("varchar", { length: 50 })
  station_namn: string;

  @Column("varchar", { length: 50 })
  station_name: string;

  @Column("varchar", { length: 50 })
  station_osoite: string;

  @Column("varchar", { length: 50 })
  station_adress: string;

  @Column("varchar", { length: 30, nullable: true })
  station_kaupunki: string;

  @Column("varchar", { length: 30, nullable: true })
  station_stad: string;

  @Column("varchar", { length: 30, nullable: true })
  station_operator: string;

  @Column("smallint")
  station_capacity: number;

  @Column("numeric")
  station_coord_x: number;

  @Column("numeric")
  station_coord_y: number;
}
