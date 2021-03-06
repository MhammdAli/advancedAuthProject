import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import {Connect} from '@configs/mongo/connection'
import {redisConnect} from '@configs/redis/connection';
import express, { NextFunction, Request, Response } from 'express';

import 'express-async-errors';

import apiRouter from '@routes/api';
import logger from 'jet-logger';

/***********************************************************************************
 *                                RUN SERVICES
 **********************************************************************************/
 (async()=>{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await Connect();
 })();
(async()=>{
    await redisConnect();  
})();

// Constants
const app = express();


/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/

// Common middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security (helmet recommended in express docs)
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}


/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/

// Add api router
app.use('/', apiRouter);

// Error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
    logger.err(err, true);
    
    return res.status(400).json({
        error: err.message,
    });
});


/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/

// Set views dir
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static dir
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Serve index.html file
app.get('*', (_: Request, res: Response) => {
    res.sendFile('index.html', {root: viewsDir});
});



// Export here and start in a diff file (for testing).
export default app;
