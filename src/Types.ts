export type TJourney = {
  id: number;
  departure_time: string;
  return_time: string;
  departure_station_id: number;
  departure_station_nimi: string;
  return_station_id: number;
  return_station_nimi: string;
  covered_distance: number;
  duration: number;
};

export type TStation = {
  station_id: number;
  station_nimi: string;
  station_namn: string;
  station_name: string;
  station_osoite: string;
  station_adress: string;
  station_kaupunki: string;
  station_stad?: string;
  station_operator?: string;
  station_capacity: number;
  station_coord_x: number;
  station_coord_y: number;
  station_departures: number;
  station_returns: number;
};

export type Count = {
  count: number;
};
