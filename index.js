const express = require("express")
require('dotenv').config()
// import express from "express"

const githubData = {
    "login": "irfanhg07",
    "id": 129152508,
    "node_id": "U_kgDOB7K1_A",
    "avatar_url": "https://avatars.githubusercontent.com/u/129152508?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/irfanhg07",
    "html_url": "https://github.com/irfanhg07",
    "followers_url": "https://api.github.com/users/irfanhg07/followers",
    "following_url": "https://api.github.com/users/irfanhg07/following{/other_user}",
    "gists_url": "https://api.github.com/users/irfanhg07/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/irfanhg07/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/irfanhg07/subscriptions",
    "organizations_url": "https://api.github.com/users/irfanhg07/orgs",
    "repos_url": "https://api.github.com/users/irfanhg07/repos",
    "events_url": "https://api.github.com/users/irfanhg07/events{/privacy}",
    "received_events_url": "https://api.github.com/users/irfanhg07/received_events",
    "type": "User",
    "site_admin": false,
    "name": null,
    "company": null,
    "blog": "",
    "location": null,
    "email": null,
    "hireable": null,
    "bio": null,
    "twitter_username": null,
    "public_repos": 11,
    "public_gists": 0,
    "followers": 0,
    "following": 0,
    "created_at": "2023-03-28T07:01:30Z",
    "updated_at": "2024-08-22T16:32:41Z"
  }

const app = express()

// const port = 8080

app.get("/", (req,res)=>{
    res.send("Hellow welcome to the backend")

})

app.get("/github", (req, res)=> {
    res.json(githubData);
})

app.get("/youtube", (req , res)=>{
    res.send("<h1>This is youtube link </h1>")
})

app.listen(process.env.PORT, ()=>{
    console.log('App is listening on port ${port}')
})
