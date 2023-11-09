import axios from 'axios';
import Product from '../models/productModel.js';

const seedData = async (req, res) => {
    try {
        await Product.deleteMany();

        const URL = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

        await axios.get(URL).
        then((response) => {

           const {data} = response;
           Product.insertMany(data);

        }).catch(err => console.log(err))

        console.log('Data Imported');
        res.status(201).json({message :"Third Party API Data have been seeded to DB Successfully"});

    } catch (error) {
        console.error(`${error}`);
        res.status(500).send("Server Side Error");
    }
}

export default seedData;