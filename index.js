const program = require('commander')
const CoinbasePro = require('coinbase-pro')
const config = require('./configuration')
const Backtester = require('./src/backtester')
const Ticker = require('./src/ticker')
const Trader = require('./src/trader')

const now = new Date()
const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1e3))

function toDate(val) {
    return new Date(val * 1e3)
}

program.version('1.0.0')
    .option('-i, --interval [interval]', 'Interval in seconds for candlestick', parseInt)
    .option('-p, --product [product]', 'Product identifier', 'BTC-GBP')
    .option('-s, --start [start]', 'Start time in unix seconds', toDate, yesterday)
    .option('-e, --end [end]', 'End time in unix seconds', toDate, now)
    .option('-t, --strategy [strategy]', 'Strategy Type')
    .option('-r, --type [type]', 'Run Type')
    .option('-f, --funds [funds]', 'Amount of money to use', parseInt)
    .option('-l, --live', 'Run Live')
    .parse(process.argv)

const main = async function() {
    const { interval, product, start, end, strategy, live, type, funds } = program
    
    
    if (type == 'trader') {
        const trader = new Trader({
            start, end, product, interval, strategyType: strategy, live, funds
        })

        await trader.start()

    } else {
        const tester = new Backtester({
            start, end, product, interval, strategyType: strategy
        })
        
        await tester.start()
    }   
    
}

main()
  