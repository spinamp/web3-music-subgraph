import { Address, BigInt, log, ethereum } from '@graphprotocol/graph-ts'

import { Artist as ArtistContract } from '../../generated/SoundArtistCreator/Artist'
import {
  SoundArtist as SoundArtistEntity,
  Balance as BalanceEntity,
  Edition as EditionEntity,
  Token as TokenEntity,
  Sale as SaleEntity,
  Transfer as TransferEntity
} from '../../generated/schema'
import {
  EditionCreated as EditionCreatedEvent,
  EditionPurchased as EditionPurchasedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent
} from '../../generated/templates/SoundArtist/Artist'

import {toChecksumAddress} from '../utils';

import {
  buildAccountId,
  loadOrCreateAccount
} from '../shared';

const ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let owner = loadOrCreateAccount(event.params.newOwner)
  owner.save()

  let artist = loadOrCreateArtist(event.address)
  artist.owner = owner.id
  artist.save()
}

export function handleEditionCreated(event: EditionCreatedEvent): void {
  let edition = loadOrCreateEdition(event.address, event.params.editionId)
  edition.artist = buildArtistId(event.address)
  edition.editionId = event.params.editionId
  edition.fundingRecipient = event.params.fundingRecipient
  edition.price = event.params.price
  edition.quantity = event.params.quantity
  edition.royaltyBPS = event.params.royaltyBPS
  edition.startTime = event.params.startTime
  edition.endTime = event.params.endTime
  edition.numSold = BigInt.zero()
  edition.uri = getEditionUri(event.address, event.params.editionId)
  edition.save()
}

export function handleEditionPurchased(event: EditionPurchasedEvent): void {
  let artist = loadOrCreateArtist(event.address)
  artist.totalSupply = artist.totalSupply.plus(BigInt.fromI32(1))
  artist.save()

  let edition = loadOrCreateEdition(event.address, event.params.editionId)
  edition.numSold = edition.numSold.plus(BigInt.fromI32(1))
  edition.save()

  let buyer = loadOrCreateAccount(event.params.buyer)
  buyer.save()

  let creator = loadOrCreateAccount(event.transaction.from)
  creator.save()

  let balance = loadOrCreateBalance(event.address, event.params.buyer)
  balance.amount = balance.amount.plus(BigInt.fromI32(1))
  balance.save()

  let token = loadOrCreateToken(event.address, event.params.editionId, event.params.tokenId)
  token.owner = buyer.id
  token.creator = creator.id
  token.uri = getTokenUri(event.address, event.params.tokenId)
  token.save()

  let id = buildEventId(event)
  let sale = new SaleEntity(id)
  sale.artist = buildArtistId(event.address)
  sale.edition = buildEditionId(event.address, event.params.editionId)
  sale.token = buildTokenId(event.address, event.params.editionId, event.params.tokenId)
  sale.seller = creator.id
  sale.buyer = buyer.id
  sale.amount = edition.price
  sale.currency = ZERO_ADDRESS
  sale.blockNumber = event.block.number
  sale.blockHash = event.block.hash
  sale.timestamp = event.block.timestamp
  sale.txHash = event.transaction.hash
  sale.save()
}

export function handleTransfer(event: TransferEvent): void {
  let from = loadOrCreateAccount(event.params.from)
  from.save()

  let to = loadOrCreateAccount(event.params.to)
  to.save()

  let balanceSender = loadOrCreateBalance(event.address, event.params.from)
  balanceSender.amount = balanceSender.amount.minus(BigInt.fromI32(1))
  balanceSender.save()

  let balanceRecipient = loadOrCreateBalance(event.address, event.params.from)
  balanceRecipient.amount = balanceRecipient.amount.plus(BigInt.fromI32(1))
  balanceRecipient.save()

  let editionId = getEditionIdForToken(event.address, event.params.tokenId)
  let token = loadOrCreateToken(event.address, editionId, event.params.tokenId)
  token.owner = to.id
  token.save()

  let id = buildEventId(event)
  let transfer = new TransferEntity(id)
  transfer.artist = buildArtistId(event.address)
  transfer.edition = buildEditionId(event.address, editionId)
  transfer.token = buildTokenId(event.address, editionId, event.params.tokenId)
  transfer.from = from.id
  transfer.to = to.id
  transfer.blockNumber = event.block.number
  transfer.blockHash = event.block.hash
  transfer.timestamp = event.block.timestamp
  transfer.txHash = event.transaction.hash
  transfer.save()
}

