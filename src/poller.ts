import { Keyword } from "./keywords";
import Twitter, { SearchResponse } from './twitter';
import Axios from "../node_modules/axios";
import * as _ from "lodash";
import { TwilioConfig } from "../config";

class Poller {
    private twitter: Twitter;
    private lastIds: {[k:string]: number};
    callbackUrl: string;
    twilio: TwilioConfig;

    constructor(twilio: TwilioConfig, twitter: Twitter, callbackUrl: string) {
        this.twilio = twilio;
        this.twitter = twitter;
        this.lastIds = {};
        this.callbackUrl = callbackUrl;
    }

    public async poll(keywords: Keyword[]): Promise<any> {
        return Promise.all(keywords.map(k => {
            let lastId = this.lastIds[k.keyword] || 0;
            let params = { since_id: lastId };

            return this.twitter.search(`to:${k.keyword}`, params)
                .then(res => {
                    this.lastIds[k.keyword] = res.search_metadata.max_id;
                    console.log(`Results for key ${k.keyword}:`, res.statuses.map(s => s.text));

                    let lastFive = _.take(res.statuses, 5);

                    let params = new URLSearchParams();
                    params.append("To", "+15022334042")
                    params.append("From", "+2063932974")

                    return Axios.post(this.callbackUrl,
                        params,
                        {
                            params: {
                                'Parameters': encodeURIComponent(JSON.stringify(lastFive)),
                            },
                            auth: {
                                username: this.twilio.accountSid,
                                password: this.twilio.authToken
                            }
                        }
                );
                }).catch((err) => {
                    console.log("Poller failed to poll with error: ", err);
                    return err;
                });
        }));
    }
}

export default Poller;
