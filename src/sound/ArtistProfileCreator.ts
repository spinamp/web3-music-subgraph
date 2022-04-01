import { SoundArtistProfile, ERC721 } from '../../generated/templates';
import { CreatedArtist } from '../../generated/SoundArtistProfileCreator/ArtistProfileCreator';

import { loadOrCreateAccount } from '../shared/account';
import { loadOrCreateSoundArtistProfile } from './ArtistProfile';

export function handleCreatedArtist(event: CreatedArtist): void {
  SoundArtistProfile.create(event.params.artistAddress)
  ERC721.create(event.params.artistAddress)

  let owner = loadOrCreateAccount(event.transaction.from)
  owner.save()

  let artistProfile = loadOrCreateSoundArtistProfile(event.params.artistAddress)
  artistProfile.creator = owner.id
  artistProfile.platform = 'sound';
  artistProfile.save()
}
