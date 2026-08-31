# Integration Guide

This guide provides detailed instructions for integrating with the Blockchain Evidence Registry service. The service exposes a REST API that can be consumed by any backend or frontend application.

## Overview

The Blockchain Evidence Registry service provides a simple HTTP interface for:
- **Anchoring evidence**: Store cryptographic hashes on the blockchain
- **Verifying evidence**: Check if current evidence matches the stored hash
- **Retrieving records**: Get detailed information about anchored evidence

## Base URL

```
http://localhost:3001/api/v1/blockchain
```

## Authentication

If `API_KEY` is configured in the service environment, include it in the `X-API-Key` header:

```
X-API-Key: your_api_key_here
```

## API Endpoints

### 1. Health Check

Check if the service is running.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "blockchain-evidence-service",
  "uptime": 3600.5,
  "memory": {
    "rss": 45678901,
    "heapTotal": 34567890,
    "heapUsed": 23456789
  },
  "environment": "development"
}
```

### 2. Metrics

Get service performance metrics.

**Endpoint**: `GET /metrics`

**Authentication**: Not required

**Response**:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "rss": 45678901,
    "heapTotal": 34567890,
    "heapUsed": 23456789
  },
  "cpu": {
    "user": 12345678,
    "system": 9876543
  },
  "environment": "development",
  "service": "blockchain-evidence-service"
}
```

### 3. Anchor Evidence

Store evidence hash on the blockchain.

**Endpoint**: `POST /anchor`

**Authentication**: Required (if API key configured)

**Request Body**:
```json
{
  "evidence_id": "evidence_001",
  "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**Parameters**:
- `evidence_id` (string, required): Unique identifier for the evidence
- `hash` (string, required): 32-byte hex string (66 characters including 0x prefix)

**Response**:
```json
{
  "record_id": "1",
  "tx_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "block_number": "12345"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Invalid or missing API key
- `500 Internal Server Error`: Blockchain transaction failed

### 4. Verify Evidence

Check if evidence hash matches the stored blockchain record.

**Endpoint**: `POST /verify`

**Authentication**: Required (if API key configured)

**Request Body**:
```json
{
  "evidence_id": "evidence_001"
}
```

**Parameters**:
- `evidence_id` (string, required): Unique identifier for the evidence

**Response (Valid)**:
```json
{
  "valid": true,
  "message": "Evidence verified successfully",
  "blockchain_record": {
    "id": "1",
    "evidence_id": "evidence_001",
    "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "anchorer": "0xABC123...",
    "timestamp": "1705314600",
    "block_number": "12345",
    "tx_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "exists": true
  }
}
```

**Response (Invalid)**:
```json
{
  "valid": false,
  "message": "Evidence not found in blockchain registry"
}
```

### 5. Get Record

Retrieve detailed information about a specific record.

**Endpoint**: `GET /records/:id`

**Authentication**: Required (if API key configured)

**Parameters**:
- `id` (path parameter, required): Record ID (numeric string)

**Response**:
```json
{
  "id": "1",
  "evidence_id": "evidence_001",
  "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "anchorer": "0xABC123...",
  "timestamp": "1705314600",
  "block_number": "12345",
  "tx_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "exists": true
}
```

### 6. Get Total Records

Get the total number of records in the registry.

**Endpoint**: `GET /total`

**Authentication**: Required (if API key configured)

**Response**:
```json
{
  "total": "42"
}
```

## Integration Examples

### JavaScript/TypeScript

```typescript
const API_BASE_URL = 'http://localhost:3001/api/v1/blockchain';
const API_KEY = 'your_api_key';

class BlockchainClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async anchorEvidence(evidenceId: string, hash: string) {
    return this.request('/anchor', {
      method: 'POST',
      body: JSON.stringify({ evidence_id: evidenceId, hash }),
    });
  }

  async verifyEvidence(evidenceId: string) {
    return this.request('/verify', {
      method: 'POST',
      body: JSON.stringify({ evidence_id: evidenceId }),
    });
  }

  async getRecord(recordId: string) {
    return this.request(`/records/${recordId}`);
  }

  async getTotalRecords() {
    return this.request('/total');
  }
}

// Usage
const client = new BlockchainClient(API_BASE_URL, API_KEY);

// Anchor evidence
const anchorResult = await client.anchorEvidence('evidence_001', '0x123...');
console.log('Anchored:', anchorResult);

// Verify evidence
const verifyResult = await client.verifyEvidence('evidence_001');
console.log('Valid:', verifyResult.valid);
```

### Python

```python
import requests
from typing import Dict, Any

class BlockchainClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        }

    def _request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = requests.request(
            method,
            url,
            headers=self.headers,
            json=data
        )
        
        if not response.ok:
            error = response.json()
            raise Exception(error.get('error', 'Request failed'))
            
        return response.json()

    def anchor_evidence(self, evidence_id: str, hash: str) -> Dict[str, Any]:
        return self._request('/anchor', 'POST', {
            'evidence_id': evidence_id,
            'hash': hash
        })

    def verify_evidence(self, evidence_id: str) -> Dict[str, Any]:
        return self._request('/verify', 'POST', {
            'evidence_id': evidence_id
        })

    def get_record(self, record_id: str) -> Dict[str, Any]:
        return self._request(f'/records/{record_id}')

    def get_total_records(self) -> Dict[str, Any]:
        return self._request('/total')

# Usage
client = BlockchainClient(
    'http://localhost:3001/api/v1/blockchain',
    'your_api_key'
)

# Anchor evidence
anchor_result = client.anchor_evidence('evidence_001', '0x123...')
print(f'Anchored: {anchor_result}')

# Verify evidence
verify_result = client.verify_evidence('evidence_001')
print(f'Valid: {verify_result["valid"]}')
```

### cURL

```bash
# Set variables
API_BASE="http://localhost:3001/api/v1/blockchain"
API_KEY="your_api_key"

# Health check
curl "$API_BASE/health"

# Anchor evidence
curl -X POST "$API_BASE/anchor" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "evidence_id": "evidence_001",
    "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  }'

# Verify evidence
curl -X POST "$API_BASE/verify" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"evidence_id": "evidence_001"}'

# Get record
curl -X GET "$API_BASE/records/1" \
  -H "X-API-Key: $API_KEY"

# Get total records
curl -X GET "$API_BASE/total" \
  -H "X-API-Key: $API_KEY"
```

### Go

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type BlockchainClient struct {
	BaseURL string
	APIKey  string
	Client  *http.Client
}

func NewBlockchainClient(baseURL, apiKey string) *BlockchainClient {
	return &BlockchainClient{
		BaseURL: baseURL,
		APIKey:  apiKey,
		Client:  &http.Client{},
	}
}

func (c *BlockchainClient) request(endpoint string, method string, body interface{}) (map[string]interface{}, error) {
	url := c.BaseURL + endpoint
	
	var reqBody *bytes.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.APIKey)

	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errorResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errorResp)
		return nil, fmt.Errorf("request failed: %v", errorResp)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return result, nil
}

