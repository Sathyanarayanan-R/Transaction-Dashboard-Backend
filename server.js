
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import seedDataRoute from './routes/seeder.js'
import productRoutes from "./routes/product.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: '30mb', extended: true }))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(cors({origin: "*"}));

app.use("/seeddata", seedDataRoute);
app.use("/products", productRoutes);

const PORT = process.env.PORT|| 5000;

app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`));