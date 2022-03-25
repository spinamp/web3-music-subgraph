import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  ArtistProfile,
  SoundEdition as Edition,
  SoundToken,
  Track,
} from '../../generated/schema'
import {
  EditionCreated as EditionCreatedEvent,
  EditionPurchased as EditionPurchasedEvent,
} from '../../generated/templates/SoundArtist/Artist'

import { loadOrCreateAccount } from '../shared/account';
import {buildERC721Id, upsertERC721} from '../shared/nft'

export function handleEditionCreated(event: EditionCreatedEvent): void {
  const edition = loadOrCreateEdition(event.address, event.params.editionId)
  edition.artistProfile = buildArtistProfileId(event.address)
  edition.editionId = event.params.editionId
  edition.fundingRecipient = event.params.fundingRecipient
  edition.price = event.params.price
  edition.quantity = event.params.quantity
  edition.royaltyBPS = event.params.royaltyBPS
  edition.startTime = event.params.startTime
  edition.endTime = event.params.endTime
  edition.numSold = BigInt.zero()
  edition.save()

  const track = createSoundTrack(event.address, event.params.editionId);
  track.save();
};

export function handleEditionPurchased(event: EditionPurchasedEvent): void {
  const buyer = loadOrCreateAccount(event.params.buyer)
  buyer.save()

  const creator = loadOrCreateAccount(event.transaction.from)
  creator.save()

  const trackId = buildSoundTrackId(event.address, event.params.editionId)

  upsertERC721(
    event.address,
    event.params.tokenId,
    trackId,
    buyer.id,
    event.block.timestamp,
    event.block.number
  );

  const token = createSoundToken(event.address, event.params.tokenId, event.params.editionId)
  token.save()
}

export function loadOrCreateSoundArtistProfile(address: Address): ArtistProfile {
  const id = buildArtistProfileId(address)
  let artist = ArtistProfile.load(id)

  if (artist === null) {
    artist = new ArtistProfile(id)
  }

  return artist
}

function loadOrCreateEdition(artist: Address, editionId: BigInt): Edition {
  const id = buildEditionId(artist, editionId)
  let edition = Edition.load(id)

  if (edition === null) {
    edition = new Edition(id)
    edition.artistProfile = buildArtistProfileId(artist)
  }

  return edition
}

function createSoundTrack(artist: Address, editionId: BigInt): Track {
  const id = buildSoundTrackId(artist, editionId)
  const track  = new Track(id)
  return track
}

function createSoundToken(artist: Address, tokenId: BigInt, editionId: BigInt): SoundToken {
  const id = buildTokenId(artist, tokenId)
  const token = new SoundToken(id)
  token.edition = buildEditionId(artist, editionId)
  token.artistProfile = buildArtistProfileId(artist)
  token.nft = buildERC721Id(artist, tokenId)
  return token
}

function buildSoundTrackId(artist: Address, editionId: BigInt): string {
  return buildEditionId(artist, editionId);
}

function buildArtistProfileId(artist: Address): string {
  return `sound/${artist.toHexString().toLowerCase()}`
}

function buildEditionId(artist: Address, editionId: BigInt): string {
  return artist.toHexString().toLowerCase() + '/' + editionId.toString()
}

function buildTokenId(artist: Address, tokenId: BigInt): string {
  return artist.toHexString().toLowerCase() + '/' + tokenId.toString()
}
