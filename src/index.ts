import App from './app';
import * as dotenv from 'dotenv';
import { Result } from '../node_modules/@types/range-parser';

const port = process.env.PORT || 3000;

App.listen(port, (err) => {
    if (err) return console.log(err);
    return console.log(`Server is listening on port ${port}`);
});