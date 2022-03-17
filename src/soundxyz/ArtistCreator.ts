import { SoundXYZArtist as SoundXYZArtistTemplate } from '../../generated/templates'
import { CreatedArtist as CreatedArtistEvent } from '../../generated/SoundXYZArtistCreator/ArtistCreator'

import { loadOrCreateAccount, loadOrCreateArtist } from './Artist'

export function handleCreatedArtist(event: CreatedArtistEvent): void {
  SoundXYZArtistTemplate.create(event.params.artistAddress)

  let owner = loadOrCreateAccount(event.transaction.from)
  owner.save()

  let artist = loadOrCreateArtist(event.params.artistAddress)
  artist.owner = owner.id
  artist.creator = owner.id
  artist.name = event.params.name
  artist.symbol = event.params.symbol
  artist.artistId = event.params.artistId
  artist.save()
}
