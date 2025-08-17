# ShieldPay

A decentralized payment protocol implementation that enables secure, on-chain payments using the x402 Payment Protocol on the Aleo blockchain. ShieldPay provides middleware for Express.js applications to seamlessly integrate cryptocurrency payments with API access control.

## Overview

ShieldPay combines the power of blockchain payments with traditional web APIs, allowing developers to monetize their services through microtransactions on the Aleo network. The system enforces payment requirements before granting access to protected endpoints, creating a pay-per-use model for API services.

## Key Features

- **Blockchain-Powered Payments**: Utilizes Aleo blockchain for secure, private transactions
- **Express.js Middleware**: Easy integration with existing Node.js/Express applications
- **Pay-Per-Use Model**: Configure different pricing for different API endpoints
- **Automatic Settlement**: Handles transaction processing and verification automatically
- **MCP Integration**: Model Context Protocol server for external system integration
- **TypeScript Support**: Fully typed for better development experience

## Architecture

The project consists of several key components:

### Core Library (`x402-express`)
- Express.js middleware for payment enforcement
- Aleo blockchain integration using ProvableHQ SDK
- Automatic transaction settlement and verification
- Configurable pricing per API route

### Example Server (`server/`)
- Demonstrates usage of the x402-express middleware
- Sample weather API with payment protection
- Environment-based configuration

### MCP Server (`mcp/`)
- Model Context Protocol server implementation
- Enables integration with external tools and AI systems
- Provides API access through payment verification

## Quick Start

### Prerequisites
- Node.js 18+ with pnpm
- Aleo account with sufficient credits
- Environment variables configured

### Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build
```

### Configuration

Create `.env` files in the respective directories:

```bash
# For server/
PRIVATE_KEY=your_aleo_private_key
ADDRESS=your_aleo_address
PORT=4022

# For mcp/
RESOURCE_SERVER_URL=http://localhost:4022
ENDPOINT_PATH=/weather
```

### Running the Services

```bash
# Start the payment-protected API server
cd server
pnpm run dev

# In another terminal, start the MCP server
cd mcp
pnpm run dev
```

## Usage Example

### Setting up Payment Middleware

```typescript
import { paymentMiddleware } from "x402-express";

const app = express();

app.use(paymentMiddleware(
  "your_aleo_address", // Payment recipient
  {
    "GET /weather": {
      price: 100000,      // 0.1 Aleo credits (100,000 microcredits)
      network: "ALEO"
    }
  }
));

app.get("/weather", (req, res) => {
  res.json({ weather: "sunny", temperature: 70 });
});
```

### Making Payments

Clients must include the `X-PAYMENT` header when accessing protected endpoints:

```bash
curl -H "X-PAYMENT: transaction_proof" http://localhost:4022/weather
```

## Technical Details

### Payment Flow
1. Client requests protected endpoint with `X-PAYMENT` header
2. Middleware validates payment information
3. If valid, request proceeds to handler
4. Response includes `X-PAYMENT-RESPONSE` header with settlement details
5. Automatic Aleo transaction settlement occurs in background

### Blockchain Integration
- Uses Aleo's privacy-preserving blockchain
- Supports both public and private transactions
- Optimized for Apple M3 processors with multi-threading
- Automatic key management and transaction building

### Security Features
- Private key protection through environment variables
- Transaction verification before API access
- Secure payment settlement with blockchain finality
- Error handling for failed transactions

## Development

### Project Structure
```
ShieldPay/
├── typescript/packages/x402-express/    # Core payment middleware
├── server/                              # Example Express server
├── mcp/                                 # Model Context Protocol server
└── README.md                           # This file
```

### Scripts
- `pnpm run build` - Build all packages
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code
- `pnpm run test` - Run tests (where available)

## Contributing

This project demonstrates the x402 Payment Protocol implementation. For contributions:

1. Ensure all tests pass
2. Follow the existing code style
3. Update documentation as needed
4. Test with actual Aleo transactions

## License

Licensed under the Apache-2.0 License. See the individual package.json files for specific licensing information.

## Related Projects

- [x402 Payment Protocol](https://github.com/coinbase/x402) - Original protocol specification
- [Aleo SDK](https://github.com/AleoNet/sdk) - Aleo blockchain development kit
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification