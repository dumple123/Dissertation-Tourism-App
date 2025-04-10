import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

// Middleware to parse JSON
app.use(express.json())

// Import and use routers
import helloRouter from "./routes/hello.js" //test route
import userRouter from "./routes/user.js"  //user route

app.use("/hello", helloRouter)
app.use("/user", userRouter) // 

// Start server
server.listen("3000", function () {
    console.log("Server listening on port " + server.address().port)
})
