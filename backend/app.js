import http from "http"
import express from "express"
import cors from "cors"

const app = express()
const server = http.createServer(app)

// Middleware to parse JSON
app.use(express.json())
app.use(cors({ origin: "*" }));

// Import and use routers
import loginRouter from "./routes/login.js"  //login route
import signupRouter from './routes/signup.js' //Signup route
import refreshToken from "./utils/refreshToken.js" //Reresh JWT Token

app.use("/login", loginRouter) 
app.use("/signup", signupRouter)
app.use("/refreshToken", refreshToken)

// Start server
server.listen("3000", function () {
    console.log("Server listening on port " + server.address().port)
})
