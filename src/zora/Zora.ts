import { Address, BigInt } from '@graphprotocol/graph-ts';

import {
  Transfer
} from '../../generated/templates/ERC721/ERC721';
import { upsertERC721 } from '../shared/NFT'

import {
  loadOrCreateAccount, ZERO_ADDDRESS, formatAddress
} from '../shared/account';
import { Track } from '../../generated/schema';

function buildZoraTrackId(contractAddress: Address, tokenId: BigInt): string {
  return `${formatAddress(contractAddress.toHexString())}/${tokenId.toString()}`;
}

function createZoraTrack(artist: Address, tokenId: BigInt, blockNumber: BigInt): Track {
  const id = buildZoraTrackId(artist, tokenId)
  const track = new Track(id)
  track.platform = 'zora';
  track.createdAtBlockNumber = blockNumber;
  return track
}

export function handleMint(event: Transfer): void {
  const fromAddress = formatAddress(event.params.from.toHexString());
  if (fromAddress != ZERO_ADDDRESS) {
    return;
  }
  const to = loadOrCreateAccount(event.params.to)
  to.save()

  const track = createZoraTrack(event.address, event.params.tokenId, event.block.number);
  track.save();

  upsertERC721(
    event.address,
    event.params.tokenId,
    track.id,
    'zora',
    to.id,
    event.block.timestamp.times(BigInt.fromU64(1000)),
    event.block.number
  );
}
