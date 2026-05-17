import axios from 'axios';

export function getErrorMessage(
    error: unknown
): string {
    if (axios.isAxiosError(error)) {
        const responseMessage =
            error.response?.data?.message;

        if (typeof responseMessage === 'string') {
            return responseMessage;
        }

        if (error.response) {
            return `Request failed with status ${error.response.status}`;
        }

        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Unknown error';
}
