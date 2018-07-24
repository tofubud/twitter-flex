import * as _ from 'lodash'
import Axios, { AxiosResponse, AxiosPromise, AxiosRequestConfig } from 'axios';
import { TwitterConfig } from '../config';
import { JsonObject, JsonProperty } from 'json2typescript';
import { jc } from './app';

@JsonObject
export class TwitterUser  {
    @JsonProperty("name") name: string = undefined;
    @JsonProperty("location") location: string = undefined;
    @JsonProperty("created_at") created_at: string = undefined;
    @JsonProperty("profile_image_url") profile_image_url: string = undefined;
}

@JsonObject
export class Status {
    @JsonProperty("id") id: number = undefined;
    @JsonProperty("created_at") created_at: string = undefined;
    @JsonProperty("text") text: string = undefined;
    @JsonProperty("user", TwitterUser) user: TwitterUser = undefined;
}

@JsonObject
export class SearchMetadata  {
    @JsonProperty("max_id") max_id: number = undefined;
    @JsonProperty("next_results", String, true) next_results?: string = undefined;
    @JsonProperty("since_id") since_id: number = undefined;
    @JsonProperty("query") query: string = undefined;
    @JsonProperty("count") count: number = undefined;
}

@JsonObject
export class SearchResponse  {
    @JsonProperty("statuses", [Status]) statuses: Status[] = undefined;
    @JsonProperty("search_metadata", SearchMetadata) search_metadata: SearchMetadata = undefined;
}

@JsonObject
export class TokenResponse  {
    @JsonProperty("token_type") token_type: string = undefined;
    @JsonProperty("access_token") access_token: string = undefined;
}

export default class Twitter {
    private baseUrl: string = 'https://api.twitter.com/1.1';
    private accessToken: string;
    private creds: any;

    constructor(config: TwitterConfig) {
        this.creds = config;
    }

    public async search(q: string, options?: any): Promise<SearchResponse> {
        options = options || { result_type: 'recent' };
        _.merge(options, { q: q });

        let res = await this.get('/search/tweets.json', { params: options });

        return jc.deserialize(res.data, SearchResponse);
    }

    public async get(url: string, config?: AxiosRequestConfig): Promise<any> {
        let token = await this.token(this.creds);

        config = config || {};
        _.merge(config, {
            headers: {'Authorization': `Bearer ${token}`}
        });

        return Axios.get(this.baseUrl + url, config)
                    .catch((err) => console.log(err.data));
    }

    public async token(creds: any): Promise<string> {
        if(this.accessToken) {
            return Promise.resolve(this.accessToken);
        }

        let compoundKey = Buffer.from(creds.consumerKey + ":" + creds.consumerSecret)
                                .toString("base64");
        let token;
        try {
            token = await Axios.post(
                'https://api.twitter.com/oauth2/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${compoundKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    }
                }
            );
        } catch (err) {
            return Promise.reject(err);
        }

        let res = jc.deserialize(token.data, TokenResponse);
        return res.access_token;
    }

}