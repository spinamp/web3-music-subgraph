# Web3 Music subgraph

This is a subgraph that aggregates various web3 music platforms.

## NOIZD
The NOIZD integration is pretty simple, just tracking plain erc721 transfers.

## Zora/Catalog
The Zora integration (which includes catalog) is sliced out from https://github.com/ourzora/zora-v1-subgraph and just tracks plain erc721 transfers

## Sound.xyz
The Sound.xyz integration was forked from https://github.com/soundxyz/subgraph. See that repo or the soundxyz-fork branch for more details.


### Ingestion process
The subraph only ingests data from Events. It does not query Ethereum for additional on-chain data, for example, tokenURIs. This is because any on-chain queries destroy ingestion performance, as The Graph does not support parallel/bulk queries to on-chain state. A seperate post-processing phase is run to augment the data with this other on-chain data that is needed.

Note: It may be possible to explore using calls and calldata to ingest this other on-chain data without on-chain queries, though this hasn't been tried yet.
