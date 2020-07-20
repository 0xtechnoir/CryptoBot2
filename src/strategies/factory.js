const Simple = require('./simple')
const MACD = require('./simpleMACD')


exports.create = function(type, data) {
    switch (data.type) {
        case 'mcad':
            return new MACD(data)
        case 'simple':
            return new Simple(data)
        default:
            return new MACD(data)
    }
}