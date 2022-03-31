import { Address, BigInt } from '@graphprotocol/graph-ts';

import {
  Transfer
} from '../../generated/templates/ERC721/ERC721';
import {upsertERC721} from '../shared/NFT';

import {
  loadOrCreateAccount, ZERO_ADDDRESS, formatAddress
} from '../shared/account';
import { Track } from '../../generated/schema';

function buildZoraTrackId(contractAddress:Address, tokenId: BigInt): string {
  return `${formatAddress(contractAddress.toHexString())}/${tokenId.toString()}`;
}

function createZoraTrack(artist: Address, tokenId: BigInt): Track {
  const id = buildZoraTrackId(artist, tokenId)
  const track  = new Track(id)
  return track
}

export function handleMint(event: Transfer): void {
  const fromAddress = formatAddress(event.params.from.toHexString());
  if(fromAddress != ZERO_ADDDRESS) {
    return;
  }
  const to = loadOrCreateAccount(event.params.to)
  to.save()

  const track = createZoraTrack(event.address, event.params.tokenId);
  track.save();

  upsertERC721(
    event.address,
    event.params.tokenId,
    track.id,
    to.id,
    event.block.timestamp,
    event.block.number
  );
}
