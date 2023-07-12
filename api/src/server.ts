import app from ".";
import dotenv from "dotenv";
dotenv.config();
let port = process.env.PORT;

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
