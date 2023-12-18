import {} from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { UserDocument } from 'src/users/entities/user.entity';

export async function createVerificationToken() {
  const token = randomBytes(8).toString('hex');
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getMinutes() + 30);

  return { token, expirationTime };
}

export async function verifyToken(
  userModel: Model<UserDocument>,
  id: string,
  token: string,
): Promise<boolean> {
  const user = await userModel.findById(id);

  if (!user || !user.confirmationToken || !user.confirmationTokenExpires) {
    return false;
  }

  const now = new Date();
  if (user.confirmationToken === token && user.confirmationTokenExpires > now) {
    user.confirmationToken = null;
    user.confirmationTokenExpires = null;
    user.status = true;
    await user.save();
    return true;
  }

  return false;
}

//should apply an cronjob here
async function clearExpiredTokens() {
  const now = new Date();
  await this.userModel.updateMany(
    { confirmationTokenExpires: { $lte: now } },
    { $set: { confirmationToken: null, confirmationTokenExpires: null } },
  );
}
