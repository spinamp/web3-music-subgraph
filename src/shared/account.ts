import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  Account,
} from '../../generated/schema';

export function loadOrCreateAccount(address: Address): Account {
  let id = buildAccountId(address)
  let account = Account.load(id)
  return account === null ? new Account(id) : account
}

export function buildAccountId(account: Address): string {
  return account.toHexString().toLowerCase();
}
