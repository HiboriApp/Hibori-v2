import crypto from 'node:crypto';

const hashPassword = (password: string): string => {
  const hashObject = crypto.createHash('sha256');
  hashObject.update(password);
  const hexHash = hashObject.digest('hex');
  return hexHash;
};