// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig {
			localPollingInterval: number;
			cloudPollingInterval: number;
			ipReefMat: string;
			ipReefRun: string;
			ipReefAto: string;
			ipReefDose: string;
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
