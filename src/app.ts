import * as express from 'express';

import Keywords from './keywords';
import Poller from './poller';
import Twitter from './twitter';
import {AppConfig} from '../config';
import {JsonConvert} from 'json2typescript';
import * as dotenv from 'dotenv';

export let jc = new JsonConvert();

class App {
    public express;
    public keywords: Keywords;
    public poller: Poller;

    constructor() {
        this.express = express();
        this.keywords = new Keywords();

        let config = this.loadConfig();
        let twitter = new Twitter(config.twitter);
        this.poller = new Poller(config.twilio, twitter, config.callbackUrl);

        this.init(this.keywords);

        this.keywords.register("drake");
        this.poller.poll(this.keywords.list());
    }

    private init(keywords: Keywords): void {
        const r = express.Router();

        r.get('/', (req, res) => {
            res.json({
                message: 'Hello!'
            });
        });

        r.post('/keywords/:keyword', (req, res) => {
            const keyword = req.params.keyword;

            keywords.register(keyword);

            res.json({
                message: `Registered ${req.params.keyword}`
            });
        });

        r.get('/keywords', (req, res) => {
            res.json({
                keywords: keywords.list()
            });
        });

        r.post('/poll', (req, res) => {
            this.poller.poll(keywords.list());

            res.json({
                message: 'Submitted request to poll Twitter...'
            });
        });

        this.express.use('/', r);
    }

    private loadConfig(): AppConfig {
        // this is stupid. how to cod3z?
        dotenv.config();

        return {
            callbackUrl: process.env.CALLBACK_URL,
            twitter: {
                consumerKey: process.env.CONSUMER_KEY,
                consumerSecret: process.env.CONSUMER_SECRET
            },
            twilio: {
                accountSid: process.env.TWILIO_ACCOUNT_SID,
                authToken: process.env.TWILIO_AUTH_TOKEN
            }
        };
    }

}

export default new App().express;