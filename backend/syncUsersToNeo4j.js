const mongoose = require('mongoose');
const User = require('./models/User');
const neo4j = require('./neo4j');

const MONGO_URI = "mongodb+srv://734691yzq:zyang040123@5902.ikeftwf.mongodb.net/?retryWrites=true&w=majority&appName=5902";

async function syncUsers() {
  await mongoose.connect(MONGO_URI);
  const session = neo4j.session();
  try {
    const users = await User.find();
    for (const user of users) {
      await session.run(
        `MERGE (u:User {id: $userId})
         SET u.username = $username, u.email = $email`,
        {
          userId: user._id.toString(),
          username: user.username,
          email: user.email
        }
      );
    }
    console.log('All users synced to Neo4j!');
  } catch (err) {
    console.error('Sync error:', err);
  } finally {
    await session.close();
    await mongoose.disconnect();
  }
}

syncUsers(); 