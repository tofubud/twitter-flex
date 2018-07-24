export interface TwitterConfig {
    consumerKey: string;
    consumerSecret: string;
}

export interface TwilioConfig {
    accountSid: string;
    authToken: string;
}

export class AppConfig {
    callbackUrl: string;
    twitter: TwitterConfig;
    twilio: TwilioConfig;
}