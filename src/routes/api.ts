import { Router } from 'express';
import auth from "@routes/auth";
import verify from '@routes/verify';
// Export the base-router
const baseRouter = Router();

baseRouter.use('/users',auth);
baseRouter.use('/verify',verify)

// Export default.
export default baseRouter;
