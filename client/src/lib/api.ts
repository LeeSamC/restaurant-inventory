const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type RequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown
}

export async function api<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const headers = new Headers(
        options.headers
    )

    headers.set('Content-Type', 'application/json')

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers,
            credentials: 'include',
            body:
                options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined
        }
    )

    const data = await response.json()

    if(!response.ok){
        throw new Error(
            data.message || 'Request Failed'
        )
    }

    return data
}