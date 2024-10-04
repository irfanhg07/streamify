const express = require("express")
require('dotenv').config()
// import express from "express"

const app = express()

// const port = 8080

app.get("/", (req,res)=>{
    res.send("Hellow welcome to the backend")

})

app.get("/youtube", (req , res)=>{
    res.send("<h1>This is youtube link </h1>")
})

app.listen(process.env.PORT, ()=>{
    console.log('App is listening on port ${port}')
})
