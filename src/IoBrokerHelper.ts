export class IoBrokerHelper {
	private adapter: ioBroker.Adapter;

	constructor(adapter: ioBroker.Adapter) {
		this.adapter = adapter;
	}

	public async ensureStateAsync(
		id: string,
		name: string,
		type: ioBroker.CommonType,
		role: string,
		write = false,
		read = true,
	): Promise<void> {
		await this.adapter.setObjectNotExistsAsync(id, {
			type: "state",
			common: {
				name,
				type,
				role,
				read,
				write,
			},
			native: {},
		});
	}

	public async ensureStateWithChannelAsync(
		id: string,
		name: string,
		type: ioBroker.CommonType,
		role: string,
		write = false,
		read = true,
	): Promise<void> {
		const parts = id.split(".");
		if (parts.length > 1) {
			const channelId = parts.slice(0, -1).join(".");
			await this.adapter.setObjectNotExistsAsync(channelId, {
				type: "channel",
				common: { name: channelId },
				native: {},
			});
		}
		await this.ensureStateAsync(id, name, type, role, write, read);
	}

	public async setAckedStateAsync(id: string, value: any): Promise<void> {
		await this.adapter.setStateAsync(id, { val: value, ack: true });
	}
}
