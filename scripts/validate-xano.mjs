import { validateXanoscript } from "@xano/developer-mcp";

const result = validateXanoscript({ directory: "./xano" });
console.log(result.message);
process.exit(result.valid ? 0 : 1);
