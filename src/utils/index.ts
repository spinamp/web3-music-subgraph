import { ByteArray, crypto } from '@graphprotocol/graph-ts'

// toChecksumAddress adapted from web3.js.
// Note: It may not handle errors/bad input properly.
export const toChecksumAddress = function (address:string): string {
  if (typeof address === 'undefined') return '';

  address = address.toLowerCase().replace('0x', '');
  var addressHash = crypto.keccak256(ByteArray.fromHexString(address)).toHexString().replace('0x', '');
  var checksumAddress = '0x';

  for (var i = 0; i < address.length; i++) {
    // If ith character is 8 to f then make it uppercase
    if (parseInt((addressHash.charAt(i)), 16) > 7) {
      checksumAddress += address.charAt(i).toUpperCase();
    } else {
      checksumAddress += address.charAt(i);
    }
  }

  return checksumAddress;
};
