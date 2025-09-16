import UserPAT, { IUserPAT } from '../models/userPAT.model';
import { encrypt, decrypt } from '../utils/encryption';

export const upsertUserPAT = async (email: string, pat: string): Promise<IUserPAT> => {
  const encryptedPAT = encrypt(pat);
  return UserPAT.findOneAndUpdate(
    { email },
    { pat: encryptedPAT },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const getUserPAT = async (email: string): Promise<IUserPAT | null> => {
  const userPat = await UserPAT.findOne({ email });
  if (!userPat) return null;
  userPat.pat = decrypt(userPat.pat);
  return userPat;
};
