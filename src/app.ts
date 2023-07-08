import express, {Application,Request,Response,json} from 'express';
import http from 'http';
import { AuthController } from './controllers';
import Log from './util/logger';


const app : Application = express();
const port : Number = 3000;
Log.createInstance();

const authController : AuthController = new AuthController();

app.get("/",
    async (req: Request, res: Response) => {
        Log.debug("/ request received");
        return res.status(200).send({
            message: "Hello World!",
        });
    }
);

app.use('/auth',authController.router);

try {
    app.listen(port, (): void => {
        Log.debug(`Connected successfully on port ${port}`);
    });
} catch (error) {
    Log.debug(`Error occured: ${error.message}`);
}