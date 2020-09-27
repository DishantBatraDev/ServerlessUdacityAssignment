import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from 'middy'
import {  cors } from "middy/middlewares";
import {getTodo, updateToDoImageURL} from '../../businessLogic/todo'

const bucketName = process.env.TODOS_IMAGES_BUCKET
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION
const imageId=  uuid.v4() 
const s3 =  new AWS.S3({
  signatureVersion: 'v4' 
 })


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  //get to do in the database
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const uploadUrl=getUploadUrl(imageId)
  
  const todoItem =await getTodo(todoId) 
  const imageUrl=`https://${bucketName}.s3.amazonaws.com/${imageId}`
  //update url
  await updateToDoImageURL(todoItem,imageUrl)

  //signed url
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
})

handler.use(cors({
  credentials: true   //It means it allows headers that allow credentials from the browser
}))

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration,
  });
}