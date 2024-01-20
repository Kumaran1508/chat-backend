import { Model, ObjectId } from "mongoose";
import ModelI from "../interfaces/model.interface";

export default class BaseDao<T> {

    model : Model<any,any>

    constructor(model: ModelI){
        this.model = model.model
    }

    public async create(document:T){
        return await this.model.create(document);
    }

    public async getById(id:ObjectId){
        return await this.model.findOne(id) as T  
    }

    public async delete(id:ObjectId){
        return await this.model.deleteOne(id)
    }

}