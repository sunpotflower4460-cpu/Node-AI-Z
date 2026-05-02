export type BindingQueueItem = {
  id: string
  candidateId: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'checking' | 'confirmed' | 'rejected' | 'held' | 'resolved'
  reason: string
  createdAt: number
  updatedAt: number
}

export type BindingQueueState = {
  items: BindingQueueItem[]
  pendingCount: number
  confirmedCount: number
  rejectedCount: number
  heldCount: number
}
