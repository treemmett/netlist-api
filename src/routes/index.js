import { Router } from 'express';

const route = new Router();

route.all('*', (req, res) => {
  res.send('hi');
})

export default route;