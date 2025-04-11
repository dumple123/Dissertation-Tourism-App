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
import signupRouter from './routes/signup.js' //Signup route

app.use("/hello", helloRouter)
app.use("/login", loginRouter) 
app.use("/signup", signupRouter)

// Start server
server.listen("3000", function () {
    console.log("Server listening on port " + server.address().port)
})
