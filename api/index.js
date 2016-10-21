const express = require('express')
const bodyParser = require('body-parser')
const AWS = require('aws-sdk')
const createTimer = require('unitimer')
const region = process.env.AWS_REGION || 'eu-west-1'
AWS.config.update({ region })

const app = express()
app.use(bodyParser.json())

const sqs = new AWS.SQS()
const [ timerQueue ] = createTimer([ 'Queue' ])
let id = 0

function getCallbackUrl(req) {
  return req.protocol + '://' + req.get('host') + '/callback'
}

app.get('/', (req, res) => {
  const message = {
    MessageBody: JSON.stringify({
      id,
      message: `Hello World ${id}`,
      callbackUrl: getCallbackUrl(req)
    }),
    QueueUrl: process.env.QUEUE_URL || 'https://sqs.eu-west-1.amazonaws.com/102549380155/universal-render-queue'
  }
  id += 1
  timerQueue.start()
  sqs.sendMessage(message, (err, data) => {
    if (err) {
      console.error(err)
      return res.send(`Error ${err}`)
    }
    timerQueue.stop()
    console.log('Done', data)
    res.send(`
      Data:<pre>${JSON.stringify(data, null, 2)}</pre>
      Timer:<pre>${timerQueue.info(1)}</pre>
    `)
  })
})

app.post('/callback', (req, res) => {
  const reply = `API callback: ${JSON.stringify(req.body) || 'NONE'}`
  console.log('Sending', reply)
  res.send(reply)
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
