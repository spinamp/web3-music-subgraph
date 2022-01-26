# Sound.xyz subgraph

Current subgraph here: https://thegraph.com/hosted-service/subgraph/schmidsi/sound-subgraph?query=Example%20query

## Spec

Sound.xyz deploys for every artist its own ERC721 (or ERC1155?) contract from a factory contract. The artist contract is a [BeaconProxy](https://docs.openzeppelin.com/contracts/4.x/api/proxy). There are multiple drops per artist.

This subgraph should track following events:

- Creation of new artist contract (use data source templates)
- New drop on artist contract: Will be announced
- Sale events on artist contract, during drop
- Transfer events of NFTs
- Statistics (Prio 2):
  - Total NFTs sold
  - Total contracts deployed
  - Total drops

## Reverse engineering notes

- Example artist contract: https://etherscan.io/address/0x913E9B0Bf8e9c3AC18b28460772D79321a26bDf8#readProxyContract, Artist: https://www.sound.xyz/thedramaduo/3am
- Heno (Example Artist): https://etherscan.io/token/0x87853A0b58F2C36FeAf0F9183953D9319e598c16
- Beacon referred beacon contract: https://etherscan.io/address/0xeb4cedc465cd6c9b0267677d0cd56bfa00ca0e57#events
- Artist creator proxy: https://etherscan.io/address/0x78e3adc0e811e4f93bd9f1f9389b923c9a3355c2#code
- Implementation contract: https://etherscan.io/address/0xe2364090b151c09c596e1b58cb4a412906ff2127#code
