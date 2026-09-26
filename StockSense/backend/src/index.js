const app = require('./app')
const env = require('./config/env')

app.listen(env.port, () => {
  console.log(`StockSense API running on http://localhost:${env.port}`)
})
