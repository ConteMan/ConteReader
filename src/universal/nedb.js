import Datastore from 'nedb-promises'
import path from 'path'
import fs from 'fs-extra'
import { app } from 'electron'

let STORE_PATH = app.getPath('userData')
console.log(STORE_PATH)

if (process.type !== 'renderer') {
    if (!fs.pathExistsSync(STORE_PATH + '/data')) {
        fs.mkdirpSync(STORE_PATH + '/data')
    }
}

let nedb = {}
let config = {
    autoload: true,
    timestampData: true,
    inMemoryOnly: false,
}

nedb.feeds = Datastore.create({
    ...config,
    filename: path.join(STORE_PATH, '/data/feeds.db')
})

nedb.feed_records = Datastore.create({
    ...config,
    filename: path.join(STORE_PATH, '/data/feed_records.db')
})
export default nedb