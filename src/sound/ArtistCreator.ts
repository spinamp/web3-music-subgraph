import { SoundArtist, ERC721 } from '../../generated/templates';
import { CreatedArtist } from '../../generated/SoundArtistCreator/ArtistCreator';

import { loadOrCreateAccount } from '../shared/account';
import { loadOrCreateArtist } from './Artist';

export function handleCreatedArtist(event: CreatedArtist): void {
  SoundArtist.create(event.params.artistAddress)
  ERC721.create(event.params.artistAddress)

  let owner = loadOrCreateAccount(event.transaction.from)
  owner.save()

  let artist = loadOrCreateArtist(event.params.artistAddress)
  artist.creator = owner.id
  artist.name = event.params.name
  artist.symbol = event.params.symbol
  artist.artistId = event.params.artistId
  artist.save()
}
