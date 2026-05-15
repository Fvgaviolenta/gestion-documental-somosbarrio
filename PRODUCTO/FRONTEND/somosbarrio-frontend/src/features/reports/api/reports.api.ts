import { api } from '@/shared/lib/axios'

interface WorkerReportPayload {
  title: string
  description: string
  photos: File[]
}

export async function createWorkerReport(payload: WorkerReportPayload): Promise<void> {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('description', payload.description)

  payload.photos.forEach((photo) => {
    formData.append('photos', photo, photo.name)
  })

  await api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
