import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  UpdateTaskModelType,
} from 'api/todolists-api'
import { type AppDispatch, AppThunk } from 'app/store'
import { clearTasksAndTodolists } from 'common/actions/common.actions'
import { todolistsActions } from 'features/TodolistsList/todolists.reducer'
import { createAppAsyncThunk } from 'hooks/useAppAsyncThunk'
import {
  handleServerAppError,
  handleServerNetworkError,
} from 'utils/error-utils'

const initialState: TasksStateType = {}

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    removeTask: (
      state,
      action: PayloadAction<{ taskId: string; todolistId: string }>
    ) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex((t) => t.id === action.payload.taskId)
      if (index !== -1) tasks.splice(index, 1)
    },

    // addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
    //   const tasks = state[action.payload.task.todoListId]
    //   tasks.unshift(action.payload.task)
    // },
    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string
        model: UpdateDomainTaskModelType
        todolistId: string
      }>
    ) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex((t) => t.id === action.payload.taskId)
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...action.payload.model }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(todolistsActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = []
        })
      })
      .addCase(clearTasksAndTodolists, () => {
        return {}
      })
      .addCase(fetchTasksTC.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(fetchTasksTC.rejected, (state, action) => {})
      .addCase(addTaskTC.fulfilled, (state, action) => {
        const tasks = state[action.payload.task.todoListId]
        tasks.unshift(action.payload.task)
      })
      .addCase(updateTaskTC.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...action.payload.model }
        }
      })
  },
})

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions

export const fetchTasksTC = createAppAsyncThunk<
  {
    tasks: TaskType[]
    todolistId: string
  },
  string
>('tasks/fetch-task', async (todolistId, thunkAPI) => {
  const { rejectWithValue, dispatch, getState } = thunkAPI

  try {
    const res = await todolistsAPI.getTasks(todolistId)
    const tasks = res.data.items
    return { tasks, todolistId }
  } catch (e: any) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

// thunks
// export const _fetchTasksTC =
//   (todolistId: string): AppThunk =>
//   (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: 'loading' }))
//     todolistsAPI.getTasks(todolistId).then((res) => {
//       const tasks = res.data.items
//       dispatch(tasksActions.setTasks({ tasks, todolistId }))
//       dispatch(appActions.setAppStatus({ status: 'succeeded' }))
//     })
//   }

export const removeTaskTC =
  (taskId: string, todolistId: string): AppThunk =>
  (dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId).then(() => {
      dispatch(tasksActions.removeTask({ taskId, todolistId }))
    })
  }

export const addTaskTC = createAppAsyncThunk<
  {
    task: TaskType
  },
  {
    todolistId: string
    title: string
  }
>('tasks/add-task', async ({ todolistId, title }, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  // dispatch(appActions.setAppStatus({ status: 'loading' }))
  try {
    const res = await todolistsAPI.createTask(todolistId, title)
    if (res.data.resultCode === 0) {
      const task = res.data.data.item
      // dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      return { task }
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  } catch (error: any) {
    handleServerNetworkError(error, dispatch)
    return rejectWithValue(null)
  }
})

export const newThunk = createAsyncThunk<
  string, // Возвращаем ( для fulfilled action)
  { task: number; todolist: string }, // аргументы
  { state: boolean; dispatch: AppDispatch; rejectValue: null } // trunk API
>('tasks/newThunk', (arg, thunkAPI) => {
  const { rejectWithValue, dispatch, getState } = thunkAPI
  const state = getState()
  try {
    return 'sasg'
  } catch (e: any) {
    return rejectWithValue(null)
  }
})

export const updateTaskTC = createAppAsyncThunk<
  {
    taskId: string
    model: UpdateDomainTaskModelType
    todolistId: string
  },
  {
    taskId: string
    domainModel: UpdateDomainTaskModelType
    todolistId: string
  }
>('tasks/updateTask', async ({ taskId, domainModel, todolistId }, thunkAPI) => {
  const { rejectWithValue, getState, dispatch } = thunkAPI
  const state = getState()
  const task = state.tasks[todolistId].find((t) => t.id === taskId)
  if (!task) {
    return rejectWithValue(null)
  }
  const apiModel: UpdateTaskModelType = {
    deadline: task.deadline,
    description: task.description,
    priority: task.priority,
    startDate: task.startDate,
    title: task.title,
    status: task.status,
    ...domainModel,
  }
  try {
    const res = await todolistsAPI.updateTask(todolistId, taskId, apiModel)
    if (res.data.resultCode === 0) {
      return {
        taskId,
        model: domainModel,
        todolistId,
      }
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  } catch (error: any) {
    handleServerNetworkError(error, dispatch)
    return rejectWithValue(null)
  }
})

// export const _updateTaskTC =
//   ({
//     taskId,
//     domainModel,
//     todolistId,
//   }: {
//     taskId: string
//     domainModel: UpdateDomainTaskModelType
//     todolistId: string
//   }): AppThunk =>
//   (dispatch, getState) => {
//     const state = getState()
//     const task = state.tasks[todolistId].find((t) => t.id === taskId)
//     if (!task) {
//       //throw new Error("task not found in the state");
//       console.warn('task not found in the state')
//       return
//     }
//
//     const apiModel: UpdateTaskModelType = {
//       deadline: task.deadline,
//       description: task.description,
//       priority: task.priority,
//       startDate: task.startDate,
//       title: task.title,
//       status: task.status,
//       ...domainModel,
//     }
//
//     todolistsAPI
//       .updateTask(todolistId, taskId, apiModel)
//       .then((res) => {
//         if (res.data.resultCode === 0) {
//           dispatch(
//             tasksActions.updateTask({
//               taskId,
//               model: domainModel,
//               todolistId,
//             })
//           )
//         } else {
//           handleServerAppError(res.data, dispatch)
//         }
//       })
//       .catch((error) => {
//         handleServerNetworkError(error, dispatch)
//       })
//   }

// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}
