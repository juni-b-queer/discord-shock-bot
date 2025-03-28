export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

export type OpenshockControlSchema = {
    id: string;
    intensity: number;
    duration: number;
    type: 'Shock' | 'Vibrate' | 'Stop';
    exclusive: boolean;
};

export class OpenShockClient {
    constructor(private apiUrl: string = 'https://api.openshock.app/') {}

    public async makeRequest(
        apiKey: string,
        method: HttpMethod,
        path: string,
        body?: any
    ) {
        const headers = {
            'Content-Type': 'application/json',
            OpenShockToken: `${apiKey}`,
        };

        let url = `${this.apiUrl}${path}`;
        let requestOptions: RequestInit = {
            method,
            headers,
        };

        if (method === HttpMethod.GET && body) {
            // Generate query parameters from body
            const queryParams = new URLSearchParams(body).toString();
            url += `?${queryParams}`;
        } else if (
            [HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.POST].includes(
                method
            ) &&
            body
        ) {
            // Set body as JSON
            requestOptions.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(
                    `HTTP Error: ${response.status} - ${errorResponse.message || response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error('Error making request:', error);
            throw error;
        }
    }

    // public async linkShare(shareCodeId: string) {
    //     const path = `1/shares/code/${shareCodeId}`
    //     const method = HttpMethod.POST
    //     return await this.makeRequest(method, path)
    // }

    public async controlDevice(
        apiKey: string,
        controlRequests: OpenshockControlSchema[]
    ) {
        const path = `2/shockers/control`;
        const method = HttpMethod.POST;
        const body = {
            shocks: [...controlRequests],
        };
        return await this.makeRequest(apiKey, method, path, body);
    }

    public static generateControlRequest(
        id: string,
        type: 'Shock' | 'Vibrate',
        intensity: number,
        duration: number,
        exclusive: boolean
    ): OpenshockControlSchema {
        return {
            id: id,
            intensity: intensity,
            duration: duration,
            type: type,
            exclusive: exclusive,
        };
    }
}

export const openShockClient = new OpenShockClient();
