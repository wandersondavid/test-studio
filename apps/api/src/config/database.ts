import mongoose from 'mongoose'

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/test-studio'
  await mongoose.connect(uri)
  console.log('MongoDB conectado')
}
