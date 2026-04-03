const mongoose = require('mongoose');

let mongoServer;

const connect = async () => {
  // Use MONGO_TEST_URI if provided (e.g. in CI), otherwise try mongodb-memory-server
  if (process.env.MONGO_TEST_URI) {
    await mongoose.connect(process.env.MONGO_TEST_URI);
    return;
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create({
      binary: { version: '6.0.4' },
    });
    await mongoose.connect(mongoServer.getUri());
  } catch (e) {
    // Fallback: mock mongoose for unit-style testing
    throw new Error(
      'Could not start MongoMemoryServer. Set MONGO_TEST_URI env var to run integration tests.\n' + e.message
    );
  }
};

const disconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
};

const clearAll = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, disconnect, clearAll };
