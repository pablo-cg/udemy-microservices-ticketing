import mongoose from 'mongoose';
import { app } from './app';

async function start() {
  console.log("Starting up...")

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🚀 ~ start ~ connected to mongodb');
  } catch (error) {
    console.error('🚀 ~ start ~ error:', error);
  }

  app.listen(3000, () => {
    console.log('🚀 ~ Auth Listening on port: 3000');
  });
}

start();
