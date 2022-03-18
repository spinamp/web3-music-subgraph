import { Address } from '@graphprotocol/graph-ts'

import {
  Account as AccountEntity,
} from '../generated/schema';

export function loadOrCreateAccount(address: Address): AccountEntity {
  let id = buildAccountId(address)
  let account = AccountEntity.load(id)
  return account === null ? new AccountEntity(id) : account
}

export function buildAccountId(account: Address): string {
  return account.toHexString()
}
