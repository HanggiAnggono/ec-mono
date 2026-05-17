export type SearchPhase = 'init' | 'browsing' | 'results'

export type SearchState = {
  /** Current text in the search input */
  query: string
  /** Keyword selected from the list – drives the product results */
  selectedKeyword: string | null
  /** Current UI phase */
  phase: SearchPhase
}

export type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SELECT_KEYWORD'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'CLEAR_QUERY' }
  | { type: 'RESET' }

export const initialSearchState: SearchState = {
  query: '',
  selectedKeyword: null,
  phase: 'init',
}

export const searchReducer = (
  state: SearchState,
  action: SearchAction
): SearchState => {
  switch (action.type) {
    case 'SET_QUERY':
      return {
          ...state,
          query: action.payload,
          phase: 'browsing',
          selectedKeyword: null,
        }

    case 'SELECT_KEYWORD':
      return {
        ...state,
        query: action.payload,
        selectedKeyword: action.payload,
        phase: 'results',
      }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        query: '',
        selectedKeyword: null,
        phase: 'init',
      }

    case 'CLEAR_QUERY':
      return {
        ...state,
        query: '',
        selectedKeyword: null,
        phase: 'init',
      }

    case 'RESET':
      return initialSearchState

    default:
      return state
  }
}
