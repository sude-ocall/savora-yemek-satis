import 'dotenv/config';
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

const PORT = 3000; 

app.listen(3000, "0.0.0.0", () => {
  console.log(`Server running on port 3000`);
});