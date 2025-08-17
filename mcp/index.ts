import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "dotenv";

config();

const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather

if (!baseURL || !endpointPath) {
  throw new Error("Missing environment variables");
}

const server = new McpServer({
  name: "shieldpay-mcp",
  version: "1.0.0",
  description: "ShieldPay MCP Server",
});

// Add an addition tool
server.tool(
    "get-data-from-resource-server",
    "Get data from the resource server (in this example, the weather)",
    {},
    async () => {
        const url = `${baseURL}${endpointPath}`;
        const requestInfo = {
          url: url,
          method: 'GET',
          headers: { 'X-PAYMENT': 'test' }
        };
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-PAYMENT': 'test'
          }
        });
        
        const data = await response.json();
        
        return {
          content: [{ 
            type: "text", 
            text: `Response: ${JSON.stringify(data, null, 2)}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}\nURL: ${baseURL}${endpointPath}` }],
        };
      }
    },
  );
  
  const transport = new StdioServerTransport();
  await server.connect(transport);