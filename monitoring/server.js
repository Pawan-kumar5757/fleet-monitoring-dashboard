const express = require("express");
const http = require("http");
const mysql = require("mysql2");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});


// MYSQL CONNECTION
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pawan@123",
  database: "fleet_monitor"
});

db.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log("MySQL Connected");
  }
});


// STORE METRICS
let metrics = {
  liveDrivers: new Set(),
  trips: 0,
  violations: 0,
  riskScore: 0
};


// EVENT API
app.post("/event", (req, res) => {

  const { driverId, vehicleId, eventType, speed } = req.body;

  const query =
    "INSERT INTO events(driver_id,vehicle_id,event_type,speed) VALUES(?,?,?,?)";

  db.query(query, [driverId, vehicleId, eventType, speed]);

  metrics.liveDrivers.add(driverId);
  metrics.trips++;

  if (eventType !== "normal") {
    metrics.violations++;
  }

  if (speed > 80) {
    metrics.riskScore += 5;
  }

  const event = {
    driverId,
    vehicleId,
    eventType,
    speed,
    time: new Date()
  };

  io.emit("new-event", event);

  res.send("Event stored");
});


// RANDOM EVENT GENERATOR
function generateEvent() {

  const drivers = ["D1","D2","D3","D4","D5"];
  const vehicles = ["V1","V2","V3"];
  const events = ["speeding","harsh_braking","drowsiness","normal"];

  const driverId = drivers[Math.floor(Math.random()*drivers.length)];
  const vehicleId = vehicles[Math.floor(Math.random()*vehicles.length)];
  const eventType = events[Math.floor(Math.random()*events.length)];
  const speed = Math.floor(Math.random()*120);

  const query =
    "INSERT INTO events(driver_id,vehicle_id,event_type,speed) VALUES(?,?,?,?)";

  db.query(query,[driverId,vehicleId,eventType,speed]);

  metrics.liveDrivers.add(driverId);
  metrics.trips++;

  if(eventType !== "normal") metrics.violations++;
  if(speed > 80) metrics.riskScore += 5;

  const event = { driverId, vehicleId, eventType, speed };

  io.emit("new-event", event);
}


// GENERATE EVENT EVERY 3s
setInterval(generateEvent,3000);


server.listen(5000,()=>{
  console.log("Server running on port 5000");
});