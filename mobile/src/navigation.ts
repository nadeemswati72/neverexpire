export type RootStackParamList = {
  Login: undefined
  Dashboard: undefined
  Documents: { statusFilter?: string } | undefined
  DocumentDetail: { id: number }
  AddDocument: { personId?: number } | undefined
  Family: undefined
}
