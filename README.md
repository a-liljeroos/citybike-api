<h1>Citybike Web App API Backend</h1>

<h2>👻 Using technologies:</h2>
<ul>
  <li>NodeJS</li>
    <li>Typescript</li>
  <li>PostgreSQL</li>
  <li>express, pg, dotenv, joi, cors, TypeORM, winston, uuid</li>
</ul>
<p>This the backend service of a small application where the user can browse Helsinki City Bike stations and journeys from the summer 2021. The data is imported from CSV files to the database.</p>

<p>The station data was imported and validated with PgAdmin 4 and the journey data with a script made in Python. There were only two requirements for the valdiation: don't import journeys that lasted for less than ten seconds and don't import journeys that covered distances shorter than 10 meters. I did the validation two times. Once in the import script and second time in the database tables. The script is in a folder "./postgres/python" if you are interested to take a look.</p>

<p>After that the data is exported to a .sql file to populate the docker image.</p>

<p>Application operations are logged with winston. Each request is logged with unique identifier, time, requested endpoint, user device information, execution time duration, request body/query & possible errors. </p>

<p>The api calls are validated with <a target="_blank" href="https://joi.dev/">joi</a> and database queries are done with <a target="_blank" href="https://typeorm.io">TypeORM</a>. The endpoints are listed below:</p>
<hr>
<h2>API Resources :</h2>
<h2>📥 /stations/all</h2>
<h3>method: <b>GET</b></h3>
<h4>✅ Success Response:  </h4>
<li>200 OK</li>
<pre>CONTENT
{ TStation[] }</pre>
<h4>❌ Error Responses:</h4>
<li>404 Not Found</li>
<pre>CONTENT
{ error: "Record not found." }</pre>
<li>503 Service Unavailable</li>
<pre>CONTENT
{ error: "Service Unavailable" }</pre>
<hr>
<h2>📥 /stations</h2>
<h3>method: <b>GET</b></h3>
<li>Query parameters:</li>
<p><i>station_id</i> - Number. The unique identifier of the station.</p>
<li>Request schema:</li>
<pre>
{
      station_id: Joi.number().min(1).required(),
}
</pre>
<h4>✅ Success Response:  </h4>
<li>200 OK</li>
<pre>{ TStation }</pre>
<br>
<h4>❌ Error Responses:</h4>
<li>400 Bad Request</li>
<pre>
CONTENT
{
        error: "Not a valid request.",
        message: "The query parameter does not match the expected schema.",
        requestQuery: req.query,
        correctExample: { station_id: 1 },
}
</pre>
<li>404 Not Found</li>
<pre>
CONTENT
{
  "error": "Record not found.",
  "requestQuery": req.query,
}
</pre>
<li>503 Service Unavailable</li>
<pre>
CONTENT
{ 
error: "Service Unavailable",
requestQuery: req.query
}</pre>
<hr>
<h2>📥 /stations/data</h2>
<h3>method: <b>GET</b></h3>
<li>Query Parameters</li>
<p><i>trafficInfo</i> - The unique identifier of the station.</p>
<h4>✅ Success Response:  </h4>
<li>200 OK</li>
<pre>CONTENT
{
  "station_departures": number;
  "station_returns": number;
};</pre>
<h4>❌ Error Responses:</h4>
<li>404 Not Found</li>
<pre>
CONTENT
{  "error": "Record not found." }
</pre>
<li>503 Service Unavailable</li>
<pre>
CONTENT
{ error: "Service Unavailable" }</pre>
<hr>
<h2>📥 /stations/edit</h2>
<h3>method: <b>PUT</b></h3>
<li>Request body schema:</li>
<pre>
{
      station_id: Joi.number().min(1).required(),
      station_nimi: Joi.string().min(1).max(50).required(),
      station_namn: Joi.string().min(1).max(50).required(),
      station_name: Joi.string().min(1).max(50).required(),
      station_osoite: Joi.string().min(1).max(50).required(),
      station_adress: Joi.string().min(1).max(50).required(),
      station_kaupunki: Joi.string().min(1).max(30).allow(null),
      station_stad: Joi.string().min(1).max(30).allow(null),
      station_operator: Joi.string().min(1).max(30).allow(null),
      station_capacity: Joi.number().min(1).max(32767).required(),
      station_coord_x: Joi.number().min(1).required(),
      station_coord_y: Joi.number().min(1).required(),
}
</pre>
<h4>✅ Success Response:  </h4>
<li>201 OK</li>
<pre>CONTENT
{
      message: "Resource updated successfully.",
      updatedResource: newStationData,
}</pre>
<h4>❌ Error Responses:</h4>
<li>400 Bad Request: </li>
<pre>CONTENT
{
        error: "Not a valid request.",
        message: "The request body does not match the expected schema.",
        requestBody: req.body,
        correctExample: exampleStation,
}</pre>
<li>404 Not Found / station_id does not exist</li>
<pre>CONTENT
{
     error: "Record not found.",
     requestBody: req.body,
}</pre>
<li>503 Service Unavailable</li>
<pre>
CONTENT
{ 
	error: "Service Unavailable",
	requestBody: req.body,
}</pre>
<hr>
<h2>📥 /journeys/pages</h2>
<h3>method: <b>GET</b></h3>
<li>Query Parameters</li>
<p><i>page</i> - The requested page number. Minimum value: 1.</p>
<h4>✅ Success Response:  </h4>
<li>200 OK</li>
<pre>CONTENT
{
      TJourney[],
      pagination: {
        currentPage: number,
        pageSize: number,
        totalJourneys: number,
        totalPages: number,
      },
    }</pre>
