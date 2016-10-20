const AWS = require('aws-sdk')
const createTimer = require('unitimer')
AWS.config.update({ region: 'eu-west-1' })

// var [ timerQueue ] = createTimer([ 'Queue' ])

const sqs = new AWS.SQS()
const QueueUrl = 'https://sqs.eu-west-1.amazonaws.com/102549380155/universal-render-queue'

function hasMessages (data) {
  return data && data.Messages && data.Messages.length
}

function deleteMessage (message, cb) {
  const params = { QueueUrl, ReceiptHandle: message.ReceiptHandle }
  sqs.deleteMessage(params, cb)
}

function processMessage (cb) {
  return (message) => {
    return new Promise((resolve, reject) => {
      cb(
        message,
        (err) => err
          ? reject(err)
          : deleteMessage(message, (err, data) => err ? reject(err) : resolve(data))
      )
    })
  }
}

function getMessages (data) {
  return data.Messages
}

function processMessages (messages, cb) {
  return Promise.all(messages.map(processMessage(cb)))
}

function handleSuccess (cb) {
  return (results) => {
    console.log('Success')
    whenMessage(cb)
  }
}

function handleError (cb) {
  return (err) => {
    console.error(err)
    whenMessage(cb)
  }
}

function handleResponse (err, data, cb) {
  if (err) {
    console.error(err)
    return
  }

  if (hasMessages(data)) {
    processMessages(getMessages(data), cb)
      .then(handleSuccess(cb))
      .catch(handleError(cb))
  } else {
    whenMessage(cb)
  }
}

function whenMessage (cb) {
  const params = {
    AttributeNames: [ 'All' ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [ 'All' ],
    QueueUrl,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 20
  }
  sqs.receiveMessage(params, (err, data) => {
    handleResponse(err, data, cb)
  })
}

whenMessage((message, cb) => {

  // Do something with message
  console.log(`I can haz message ${message.MessageId}`)
  console.log(`${message.Body}`)

  // Something went wrong!
  // cb(err)

  cb()
})
