"use strict";
/*
 * Created with @iobroker/create-adapter v2.0.1
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const dm_utils_1 = require("dm-utils");
// Load your modules here, e.g.:
// import * as fs from "fs";
const demoFormSchema = {
    type: "tabs",
    items: {
        options1: {
            type: "panel",
            label: "Tab1",
            icon: "base64 svg",
            items: {
                myPort: {
                    type: "number",
                    min: 1,
                    max: 65565,
                    label: "Number",
                    sm: 6,
                    // "validator": "'"!!data.name"'", // else error
                    hidden: "data.myType === 1",
                    disabled: "data.myType === 2", // disabled if myType is 2
                },
                myType: {
                    // name could support more than one levelhelperText
                    newLine: true,
                    type: "select",
                    label: "My Type",
                    sm: 6,
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
            icon: "base64 svg",
            items: {
                secondPort: {
                    type: "number",
                    min: 1,
                    max: 65565,
                    label: "Second Number",
                    sm: 6,
                    // "validator": "'"!!data.name"'", // else error
                    hidden: "data.secondType === 1",
                    disabled: "data.secondType === 2", // disabled if myType is 2
                },
                secondType: {
                    // name could support more than one levelhelperText
                    newLine: true,
                    type: "select",
                    label: "Second Type",
                    sm: 6,
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
class DmTestDeviceManagement extends dm_utils_1.DeviceManagement {
    async getInstanceInfo() {
        return {
            ...(await super.getInstanceInfo()),
            actions: [
                {
                    id: "search",
                    handler: this.handleSearch.bind(this),
                    icon: "search",
                    title: "Search",
                    description: "Search for new devices",
                },
                { id: "pair", icon: "link", title: "Pair" },
            ],
        };
    }
    async handleSearch(context) {
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
    }
    async listDevices() {
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
                        handler: this.handlePlay.bind(this),
                        icon: "fas fa-play",
                    },
                    {
                        id: "pause",
                        handler: this.handlePause.bind(this),
                        icon: "fa-pause",
                        description: "Pause device",
                    },
                    {
                        id: "forward",
                        icon: "forward",
                        description: "Forward",
                    },
                ],
            },
            {
                id: "test-ABC",
                name: "Test ABC",
                status: ["connected", { icon: "signal" }],
                actions: [
                    {
                        id: "forms",
                        handler: this.handleForms.bind(this),
                        icon: "fab fa-wpforms",
                        description: "Show forms flow",
                    },
                ],
            },
        ];
    }
    async handlePlay(deviceId, _context) {
        this.log.info(`Play was pressed on ${deviceId}`);
        await this.delay(2000);
        return { refresh: false };
    }
    async handlePause(deviceId, context) {
        this.log.info(`Pause was pressed on ${deviceId}`);
        const confirm = await context.showConfirmation("Do you want to refresh the device only?");
        return { refresh: confirm ? "device" : "instance" };
    }
    async handleForms(deviceId, context) {
        this.log.info(`Forms was pressed on ${deviceId}`);
        const data = await context.showForm(demoFormSchema, {
            data: { myPort: 8081, secondPort: 8082 },
            title: "Edit this form",
        });
        if (!data) {
            await context.showMessage("You cancelled the previous form!");
        }
        else {
            await this.delay(2000);
            await context.showMessage(`You entered: ${JSON.stringify(data)}`);
        }
        return { refresh: false };
    }
    async handleInstanceAction(actionId, context) {
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
    async getDeviceDetails(id) {
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
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
class DmTest extends utils.Adapter {
    constructor(options = {}) {
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
    async onReady() {
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
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
            callback();
        }
        catch (e) {
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
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        }
        else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.messagebox" property to be set to true in io-package.json
     */
    onMessage(obj) {
        this.log.info("onMessage(): " + JSON.stringify(obj));
        if (typeof obj === "object" && obj.message) {
            if (obj.command === "send") {
                // e.g. send email or pushover or whatever
                this.log.info("send command");
                // Send response in callback if required
                if (obj.callback)
                    this.sendTo(obj.from, obj.command, "Message received", obj.callback);
            }
        }
    }
}
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options) => new DmTest(options);
}
else {
    // otherwise start the instance directly
    (() => new DmTest())();
}
//# sourceMappingURL=main.js.map