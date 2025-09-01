require("./instrument.js");
require('dotenv').config();

const email= require ( '@sendgrid/mail' ); 
const Sentry = require("@sentry/node");
const express = require("express");
const cors = require("cors");

email. setApiKey (process.env.SENDGRID_AP_KEY); 
const { PrismaClient } = require("./generated/prisma");
const { RENT_CONFIRMATION_TEMPLATE } = require("./utils/constants.js");

const prisma = new PrismaClient();

const app = express(); //Definição de rotas
const port = 3001; // Porta padrão

app.use(cors());
app.use(express.json());

let cars = [];

// Na Criação da Rota precisa infomrar 2 Parametros Caminho e / req, res

// Ira retornar uma listagem de carros com status 200
app.get("/cars", async (req, res) => {
  const allCars = await prisma.car.findMany();
  res.status(200).json(allCars);
});

// Ira criar um novo carro com status 201
app.post("/cars", async (req, res) => {
  console.log(req.body);
  const car = {
    name: req.body.name,
    category: req.body.category,
    seats: req.body.seats,
    price: req.body.price,
    transmission: req.body.transmission,
    fuel: req.body.fuel,
    image: req.body.image,
    available: req.body.available,
  };
  const newcar = await prisma.car.create({
    data: car,
  });
  res.status(201).json(newcar);
});

app.delete("/cars/:id", async (req, res) => {
  try {
    const deletedCar = await prisma.car.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json(deletedCar);
  } catch (error) {
    res.status(404).json({ error: "Car Not Found" });
  }
});

app.put("/cars/:id", async (req, res) => {
  try {
    const updatedCar = await prisma.car.update({
      where: {
        id: req.params.id
      },
      data: {
        name: req.body.name,
        category: req.body.category,
        seats: req.body.seats,
        price: req.body.price,
        transmission: req.body.transmission,
        fuel: req.body.fuel,
        image: req.body.image,
        available: req.body.available
      }

      })

      res.status(200).json(updatedCar)
 
       } catch (error) {
    res.status(404).json({ error: "Car Not Found" })
  }
})

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.get('/send-email', async (req, res) => {
  const emailContent= { 
  to : 'gomes.idb@gmail.com' , 
  from : 'gomes.idb@gmail.com' , 
  subject : 'Enviando um e-mail usando o SendGrid' , 
  html: RENT_CONFIRMATION_TEMPLATE,
}; 
try {
  await email.send(emailContent);
  res.status(200).json({ message:"Email enviado com sucesso!"});
} catch (error) {
  res.status(500).json({ message:"Erro ao enviar e-mail!"});
}
});

Sentry.setupExpressErrorHandler(app);

app.listen(port, () => {
  console.log(`Uma Api rodando na porta: ${port}`)
})
