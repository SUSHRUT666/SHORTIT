const express=require("express");
const {connectToMongoDB}=require("./connect")
const urlRoute= require('./routes/url');
const path = require("path");
const URL=require("./models/url")
const app=express();
const PORT=8001;
connectToMongoDB("mongodb://localhost:27017/short-url")
.then(()=>console.log('MongoDb connected'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html',"style.css"));
});
app.use('/url',urlRoute);

app.get('/:shortId', async (req, res) => {
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timestamp: Date.now() } } },
            { new: true }
        );
        if (!entry || !entry.redirectURL) {
            return res.status(404).json({ error: "Short URL not found" });
        }
        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error('Error handling short URL:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT,()=> console.log(`Server started at PORT:${PORT}`))