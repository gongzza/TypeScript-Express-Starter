/**
 * Module dependencies.
 */
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as logger from 'morgan'
import * as lusca from 'lusca'
import { Err } from './interfaces'

const debug = require('debug')('ts-express:app')

const { error } = require('dotenv').config()
if (error) {
  debug(error)
  throw error
}

/**
 * Create Express server.
 */
const app = express()

/**
 * Express configuration.
 */

const isTest = process.env.NODE_ENV === 'test'
app.use(logger(process.env.LOG_LEVEL, {
  skip: () => isTest
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))

/**
 * routes.
 */
app.use('/', require('./router'))

// catch 404 and forward to error handler
app.use(function (req: express.Request, res: express.Response, next: express.NextFunction) {
  let err = new Error('Not Found') as Err
  err.status = 404
  next(err)
})

// error handler
app.use(function (err: Err, req: express.Request, res: express.Response, next: express.NextFunction) {
  debug(err)

  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({
    message: err.message,
    data: err.data
  })
})

module.exports = app
