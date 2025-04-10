import express from "express"
import pkg from "@prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const { PrismaClient } = pkg
const prisma = new PrismaClient()
const router = express.Router()


// POST /user/signup
router.post("/signup", async (req, res) => {
    const { email, username, password } = req.body

    // Basic input validation
    if (!email || !username || !password) {
        return res.status(400).json({ error: "All fields are required" })
    }

    try {
        // Check if the email is already in use
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" })
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the new user
        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        })

        res.status(201).json({ message: "User created successfully", userId: newUser.id })
    } catch (err) {
        console.error("Signup error:", err)
        res.status(500).json({ error: "Internal server error" })
    }
})

// POST /user/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username }, // data you want inside token
            process.env.JWT_SECRET, // secret key
            { expiresIn: "1h" } // optional expiry
          )
        res.status(200).json({
            message: "Login successful",
            token,
            userId: user.id,
            username: user.username
        })
    } catch (err) {
        console.error("Login error:", err)
        res.status(500).json({ error: "Internal server error" })
    }
})

export default router
