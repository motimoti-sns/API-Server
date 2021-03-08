import { createHash } from 'crypto';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { sharing } from '../../app.module';
dotenv.config()

const blockChainAddr = process.env.BLOCKCHAIN_ADDRESS

function stashHash (previousHash: string, currentHash: string) {
  return createHash('sha256')
    .update(previousHash + currentHash)
    .digest('hex')
}

function hash (toHash: string) {
  return createHash('sha256')
    .update(toHash)
    .digest('hex')
}

export async function createHashChain (userId: number, textBody: string, index: number, textId: number): Promise<string> {
  const tempLastHash = sharing.data.lastHash
  let previousHash: string
  let currentHash: string;
  if (tempLastHash[userId]) {
    previousHash = tempLastHash[userId]
    currentHash = stashHash(tempLastHash[userId], hash(textBody));
  } else {
    previousHash = hash('genesis')
    currentHash = stashHash(hash('genesis'), hash(textBody));
  }
  try {
    const res = await axios.post<{msg: string}>(`${blockChainAddr}/api/post`, {
      user_id: userId,
      previous_hash: previousHash,
      hash: currentHash,
      index: index,
      text_id: textId
    });
    if (res.data.msg === 'success') {
      tempLastHash[userId] = currentHash
      sharing.setLastHash(tempLastHash)
      return 'success'
    }
  } catch (e) {
    console.error(e)
    return 'failed'
  }
}