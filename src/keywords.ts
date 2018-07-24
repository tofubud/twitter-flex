export interface Keyword {
    keyword: string;
    type: string;
};

export default class Keywords {
    private keywords: Keyword[];

    constructor() {
        this.keywords = [];
    }

    public register(keyword: string): Keyword[] {
        if (!keyword) {
            return this.keywords;
        }

        this.keywords.push({
            keyword: keyword,
            type: this.getType(keyword)
        });

        return this.keywords;
    }

    public list(): Keyword[] {
        return this.keywords;
    }

    private getType(keyword: string): string {
        if(keyword.indexOf("@") === 0) {
            return 'account';
        } else if(keyword.indexOf("#") === 0) {
            return 'hashtag'
        } else {
            return 'keyword'
        }
    }
}
