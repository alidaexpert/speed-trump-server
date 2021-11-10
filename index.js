const express=require("express")
const cors=require("cors")
const {MongoClient}=require("mongodb")
const ObjectId=require("mongodb").ObjectId
require("dotenv").config();
var admin = require("firebase-admin");
const app=express()
const port=process.env.PORT || 5000

app.use(express.json())
app.use(cors())


//firebase admin authirized
var serviceAccount = require('./tour-express-bd-firebase-adminsdk-lcv24-ddad30a3e5.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


app.get("/",(req,res)=>{
    res.send("Successfully Run The Node And Express")
})
app.get("/check",(req,res)=>{
    res.send("Check  this for remote url change")
})

// Mongo connect 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwcfz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function verifyToken(req,res,next){
  if(req.headers?.authorization?.startsWith("Bearer ")){
    const idToken=req.headers.authorization.split("Bearer ")[1]
    try{
const decodeUser=await admin.auth().verifyIdToken(idToken)
  req.decodeUserEmail=decodeUser.email
  // console.log(req.decodeUserEmail)
    }
    catch{

    }
  }
  next()
}

async function run() {
    try {
      await client.connect();
      const database = client.db("Tour-Express");
      const offers = database.collection("offers");
      const banner = database.collection("banner");
      const gallery = database.collection("gallery");
      const tourTeam = database.collection("tour-team");
      const bookings = database.collection("booking");
      
    app.get("/offers",async(req,res)=>{
      const count=await offers.find({}).count()
      const page=req.query.page
      const size=parseInt(req.query.size)
      let offer;
      if(page){
         offer=await offers.find({}).skip(page*size).limit(size).toArray()

      }
      else(
       offer=await offers.find({}).toArray()

      )
      // console.log(products.length)
      res.json({
        count,
        offer
      })
    })
    app.get("/banner",async(req,res)=>{
      const result=await banner.find({}).toArray()
      res.json(result)
    })
    app.get("/booking/:id",async(req,res)=>{
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const booking=await bookings.findOne(query)
      res.json(booking)
    })
    app.get("/booking",async(req,res)=>{
      let query={}
      const email=req.query.email
     if(email){
     query={email:email}
     }
     const cursor= bookings.find(query)
     const booking=await cursor.toArray()
     console.log(booking)
     res.json(booking)
    })
    app.delete("/booking/:id",async(req,res)=>{
      const id=req.params.id
    const item={_id:ObjectId(id)}
  const booking=await bookings.deleteOne(item)
  res.json(booking) 
  })
    app.get("/myorder/:email",verifyToken,async(req,res)=>{
      const email=req.params.email
      // console.log(req.decodeUserEmail)
      if(req.decodeUserEmail===email){
    const query={email:email}
    const booking=await bookings.find(query).toArray()
    res.json(booking) 
   }
   else{
     res.status(401).json({Message:"This is invalid authirized"})
   }
  })
    app.put("/booking/:id",async(req,res)=>{
      const id=req.params.id
      const filter={_id:ObjectId(id)}
      const item=req.body
      const option={upsert:true}
      const updateDocs={
      $set:{
       status:item.status
      }
      }
      const booking=await bookings.updateOne(filter,updateDocs,option)
      res.json(booking)
          })
    app.get("/gallery",async(req,res)=>{
      const result=await gallery.find({}).toArray()
      res.json(result)
    })
    app.get("/tour-team",async(req,res)=>{
      const result=await tourTeam.find({}).toArray()
      res.json(result)
    })
    app.get("/offers/:id",async(req,res)=>{
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const result=await offers.findOne(query)
      res.json(result)
    })
    app.post("/offers",async(req,res)=>{
      const item=req.body
      const result=await offers.insertOne(item)
      res.json(result)
    })
    app.post("/booking",async(req,res)=>{
      const item=req.body
      const booking=await bookings.insertOne(item)
      res.json(booking)
    })
    app.put("/offers/update/:id",async(req,res)=>{
const id=req.params.id
const filter={_id:ObjectId(id)}
const item=req.body
const option={upsert:true}
const updateDocs={
$set:{
  title:item.title,
  location:item.location,
  price:item.price,
  groupSize:item.groupSize,
  duration:item.duration,
photo:item.photo,
tourType:item.tourType,
introduction:item.introduction,
departureTime:item.departureTime,
returnTime:item.returnTime,
}
}
const result=await offers.updateOne(filter,updateDocs,option)
res.json(result)
    })
  
    app.delete("/offers/:id",async(req,res)=>{
      const id=req.params.id
    const item={_id:ObjectId(id)}
  const result=await offers.deleteOne(item)
  res.json(result) 
  })
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.listen(port,()=>{
    console.log("Running the Localhost",`http://localhost:${port}`)
})