import { TodoItem } from '../models/TodoItem'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWS from 'aws-sdk'
import * as AWSXray from 'aws-xray-sdk'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXray.captureAWS(AWS)

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly toDosTable = process.env.TODOS_TABLE,
    private readonly todosIdIndex = process.env.TODO_ID_INDEX
  ) {}

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    console.log(`Creating a todo item with id ${todo.todoId}`)

    await this.docClient
      .put({
        TableName: this.toDosTable,
        Item: todo
      })
      .promise()
    return todo
  }

  async deleteTodo(todoToDelete: string, userId: string) {
    console.log(`deleting  a todo item with id ${todoToDelete}`)
    var result =await this.getToDo(todoToDelete)
    console.log('deleting item '+JSON.stringify(result))
    await this.docClient
      .delete({
        TableName: this.toDosTable,
        Key: {
          userId: userId,
          createdAt:result.createdAt
        },
        ConditionExpression: 'todoId= :val',
        ExpressionAttributeValues: {
          ':val': todoToDelete
        }
      })
      .promise()
  }

  async getToDo(todoId: string): Promise<TodoItem> {
    console.log(`getting to do details for the todo id ${todoId}`)
    const result = await this.docClient
      .query({
        TableName: this.toDosTable,
        IndexName: this.todosIdIndex,
        KeyConditionExpression: "todoId = :todoId",
        ExpressionAttributeValues:{
          ':todoId': todoId 
      }
      })
      .promise()
    return result.Items[0] as TodoItem
  }

  async getToDos(userId: string) {
    console.log(`getting all todos for userid ${userId}`)
    const result = await this.docClient
      .query({
        TableName: this.toDosTable,
        KeyConditionExpression:'userId= :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()
    return result.Items
  }

  async updateToDoImageURL(todoItem: TodoItem, imageUrl: string) {
    var params = {
      TableName: this.toDosTable,
      Key: {
        userId: todoItem.userId,
        createdAt: todoItem.createdAt
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': imageUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }
     await this.docClient.update(params).promise()
  }

  async updateToDoData(itemToUpdate: UpdateTodoRequest,todoId: string){
    const todoItem =await this.getToDo(todoId)
    var params = {
      TableName: this.toDosTable,
      Key: {
        userId: todoItem.userId,
        createdAt: todoItem.createdAt
      },
      UpdateExpression: "set #name = :val, #dueDate=:dueDate, #done=:done",
      ExpressionAttributeNames:{ //An expression attribute name is a placeholder that you use in an Amazon DynamoDB expression as an alternative to an actual attribute name. An expression attribute name must begin with a pound sign (#), and be followed by one or more alphanumeric characters.
        "#name":"name",  // to handle reserved word of the dynamo db
        "#dueDate":"dueDate",
        "#done":"done"
      },
      ExpressionAttributeValues:{
          ":val":itemToUpdate.name,
          ":dueDate":itemToUpdate.dueDate,
          ":done":itemToUpdate.done
      },
      ReturnValues:"UPDATED_NEW"
    }
    await this.docClient.update(params).promise()
  }
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}
