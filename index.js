const CoinbasePro = require('coinbase-pro')
const config = require('./configuration')

const key = config.COINBASE_PRO_API_KEY
const secret = config.COINBASE_PRO_API_SECRET
const passphrase = config.COINBASE_PRO_API_PASSPHRASE
const apiUri = config.COINBASE_PRO_API_URI

const client = new CoinbasePro.PublicClient();
const authedClient = new CoinbasePro.AuthenticatedClient(
    key,
    secret,
    passphrase,
    apiUri
  );

  const product = 'BTC-GBP'

  async function historicalRates() {
      const results = await client.getProductHistoricRates(
        product,
        { granularity: 300 },
      );
      console.log(results);
      
  }

historicalRates()
  
  