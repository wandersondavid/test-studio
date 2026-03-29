import { Schema, model, Document } from 'mongoose'

export interface IDataset extends Document {
  name: string
  variables: Map<string, string>
}

const DatasetSchema = new Schema<IDataset>({
  name: { type: String, required: true },
  variables: { type: Map, of: String, default: {} },
}, { timestamps: true })

export const Dataset = model<IDataset>('Dataset', DatasetSchema)
