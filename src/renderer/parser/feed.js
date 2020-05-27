import RssParser from 'rss-parser'
import request from "../request/http"

const parser = new RssParser({
    defaultRSS: 2.0,
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
    },
    //timeout: 30000,
})

export async function parserFeed(feedUrl) {
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