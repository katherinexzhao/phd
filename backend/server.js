const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const paperRoutes = require('./routes/paperRoutes')
const planRoutes = require('./routes/planRoutes')
require('dotenv').config()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST','DELETE'],
}))
app.use(express.json())

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(' MongoDB connected'))
.catch((err) => console.error(' MongoDB connection error:', err))

app.get('/', (req, res) => {
  res.send('API is running')
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/oer', require('./routes/oer'))
app.use('/api/user', require('./routes/user'))
app.use('/api/core', require('./routes/core'))
app.use('/uploads', express.static('uploads'))
app.use('/api', paperRoutes)
app.use('/api', planRoutes)
const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))