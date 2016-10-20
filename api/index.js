const express = require('express')
const app = express()
const AWS = require('aws-sdk')
const createTimer = require('unitimer')
AWS.config.update({ region: 'eu-west-1' })

const sqs = new AWS.SQS()

var [ timerQueue ] = createTimer([ 'Queue' ])

let id = 0

app.get('/', (req, res) => {
  const message = {
    MessageAttributes: {
      Foo: {
        DataType: 'String',
        StringValue: 'Hello World'
      },
      Bar: {
        DataType: 'Binary',
        BinaryValue: '...'
      },
      Baz: {
        DataType: 'Number',
        StringValue: '42'
      }
    },
    MessageBody: 'The quick brown fox jumped over the lazy dogs',
    QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/102549380155/universal-render-queue'
  }
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

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