func (c *BlockchainClient) AnchorEvidence(evidenceID, hash string) (map[string]interface{}, error) {
	body := map[string]string{
		"evidence_id": evidenceID,
		"hash":       hash,
	}
	return c.request("/anchor", "POST", body)
}

func (c *BlockchainClient) VerifyEvidence(evidenceID string) (map[string]interface{}, error) {
	body := map[string]string{
		"evidence_id": evidenceID,
	}
	return c.request("/verify", "POST", body)
}

func main() {
	client := NewBlockchainClient(
		"http://localhost:3001/api/v1/blockchain",
		"your_api_key",
	)

	// Anchor evidence
	result, err := client.AnchorEvidence("evidence_001", "0x123...")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	fmt.Printf("Anchored: %v\n", result)

	// Verify evidence
	verifyResult, err := client.VerifyEvidence("evidence_001")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	fmt.Printf("Valid: %v\n", verifyResult["valid"])
}
```

## Error Handling

All endpoints may return error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information (in development mode)"
}
```

Common HTTP status codes:
- `200 OK`: Request successful
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Invalid or missing API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server or blockchain error

## Rate Limiting

The service implements rate limiting to prevent abuse. Default configuration:
- Maximum requests: 100 per window
- Window duration: 60 seconds

Configure via environment variables:
- `RATE_LIMIT_MAX`: Maximum requests per window
- `RATE_LIMIT_WINDOW_MS`: Window duration in milliseconds

## Best Practices

1. **Always validate responses**: Check HTTP status codes and response structure
2. **Handle errors gracefully**: Implement retry logic for transient failures
3. **Use evidence IDs consistently**: Use the same evidence ID for anchoring and verification
4. **Store record IDs**: Save the record_id from anchoring for future reference
5. **Monitor service health**: Use the `/health` endpoint to check service status
6. **Implement caching**: Cache verification results when appropriate
7. **Log API calls**: Maintain logs for debugging and audit purposes

## Testing Integration

### Test Health Endpoint

```bash
curl http://localhost:3001/api/v1/blockchain/health
```

### Test Anchor and Verify

```bash
# Anchor test evidence
curl -X POST http://localhost:3001/api/v1/blockchain/anchor \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"evidence_id":"test_001","hash":"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"}'

# Verify the evidence
curl -X POST http://localhost:3001/api/v1/blockchain/verify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"evidence_id":"test_001"}'
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to service

**Solutions**:
- Verify service is running: `curl http://localhost:3001/api/v1/blockchain/health`
- Check firewall settings
- Verify correct base URL
- Check service logs

### Authentication Issues

**Problem**: 401 Unauthorized errors

**Solutions**:
- Verify API key is correct
- Check API key header format: `X-API-Key: your_key`
- Ensure API key is configured in service

### Transaction Failures

**Problem**: 500 errors when anchoring evidence

**Solutions**:
- Check service logs for specific error
- Verify blockchain node is accessible
- Ensure wallet has sufficient ETH for gas
- Check evidence ID doesn't already exist

### Rate Limiting

**Problem**: 429 Too Many Requests

**Solutions**:
- Implement exponential backoff
- Reduce request frequency
- Contact service admin to increase limits

## Support

For integration issues:
1. Check this integration guide
2. Review service logs
3. Test with provided examples
4. Open an issue in the project repository
