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
var serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


app.get("/",(req,res)=>{
    res.send("Successfully Run The Node And Express With Ali")
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
      const database = client.db("Speed-Trump");
      const cars = database.collection("cars");
      const banner = database.collection("banner");
      const userData = database.collection("userData");
      const reviews = database.collection("reviews");
      const purchases = database.collection("purchase");
      
    app.get("/cars",async(req,res)=>{
      const count=await cars.find({}).count()
      const page=req.query.page
      const size=parseInt(req.query.size)
      let products;
      if(page){
         products=await cars.find({}).skip(page*size).limit(size).toArray()

      }
      else(
       products=await cars.find({}).toArray()

      )
      // console.log(products.length)
      res.json({
        count,
        products
      })
    })
    app.get("/banner",async(req,res)=>{
      const result=await banner.find({}).toArray()
      res.json(result)
    })
    app.get("/purchase/:id",async(req,res)=>{
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const purchase=await purchases.findOne(query)
      res.json(purchase)
    })
    app.get("/purchase",async(req,res)=>{
      let query={}
      const email=req.query.email
     if(email){
     query={email:email}
     }
     const cursor= purchases.find(query)
     const purchase=await cursor.toArray()
     res.json(purchase)
    })
    app.delete("/purchase/:id",async(req,res)=>{
      const id=req.params.id
    const item={_id:ObjectId(id)}
  const purchase=await purchases.deleteOne(item)
  res.json(purchase) 
  })
    app.get("/myorder/:email",verifyToken,async(req,res)=>{
      const email=req.params.email
      // console.log(req.decodeUserEmail)
      if(req.decodeUserEmail===email){
    const query={email:email}
    const purchase=await purchases.find(query).toArray()
    res.json(purchase) 
   }
   else{
     res.status(401).json({Message:"This is invalid authirized"})
   }
  })
    app.put("/purchase/:id",async(req,res)=>{
      const id=req.params.id
      const filter={_id:ObjectId(id)}
      const item=req.body
      const option={upsert:true}
      const updateDocs={
      $set:{
       status:item.status
      }
      }
      const purchase=await purchases.updateOne(filter,updateDocs,option)
      res.json(purchase)
          })
    app.get("/user_data",async(req,res)=>{
      const result=await userData.find({}).toArray()
      res.json(result)
    })
    app.get('/user/:email',async(req,res)=>{
      const email=req.params.email
      const query={email:email}
      const user=await userData.findOne(query)
      let isAdmin=false
      if(user?.role==='Admin'){
isAdmin=true
      }
      res.json({Admin:isAdmin})
    })
    app.get("/user_data/:id",async(req,res)=>{
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const purchase=await userData.findOne(query)
      res.json(purchase)
    })
    app.post("/user_data",async(req,res)=>{
      const item=req.body
      const result=await userData.insertOne(item)
      res.json(result)
    })
    app.put("/user_data",async(req,res)=>{
      const item=req.body
      const filter={email:item.email}
      const option={upsert:true}
      const updateDocs={
        $set:item
      }
      const result=await userData.updateOne(filter,updateDocs,option)
      res.json(result)
    })
    app.put("/user_admin/:id",async(req,res)=>{
      const id=req.params.id
      const filter={_id:ObjectId(id)}
      const item=req.body
      const option={upsert:true}
      const updateDocs={
      $set:{
       role:item.role
      }
      }
      const purchase=await userData.updateOne(filter,updateDocs,option)
      res.json(purchase)
          })
    app.get("/reviews",async(req,res)=>{
      const result=await reviews.find({}).toArray()
      res.json(result)
    })
    app.post("/reviews",async(req,res)=>{
      const item=req.body
      const result=await reviews.insertOne(item)
      res.json(result)
    })
    app.get("/cars/:id",async(req,res)=>{
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const result=await cars.findOne(query)
      res.json(result)
    })
    app.post("/cars",async(req,res)=>{
      const item=req.body
      const result=await cars.insertOne(item)
      res.json(result)
    })
    app.post("/purchase",async(req,res)=>{
      const item=req.body
      const purchase=await purchases.insertOne(item)
      res.json(purchase)
    })
    app.put("/cars/update/:id",async(req,res)=>{
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
const result=await cars.updateOne(filter,updateDocs,option)
res.json(result)
    })
  
    app.delete("/cars/:id",async(req,res)=>{
      const id=req.params.id
    const item={_id:ObjectId(id)}
  const result=await cars.deleteOne(item)
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