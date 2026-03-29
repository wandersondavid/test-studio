export interface Dataset {
  _id: string
  name: string
  variables: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface CreateDatasetInput {
  name: string
  variables: Record<string, string>
}
