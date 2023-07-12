import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Journey {
  @PrimaryColumn("integer")
  id: number;

  @Column("timestamptz")
  departure_time: string;

  @Column("timestamptz")
  return_time: string;

  @Column("smallint")
  departure_station_id: number;

  @Column("varchar", { length: 50 })
  departure_station_nimi: string;

  @Column("smallint")
  return_station_id: number;

  @Column("varchar", { length: 50 })
  return_station_nimi: string;

  @Column("numeric")
  covered_distance: number;

  @Column("numeric")
  duration: number;
}
