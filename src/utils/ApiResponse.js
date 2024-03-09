class ApiResponse {
    constructor(statusCode, data, messasge = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.messasge = messasge
        this.success = statusCode < 400
    }
}
export { ApiResponse }