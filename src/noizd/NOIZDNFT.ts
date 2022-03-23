import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { NOIZDNFT as NOIZDNFTContract } from '../../generated/NOIZDNFT/NOIZDNFT';
import {toChecksumAddress} from '../utils';

import {
  Transfer as TransferEvent
} from '../../generated/NOIZDNFT/NOIZDNFT';

import {
  NOIZDToken as NOIZDTokenEntity,
} from '../../generated/schema'

import {
  loadOrCreateAccount
} from '../shared';

const NOIZD_CONTRACT_ADDRESS: Address = Address.fromString(toChecksumAddress('0xF5819E27B9bAD9F97c177Bf007c1F96F26D91CA6'));

function getTokenUri(tokenId: BigInt): string {
  let noizdContract = NOIZDNFTContract.bind(NOIZD_CONTRACT_ADDRESS);
  let tokenUriCall = noizdContract.try_tokenURI(tokenId)

  if (!tokenUriCall.reverted) {
    return tokenUriCall.value
  }

  log.warning('NOIZD tokenURI() call reverted for token #{}', [tokenId.toString()])
  return 'unknown'
}

function buildTokenId(tokenId: BigInt): string {
  return `${NOIZD_CONTRACT_ADDRESS.toHexString()}/${tokenId.toString()}`;
}

function loadOrCreateToken(tokenId: BigInt): NOIZDTokenEntity {
  let id = buildTokenId(tokenId)
  let token = NOIZDTokenEntity.load(id)

  if (token === null) {
    token = new NOIZDTokenEntity(id)
    token.uri = getTokenUri(tokenId)
  }

  return token
}

export function handleTransfer(event: TransferEvent): void {
  let from = loadOrCreateAccount(event.params.from)
  from.save()

  let to = loadOrCreateAccount(event.params.to)
  to.save()

  let token = loadOrCreateToken(event.params.tokenId)
  token.owner = to.id
  token.save()
}
