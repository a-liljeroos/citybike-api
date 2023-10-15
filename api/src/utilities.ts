import { TStation } from "./Types";

export function cleanData(obj: { [key: string]: string | number }): {
  [key: string]: string | number;
} {
  const result: { [key: string]: string | number } = {};

  // it removes the trailing and leading spaces from the values of the object
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      result[key] = value.trim();
    } else {
      result[key] = value;
    }
  }

  return result;
}

interface IsortObjectArray<T> {
  array: T[];
  key: keyof T;
  reverse?: boolean;
}

export function sortObjectArray<T>({
  array,
  key,
  reverse,
}: IsortObjectArray<T>): T[] {
  const sortedArray = array.slice().sort((a, b) => {
    if (a[key] < b[key]) {
      return -1;
    } else if (a[key] > b[key]) {
      return 1;
    } else {
      return 0;
    }
  });

  if (reverse) {
    return sortedArray.reverse();
  }
  return sortedArray;
}

export const exampleStation = {
  station_id: 59,
  station_nimi: "Etuniementie",
  station_namn: "Framnäsvägen",
  station_name: "Etuniementie",
  station_osoite: "Kalastajantie 6",
  station_adress: "Fiskarvägen 6",
  station_kaupunki: "Espoo",
  station_stad: "Esbo",
  station_operator: "CityBike Finland",
  station_capacity: 10,
  station_coord_x: "24.724835",
  station_coord_y: "60.160645",
};
