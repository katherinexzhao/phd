const express = require('express')
const cors = require('cors')
const path = require('path');
const mongoose = require('mongoose')
const paperRoutes = require('./routes/paperRoutes')
const planRoutes = require('./routes/planRoutes')
const generateRoutes = require('./routes/generateRoutes');
const llmRoutes = require('./routes/llmRoutes');
const chatRoutes = require('./routes/chatRoutes');
const audioRoutes = require('./routes/audio'); 
const groupRoutes = require('./routes/group');
const studyPlanRoutes = require('./routes/studyPlan');
const commentRoutes = require('./routes/comments');

require('dotenv').config()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST','DELETE','PUT'],
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
app.use('/api', generateRoutes);
app.use('/api', paperRoutes)
app.use('/api/llm', llmRoutes);
app.use('/api', planRoutes);
app.use('/api', chatRoutes);
app.use('/api', audioRoutes);
app.use('/api/groups', require('./routes/group'));
app.use('/api/study-plan', studyPlanRoutes);
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/comment', commentRoutes);

app.use('/audio', express.static(path.join(__dirname, '../frontend/public/audio')));
const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))

app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(`[ROUTE] ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  }
});
