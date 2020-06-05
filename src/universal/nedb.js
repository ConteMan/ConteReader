import Datastore from 'nedb-promises'
import path from 'path'
import fs from 'fs-extra'
import { app } from 'electron'

const STORE_PATH = app.getPath('userData')

if (process.type !== 'renderer') {
    if (!fs.pathExistsSync(STORE_PATH)) {
        fs.mkdirpSync(STORE_PATH)
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
    filename: path.join(STORE_PATH, '/feeds.db')
})

nedb.feed_records = Datastore.create({
    ...config,
    filename: path.join(STORE_PATH, '/feed_records.db')
})
export default nedb