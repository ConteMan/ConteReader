let RssParser = require('rss-parser');
let Agent = require('proxy-agent')

const defaultOptions = {
    defaultRSS: 2.0,
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
    },
    timeout: 15000,
}

async function parserFeed(feedUrl, options) {
    const parser = new RssParser({
        ...defaultOptions,
        ...{
            requestOptions: {
                agent: options.proxy ? new Agent(options.proxy) : false
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

module.exports = {
    parserFeed
}