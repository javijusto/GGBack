require("dotenv").config();

const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const port = 3000;

const {
  inicio,
  entradaCaja,
  salidaCaja,
  pagoCuota
} = require("./controllers/inventario.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get("/", inicio);
app.post("/entrada", entradaCaja);
app.post("/salida", salidaCaja);
app.post("/cuota", pagoCuota);

app.listen(port, () => {
  console.log(`Servidor operativo: ${port}`);
})
