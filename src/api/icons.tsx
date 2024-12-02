import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

export async function GenerateIcons(seed: string) {
    return await createAvatar(lorelei, { seed: seed }).toString();
}