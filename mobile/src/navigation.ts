export type RootStackParamList = {
  Login: undefined
  Dashboard: undefined
  Documents: undefined
  DocumentDetail: { id: number }
  AddDocument: { personId?: number } | undefined
  Family: undefined
}
