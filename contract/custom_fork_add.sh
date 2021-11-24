brownie networks delete mainnet-fork 
brownie networks add development mainnet-fork cmd=ganache-cli host=http://127.0.0.1 fork='$ALCHEMY_API' accounts=10 port=8545 mnemonic=brownie
