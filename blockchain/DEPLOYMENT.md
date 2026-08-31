# Deployment Guide

This guide covers deploying the EvidenceRegistry smart contract and the standalone blockchain service to different environments.

## Prerequisites

- Node.js 18+
- npm or yarn
- Ethereum wallet with ETH for gas (for testnet/mainnet)
- RPC endpoint URL (Infura, Alchemy, or local node)

## Local Development Deployment

### 1. Deploy Smart Contract

```bash
# Start local Hardhat node (in one terminal)
npx hardhat node

# Deploy contract (in another terminal)
npx hardhat run scripts/deploy.ts --network localhost
```

The contract will be deployed to the local Hardhat network. Note the contract address.

### 2. Configure Service

```bash
cd service
cp .env.example .env
```

Edit `.env` with:
```
CONTRACT_ADDRESS=<address_from_deployment>
RPC_URL=http://localhost:8545
PRIVATE_KEY=<your_local_wallet_private_key>
API_KEY=your_api_key (optional)
```

### 3. Start Service

```bash
npm install
npm run dev
```

The service will be available at `http://localhost:3001`

## Testnet Deployment (Sepolia)

### 1. Configure Testnet Environment

```bash
# Copy environment file
cp .env.example .env.testnet
```

Edit `.env.testnet` with:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Note the contract address from the output.

### 3. Verify Contract

```bash
CONTRACT_ADDRESS=<deployed_address> DEPLOYER_ADDRESS=<your_wallet_address> \
npx hardhat run scripts/verify.ts --network sepolia
```

### 4. Configure Service for Testnet

```bash
cd service
cp .env.example .env
```

Edit `.env` with:
```
CONTRACT_ADDRESS=<deployed_address>
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_sepolia_private_key
API_KEY=your_api_key
NODE_ENV=production
```

### 5. Deploy Service

```bash
# Using Docker Compose (from blockchain root)
docker-compose up -d

# Or manually
npm install
npm run build
npm start
```

## Mainnet Deployment

⚠️ **WARNING**: Mainnet deployment involves real money. Ensure you have:
- Thoroughly tested on testnet
- Security audit completed
- Sufficient ETH for gas fees
- Backup of private keys
- Emergency procedures in place

### 1. Configure Mainnet Environment

```bash
cp .env.example .env.mainnet
```

Edit `.env.mainnet` with mainnet RPC URL and private key.

### 2. Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.ts --network mainnet
```

### 3. Verify Contract

```bash
CONTRACT_ADDRESS=<deployed_address> DEPLOYER_ADDRESS=<your_wallet_address> \
npx hardhat run scripts/verify.ts --network mainnet
```

### 4. Deploy Service

Follow the same steps as testnet deployment, using mainnet configuration.

## Docker Deployment

### Build and Run

```bash
# Build the service image
docker build -t blockchain-evidence-service ./service

# Run with environment variables
docker run -d \
  -p 3001:3001 \
  -e CONTRACT_ADDRESS=0x... \
  -e RPC_URL=https://... \
  -e PRIVATE_KEY=... \
  -e API_KEY=... \
  blockchain-evidence-service
```

### Using Docker Compose

```bash
# Set environment variables
export CONTRACT_ADDRESS=0x...
export RPC_URL=https://...
export PRIVATE_KEY=...
export API_KEY=...

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract verified on block explorer
- [ ] Service configuration updated with contract address
- [ ] Service starts without errors
- [ ] Health check endpoint returns healthy status
- [ ] Can anchor test evidence successfully
- [ ] Can verify test evidence successfully
- [ ] Logs are being written correctly
- [ ] Rate limiting is working (if configured)
- [ ] API authentication is working (if configured)

## Troubleshooting

### Deployment Fails

**Issue**: Insufficient funds
```bash
# Check wallet balance
npx hardhat run scripts/check-balance.ts --network <network>
```

**Issue**: RPC connection issues
- Verify RPC URL is correct
- Check API key is valid
- Test RPC endpoint manually

### Service Won't Start

**Issue**: Configuration errors
```bash
# Validate configuration
cd service
node -e "require('./dist/config').validateConfig()"
```

**Issue**: Contract address invalid
- Verify contract address is correct
- Check contract is deployed on the specified network
- Ensure wallet has sufficient permissions

### Transaction Failures

**Issue**: Gas price too low
- Increase gas price in Hardhat config
- Use gas estimation tools

**Issue**: Unauthorized address
- Verify wallet is authorized to anchor evidence
- Check admin has authorized the address

## Monitoring

### Service Health

```bash
# Check service health
curl http://localhost:3001/api/v1/blockchain/health

# View service logs
docker-compose logs -f blockchain-service
# or
tail -f service/logs/combined.log
```

### Contract Monitoring

- Monitor contract on Etherscan (testnet/mainnet)
- Set up alerts for contract events
- Track gas costs and transaction patterns

## Security Considerations

1. **Never commit private keys** - Use environment variables
2. **Use hardware wallets** for mainnet deployments
3. **Enable API authentication** in production
4. **Use HTTPS** for production endpoints
5. **Regular security updates** - Keep dependencies updated
6. **Monitor for unusual activity** - Set up alerts
7. **Backup configuration** - Keep secure backups of deployment info

## Rollback Procedures

### Contract Rollback

Smart contracts cannot be "rolled back" in the traditional sense. If issues arise:

1. Pause the service to prevent new transactions
2. Deploy a new contract instance
3. Update service configuration with new contract address
4. Migrate data if needed (via off-chain processes)

### Service Rollback

```bash
# Stop current service
docker-compose down

# Deploy previous version
docker-compose up -d --build

# Or revert to previous commit
git checkout <previous_commit>
docker-compose up -d --build
```

## Support

For deployment issues:
1. Check this deployment guide
2. Review service logs
3. Check Hardhat documentation
4. Open an issue in the project repository
