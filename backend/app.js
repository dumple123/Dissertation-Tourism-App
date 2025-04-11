import http from "http"
import express from "express"
import cors from "cors"

const app = express()
const server = http.createServer(app)

// Middleware to parse JSON
app.use(express.json())
app.use(cors({ origin: "*" }));

// Import and use routers
import helloRouter from "./routes/hello.js" //test route
import loginRouter from "./routes/login.js"  //login route

app.use("/hello", helloRouter)
app.use("/login", loginRouter) // 

// Start server
server.listen("3000", function () {
    console.log("Server listening on port " + server.address().port)
})
