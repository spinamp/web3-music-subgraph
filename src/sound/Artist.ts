import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  SoundArtist as SoundArtist,
  SoundEdition as Edition,
  SoundToken as Token,
} from '../../generated/schema'
import {
  EditionCreated as EditionCreatedEvent,
  EditionPurchased as EditionPurchasedEvent,
} from '../../generated/templates/SoundArtist/Artist'

import { loadOrCreateAccount } from '../shared/account';

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
  edition.save()
};

export function handleEditionPurchased(event: EditionPurchasedEvent): void {
  let buyer = loadOrCreateAccount(event.params.buyer)
  buyer.save()

  let creator = loadOrCreateAccount(event.transaction.from)
  creator.save()

  let token = loadOrCreateToken(event.address, event.params.tokenId, event.params.editionId)
  token.owner = buyer.id
  token.creator = creator.id
  token.save()
}

export function loadOrCreateArtist(address: Address): SoundArtist {
  let id = buildArtistId(address)
  let artist = SoundArtist.load(id)

  if (artist === null) {
    artist = new SoundArtist(id)
  }

  return artist
}

function loadOrCreateEdition(artist: Address, editionId: BigInt): Edition {
  let id = buildEditionId(artist, editionId)
  let edition = Edition.load(id)

  if (edition === null) {
    edition = new Edition(id)
    edition.artist = buildArtistId(artist)
  }

  return edition
}

function loadOrCreateToken(artist: Address, tokenId: BigInt, editionId: BigInt): Token {
  let id = buildTokenId(artist, tokenId)
  let token = Token.load(id)

  if (token === null) {
    token = new Token(id)
    token.tokenId = tokenId
    token.edition = buildEditionId(artist, editionId)
    token.artist = buildArtistId(artist)
  }

  return token
}

function buildArtistId(artist: Address): string {
  return artist.toHexString().toLowerCase()
}

function buildEditionId(artist: Address, editionId: BigInt): string {
  return artist.toHexString().toLowerCase() + '/' + editionId.toString()
}

function buildTokenId(artist: Address, tokenId: BigInt): string {
  return artist.toHexString().toLowerCase() + '/' + tokenId.toString()
}
