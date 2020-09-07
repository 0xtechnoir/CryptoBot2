class Candlestick {
    constructor({
        low, high, close, open, interval, startTime = new Date() , volume, price
    }) {
        this.startTime = startTime
        this.interval = interval
        this.open = open || price
        this.close = close || price
        this.high = high || price
        this.low = low || price
        this.volume = volume || 1e-5
        this.state = close ? 'closed' : 'open'
    }

    average() {
        return (this.close + this.high + this.low / 3)
    }

    onPrice({ price, volume, time = new Date() }) {
        if (this.state === 'closed') {
            throw new Error('Trying to add to closed candlestick')
        }
        
        this.volume = this.volume + volume

        // how does the incoming ticker price compare with the existing high and low candle values
        if (this.high < price) {this.high = price}
        if (this.low > price) {this.low = price}

        // candlestick close is always the mpst up-to-date price
        this.close = price

        // current time - the candlesticks start time.
        const delta = (time - this.startTime) * 1e-3

        console.log("Delta: " + delta);
        console.log("Interval: " + this.interval);


        // once the candle is filled, close it off. 
        if (delta >= this.interval) {
            this.state = 'closed'
        }

    }

    

}

module.exports = exports = Candlestick