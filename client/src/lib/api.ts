const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type ApiOptions = {
    method?: string
    body?: unknown
    headers?: HeadersInit
}

export async function api<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const headers = new Headers(options.headers)

    if(options.body !== undefined){
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            method: options.method || 'GET',
            headers,
            credentials: 'include',
            body:
                options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined
        }
    )

    let data: any = null

    try{
        data = await response.json()
    }catch {
        data = null
    }

    if(!response.ok){
        throw new Error(
            data.message || 'Request Failed'
        )
    }

    return data as T
}