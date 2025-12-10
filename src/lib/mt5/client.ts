/**
 * MT5 Client - MetaApi Connection Manager
 * Uses dynamic imports to avoid SSR issues with MetaApi SDK
 */

// Dynamic import type - MetaApi is only loaded at runtime
type MetaApiType = any;

let metaApiInstance: MetaApiType | null = null;
let accountConnection: any = null;

/**
 * Dynamically import MetaApi SDK to avoid SSR issues
 */
async function getMetaApiClass(): Promise<any> {
  const module = await import('metaapi.cloud-sdk');
  return module.default;
}

/**
 * Initialize MetaApi instance with token from environment
 */
export async function initializeMetaApi(): Promise<MetaApiType> {
  if (metaApiInstance) {
    return metaApiInstance;
  }

  const token = process.env.METAAPI_TOKEN;
  if (!token) {
    throw new Error('METAAPI_TOKEN environment variable is not set');
  }

  const MetaApi = await getMetaApiClass();
  metaApiInstance = new MetaApi(token);

  return metaApiInstance;
}

/**
 * Connect to MT5 account using MetaApi
 */
export async function connectToAccount(accountId: string): Promise<any> {
  try {
    const api = await initializeMetaApi();

    // Get account by ID
    const account = await api.metatraderAccountApi.getAccount(accountId);

    // Check if account is deployed
    if (account.state !== 'DEPLOYED') {
      await account.deploy();
      console.log('Deploying account...');
    }

    // Wait for deployment
    await account.waitDeployed();

    // Connect to MetaTrader terminal
    accountConnection = account.getRPCConnection();
    await accountConnection.connect();

    // Wait for synchronization
    await accountConnection.waitSynchronized();

    console.log(`Successfully connected to MT5 account: ${accountId}`);

    return accountConnection;
  } catch (error) {
    console.error('Failed to connect to MT5 account:', error);
    throw error;
  }
}

/**
 * Get current account connection
 */
export function getConnection(): any {
  if (!accountConnection) {
    throw new Error('No active MT5 connection. Call connectToAccount first.');
  }
  return accountConnection;
}

/**
 * Check if connected to MT5
 */
export function isConnected(): boolean {
  return accountConnection !== null && accountConnection.synchronized;
}

/**
 * Disconnect from MT5 account
 */
export async function disconnect(): Promise<void> {
  if (accountConnection) {
    try {
      await accountConnection.close();
      accountConnection = null;
      console.log('Disconnected from MT5 account');
    } catch (error) {
      console.error('Error disconnecting from MT5:', error);
      throw error;
    }
  }
}
