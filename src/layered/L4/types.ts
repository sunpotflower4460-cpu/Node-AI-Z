export type NeedType =
  | 'connection'
  | 'information'
  | 'expression'
  | 'reflection'
  | 'action'
  | 'acknowledgment'
  | 'unclear'

export type SemanticFrame = {
  gist: string
  need: NeedType
  contextModifier: string | null
  relation: 'new_topic' | 'continuation' | 'response' | 'shift' | 'deepening'
}

export type L4Result = {
  frame: SemanticFrame
}
