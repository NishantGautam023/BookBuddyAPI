import app from "./src/app"
import {config} from "./src/config/config"
const startServer = () => {
    const port = config.port || 3000

    app.listen(port, () => {
        console.log(`App is Listening on port: ${port}`)
    })
}

startServer()
