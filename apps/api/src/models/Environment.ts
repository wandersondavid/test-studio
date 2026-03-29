import { Schema, model, Document } from 'mongoose'

export interface IEnvironment extends Document {
  name: string
  baseURL: string
  type: 'local' | 'dev' | 'hml' | 'prod'
  headers: Map<string, string>
  variables: Map<string, string>
}

const EnvironmentSchema = new Schema<IEnvironment>({
  name: { type: String, required: true },
  baseURL: { type: String, required: true },
  type: { type: String, enum: ['local', 'dev', 'hml', 'prod'], required: true },
  headers: { type: Map, of: String, default: {} },
  variables: { type: Map, of: String, default: {} },
}, { timestamps: true })

export const Environment = model<IEnvironment>('Environment', EnvironmentSchema)
