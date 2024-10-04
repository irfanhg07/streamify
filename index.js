import express from 'express';
import { config as configDotenv } from 'dotenv';

configDotenv();



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


  const jokes = [
    { id: 1, title: "Why don’t skeletons fight each other?", content: "They don’t have the guts." },
    { id: 2, title: "What do you call fake spaghetti?", content: "An impasta." },
    { id: 3, title: "Why was the math book sad?", content: "It had too many problems." },
    { id: 4, title: "Why don’t scientists trust atoms?", content: "Because they make up everything!" },
    { id: 5, title: "What did one ocean say to the other ocean?", content: "Nothing, they just waved." }
  ];
  

const app = express()
// For frontend purpose Import static files
app.use(express.static('frontend/dist'));
const port = process.env.PORT || 5000

// const port = 8080

// app.get("/", (req,res)=>{
//     res.send("Hellow welcome to the backend")

// })

app.get("/api/jokes", (req, res) => {
    res.json(jokes); // Sends the jokes array as JSON
});

app.get("/youtube", (req , res)=>{
    res.send("<h1>This is youtube link </h1>")
})

app.listen(port, ()=>{
    console.log('App is listening on port ',port)
})
  