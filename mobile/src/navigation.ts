export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Dashboard: undefined
  Documents: { statusFilter?: string; personId?: number } | undefined
  DocumentDetail: { id: number }
  AddDocument: { personId?: number } | undefined
  Family: undefined
}
