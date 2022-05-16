const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// DB_USER=doctorsPortal
// DB_PASS=tauhid1984


// middle were
app.use(cors());
app.use(express.json());


// api start


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqwop.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('doctors_portal').collection('services');
        const bookingCollection = client.db('doctors_portal').collection('bookings');

        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/available', async (req, res) => {
            const date = req.query.date;
            // get all services
            const services = await serviceCollection.find().toArray();

            // get of that day booking
            const query = { date: date };
            const bookings = await bookingCollection.find(query).toArray();

            // for each find booking
            services.forEach(service => {
                const serviceBookings = bookings.filter(book => book.treatment === service.name);
                const booked = serviceBookings.map(book => book.slot);
                const available = service.slots.filter(slot => !booked.includes(slot));
                service.slots = available;

            })

            res.send(services);
        })


        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
            const exists = await bookingCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, booking: exists })
            }
            const result = await bookingCollection.insertOne(booking);
            return res.send({ success: true, result });

        })

    }
    finally {

    }
}

run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Hello From tauhids doctor portal')
})

app.listen(port, () => {
    console.log(`Doctors app listening on port ${port}`)
})