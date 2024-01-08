import { clone } from 'lodash';
import { Query } from 'mongoose';

export interface PaginationOptions {
  perPage?: number;
  page?: number;
}

const defaultOptions: PaginationOptions = { perPage: 10, page: 1 };

export const paginate = async <T>(
  query: Query<any, T>,
  options: PaginationOptions = defaultOptions,
) => {
  const { perPage, page } = options;

  const totalQuery = query.model.find(query.getQuery());
  const total = await totalQuery.countDocuments().exec();

  const lastPage = Math.ceil(total / perPage!);
  const data = await query
    .limit(perPage!)
    .skip(perPage! * (page! - 1))
    .exec();

  return { data, metadata: { total, perPage, page, lastPage } };
};
