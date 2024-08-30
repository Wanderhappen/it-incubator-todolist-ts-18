import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AppDispatch, AppRootStateType } from 'app/store'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppRootStateType
  dispatch: AppDispatch
  rejectValue: null
}>()
