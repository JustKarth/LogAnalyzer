# Blockchain Evidence Registry Service

Standalone REST API service for the Blockchain Evidence Registry. This service provides a simple HTTP interface for interacting with the blockchain smart contract, making it easy for other teams to integrate without needing to understand blockchain details.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Deployed EvidenceRegistry smart contract
- Ethereum node (local or RPC URL)

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
# - CONTRACT_ADDRESS: Your deployed contract address
# - RPC_URL: Blockchain RPC URL
# - PRIVATE_KEY: Service wallet private key
# - API_KEY: Optional API key for authentication
```

### Running the Service

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The service will start on port 3001 (configurable via PORT environment variable).

## API Endpoints

### Base URL
```
http://localhost:3001/api/v1/blockchain
```

### Endpoints

#### Health Check
```
GET /health
```
Returns service health status (no authentication required).

#### Anchor Evidence
```
POST /anchor
Content-Type: application/json
X-API-Key: your_api_key (if configured)

Body:
{
  "evidence_id": "evidence_001",
  "hash": "0x1234567890abcdef..."
}

Response:
{
  "record_id": "1",
  "tx_hash": "0xabc123...",
  "block_number": "12345"
}
```

#### Verify Evidence
```
POST /verify
Content-Type: application/json
X-API-Key: your_api_key (if configured)

Body:
{
  "evidence_id": "evidence_001"
}

Response:
{
  "valid": true,
  "message": "Evidence verified successfully",
  "blockchain_record": {
    "id": "1",
    "evidence_id": "evidence_001",
    "hash": "0x1234567890abcdef...",
    "anchorer": "0xabc...",
    "timestamp": "1699999999",
    "block_number": "12345",
    "tx_hash": "0xabc123...",
    "exists": true
  }
}
```

#### Get Record
```
GET /records/:id
X-API-Key: your_api_key (if configured)

Response:
{
  "id": "1",
  "evidence_id": "evidence_001",
  "hash": "0x1234567890abcdef...",
  "anchorer": "0xabc...",
  "timestamp": "1699999999",
  "block_number": "12345",
  "tx_hash": "0xabc123...",
  "exists": true
}
```

#### Get Total Records
```
GET /total
X-API-Key: your_api_key (if configured)

Response:
{
  "total": "42"
}
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3001 | Service port |
| NODE_ENV | No | development | Environment (development/production) |
| CONTRACT_ADDRESS | Yes | - | Deployed contract address |
| RPC_URL | Yes | - | Blockchain RPC URL |
| PRIVATE_KEY | Yes | - | Service wallet private key |
| API_KEY | No | - | API key for authentication (optional) |
| RATE_LIMIT_MAX | No | 100 | Max requests per window |
| RATE_LIMIT_WINDOW_MS | No | 60000 | Rate limit window in ms |
| LOG_LEVEL | No | info | Logging level |
| ENABLE_METRICS | No | true | Enable metrics collection |

## Security

### API Authentication
If `API_KEY` is configured in `.env`, all endpoints (except `/health`) require the API key in the `X-API-Key` header.

### Rate Limiting
The service includes rate limiting to prevent abuse. Configure via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`.

### Security Headers
The service uses Helmet.js to set security headers automatically.

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

In development mode, logs are also printed to the console.

## Docker Deployment

```bash
# Build the Docker image
docker build -t blockchain-evidence-service .

# Run the container
docker run -p 3001:3001 \
  -e CONTRACT_ADDRESS=0x... \
  -e RPC_URL=https://... \
  -e PRIVATE_KEY=... \
  blockchain-evidence-service
```

## Integration Examples

### cURL
```bash
# Anchor evidence
curl -X POST http://localhost:3001/api/v1/blockchain/anchor \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"evidence_id":"evidence_001","hash":"0x123..."}'

# Verify evidence
curl -X POST http://localhost:3001/api/v1/blockchain/verify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"evidence_id":"evidence_001"}'
```

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3001/api/v1/blockchain/anchor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
  },
  body: JSON.stringify({
    evidence_id: 'evidence_001',
    hash: '0x123...'
  })
});
const result = await response.json();
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3001/api/v1/blockchain/anchor',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'your_api_key'
    },
    json={
        'evidence_id': 'evidence_001',
        'hash': '0x123...'
    }
)
result = response.json()
```

## Troubleshooting

### Service won't start
- Check that all required environment variables are set
- Verify the contract address is correct
- Ensure the RPC URL is accessible
- Check that the private key is valid

### Connection errors
- Verify the RPC URL is correct and accessible
- Check network connectivity
- Ensure the blockchain node is running

### Transaction failures
- Verify the wallet has sufficient ETH for gas
- Check that the wallet is authorized to anchor evidence
- Review contract logs for specific error messages

## Development

### Project Structure
```
service/
├── src/
│   ├── server.ts       # Express server setup
│   ├── routes.ts       # API route handlers
│   ├── blockchain.ts   # Blockchain interaction layer
│   ├── config.ts       # Configuration management
│   └── logger.ts       # Logging setup
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Adding New Endpoints
1. Add the route in `src/routes.ts`
2. Implement the business logic in `src/blockchain.ts` if needed
3. Add appropriate error handling and logging
4. Update this README with the new endpoint documentation
