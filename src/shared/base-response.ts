export class BaseResponse {
    static success(data: any, message: string = 'OK') {
        return {
            success: true,
            message,
            status: 200,
            data
        };
    }

    static error(message: string, status: number = 500) {
        return {
            success: false,
            message,
            status,
            data: null
        };
    }
}
