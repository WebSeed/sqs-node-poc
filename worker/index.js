const AWS = require('aws-sdk')
const createTimer = require('unitimer')
const region = process.env.AWS_REGION || 'eu-west-1'
AWS.config.update({ region })

const Consumer = require('sqs-consumer')

var app = Consumer.create({
  queueUrl: 'https://sqs.eu-west-1.amazonaws.com/102549380155/universal-render-queue',
  region,
  handleMessage (message, done) {
    console.log('MESSAGE', message)
    done()
  }
});

app.on('error', (err) => {
  console.error(err)
})

app.on('empty', (d) => {
  console.log('Queue is empty')
})

app.start()
console.log('Waiting for message...')
