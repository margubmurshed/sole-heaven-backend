/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Query } from "mongoose";
import { filterExcludedFields } from "../app/constants";

export class QueryBuilder<T>{
    public modelQuery: Query<T[], T>;
    public query: Record<string, string>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    filter() {
        const filter = { ...this.query };
        filterExcludedFields.forEach(field => delete filter[field]);

        this.modelQuery = this.modelQuery.find(filter);
        return this;
    }

    search(searchableFields: string[]) {
        const searchTerm = this.query.searchTerm || '';
        if (searchTerm) {
            const searchArray = searchableFields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' }
            }));
            this.modelQuery = this.modelQuery.find({ $or: searchArray });
        }
        return this;
    }

    sort(){
        const sortBy = this.query.sortBy || '';
        if (sortBy) {
            this.modelQuery = this.modelQuery.sort(sortBy);
        }
        return this;
    }

    fields(){
        const fields = this.query.fields?.split(',').join(' ') || '';
        if (fields) {
            this.modelQuery = this.modelQuery.select(fields);
        }
        return this;
    }

    paginate(){
        const page = parseInt(this.query.page) || 1;
        const limit = parseInt(this.query.limit) || 10;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    build() {
        return this.modelQuery;
    }

    async getMetaData() {
        const totalDocuments = await this.modelQuery.model.countDocuments();
        const page = parseInt(this.query.page) || 1;
        const limit = parseInt(this.query.limit) || 10;
        const totalPages = Math.ceil(totalDocuments / limit);

        return {
            total: totalDocuments,
            page,
            limit,
            totalPages
        };
    }
}