// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'rb44l4iqfb'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-l6h-4rus.us.auth0.com',            // Auth0 domain
  clientId: '0q8Yt6PEE2FAif8zibrn4cW0hD2tf8jQ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