<h4>❌ Error Responses:</h4>
<li>400 Bad Request</li>
<pre>CONTENT
{
      error: "Not a valid request.",
      message: "The request query does not match the expected schema.",
      requestQuery: req.query,
      correctExample: { page: 1 },
 }</pre>
<li>404 Not Found</li>
<pre>CONTENT
{
error: "Record not found.",
requestQuery: req.query
}</pre>
<li>503 Service Unavailable</li>
<pre>CONTENT
{ error: "Service Unavailable" }</pre>
<hr>
 <h4>📜 Station object:</h4>
<pre>
type TStation = {
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
};
</pre>
<h4>📜 Journey object:</h4>
<pre>
type TJourney = {
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
</pre>
</br>

<h2>🤖Docker installation:</h2>
<h3>Requirements</h3>
<ul>
  <li><a target="_blank" href="https://www.docker.com/products/docker-desktop/">Docker desktop</a></li>    
</ul>
<h3>1. Download the database dump</h3>
<pre>
<a target="_blank" href="https://www.dropbox.com/s/7hkm6173hr1twt5/citybike.sql?dl=0">Citybike.sql</a>
</pre>
</br>
<h3>2. Download the repository and insert the .sql file in the postgres folder.</h3>
</br>
<h3>3. Create .env file in the api folder with the following content</h3>
<pre>
PORT=5000
TEST_PORT=5001
DATABASE_PASS=admin
</pre>
</br>
<h3>4. Navigate to the folder and run docker-compose.</h3>
<pre>
cd ./citybike-api
</pre>
<pre>
docker-compose up
</pre>
</br>
<h3>5. Install the frontend application. See guide here 👉 <a target="_blank" href="https://github.com/a-liljeroos/citybike-frontend">Citybike Frontend</a></h3>

<h2>🤖Local installation:</h2>
<h3>Requirements</h3>
<ul>
  <li>NodeJS</li>
  <li>PostgreSQL</li>
</ul>
</br>
<h2>💬Database Installation for windows machine:</h2>
</br>
<h3>1. Install postgreSQL</h3>
<pre>
<a target="_blank" href="https://www.postgresql.org/download/">https://www.postgresql.org/download/</a>
</pre>
</br>
<h3>2. Download the database dump</h3>
<pre>
<a target="_blank" href="https://www.dropbox.com/s/7hkm6173hr1twt5/citybike.sql?dl=0">Citybike.sql</a>
</pre>
</br>
<h3>3. Open CMD and navigate to the postgreSQL executable files</h3>
<pre>cd C:\Program Files\PostgreSQL\15\bin</pre>
</br>
<h3>4. Login in postgreSQL</h3>
<pre>psql -U postgres -W</pre>
<image src="https://github.com/a-liljeroos/citybike-api/blob/main/docs/login.png?raw=true"/>
</br>
<h3>5. Create a database named citybike</h3>
<pre>
  CREATE DATABASE citybike
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
</pre>
<image src="https://github.com/a-liljeroos/citybike-api/blob/main/docs/create-db.png?raw=true"/>
</br>
<h3>6. Quit psql</h3>
<pre>\q</pre>
</br>
<h3>7. Import the database dump file</h3>
</br>
<p>EXAMPLE: "psql -h localhost -d citybike -U postgres -f <strong><i>***path to the sql file**</i></strong>"</p>
<pre>psql -h localhost -d citybike -U postgres -f C:\citybike.sql</pre>
<image src="https://github.com/a-liljeroos/citybike-api/blob/main/docs/import-sql-file.PNG?raw=true"/>
</br>
<h3>8. Done! Close CMD 😎	</h3>
</br>
<h2>💬API Installation:</h2>
</br>
<h3>1. Install NodeJS</h3>
<pre><a target="_blank" href="https://www.postgresql.org/download/">https://nodejs.org/en/</a></pre>
</br>
<h3>2. Download the project repository and navigate to the folder with CMD</h3>
<pre>cd ./citybike-api</pre>
</br>
<h3>3. Create .env file in the api folder with the following content</h3>
<pre>
PORT=5000
TEST_PORT=5001
DATABASE_PASS=admin
</pre>
</br>
<h3>4. Change the host on the line 7 to 'localhost' in "./api/src/data-source.ts" -file</h3>
<pre>
host: "postgres"
host: "localhost"
</pre>
</br>
<h3>5. Install dependencies</h3>
<pre>npm install</pre>
</br>

<h3>6. Run</h3>
<pre>npm run dev</pre>
</br>
<h3>7. Install the frontend application. See guide here 👉 <a target="_blank" href="https://github.com/a-liljeroos/citybike-frontend">Citybike Frontend</a></h3>
