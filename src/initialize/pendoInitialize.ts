// import { services } from "./modules/management/shared/services";

/**
 * Type Definitions
 */
interface PendoUser {
    email: string;
    organizationName: string;
    [key: string]: string | number | boolean | undefined;
}

interface PendoConfig {
    visitor?: {
        id?: string;
        [key: string]: string | undefined;
    };
    account?: {
        id?: string;
        [key: string]: string | undefined;
    };
    excludeAllText?: boolean;
}

interface ClientConfig extends PendoConfig {
    // Additional properties from server configuration
}

interface PendoWindow extends Window {
    pendo?: {
        initialize: (config: PendoConfig) => void;
    };
}

declare const window: PendoWindow;

/**
 * Replace placeholders in config object with actual user values
 */
function replacePlaceholders(configObject: Record<string, unknown>, user: PendoUser): void {
    if (!configObject || typeof configObject !== "object") return;

    for (const [key, value] of Object.entries(configObject)) {
        if (typeof value === "string" && value.includes("{") && value.includes("}")) {
            configObject[key] = value.replace(/\{(\w+)\}/g, (match: string, userKey: string) => {
                const userValue = user[userKey];
                return userValue !== undefined ? String(userValue) : match;
            });
        }
    }
}

/**
 * Initialize Pendo with user configuration
 */
export async function initializePendo(user: PendoUser): Promise<void> {
    let clientConfig: ClientConfig | undefined;
    const defaultConfig: PendoConfig = {
        visitor: {
            id: user.email,
        },
        account: {
            id: user.organizationName,
        },
        excludeAllText: true,
    };

    // TODO: Uncomment when services module is available
    // try {
    //     clientConfig = await services.retrieveClientConfiguration({ code: "pendo" });
    // } catch (err) {
    //     console.warn("Could not find Pendo initialize configuration. The default configuration will be used.");
    // }

    if (clientConfig) {
        if (clientConfig.account) {
            replacePlaceholders(clientConfig.account as Record<string, unknown>, user);
        }
        if (clientConfig.visitor) {
            replacePlaceholders(clientConfig.visitor as Record<string, unknown>, user);
        }
    }

    if (window.pendo && user.email && user.organizationName) {
        window.pendo.initialize(clientConfig ?? defaultConfig);
    }
}
