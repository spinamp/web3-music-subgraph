# Web3 Music subgraph

This is a subgraph that aggregates various web3 music platforms. The goal is to aggregate all web3 music into a single, highly normalized and queryable schema. It's based off The Graph for now, though could branch out further if we get to integrating from non-EVM chains in future.

## Installation

### Deploying it locally with self-hosted node

**Prerequisites:**

- Install, sync and run an Ethereum full node (e.g. Erigon)
- Install and run a [graph-node](https://github.com/graphprotocol/graph-node#quick-start)

```bash
git clone https://github.com/spinamp/web3-music-subgraph.git
yarn
yarn build
yarn create-local
yarn deploy-local
```

## Design Goals
There are a few goals
 - Develop a schema that covers the minimal subset of web3 music/nft metadata that is possible to get just from on-chain data, with which the indexer can map data from different nuanced contracts into.
 - Extend the schema with custom tables for each platform that tracks platform-specific data within the same database, so that it is still available for querying.

## Priorities
 - Development resources on this project are also working on [Spinamp](https://spinamp.xyz/), a music player app for web3 music primarily focused on fans, listeners and media. The priorities for it are on ownership, media, track and artist data to enable frictionless, reliable browsing and listening of artists.
 - Sales, Royalties, Splits, etc are important too and hopefully will get added in time and we'd love contributions from others for this data. Having said that, we haven't put too deep thought into the schema for this kind of data yet

### Ingestion process
The subraph only ingests data directly from Events. It does not query Ethereum for additional on-chain data, for example, tokenURIs. This is because any on-chain queries are really bad for ingestion performance, as The Graph does not support parallel/bulk queries to on-chain state. A seperate post-processing phase will be run to augment and map the data into a bigger more comprehensive schema, with this other off-chain data that is needed, including data from IPFS and centralized APIs.

Note: It may be possible to explore using calls and calldata to ingest tokenURIs and other on-chain data without requiring on-chain queries, though this hasn't been tried yet.

## Current Platforms

## Zora/Catalog
The [Zora](https://zora.co/) integration (which includes catalog) is sliced out from https://github.com/ourzora/zora-v1-subgraph and also just tracks plain erc721 transfers with mints triggered based on the first transfer. With Zora, it does not seem possible to filter out for web3 music only using just on-chain data, so filtering non-music nfts out will likely happen in a post-processing phase.

## NOIZD
The [NOIZD](https://noizd.com/) integration is pretty simple, just tracking plain erc721 transfers, with mints triggered based on the first transfer.

## Sound.xyz
The [Sound.xyz](https://sound.xyz/) integration was sliced out of from https://github.com/soundxyz/subgraph. It tracks artist profile creation, edition and nft creation.


