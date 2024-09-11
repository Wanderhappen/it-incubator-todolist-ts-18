import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { authAPI } from 'api/todolists-api'
import { authActions } from 'features/auth/auth.reducer'
import {
  addTaskTC,
  fetchTasksTC,
  updateTaskTC,
} from 'features/TodolistsList/tasks.reducer'
import { Dispatch } from 'redux'

const initialState = {
  status: 'idle' as RequestStatusType,
  error: null as string | null,
  isInitialized: false,
}

export type AppInitialStateType = typeof initialState
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error
    },
    setAppStatus: (
      state,
      action: PayloadAction<{ status: RequestStatusType }>
    ) => {
      state.status = action.payload.status
    },
    setAppInitialized: (
      state,
      action: PayloadAction<{ isInitialized: boolean }>
    ) => {
      state.isInitialized = action.payload.isInitialized
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksTC.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTasksTC.fulfilled, (state, action) => {
        state.status = 'succeeded'
      })
      .addCase(addTaskTC.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(addTaskTC.fulfilled, (state, action) => {
        state.status = 'succeeded'
      })
      .addCase(updateTaskTC.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(updateTaskTC.fulfilled, (state, action) => {
        state.status = 'succeeded'
      })
  },
})

export const appReducer = slice.reducer
export const appActions = slice.actions

export const initializeAppTC = () => (dispatch: Dispatch) => {
  authAPI.me().then((res) => {
    if (res.data.resultCode === 0) {
      dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }))
    } else {
    }

    dispatch(appActions.setAppInitialized({ isInitialized: true }))
  })
}
