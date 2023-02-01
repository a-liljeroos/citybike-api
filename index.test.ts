import request from "supertest";
import app from ".";

// could not finish the tests here because of some import error with supertest appeared out of nowhere
// TypeError: Cannot set properties of undefined (setting 'strict')

describe("GET /stations/all", () => {
  it("should return status code 200 and list of stations", async () => {
    const res = await request(app).get("/stations/all");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          station_id: expect.any(Number),
          station_nimi: expect.any(String),
          station_namn: expect.any(String),
          station_name: expect.any(String),
          station_osoite: expect.any(String),
          station_adress: expect.any(String),
          station_kaupunki: expect.any(String),
          station_stad: expect.any(String),
          station_operator: expect.any(String),
          station_capacity: expect.any(Number),
          station_coord_x: expect.any(Number),
          station_coord_y: expect.any(Number),
          station_departures: expect.any(Number),
          station_returns: expect.any(Number),
        }),
      ])
    );
  });
});
