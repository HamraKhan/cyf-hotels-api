const express = require("express");
const app = express();
app.use(express.json());

const { Pool } = require('pg');

//setting for how heroku sets up postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get("/hotels", function(req, res) {
    const hotelNameQuery = req.query.name;
    let query = `SELECT * FROM hotels ORDER BY name`;
    let params = [];
    if (hotelNameQuery) {
        query = `SELECT * FROM hotels WHERE name LIKE $1 ORDER BY name`;
        params.push(`%${hotelNameQuery}%`);
    }

    pool
      .query(query, params)
      .then((result) => res.json(result.rows))
      .catch((error) => {
        console.error(error);
        res.status(500).json(error);
      });
});

app.get("/bookings", function (req, res) {
  pool
    .query("SELECT * FROM bookings;")
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

app.get("/hotels", function (req, res) {
  pool
    .query("SELECT * FROM hotels;")
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

app.get("/hotels/:hotelId", function (req, res) {
    const hotelId = req.params.hotelId;

    pool
      .query("SELECT * FROM hotels WHERE id=$1", [hotelId])
      .then((result) => res.json(result.rows))
      .catch((error) => {
        console.error(error);
        res.status(500).json(error);
      });
})

app.post("/hotels", function (req, res) {
    const newHotelName = req.body.name;
    const newHotelRooms = req.body.rooms;
    const newHotelPostcode = req.body.postcode;

    const query =
        "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";

    pool.query(query, [newHotelName, newHotelRooms, newHotelPostcode])
        .then(() => res.send("Hotel created!"))
          .catch((error) => {
            console.error(error);
            res.status(500).json(error);
          });
});

app.post("/customers", function (req, res) {
    const newCustomerName = req.body.name;
    const newCustomerEmail = req.body.email;
    const newCustomerAddress = req.body.address;
    const newCustomerCity = req.body.city;
    const newCustomerPostcode = req.body.postcode;
    const newCustomerCountry = req.body.country;

    const query =
        "INSERT INTO customers (name, email, address, city, postcode, country) VALUES ($1, $2, $3, $4, $5, $6)";
    
    pool.query(query, [newCustomerName, newCustomerEmail, newCustomerAddress, newCustomerCity, newCustomerPostcode, newCustomerCountry])
        .then(() => res.send("Customer created!"))
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        });
});


app.put("/customers/:customerId", (req, res) => {
  const customerId = req.params.customerId;
  const { email, address, city, postcode, country } = req.body;
  const customerDetails = {};

  if (email) customerDetails.email = email;
  if (address) customerDetails.address = address;
  if (city) customerDetails.city = city;
  if (postcode) customerDetails.postcode = postcode;
  if (country) customerDetails.country = country;

  let queryString = 'UPDATE customers SET '
  for(let key in customerDetails){
    queryString += `${key} = '${customerDetails[key]}',`
  }
  queryString = queryString.slice(0, queryString.length - 1);
  queryString += ` WHERE customers.id = ${customerId};`
  console.log(queryString);

  pool
    .query(queryString)
    .then(() => res.send(`Customer ${customerId} updated!`))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });

});

const port = process.env.PORT
app.listen(port, function () {
  console.log(`Your app is running on port ${port}`);
});