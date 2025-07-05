import mongoose from 'mongoose';
import debug from 'debug';
import cors from 'cors';
import models from './models/index.js';
import routes from './routes/index.js'
import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import * as dotenv from 'dotenv' 
dotenv.config()

//Initialise our app by creating express object
const app = express();
// To parse JSON we use express.json
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// Initialise the routes
routes(app);
// Establish the connection with DB
function database() {
    const connectionParams = {
        useNewUrlParser : true,
        useUnifiedTopology : true
    }
    try{
        mongoose.connect(process.env.MONGO_URI, connectionParams);
        console.log('Database connected successfully');
    } catch(error){
        console.log(error);
        console.log("Database connection failed");
    }
}

database();


export default app;
