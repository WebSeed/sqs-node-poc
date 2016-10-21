const AWS = require('aws-sdk')
const createTimer = require('unitimer')
const region = process.env.AWS_REGION || 'eu-west-1'
const fetch = require('node-fetch')
AWS.config.update({ region })

const Consumer = require('sqs-consumer')

var app = Consumer.create({
  queueUrl: process.env.QUEUE_URL || 'https://sqs.eu-west-1.amazonaws.com/102549380155/universal-render-queue',
  region,
  handleMessage (message, done) {
    console.log(message)
    const data = JSON.parse(message.Body || '{}')
    setTimeout(() => {
      if (data.callbackUrl) {
        const reply = {
          id: data.id,
          message: data.message.toUpperCase()
        }
        fetch(
          data.callbackUrl,
          {
            method: 'POST',
            body: JSON.stringify(reply),
            headers: { 'Content-Type': 'application/json' }
          }
        )
          .then(() => { done() })
          .catch(() => {
            done(new Error('Could not reach callback URL'))
          })
      } else {
        done(new Error('No callback URL provided'))
      }
    }, 2000)
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
