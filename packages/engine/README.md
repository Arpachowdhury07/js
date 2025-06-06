# Engine OpenAPI TypeScript wrapper

This package is a thin OpenAPI wrapper for Engine, our backend onchain executor service.

## Configuration

```ts
import { configure } from "@thirdweb-dev/engine";

// call this once at the startup of your application
configure({
  secretKey: "<PROJECT_SECRET_KEY>",
});
```

## Example Usage

```ts
import { writeContract } from "@thirdweb-dev/engine";

const result = await writeContract({
  headers: {
    "x-vault-access-token": "<VAULT_ACCESS_TOKEN>",
  },
  body: {
    executionOptions: {
      from: "0x1234567891234567891234567891234567891234",
      chainId: "1",
    },
    params: [
      {
        contractAddress: "0x1234567890123456789012345678901234567890",
        method: "function transfer(address to, uint256 amount)",
        params: [
          "0x1234567890123456789012345678901234567890",
          "1000000000000000000",
        ],
      },
    ],
  },
});
```

This package was autogenerated from the [Engine openAPI spec](https://engine.thirdweb.com/reference) using [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts)
