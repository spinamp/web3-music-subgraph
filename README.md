# Web3 Music subgraph

This is a subgraph that aggregates various web3 music platforms. The goal is to aggregate all web3 music into a single, highly normalized and queryable schema. It's based off The Graph for now, though could branch out further if we get to integrating from non-EVM chains in future.

## Design Goals
There are a few goals
 - Develop a schema that covers the minimal subset of web3 music/nft metadata that is possible to get just from on-chain data, with which the indexer can map data from different nuanced contracts into.
 - Extend the schema with custom tables for each platform that tracks platform-specific data within the same database, so that it is still available for querying.

## Priorities
 - This project is related to https://spinamp.xyz/, a music player app for web3 music primarily focused on fans, listeners and media. The priorities for this subgraph is in media, track and artist data to enable easier browsing and listening of artists.
 - NFT, Sales, Royalties, Splits, etc are important too and hopefully will get added in time, but the priority at the moment is listener-centric data

### Ingestion process
The subraph only ingests data from Events. It does not query Ethereum for additional on-chain data, for example, tokenURIs. This is because any on-chain queries are really bad for ingestion performance, as The Graph does not support parallel/bulk queries to on-chain state. A seperate post-processing phase will be run to augment the data into a bigger more powerful schema, with this other off-chain data that is needed, including data from IPFS and centralized APIs.

Note: It may be possible to explore using calls and calldata to ingest tokenURIs and other on-chain data without requiring on-chain queries, though this hasn't been tried yet.

## Current Platforms

## Zora/Catalog
The [Zora](https://zora.co/) integration (which includes catalog) is sliced out from https://github.com/ourzora/zora-v1-subgraph and also just tracks plain erc721 transfers with mints triggered based on the first transfer. With Zora, it does not seem possible to filter out for web3 music only using just on-chain data, so filtering non-music nfts out will likely happen in a post-processing phase.

## NOIZD
The [NOIZD](https://noizd.com/) integration is pretty simple, just tracking plain erc721 transfers, with mints triggered based on the first transfer.

## Sound.xyz
The [Sound.xyz](https://sound.xyz/) integration was sliced out of from https://github.com/soundxyz/subgraph. It tracks artist profile creation, edition and nft creation.


