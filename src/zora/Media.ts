import { log, BigInt, Bytes } from '@graphprotocol/graph-ts/index'
import {
  Account as AccountEntity,
} from '../../generated/schema';

import { Media as MediaContract } from '../../generated/ZoraMedia/Media';

import {
  loadOrCreateAccount
} from '../shared';

import {
  Transfer as TransferEvent
} from '../../generated/ZoraMedia/Media';

import {
  ZoraMedia as ZoraMediaEntity,
} from '../../generated/schema'

const zeroAddress = '0x0000000000000000000000000000000000000000';

/**
 * Handler called when the `Transfer` Event is called on the Zora Media Contract
 * @param event
 */
export function handleTransfer(event: TransferEvent): void {
  const tokenId = event.params.tokenId.toString()

  const from = loadOrCreateAccount(event.params.from)
  from.save()

  const to = loadOrCreateAccount(event.params.to)
  to.save()

  if (from.id == zeroAddress) {
    handleMint(event)
    return
  }

  const media = ZoraMediaEntity.load(tokenId)
  if (media == null) {
    log.error(`Media is null for token id: {}`, [tokenId])
  }

  if (to.id == zeroAddress) {
    media!.prevOwner = zeroAddress
    media!.burnedAtTimeStamp = event.block.timestamp
    media!.burnedAtBlockNumber = event.block.number
  }

  media!.owner = to.id
  media!.approved = null
  media!.save()
}

/**
 * Handler called when the `Mint` Event is called on the Zora Media Contract
 * @param event
 */
function handleMint(event: TransferEvent): void {
  const creator = loadOrCreateAccount(event.params.to);
  creator.save()

  const tokenId = event.params.tokenId

  const mediaContract = MediaContract.bind(event.address)
  const contentURI = mediaContract.tokenURI(tokenId)
  const metadataURI = mediaContract.tokenMetadataURI(tokenId)

  const contentHash = mediaContract.tokenContentHashes(tokenId)
  const metadataHash = mediaContract.tokenMetadataHashes(tokenId)

  createMedia(
    tokenId.toString(),
    event.transaction.hash.toHexString(),
    creator,
    creator,
    creator,
    contentURI,
    contentHash,
    metadataURI,
    metadataHash,
    event.block.timestamp,
    event.block.number
  )

}

/**
 * Create New Media Entity
 * @param id
 * @param owner
 * @param creator
 * @param prevOwner
 * @param contentURI
 * @param contentHash
 * @param metadataURI
 * @param metadataHash
 * @param createdAtTimestamp
 * @param createdAtBlockNumber
 */
 export function createMedia(
  id: string,
  transactionHash: string,
  owner: AccountEntity,
  creator: AccountEntity,
  prevOwner: AccountEntity,
  contentURI: string,
  contentHash: Bytes,
  metadataURI: string,
  metadataHash: Bytes,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt
): ZoraMediaEntity {
  let media = new ZoraMediaEntity(id)
  media.owner = owner.id
  media.transactionHash = transactionHash
  media.creator = creator.id
  media.prevOwner = prevOwner.id
  media.contentURI = contentURI
  media.contentHash = contentHash
  media.metadataURI = metadataURI
  media.metadataHash = metadataHash
  media.createdAtTimestamp = createdAtTimestamp
  media.createdAtBlockNumber = createdAtBlockNumber

  media.save()
  return media
}
