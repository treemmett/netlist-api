import { Router } from 'express';

// Import routes
import auth from './auth';

const route = new Router();

route.use('/auth', auth);

export default route;