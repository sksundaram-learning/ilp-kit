import koa from 'koa'
import bodyParser from 'koa-body'
import logger from 'koa-mag'
import session from 'koa-session'
import cors from 'kcors'
import errorHandler from 'five-bells-shared/middlewares/error-handler'
import { Validator } from 'five-bells-shared'
import Config from './config'
import Auth from './auth'
import Router from './router'
import DB from './db'
import Log from './log'

export default class App {
  // TODO use decorators
  static constitute () { return [ Config, Auth, Router, Validator, DB, Log ] }
  constructor (config, auth, router, validator, db, log ) {
    this.config = config
    this.auth = auth
    this.router = router
    this.validator = validator
    this.db = db
    this.log = log('app')

    validator.loadSharedSchemas()
    validator.loadSchemasFromDirectory(__dirname + '/../../schemas')

    const app = this.app = koa()

    app.use(bodyParser())
    app.use(function *(next) {
      if (this.request.method == 'POST') {
        // the parsed body will store in this.request.body
        // if nothing was parsed, body will be an empty object {}
        this.body = this.request.body
      }
      yield next
    });

    app.use(logger({mag: log('http')}))
    app.use(errorHandler({log: log('error-handler')}))
    app.use(cors({origin: '*'}))

    app.proxy = true

    // TODO guess what
    app.keys = ['sesssecret']
    app.use(session(app))

    auth.attach(app)

    router.setupDefaultRoutes()
    router.attach(app)
  }

  async start () {
    try {
      await this._start()
    }
    catch (err) {
      this.log.critical(err)
    }
  }

  async _start () {
    await this.db.sync()
    this.listen()
  }

  listen () {
    this.app.listen(this.config.server.port)
    this.log.info('ledger-ui listening on ' + this.config.server.bind_ip +
      ':' + this.config.server.port)
    this.log.info('public at ' + this.config.server.base_uri)
  }
}