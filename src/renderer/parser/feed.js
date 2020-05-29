const remote = require('electron').remote
const agent = remote.require('proxy-agent');
const RssParser = remote.require('rss-parser');

import request from "../request/http"

//const proxyUrl = 'http://127.0.0.1:1081'

const defaultOptions = {
    defaultRSS: 2.0,
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
    },
    //timeout: 30000,
}

export async function parserFeed(feedUrl, options) {
    console.log(options)
    const parser = new RssParser({
        ...defaultOptions,
        ...{
            requestOptions: {
                agent: options.proxy ? new agent(options.proxy) : false
            }
        }
    })
    try {
        return  await parser.parseURL(feedUrl)
    } catch (e) {
        console.log(e)
        return false
    }
}

export async function parserFeedSpeed(url) {
    try {
        return request({
            url: url,
            method: 'get',
        })
    } catch (e) {
        return false
    }
}