export function loadOrCreateArtist(address: Address): SoundArtistEntity {
  let id = buildArtistId(address)
  let artist = SoundArtistEntity.load(id)

  if (artist === null) {
    artist = new SoundArtistEntity(id)
    artist.uri = ''
    artist.totalSupply = BigInt.zero()
  } else if (artist.uri == '') {
    artist.uri = getArtistBaseUri(address)
  }

  return artist
}

function loadOrCreateEdition(artist: Address, editionId: BigInt): EditionEntity {
  let id = buildEditionId(artist, editionId)
  let edition = EditionEntity.load(id)

  if (edition === null) {
    edition = new EditionEntity(id)
    edition.artist = buildArtistId(artist)
  }

  return edition
}

function loadOrCreateToken(artist: Address, editionId: BigInt, tokenId: BigInt): TokenEntity {
  let id = buildTokenId(artist, editionId, tokenId)
  let token = TokenEntity.load(id)

  if (token === null) {
    token = new TokenEntity(id)
    token.tokenId = tokenId
    token.artist = buildArtistId(artist)
    token.edition = buildEditionId(artist, editionId)
  }

  return token
}

function loadOrCreateBalance(artist: Address, account: Address): BalanceEntity {
  let id = buildBalanceId(artist, account)
  let balance = BalanceEntity.load(id)

  if (balance === null) {
    balance = new BalanceEntity(id)
    balance.artist = buildArtistId(artist)
    balance.account = buildAccountId(account)
    balance.amount = BigInt.zero()
  }

  return balance
}

function getArtistBaseUri(artist: Address): string {
  let artistContract = ArtistContract.bind(artist)
  let contractUriCall = artistContract.try_contractURI()

  if (!contractUriCall.reverted) {
    return contractUriCall.value.replace('storefront', '')
  }

  log.warning('contractURI() call reverted for {}', [artist.toHexString()])
  return 'unknown'
}

function getEditionUri(artist: Address, editionId: BigInt): string {
  let artistContract = ArtistContract.bind(artist)
  let contractUriCall = artistContract.try_contractURI()

  if (!contractUriCall.reverted) {
    return contractUriCall.value.replace('storefront', editionId.toString())
  }

  log.warning('contractURI() call reverted for {}', [artist.toHexString()])
  return 'unknown'
}

function getTokenUri(artist: Address, tokenId: BigInt): string {
  let artistContract = ArtistContract.bind(artist)
  let tokenUriCall = artistContract.try_tokenURI(tokenId)

  if (!tokenUriCall.reverted) {
    return tokenUriCall.value
  }

  log.warning('tokenURI() call reverted for {} and token #{}', [artist.toHexString(), tokenId.toString()])
  return 'unknown'
}

function getEditionIdForToken(artist: Address, tokenId: BigInt): BigInt {
  let artistContract = ArtistContract.bind(artist)
  let tokenToEditionCall = artistContract.try_tokenToEdition(tokenId)

  if (!tokenToEditionCall.reverted) {
    return tokenToEditionCall.value
  }

  log.warning('tokenToEdition() call reverted for {} and token #{}', [artist.toHexString(), tokenId.toString()])
  return BigInt.zero()
}

function buildArtistId(artist: Address): string {
  return toChecksumAddress(artist.toHexString())
}

function buildEditionId(artist: Address, editionId: BigInt): string {
  return toChecksumAddress(artist.toHexString()) + '/' + editionId.toString()
}

function buildTokenId(artist: Address, editionId: BigInt, tokenId: BigInt): string {
  return toChecksumAddress(artist.toHexString()) + '/' + editionId.toString() + '/' + tokenId.toString()
}

function buildBalanceId(artist: Address, owner: Address): string {
  return toChecksumAddress(artist.toHexString()) + '/' + toChecksumAddress(owner.toHexString())
}

function buildEventId(event: ethereum.Event): string {
  return event.transaction.hash.toHexString() + ':' + event.transactionLogIndex.toHexString()
}
