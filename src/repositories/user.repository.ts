import UserModel, { UserDocument } from '../models/user.model';

export const createUser = async (data: Partial<UserDocument>) => {
  return await UserModel.create(data);
};

export const findByUsername = async (username: string) => {
  return await UserModel.findOne({ username });
};

export const findByEmail = async (email: string) => {
  return await UserModel.findOne({ email });
};
