import express from "express";
import dotenv from "dotenv";
import { paymentMiddleware } from "x402-express";

dotenv.config();

const payTo = process.env.ADDRESS;

if (!payTo) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = express();

app.use(
  paymentMiddleware(
    payTo,
    {
      "GET /weather": {
        // ALEO microcredits
        price: 100000,
        // network: "base" // uncomment for Base mainnet
        network: "ALEO",
      },
    },
  ),
);

app.get("/weather", (req, res) => {
  res.send({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});

const port = process.env.PORT || 4022;
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Set timeout to 10 minutes for Aleo transactions
server.timeout = 600000; // 10 minutes in milliseconds