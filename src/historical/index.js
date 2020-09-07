const coinbase = require('coinbase-pro')
const Candlestick = require('../models/candelsticks/candlestick')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class HistoricalService {
    constructor({ start, end, interval = 300, product }) {
        this.client = new coinbase.PublicClient()
        this.start = start
        this.end = end
        this.interval = interval
        this.product = product
    }

    async getData() {
        // console.log("Creating requests");
        const intervals = this.createRequests()
        
        // console.log("Performing Intervals");
        const results = await this.performInterval(intervals) 

        const timestamps = {}

        const filtered = results.filter((x) => {
            const timestamp = x[0]
            const str = `${timestamp}`
            if (timestamps[str] !== undefined) {
                return false
            }
            timestamps[str] = true
            return true
        })

        const candlesticks = filtered.map((x) => {
            return new Candlestick({
                startTime: new Date(x[0] * 1e3),
                low: x[1],
                high: x[2],
                open: x[3],
                close: x[4],
                interval: this.interval,
                volume: x[5]
            })
        })

        return candlesticks
    }

    async performInterval(intervals) {
        if (intervals.length == 0) { return [] }
        const interval = intervals[0]
        const results = await this.performRequest(interval).then( r => r.reverse())
        // console.log(`Request performed at: ${Date.now()}`);
        
        await timeout(1000)
        const next = await this.performInterval(intervals.slice(1))    

        return results.concat(next)
  
    }


    async performRequest( { start, end }) {
        const results = await this.client.getProductHistoricRates(this.product, {
            start, end, granularity: this.interval
        })
        return results
    }

    createRequests() {

        // Date.getTime() returns data in milliseconds
        // This API requires time data to be in seconds. We can achieve this conversion by
        // multiplying the millisecond value by 1e-3 (0.001)
        // console.log(`Start Time (milliseconds): ${this.start.getTime()}`);
        // console.log(`Start Time x 1e-3 (seconds): ${this.start.getTime() * 1e-3}`);

        // The maximum number of data points for a single request is 300 candles. Requests made which would result in 
        // a higher number of data points will be rejected. 
        // https://docs.pro.coinbase.com/#get-historic-rates
        const max = 300

        // get the requested time period in seconds
        const timePeriodSecs = (this.end.getTime() - this.start.getTime()) * 1e-3
        // console.log(`Time period (secs): ${timePeriodSecs}`);
        
        
        // calculate the number of intervals in the time period
        // interval = length (sec) of candlestick. Default is 300
        const numberOfCandles = timePeriodSecs / this.interval
        // console.log(`Number of Candles in chosen time period: ${numberOfCandles}`); // eg 436.47746
        
        // Calculate the number of requests we need to make to get a data point on each interval.
        const numberRequests = Math.ceil(numberOfCandles / max)
        // console.log(`Number of Requests required for time period: ${numberRequests}`); // eg 2
        
        const intervals = Array(numberRequests).fill().map((_, reqNum) => {
            // Calculate the size of each request
            const size = this.interval * max * 1e3
            // console.log(`Interval size: ${size}`);
            
            // Calculate the start of each request
            const start = new Date(this.start.getTime() + (reqNum * size))
            console.log(`Interval start time: ${start}`);
            
            // Calculate the end of each request
            const end = (reqNum + 1 === numberRequests) ? this.end : new Date(start.getTime() + size)
            console.log(`Interval end time: ${end}`);
            return { start, end }

        })        
        return intervals
        
    }

}

module.exports = HistoricalService