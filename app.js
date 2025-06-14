const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("./src/configs/jwt");
const { login, register } = require("./src/controllers/account.controller");
const jobScheduleService = require("./src/services/job_schedule.service");

dotenv.config();

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || "development";

const app = express();

app.use(express.json({ limit: "50mb" }));

if (env !== "staging" && env !== "production") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerDocument = require("./src/configs/swagger");
  app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

const corsOptions = {
  origin: [
    "http://172.31.1.100",
    "http://172.31.1.100:8081",
    "http://172.31.1.100:8080",
    "http://localhost:8080",
    "http://localhost:8081",
    "https://m-vibe.com",
    "https://www.m-vibe.com",
    "https://nyc.m-vibe.com",
  ],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
// app.use(cors());
app.use("/image", express.static("./images"));
app.use("/companyimage", express.static("./companyimage"));

app.use(express.json());
app.use("/account/register", register);
app.use("/account/login", login);
app.use(jwt.verifyToken);
app.use(require("./src/routes/routes"));

app.listen(port, async () => {
  console.log(`Listening on port: ${port}`);
  console.log(`ENV on: ${env}`);
  console.log("Press Ctrl + C to quit.");
  if (env === "production" || env === "test") {
    // await jobScheduleService.scheduleJob_Automatic_Bank_Report();
    await jobScheduleService.scheduleJob_Costing();
    await jobScheduleService.scheduleJob_Costing_Labor_per_opn();
    await jobScheduleService.scheduleJob_Costing_FOH_cost_detail();
    await jobScheduleService.scheduleJob_Costing_Labor_cost_detail();
  }
});
