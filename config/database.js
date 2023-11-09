import mongoose from 'mongoose';

const db_connect = async () =>{
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB connected with ${connect.connection.host}`);

    }catch(err){
        console.error(`Error: ${err.message}`);
        process.exit(1)
    }
}

export default db_connect;  