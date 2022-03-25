import { Address } from '@graphprotocol/graph-ts'

import {
  Account,
} from '../../generated/schema';

export function loadOrCreateAccount(address: Address): Account {
  let id = buildAccountId(address)
  let account = Account.load(id)
  return account === null ? new Account(id) : account
}

export function buildAccountId(account: Address): string {
  return formatAddress(account.toHexString());
}

export function formatAddress(address: string): string {
  return address.toLowerCase();
}

export const ZERO_ADDDRESS: string = '0x0000000000000000000000000000000000000000';
