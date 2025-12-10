# MT5 Integration Layer

MetaApi-based integration for MetaTrader 5 trading platform.

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your MetaApi credentials:
```env
METAAPI_TOKEN=your_token_from_metaapi_cloud
METAAPI_ACCOUNT_ID=your_mt5_account_id
```

## API Endpoints

### GET /api/mt5/account
Returns account information and open positions.

**Response:**
```json
{
  "success": true,
  "data": {
    "accountInfo": {
      "balance": 10000,
      "equity": 10500,
      "margin": 500,
      "freeMargin": 10000,
      "marginLevel": 2100,
      "profit": 500,
      "currency": "USD",
      "leverage": 100,
      "name": "John Doe",
      "server": "ICMarkets-Demo",
      "accountId": "12345678"
    },
    "positions": [
      {
        "id": "12345",
        "symbol": "EURUSD",
        "type": "buy",
        "volume": 0.1,
        "openPrice": 1.0850,
        "currentPrice": 1.0900,
        "stopLoss": 1.0800,
        "takeProfit": 1.0950,
        "profit": 50,
        "swap": 0,
        "commission": -0.5,
        "openTime": "2025-12-09T10:30:00Z"
      }
    ]
  }
}
```

### POST /api/mt5/trade
Place, modify, or close trades.

**Open Market Order:**
```json
{
  "action": "open",
  "symbol": "EURUSD",
  "type": "buy",
  "volume": 0.1,
  "stopLoss": 1.0800,
  "takeProfit": 1.0950
}
```

**Open Pending Order:**
```json
{
  "action": "open",
  "symbol": "EURUSD",
  "type": "buy_limit",
  "volume": 0.1,
  "openPrice": 1.0850,
  "stopLoss": 1.0800,
  "takeProfit": 1.0950
}
```

**Modify Position:**
```json
{
  "action": "modify",
  "positionId": "12345",
  "stopLoss": 1.0820,
  "takeProfit": 1.0970
}
```

**Close Position:**
```json
{
  "action": "close",
  "positionId": "12345"
}
```

**Partial Close:**
```json
{
  "action": "close",
  "positionId": "12345",
  "volume": 0.05
}
```

### POST /api/mt5/connect
Connect to MT5 account.

**Request:**
```json
{
  "accountId": "optional_account_id"
}
```

### DELETE /api/mt5/connect
Disconnect from MT5 account.

## Direct Usage (Server-side)

```typescript
import {
  connectToAccount,
  getAccountInfo,
  getPositions,
  placeMarketOrder,
  closePosition
} from '@/lib/mt5';

// Connect
await connectToAccount(process.env.METAAPI_ACCOUNT_ID!);

// Get account info
const accountInfo = await getAccountInfo();
console.log(`Balance: ${accountInfo.balance}`);

// Get positions
const positions = await getPositions();
positions.forEach(pos => {
  console.log(`${pos.symbol}: ${pos.profit}`);
});

// Place market order
const result = await placeMarketOrder({
  symbol: 'EURUSD',
  type: 'buy',
  volume: 0.1,
  stopLoss: 1.0800,
  takeProfit: 1.0950
});

if (result.success) {
  console.log(`Order placed: ${result.orderId}`);
}

// Close position
await closePosition(positions[0].id);
```

## File Structure

- `types.ts` - TypeScript type definitions
- `client.ts` - MetaApi connection management
- `account.ts` - Account information functions
- `trading.ts` - Trading operations
- `index.ts` - Main exports
- API routes:
  - `/api/mt5/account/route.ts`
  - `/api/mt5/trade/route.ts`
  - `/api/mt5/connect/route.ts`

## Notes

- All files are under 200 lines as per requirements
- Environment variables are required for MetaApi credentials
- Connection is lazy-initialized on first API call
- The `metaapi.cloud-sdk` package is already installed
