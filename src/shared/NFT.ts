import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  loadOrCreateAccount
} from './account';

import {
  NFT,
} from '../../generated/schema'

import {
  Transfer
} from '../../generated/templates/ERC721/ERC721';

function buildERC721Id(contractAddress: Address, tokenId: BigInt): string {
  return `${contractAddress.toHexString().toLowerCase()}/${tokenId.toString()}`;
}

function loadOrCreateERC721(contractAddress: Address, tokenId: BigInt): NFT {
  const id = buildERC721Id(contractAddress, tokenId);
  let token = NFT.load(id)

  if (token === null) {
    token = new NFT(id)
  }

  return token
}

export function handleERC721Transfer(event: Transfer): void {
  const from = loadOrCreateAccount(event.params.from)
  from.save()

  const to = loadOrCreateAccount(event.params.to)
  to.save()

  const nft = loadOrCreateERC721(event.address, event.params.tokenId)
  nft.owner = to.id
  nft.createdAtTimestamp = event.block.timestamp
  nft.createdAtBlockNumber = event.block.number
  nft.save()
}
