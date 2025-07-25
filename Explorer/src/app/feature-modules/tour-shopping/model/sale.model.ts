export interface Sale {
    id?: number,
    discount: number,
    authorId: number,
    startTime: any,
    endTime: any,
    tourIds: number[]
}