import { Grid, Paper } from '@mui/material'
import { TaskStatuses } from 'api/todolists-api'
import { AddItemForm } from 'components/AddItemForm/AddItemForm'
import { selectIsLoggedIn } from 'features/auth/auth.selectors'
import {
  addTaskTC,
  removeTaskTC,
  updateTaskTC,
} from 'features/TodolistsList/tasks.reducer'
import { selectTasks } from 'features/TodolistsList/tasks.selectors'
import {
  addTodolistTC,
  changeTodolistTitleTC,
  fetchTodolistsTC,
  FilterValuesType,
  removeTodolistTC,
  todolistsActions,
} from 'features/TodolistsList/todolists.reducer'
import { selectTodolists } from 'features/TodolistsList/todolists.selectors'
import { useAppDispatch } from 'hooks/useAppDispatch'
import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { Todolist } from './Todolist/Todolist'

type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector(selectTodolists)
  const tasks = useSelector(selectTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return
    }
    const thunk = fetchTodolistsTC()
    dispatch(thunk)
  }, [])

  const removeTask = useCallback(function (id: string, todolistId: string) {
    const thunk = removeTaskTC(id, todolistId)
    dispatch(thunk)
  }, [])

  const addTask = useCallback(function (title: string, todolistId: string) {
    const thunk = addTaskTC({ title, todolistId })
    dispatch(thunk)
  }, [])

  const changeStatus = useCallback(function (
    id: string,
    status: TaskStatuses,
    todolistId: string
  ) {
    const thunk = updateTaskTC({
      taskId: id,
      domainModel: { status },
      todolistId: todolistId,
    })
    dispatch(thunk)
  }, [])

  const changeTaskTitle = useCallback(function (
    id: string,
    newTitle: string,
    todolistId: string
  ) {
    const thunk = updateTaskTC({
      taskId: id,
      domainModel: { title: newTitle },
      todolistId: todolistId,
    })
    dispatch(thunk)
  }, [])

  const changeFilter = useCallback(function (
    filter: FilterValuesType,
    id: string
  ) {
    dispatch(todolistsActions.changeTodolistFilter({ id, filter }))
  }, [])

  const removeTodolist = useCallback(function (id: string) {
    const thunk = removeTodolistTC(id)
    dispatch(thunk)
  }, [])

  const changeTodolistTitle = useCallback(function (id: string, title: string) {
    const thunk = changeTodolistTitleTC(id, title)
    dispatch(thunk)
  }, [])

  const addTodolist = useCallback(
    (title: string) => {
      const thunk = addTodolistTC(title)
      dispatch(thunk)
    },
    [dispatch]
  )

  if (!isLoggedIn) {
    return <Navigate to={'/login'} />
  }

  return (
    <>
      <Grid
        container
        style={{ padding: '20px' }}
      >
        <AddItemForm addItem={addTodolist} />
      </Grid>
      <Grid
        container
        spacing={3}
      >
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id]

          return (
            <Grid
              item
              key={tl.id}
            >
              <Paper style={{ padding: '10px' }}>
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTask}
                  changeFilter={changeFilter}
                  addTask={addTask}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolist}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitle}
                  demo={demo}
                />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
