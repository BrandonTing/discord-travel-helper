export const sampleCurrenciesResponse = {
    "meta": {
        "last_updated_at": "2023-06-22T23:59:59Z"
    },
    "data": {
        "HKD": {
            "code": "HKD",
            "value": 0.054743
        },
        "MYR": {
            "code": "MYR",
            "value": 0.032513
        },
        "TWD": {
            "code": "TWD",
            "value": 0.216794
        }
    }
}

export type currencyErrMsg = {
    "message": string,
    "errors": {
        [key: string]: string[]
    },
    "info": string
}
