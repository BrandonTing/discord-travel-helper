

export type CurrenciesResponse = {
    "meta": {
        "last_updated_at": string
    },
    "data": {
        [key: string]: {
            "code": string,
            "value": number
        },
    }
}

export type CurrencyErrMsg = {
    "message": string,
    "errors": {
        [key: string]: string[]
    },
    "info": string
}
