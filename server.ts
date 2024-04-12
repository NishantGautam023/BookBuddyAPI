import app from "./src/app"
import {config} from "./src/config/config"
import connectDatabase from "./src/config/db";



const startServer = async () => {

    // Connect Database
  await  connectDatabase()
    const port = config.port || 3000

    app.listen(port, () => {
        console.log(`App is Listening on port: ${port}`)
    })
}

startServer()
