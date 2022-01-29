/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import { ActionContext, DeviceDetails, DeviceInfo, DeviceManagement, DeviceRefresh, InstanceDetails } from "dm-utils";

// Load your modules here, e.g.:
// import * as fs from "fs";

const demoFormSchema = {
	type: "tabs",
	items: {
		options1: {
			type: "panel",
			label: "Tab1",
			icon: "base64 svg", // optional
			items: {
				myPort: {
					type: "number",
					min: 1,
					max: 65565,
					label: "Number",
					sm: 6, // 1 - 12
					// "validator": "'"!!data.name"'", // else error
					hidden: "data.myType === 1", // hidden if myType is 1
					disabled: "data.myType === 2", // disabled if myType is 2
				},
				myType: {
					// name could support more than one levelhelperText
					newLine: true, // must start from new row
					type: "select",
					label: "My Type",
					sm: 6, // 1 - 12
					options: [
						{ label: "option 0", value: 0 },
						{ label: "option 1", value: 1 },
						{ label: "option 2", value: 2 },
					],
				},
				myBool: {
					type: "checkbox",
					label: "My checkbox",
				},
			},
		},
		options2: {
			type: "panel",
			label: "Tab2",
			icon: "base64 svg", // optional
			items: {
				secondPort: {
					type: "number",
					min: 1,
					max: 65565,
					label: "Second Number",
					sm: 6, // 1 - 12
					// "validator": "'"!!data.name"'", // else error
					hidden: "data.secondType === 1", // hidden if myType is 1
					disabled: "data.secondType === 2", // disabled if myType is 2
				},
				secondType: {
					// name could support more than one levelhelperText
					newLine: true, // must start from new row
					type: "select",
					label: "Second Type",
					sm: 6, // 1 - 12
					options: [
						{ label: "option 0", value: 0 },
						{ label: "option 1", value: 1 },
						{ label: "option 2", value: 2 },
					],
				},
				secondBool: {
					type: "checkbox",
					label: "Second checkbox",
				},
			},
		},
	},
};

class DmTestDeviceManagement extends DeviceManagement<DmTest> {
	protected getInstanceInfo(): InstanceDetails {
		return {
			...(super.getInstanceInfo() as InstanceDetails),
			actions: [
				{ id: "search", icon: "search", title: "Search", description: "Search for new devices" },
				{ id: "pair", icon: "link", title: "Pair", disabled: true },
			],
		};
	}

	protected async listDevices(): Promise<DeviceInfo[]> {
		return [
			{ id: "test-123", name: "Test 123", status: "connected" },
			{ id: "test-345", name: "Test 345", status: "disconnected", hasDetails: true, actions: [] },
			{
				id: "test-789",
				name: "Test 789",
				status: "connected",
				actions: [
					{
						id: "play",
						icon: "fas fa-play",
					},
					{
						id: "pause",
						icon: "fa-pause",
						description: "Pause device",
					},
					{
						id: "forward",
						icon: "forward",
						description: "Forward",
						disabled: true,
					},
				],
			},
			{
				id: "test-ABC",
				name: "Test ABC",
				status: "connected",
				actions: [
					{
						id: "forms",
						icon: "fab fa-wpforms",
						description: "Show forms flow",
					},
				],
			},
		];
	}

	protected async handleInstanceAction(actionId: string, context: ActionContext): Promise<{ refresh: boolean }> {
		switch (actionId) {
			case "search":
				this.log.info(`Search was pressed`);
				const progress = await context.openProgress("Searching...", { label: "0%" });
				await this.delay(500);
				for (let i = 10; i <= 100; i += 10) {
					await this.delay(300);
					this.log.info(`Progress at ${i}%`);
					await progress.update({ value: i, label: `${i}%` });
				}
				await this.delay(1000);
				await progress.close();
				return { refresh: true };
			default:
				throw new Error(`Unknown action ${actionId}`);
		}
	}

	protected override async handleDeviceAction(
		deviceId: string,
		actionId: string,
		context: ActionContext,
	): Promise<{ refresh: DeviceRefresh }> {
		switch (actionId) {
			case "play":
				this.log.info(`Play was pressed on ${deviceId}`);
				return { refresh: false };
			case "pause":
				this.log.info(`Pause was pressed on ${deviceId}`);
				const confirm = await context.showConfirmation("Do you want to refresh the device only?");
				return { refresh: confirm ? "device" : "instance" };
			case "forms":
				this.log.info(`Forms was pressed on ${deviceId}`);
				const data = await context.showForm(demoFormSchema, {
					data: { myPort: 8081, secondPort: 8082 },
					title: "Edit this form",
				});
				if (!data) {
					await context.showMessage("You cancelled the previous form!");
				} else {
					await context.showMessage(`You entered: ${JSON.stringify(data)}`);
				}
				return { refresh: false };
			default:
				throw new Error(`Unknown action ${actionId}`);
		}
	}

	protected override async getDeviceDetails(id: string): Promise<DeviceDetails> {
		const schema = {
			type: "panel",
			items: {
				text1: {
					type: "staticText",
					text: "This is some description",
					sm: 12,
				},
				button1: {
					type: "sendTo",
					label: "Click me to send a message!",
					sm: 6,
					command: "send",
					data: { hello: "world" },
				},
			},
		};
		return { id, schema };
	}

	private delay(ms: number): Promise<void> {
		return new Promise<void>((resolve) => setTimeout(resolve, ms));
	}
}

class DmTest extends utils.Adapter {
	private readonly deviceManagement: DmTestDeviceManagement;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: "dm-test",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));

		this.deviceManagement = new DmTestDeviceManagement(this);
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("config option1: " + this.config.option1);
		this.log.info("config option2: " + this.config.option2);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectNotExistsAsync("testVariable", {
			type: "state",
			common: {
				name: "testVariable",
				type: "boolean",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates("testVariable");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates("*");

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	// private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	/**
	 * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	 * Using this method requires "common.messagebox" property to be set to true in io-package.json
	 */
	private onMessage(obj: ioBroker.Message): void {
		this.log.info("onMessage(): " + JSON.stringify(obj));
		if (typeof obj === "object" && obj.message) {
			if (obj.command === "send") {
				// e.g. send email or pushover or whatever
				this.log.info("send command");

				// Send response in callback if required
				if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
			}
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new DmTest(options);
} else {
	// otherwise start the instance directly
	(() => new DmTest())();
}
