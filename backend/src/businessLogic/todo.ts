import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'
import { TodoAccess } from '../dataLayer/todoAccess'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const toDoAccess = new TodoAccess()
export async function createToDo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  return await toDoAccess.createTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}

export async function deleteToDo(todoToDelete: string, jwtToken: string){
  const userId = parseUserId(jwtToken)
  return await toDoAccess.deleteTodo(todoToDelete,userId)
}


export async function getTodo(todoId:string):Promise<TodoItem> {
  return await toDoAccess.getToDo(todoId)
}

export async function getTodos(jwtToken: string){
  const userId = parseUserId(jwtToken)
  return await toDoAccess.getToDos(userId)
}

export async function  updateToDoData(itemToUpdate: UpdateTodoRequest,todoId: string){
 await toDoAccess.updateToDoData(itemToUpdate,todoId)
}

export  async function updateToDoImageURL(todoItem: TodoItem, imageUrl: string) {
  await toDoAccess.updateToDoImageURL(todoItem,imageUrl);
}