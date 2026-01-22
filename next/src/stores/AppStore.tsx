'use client';

/**
 * AppStore - Centralized Application State Management
 * =====================================================
 *
 * This module provides a simple, extensible state management system for caching
 * API data and reducing unnecessary network requests across the application.
 *
 * ## Architecture
 *
 * The store uses React Context with a reducer pattern, similar to Redux but lighter.
 * Data is cached in memory for the duration of the user's session.
 *
 * ## How It Works
 *
 * 1. **State Structure**: The store maintains a typed state object with sections
 *    for different data domains (e.g., `teams`, `players`, `trades`).
 *
 * 2. **Actions**: Each state update is dispatched as an action with a type and payload.
 *
 * 3. **Selectors**: Use the provided hooks to access specific parts of the state.
 *
 * 4. **Cache Invalidation**: Data can be marked as stale or cleared when needed.
 *
 * ## Adding New Data to the Store
 *
 * To add a new data type (e.g., `trades`):
 *
 * 1. **Add to AppState interface**:
 *    ```typescript
 *    interface AppState {
 *      // ... existing
 *      trades: {
 *        items: Trade[];
 *        lastFetched: number | null;
 *      };
 *    }
 *    ```
 *
 * 2. **Add initial state**:
 *    ```typescript
 *    const initialState: AppState = {
 *      // ... existing
 *      trades: { items: [], lastFetched: null },
 *    };
 *    ```
 *
 * 3. **Add action type**:
 *    ```typescript
 *    type AppAction =
 *      | // ... existing
 *      | { type: 'SET_TRADES'; payload: Trade[] }
 *      | { type: 'CLEAR_TRADES' };
 *    ```
 *
 * 4. **Add reducer case**:
 *    ```typescript
 *    case 'SET_TRADES':
 *      return { ...state, trades: { items: action.payload, lastFetched: Date.now() } };
 *    case 'CLEAR_TRADES':
 *      return { ...state, trades: { items: [], lastFetched: null } };
 *    ```
 *
 * 5. **Add selector hook**:
 *    ```typescript
 *    export function useTrades() {
 *      const { state, dispatch } = useAppStore();
 *      return {
 *        trades: state.trades.items,
 *        lastFetched: state.trades.lastFetched,
 *        setTrades: (trades: Trade[]) => dispatch({ type: 'SET_TRADES', payload: trades }),
 *        clearTrades: () => dispatch({ type: 'CLEAR_TRADES' }),
 *      };
 *    }
 *    ```
 *
 * 6. **Use in components**:
 *    ```typescript
 *    const { trades, setTrades } = useTrades();
 *
 *    useEffect(() => {
 *      if (trades.length === 0) {
 *        fetchTrades().then(setTrades);
 *      }
 *    }, []);
 *    ```
 *
 * ## Cache Staleness
 *
 * Each data section tracks `lastFetched` timestamp. You can implement staleness
 * checks in your selector hooks:
 *
 * ```typescript
 * const STALE_TIME = 5 * 60 * 1000; // 5 minutes
 * const isStale = !lastFetched || Date.now() - lastFetched > STALE_TIME;
 * ```
 */

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';
import { Team } from '@/api/league';

// =============================================================================
// State Types
// =============================================================================

interface AppState {
  teams: {
    items: Team[];
    byLeagueId: Record<string, Team[]>;
    lastFetched: Record<string, number>;
  };
}

const initialState: AppState = {
  teams: {
    items: [],
    byLeagueId: {},
    lastFetched: {},
  },
};

// =============================================================================
// Action Types
// =============================================================================

type AppAction =
  | { type: 'SET_LEAGUE_TEAMS'; payload: { leagueId: string; teams: Team[] } }
  | { type: 'CLEAR_LEAGUE_TEAMS'; payload: { leagueId: string } }
  | { type: 'CLEAR_ALL_TEAMS' }
  | { type: 'RESET_STORE' };

// =============================================================================
// Reducer
// =============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LEAGUE_TEAMS':
      return {
        ...state,
        teams: {
          ...state.teams,
          byLeagueId: {
            ...state.teams.byLeagueId,
            [action.payload.leagueId]: action.payload.teams,
          },
          lastFetched: {
            ...state.teams.lastFetched,
            [action.payload.leagueId]: Date.now(),
          },
        },
      };

    case 'CLEAR_LEAGUE_TEAMS':
      const { [action.payload.leagueId]: _removedTeams, ...remainingTeams } = state.teams.byLeagueId;
      const { [action.payload.leagueId]: _removedFetched, ...remainingFetched } = state.teams.lastFetched;
      void _removedTeams;
      void _removedFetched;
      return {
        ...state,
        teams: {
          ...state.teams,
          byLeagueId: remainingTeams,
          lastFetched: remainingFetched,
        },
      };

    case 'CLEAR_ALL_TEAMS':
      return {
        ...state,
        teams: initialState.teams,
      };

    case 'RESET_STORE':
      return initialState;

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

interface AppStoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStoreContext.Provider>
  );
}

// =============================================================================
// Base Hook
// =============================================================================

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}

// =============================================================================
// Selector Hooks
// =============================================================================

const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hook to access and manage league teams in the store.
 *
 * @example
 * ```typescript
 * const { teams, isStale, setTeams, clearTeams } = useLeagueTeams(leagueId);
 *
 * useEffect(() => {
 *   if (teams.length === 0 || isStale) {
 *     fetchTeams().then(setTeams);
 *   }
 * }, [leagueId, isStale]);
 * ```
 */
export function useLeagueTeams(leagueId: string | undefined) {
  const { state, dispatch } = useAppStore();

  const teams = leagueId ? (state.teams.byLeagueId[leagueId] ?? []) : [];
  const lastFetched = leagueId ? (state.teams.lastFetched[leagueId] ?? null) : null;
  const hasData = teams.length > 0;

  const checkIsStale = useCallback(() => {
    return !lastFetched || Date.now() - lastFetched > STALE_TIME;  // 24 hours
  }, [lastFetched]);

  const setTeams = useCallback(
    (newTeams: Team[]) => {
      if (leagueId) {
        dispatch({ type: 'SET_LEAGUE_TEAMS', payload: { leagueId, teams: newTeams } });
      }
    },
    [dispatch, leagueId]
  );

  const clearTeams = useCallback(() => {
    if (leagueId) {
      dispatch({ type: 'CLEAR_LEAGUE_TEAMS', payload: { leagueId } });
    }
  }, [dispatch, leagueId]);

  return {
    teams,
    lastFetched,
    checkIsStale,
    hasData,
    setTeams,
    clearTeams,
  };
}

/**
 * Hook to reset the entire store. Useful for logout scenarios.
 */
export function useResetStore() {
  const { dispatch } = useAppStore();
  return useCallback(() => dispatch({ type: 'RESET_STORE' }), [dispatch]);
}
