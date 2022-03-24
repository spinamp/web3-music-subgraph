import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  loadOrCreateAccount, ZERO_ADDDRESS
} from './account';

import {
  NFT,
} from '../../generated/schema'

import {
  Transfer
} from '../../generated/templates/ERC721/ERC721';

export function buildERC721Id(contractAddress: Address, tokenId: BigInt): string {
  return `${contractAddress.toHexString().toLowerCase()}/${tokenId.toString()}`;
}

export function upsertERC721(
    contractAddress:Address, tokenId:BigInt, trackId:string | null = null,
    owner:string | null = null, createdAtTimestamp:BigInt| null = null, createdAtBlockNumber:BigInt| null = null
  ): NFT {
  const id = buildERC721Id(contractAddress, tokenId);
  let nft = NFT.load(id);

  if (nft === null) {
    nft = new NFT(id);
  }

  trackId && (nft.track = trackId);
  owner && (nft.owner = owner);
  createdAtTimestamp && (nft.createdAtTimestamp = createdAtTimestamp);
  createdAtBlockNumber && (nft.createdAtBlockNumber = createdAtBlockNumber);
  nft.save();
  return nft;
}

export function handleERC721Transfer(event: Transfer): void {
  if(event.params.from === ZERO_ADDDRESS) {
    return;
  }

  const from = loadOrCreateAccount(event.params.from)
  from.save()

  const to = loadOrCreateAccount(event.params.to)
  to.save()

  upsertERC721(
    event.address,
    event.params.tokenId,
    null,
    to.id,
    null,
    null
  );
}
