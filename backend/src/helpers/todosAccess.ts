import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const AWSXRay = require('aws-xray-sdk')
import 'source-map-support/register'
import { createLogger } from '../utils/logger'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess');

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosByUserIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getListTodoItemsByUserId(userId: string): Promise<TodoItem[]> {
    logger.info('call TodosAccess.getListTodoItemsByUserId');

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();
    return result.Items as TodoItem[];
  }

  async getTodoItemByTodoIdAndUserId(todoId: string, userId: string): Promise<TodoItem> {
    logger.info('call TodosAccess.getTodoItemByTodoIdAndUserId');
    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise();

    return result.Item as TodoItem;
  }

  async createTodoItem(todoItem: TodoItem) {
    logger.info('call TodosAccess.createTodoItem');
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem,
    }).promise();
    logger.info('Created TodoItem success');
  }

  async updateTodoItem(todoId: string, userId :string, todoUpdate: TodoUpdate) {
    logger.info('call TodosAccess.updateTodoItem');
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      }
    }).promise();
    logger.info('Updated TodoItem success');
  }

  async deleteTodoItem(todoId: string, userId: string) {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }).promise();
    logger.info('Deleted TodoItem success');
  }

  async updatedAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise();
    logger.info('Updated Attachment URL success');
  }
}