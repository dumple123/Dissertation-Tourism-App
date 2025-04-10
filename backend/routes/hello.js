import express from "express"
const router=express.Router()

router.get("/", (req, res) => {
    return res.status(200).json("hello world")
})

router.post("/test", (req, res) => {
    try {
        const testname = req.body.test
        return res.status(200).json({
            message: `message: ${testname}`
        })
    } catch (error) {
        console.error(error)
    }
})

export default router