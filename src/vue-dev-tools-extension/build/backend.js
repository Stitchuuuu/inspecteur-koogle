/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 9331:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DevtoolsPluginApiInstance = exports.DevtoolsApi = void 0;
const shared_utils_1 = __webpack_require__(1942);
const hooks_1 = __webpack_require__(4187);
let backendOn;
const pluginOn = [];
class DevtoolsApi {
    constructor(bridge, ctx) {
        this.bridge = bridge;
        this.ctx = ctx;
        if (!backendOn) {
            backendOn = new hooks_1.DevtoolsHookable(ctx);
        }
    }
    get on() {
        return backendOn;
    }
    async callHook(eventType, payload, ctx = this.ctx) {
        payload = await backendOn.callHandlers(eventType, payload, ctx);
        for (const k in pluginOn) {
            payload = await pluginOn[k].callHandlers(eventType, payload, ctx);
        }
        return payload;
    }
    async transformCall(callName, ...args) {
        const payload = await this.callHook("transformCall" /* TRANSFORM_CALL */, {
            callName,
            inArgs: args,
            outArgs: args.slice()
        });
        return payload.outArgs;
    }
    async getAppRecordName(app, id) {
        const payload = await this.callHook("getAppRecordName" /* GET_APP_RECORD_NAME */, {
            app,
            name: null
        });
        if (payload.name) {
            return payload.name;
        }
        else {
            return `App ${id + 1}`;
        }
    }
    async getAppRootInstance(app) {
        const payload = await this.callHook("getAppRootInstance" /* GET_APP_ROOT_INSTANCE */, {
            app,
            root: null
        });
        return payload.root;
    }
    async registerApplication(app) {
        await this.callHook("registerApplication" /* REGISTER_APPLICATION */, {
            app
        });
    }
    async walkComponentTree(instance, maxDepth = -1, filter = null) {
        const payload = await this.callHook("walkComponentTree" /* WALK_COMPONENT_TREE */, {
            componentInstance: instance,
            componentTreeData: null,
            maxDepth,
            filter
        });
        return payload.componentTreeData;
    }
    async visitComponentTree(instance, treeNode, filter = null) {
        const payload = await this.callHook("visitComponentTree" /* VISIT_COMPONENT_TREE */, {
            componentInstance: instance,
            treeNode,
            filter
        });
        return payload.treeNode;
    }
    async walkComponentParents(instance) {
        const payload = await this.callHook("walkComponentParents" /* WALK_COMPONENT_PARENTS */, {
            componentInstance: instance,
            parentInstances: []
        });
        return payload.parentInstances;
    }
    async inspectComponent(instance) {
        const payload = await this.callHook("inspectComponent" /* INSPECT_COMPONENT */, {
            componentInstance: instance,
            instanceData: null
        });
        return payload.instanceData;
    }
    async getComponentBounds(instance) {
        const payload = await this.callHook("getComponentBounds" /* GET_COMPONENT_BOUNDS */, {
            componentInstance: instance,
            bounds: null
        });
        return payload.bounds;
    }
    async getComponentName(instance) {
        const payload = await this.callHook("getComponentName" /* GET_COMPONENT_NAME */, {
            componentInstance: instance,
            name: null
        });
        return payload.name;
    }
    async getComponentInstances(app) {
        const payload = await this.callHook("getComponentInstances" /* GET_COMPONENT_INSTANCES */, {
            app,
            componentInstances: []
        });
        return payload.componentInstances;
    }
    async getElementComponent(element) {
        const payload = await this.callHook("getElementComponent" /* GET_ELEMENT_COMPONENT */, {
            element,
            componentInstance: null
        });
        return payload.componentInstance;
    }
    async getComponentRootElements(instance) {
        const payload = await this.callHook("getComponentRootElements" /* GET_COMPONENT_ROOT_ELEMENTS */, {
            componentInstance: instance,
            rootElements: []
        });
        return payload.rootElements;
    }
    async editComponentState(instance, dotPath, state) {
        const payload = await this.callHook("editComponentState" /* EDIT_COMPONENT_STATE */, {
            componentInstance: instance,
            path: dotPath.split('.'),
            state
        });
        return payload.componentInstance;
    }
    async getComponentDevtoolsOptions(instance) {
        const payload = await this.callHook("getAppDevtoolsOptions" /* GET_COMPONENT_DEVTOOLS_OPTIONS */, {
            componentInstance: instance,
            options: null
        });
        return payload.options || {};
    }
    async inspectTimelineEvent(eventData, app) {
        const payload = await this.callHook("inspectTimelineEvent" /* INSPECT_TIMELINE_EVENT */, {
            event: eventData.event,
            layerId: eventData.layerId,
            app,
            data: eventData.event.data,
            all: eventData.all
        });
        return payload.data;
    }
    async getInspectorTree(inspectorId, app, filter) {
        const payload = await this.callHook("getInspectorTree" /* GET_INSPECTOR_TREE */, {
            inspectorId,
            app,
            filter,
            rootNodes: []
        });
        return payload.rootNodes;
    }
    async getInspectorState(inspectorId, app, nodeId) {
        const payload = await this.callHook("getInspectorState" /* GET_INSPECTOR_STATE */, {
            inspectorId,
            app,
            nodeId,
            state: null
        });
        return payload.state;
    }
    async editInspectorState(inspectorId, app, nodeId, dotPath, state) {
        const defaultSetCallback = (obj, field, value) => {
            if (state.remove || state.newKey) {
                if (Array.isArray(obj)) {
                    obj.splice(field, 1);
                }
                else {
                    delete obj[field];
                }
            }
            if (!state.remove) {
                obj[state.newKey || field] = value;
            }
        };
        await this.callHook("editInspectorState" /* EDIT_INSPECTOR_STATE */, {
            inspectorId,
            app,
            nodeId,
            path: dotPath.split('.'),
            state,
            set: (object, path, value, cb) => shared_utils_1.set(object, path, value, cb || defaultSetCallback)
        });
    }
}
exports.DevtoolsApi = DevtoolsApi;
class DevtoolsPluginApiInstance {
    constructor(plugin, ctx) {
        this.bridge = ctx.bridge;
        this.ctx = ctx;
        this.plugin = plugin;
        this.on = new hooks_1.DevtoolsHookable(ctx, plugin);
        pluginOn.push(this.on);
    }
    // Plugin API
    async notifyComponentUpdate(instance = null) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
            return;
        if (instance) {
            this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED, ...await this.ctx.api.transformCall(shared_utils_1.HookEvents.COMPONENT_UPDATED, instance));
        }
        else {
            this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED);
        }
    }
    addTimelineLayer(options) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.TIMELINE))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, options, this.plugin);
        return true;
    }
    addTimelineEvent(options) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.TIMELINE))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, options, this.plugin);
        return true;
    }
    addInspector(options) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, options, this.plugin);
        return true;
    }
    sendInspectorTree(inspectorId) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, inspectorId, this.plugin);
        return true;
    }
    sendInspectorState(inspectorId) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, inspectorId, this.plugin);
        return true;
    }
    getComponentBounds(instance) {
        return this.ctx.api.getComponentBounds(instance);
    }
    getComponentName(instance) {
        return this.ctx.api.getComponentName(instance);
    }
    getComponentInstances(app) {
        return this.ctx.api.getComponentInstances(app);
    }
    highlightElement(instance) {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_HIGHLIGHT, instance.__VUE_DEVTOOLS_UID__, this.plugin);
        return true;
    }
    unhighlightElement() {
        if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
            return false;
        this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UNHIGHLIGHT, this.plugin);
        return true;
    }
    get enabled() {
        return shared_utils_1.hasPluginPermission(this.plugin.descriptor.id, shared_utils_1.PluginPermission.ENABLED);
    }
    hasPermission(permission) {
        return shared_utils_1.hasPluginPermission(this.plugin.descriptor.id, permission);
    }
}
exports.DevtoolsPluginApiInstance = DevtoolsPluginApiInstance;
//# sourceMappingURL=api.js.map

/***/ }),

/***/ 8651:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=app-record.js.map

/***/ }),

/***/ 1771:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createBackendContext = void 0;
const api_1 = __webpack_require__(9331);
function createBackendContext(options) {
    const ctx = {
        bridge: options.bridge,
        hook: options.hook,
        api: null,
        appRecords: [],
        currentTab: null,
        currentAppRecord: null,
        currentInspectedComponentId: null,
        plugins: [],
        currentPlugin: null,
        timelineLayers: [],
        customInspectors: []
    };
    ctx.api = new api_1.DevtoolsApi(options.bridge, ctx);
    return ctx;
}
exports.createBackendContext = createBackendContext;
//# sourceMappingURL=backend-context.js.map

/***/ }),

/***/ 1556:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BuiltinBackendFeature = void 0;
var BuiltinBackendFeature;
(function (BuiltinBackendFeature) {
    BuiltinBackendFeature["COMPONENTS"] = "components";
    BuiltinBackendFeature["EVENTS"] = "events";
    BuiltinBackendFeature["VUEX"] = "vuex";
    BuiltinBackendFeature["FLUSH"] = "flush";
})(BuiltinBackendFeature = exports.BuiltinBackendFeature || (exports.BuiltinBackendFeature = {}));
//# sourceMappingURL=backend.js.map

/***/ }),

/***/ 8202:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=global-hook.js.map

/***/ }),

/***/ 4187:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DevtoolsHookable = void 0;
const shared_utils_1 = __webpack_require__(1942);
class DevtoolsHookable {
    constructor(ctx, plugin = null) {
        this.handlers = {};
        this.ctx = ctx;
        this.plugin = plugin;
    }
    hook(eventType, handler, pluginPermision = null) {
        const handlers = (this.handlers[eventType] = this.handlers[eventType] || []);
        if (this.plugin) {
            const originalHandler = handler;
            handler = (...args) => {
                if (!shared_utils_1.hasPluginPermission(this.plugin.descriptor.id, shared_utils_1.PluginPermission.ENABLED) ||
                    (pluginPermision && !shared_utils_1.hasPluginPermission(this.plugin.descriptor.id, pluginPermision)))
                    return;
                return originalHandler(...args);
            };
        }
        handlers.push({
            handler,
            plugin: this.ctx.currentPlugin
        });
    }
    async callHandlers(eventType, payload, ctx) {
        if (this.handlers[eventType]) {
            const handlers = this.handlers[eventType];
            for (let i = 0; i < handlers.length; i++) {
                const { handler, plugin } = handlers[i];
                try {
                    await handler(payload, ctx);
                }
                catch (e) {
                    console.error(`An error occured in hook ${eventType}${plugin ? ` registered by plugin ${plugin.descriptor.id}` : ''}`);
                    console.error(e);
                }
            }
        }
        return payload;
    }
    transformCall(handler) {
        this.hook("transformCall" /* TRANSFORM_CALL */, handler);
    }
    getAppRecordName(handler) {
        this.hook("getAppRecordName" /* GET_APP_RECORD_NAME */, handler);
    }
    getAppRootInstance(handler) {
        this.hook("getAppRootInstance" /* GET_APP_ROOT_INSTANCE */, handler);
    }
    registerApplication(handler) {
        this.hook("registerApplication" /* REGISTER_APPLICATION */, handler);
    }
    walkComponentTree(handler) {
        this.hook("walkComponentTree" /* WALK_COMPONENT_TREE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    visitComponentTree(handler) {
        this.hook("visitComponentTree" /* VISIT_COMPONENT_TREE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    walkComponentParents(handler) {
        this.hook("walkComponentParents" /* WALK_COMPONENT_PARENTS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    inspectComponent(handler) {
        this.hook("inspectComponent" /* INSPECT_COMPONENT */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentBounds(handler) {
        this.hook("getComponentBounds" /* GET_COMPONENT_BOUNDS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentName(handler) {
        this.hook("getComponentName" /* GET_COMPONENT_NAME */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentInstances(handler) {
        this.hook("getComponentInstances" /* GET_COMPONENT_INSTANCES */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getElementComponent(handler) {
        this.hook("getElementComponent" /* GET_ELEMENT_COMPONENT */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentRootElements(handler) {
        this.hook("getComponentRootElements" /* GET_COMPONENT_ROOT_ELEMENTS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    editComponentState(handler) {
        this.hook("editComponentState" /* EDIT_COMPONENT_STATE */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    getComponentDevtoolsOptions(handler) {
        this.hook("getAppDevtoolsOptions" /* GET_COMPONENT_DEVTOOLS_OPTIONS */, handler, shared_utils_1.PluginPermission.COMPONENTS);
    }
    inspectTimelineEvent(handler) {
        this.hook("inspectTimelineEvent" /* INSPECT_TIMELINE_EVENT */, handler, shared_utils_1.PluginPermission.TIMELINE);
    }
    getInspectorTree(handler) {
        this.hook("getInspectorTree" /* GET_INSPECTOR_TREE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
    getInspectorState(handler) {
        this.hook("getInspectorState" /* GET_INSPECTOR_STATE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
    editInspectorState(handler) {
        this.hook("editInspectorState" /* EDIT_INSPECTOR_STATE */, handler, shared_utils_1.PluginPermission.CUSTOM_INSPECTOR);
    }
}
exports.DevtoolsHookable = DevtoolsHookable;
//# sourceMappingURL=hooks.js.map

/***/ }),

/***/ 860:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(9331), exports);
__exportStar(__webpack_require__(8651), exports);
__exportStar(__webpack_require__(1556), exports);
__exportStar(__webpack_require__(1771), exports);
__exportStar(__webpack_require__(8202), exports);
__exportStar(__webpack_require__(4187), exports);
__exportStar(__webpack_require__(6409), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 6409:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=plugin.js.map

/***/ }),

/***/ 8508:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._legacy_getAndRegisterApps = exports.sendApps = exports.waitForAppsRegistration = exports.getAppRecord = exports.getAppRecordId = exports.mapAppRecord = exports.selectApp = exports.registerApp = void 0;
const shared_utils_1 = __webpack_require__(1942);
const queue_1 = __webpack_require__(5428);
const app_backend_vue1_1 = __webpack_require__(4274);
const app_backend_vue2_1 = __webpack_require__(7167);
const app_backend_vue3_1 = __webpack_require__(2925);
const scan_1 = __webpack_require__(3005);
const availableBackends = [
    app_backend_vue1_1.backend,
    app_backend_vue2_1.backend,
    app_backend_vue3_1.backend
];
const enabledBackends = new Set();
const jobs = new queue_1.JobQueue();
let recordId = 0;
async function registerApp(options, ctx) {
    return jobs.queue(() => registerAppJob(options, ctx));
}
exports.registerApp = registerApp;
async function registerAppJob(options, ctx) {
    var _a;
    // Dedupe
    if (ctx.appRecords.find(a => a.options === options)) {
        return;
    }
    let record;
    const baseFrameworkVersion = parseInt(options.version.substr(0, options.version.indexOf('.')));
    for (let i = 0; i < availableBackends.length; i++) {
        const backend = availableBackends[i];
        if (backend.frameworkVersion === baseFrameworkVersion) {
            // Enabled backend
            if (!enabledBackends.has(backend)) {
                backend.setup(ctx.api);
                enabledBackends.add(backend);
            }
            // Create app record
            const id = getAppRecordId(options.app);
            const name = await ctx.api.getAppRecordName(options.app, id);
            record = {
                id,
                name,
                options,
                backend,
                lastInspectedComponentId: null,
                instanceMap: new Map(),
                rootInstance: await ctx.api.getAppRootInstance(options.app),
                timelineEventMap: new Map(),
                meta: (_a = options.meta) !== null && _a !== void 0 ? _a : {}
            };
            options.app.__VUE_DEVTOOLS_APP_RECORD__ = record;
            const rootId = `${record.id}:root`;
            record.instanceMap.set(rootId, record.rootInstance);
            record.rootInstance.__VUE_DEVTOOLS_UID__ = rootId;
            await ctx.api.registerApplication(record);
            ctx.appRecords.push(record);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_ADD, {
                appRecord: mapAppRecord(record)
            });
            if (backend.setupApp) {
                backend.setupApp(ctx.api, record);
            }
            // Auto select first app
            if (ctx.currentAppRecord == null) {
                await selectApp(record, ctx);
            }
            break;
        }
    }
}
async function selectApp(record, ctx) {
    ctx.currentAppRecord = record;
    ctx.currentInspectedComponentId = record.lastInspectedComponentId;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_SELECTED, {
        id: record.id,
        lastInspectedComponentId: record.lastInspectedComponentId
    });
}
exports.selectApp = selectApp;
function mapAppRecord(record) {
    return {
        id: record.id,
        name: record.name,
        version: record.options.version
    };
}
exports.mapAppRecord = mapAppRecord;
function getAppRecordId(app) {
    if (app.__VUE_DEVTOOLS_APP_RECORD_ID__ != null) {
        return app.__VUE_DEVTOOLS_APP_RECORD_ID__;
    }
    const id = recordId++;
    app.__VUE_DEVTOOLS_APP_RECORD_ID__ = id;
    return id;
}
exports.getAppRecordId = getAppRecordId;
function getAppRecord(app, ctx) {
    return ctx.appRecords.find(ar => ar.options.app === app);
}
exports.getAppRecord = getAppRecord;
function waitForAppsRegistration() {
    return jobs.queue(async () => { });
}
exports.waitForAppsRegistration = waitForAppsRegistration;
async function sendApps(ctx) {
    const appRecords = [];
    for (const k in ctx.appRecords) {
        const appRecord = ctx.appRecords[k];
        if (!(await ctx.api.getComponentDevtoolsOptions(appRecord.rootInstance)).hide) {
            appRecords.push(appRecord);
        }
    }
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_LIST, {
        apps: appRecords.map(mapAppRecord)
    });
}
exports.sendApps = sendApps;
// eslint-disable-next-line @typescript-eslint/camelcase
async function _legacy_getAndRegisterApps(Vue, ctx) {
    const apps = scan_1.scan();
    apps.forEach(app => {
        registerApp({
            app,
            types: {},
            version: Vue.version,
            meta: {
                Vue
            }
        }, ctx);
    });
}
exports._legacy_getAndRegisterApps = _legacy_getAndRegisterApps;
//# sourceMappingURL=app.js.map

/***/ }),

/***/ 1697:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const shared_utils_1 = __webpack_require__(1942);
const highlighter_1 = __webpack_require__(3789);
class ComponentPicker {
    constructor(ctx) {
        this.ctx = ctx;
        this.bindMethods();
    }
    /**
     * Adds event listeners for mouseover and mouseup
     */
    startSelecting() {
        if (!shared_utils_1.isBrowser)
            return;
        window.addEventListener('mouseover', this.elementMouseOver, true);
        window.addEventListener('click', this.elementClicked, true);
        window.addEventListener('mouseout', this.cancelEvent, true);
        window.addEventListener('mouseenter', this.cancelEvent, true);
        window.addEventListener('mouseleave', this.cancelEvent, true);
        window.addEventListener('mousedown', this.cancelEvent, true);
        window.addEventListener('mouseup', this.cancelEvent, true);
    }
    /**
     * Removes event listeners
     */
    stopSelecting() {
        if (!shared_utils_1.isBrowser)
            return;
        window.removeEventListener('mouseover', this.elementMouseOver, true);
        window.removeEventListener('click', this.elementClicked, true);
        window.removeEventListener('mouseout', this.cancelEvent, true);
        window.removeEventListener('mouseenter', this.cancelEvent, true);
        window.removeEventListener('mouseleave', this.cancelEvent, true);
        window.removeEventListener('mousedown', this.cancelEvent, true);
        window.removeEventListener('mouseup', this.cancelEvent, true);
        highlighter_1.unHighlight();
    }
    /**
     * Highlights a component on element mouse over
     */
    async elementMouseOver(e) {
        this.cancelEvent(e);
        const el = e.target;
        if (el) {
            this.selectedInstance = await this.ctx.api.getElementComponent(el);
        }
        highlighter_1.unHighlight();
        if (this.selectedInstance) {
            highlighter_1.highlight(this.selectedInstance, this.ctx);
        }
    }
    /**
     * Selects an instance in the component view
     */
    async elementClicked(e) {
        this.cancelEvent(e);
        if (this.selectedInstance) {
            const parentInstances = await this.ctx.api.walkComponentParents(this.selectedInstance);
            this.ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_PICK, { id: this.selectedInstance.__VUE_DEVTOOLS_UID__, parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__) });
        }
        else {
            this.ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_PICK_CANCELED, null);
        }
        this.stopSelecting();
    }
    /**
     * Cancel a mouse event
     */
    cancelEvent(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
    /**
     * Bind class methods to the class scope to avoid rebind for event listeners
     */
    bindMethods() {
        this.startSelecting = this.startSelecting.bind(this);
        this.stopSelecting = this.stopSelecting.bind(this);
        this.elementMouseOver = this.elementMouseOver.bind(this);
        this.elementClicked = this.elementClicked.bind(this);
    }
}
exports.default = ComponentPicker;
//# sourceMappingURL=component-pick.js.map

/***/ }),

/***/ 9818:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getComponentInstance = exports.getComponentId = exports.editComponentState = exports.sendEmptyComponentData = exports.markSelectedInstance = exports.sendSelectedComponentData = exports.sendComponentTreeData = void 0;
const shared_utils_1 = __webpack_require__(1942);
const app_1 = __webpack_require__(8508);
async function sendComponentTreeData(instanceId, filter = '', ctx) {
    if (!instanceId)
        return;
    const instance = getComponentInstance(instanceId, ctx);
    if (!instance) {
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, {
            instanceId,
            treeData: null,
            notFound: true
        });
    }
    else {
        if (filter)
            filter = filter.toLowerCase();
        const maxDepth = instance === ctx.currentAppRecord.rootInstance ? 2 : 1;
        const payload = {
            instanceId,
            treeData: shared_utils_1.stringify(await ctx.api.walkComponentTree(instance, maxDepth, filter))
        };
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, payload);
    }
}
exports.sendComponentTreeData = sendComponentTreeData;
async function sendSelectedComponentData(instanceId, ctx) {
    if (!instanceId)
        return;
    markSelectedInstance(instanceId, ctx);
    const instance = getComponentInstance(instanceId, ctx);
    if (!instance) {
        sendEmptyComponentData(instanceId, ctx);
    }
    else {
        // Expose instance on window
        if (typeof window !== 'undefined') {
            window.$vm = instance;
        }
        const parentInstances = await ctx.api.walkComponentParents(instance);
        const payload = {
            instanceId,
            data: shared_utils_1.stringify(await ctx.api.inspectComponent(instance)),
            parentIds: parentInstances.map(i => i.__VUE_DEVTOOLS_UID__)
        };
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload);
    }
}
exports.sendSelectedComponentData = sendSelectedComponentData;
function markSelectedInstance(instanceId, ctx) {
    ctx.currentInspectedComponentId = instanceId;
    ctx.currentAppRecord.lastInspectedComponentId = instanceId;
}
exports.markSelectedInstance = markSelectedInstance;
function sendEmptyComponentData(instanceId, ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, {
        instanceId,
        data: null
    });
}
exports.sendEmptyComponentData = sendEmptyComponentData;
async function editComponentState(instanceId, dotPath, state, ctx) {
    if (!instanceId)
        return;
    const instance = getComponentInstance(instanceId, ctx);
    if (instance) {
        if ('value' in state && state.value != null) {
            state.value = shared_utils_1.parse(state.value, true);
        }
        await ctx.api.editComponentState(instance, dotPath, state);
        await sendSelectedComponentData(instanceId, ctx);
    }
}
exports.editComponentState = editComponentState;
function getComponentId(app, uid, ctx) {
    const appRecord = app_1.getAppRecord(app, ctx);
    if (!appRecord)
        return null;
    return `${appRecord.id}:${uid === 0 ? 'root' : uid}`;
}
exports.getComponentId = getComponentId;
function getComponentInstance(instanceId, ctx) {
    if (instanceId === '_root') {
        instanceId = `${ctx.currentAppRecord.id}:root`;
    }
    const instance = ctx.currentAppRecord.instanceMap.get(instanceId);
    if (!instance) {
        console.warn(`Instance uid=${instanceId} not found`);
    }
    return instance;
}
exports.getComponentInstance = getComponentInstance;
//# sourceMappingURL=component.js.map

/***/ }),

/***/ 3426:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hook = void 0;
const shared_utils_1 = __webpack_require__(1942);
// hook should have been injected before this executes.
exports.hook = shared_utils_1.target.__VUE_DEVTOOLS_GLOBAL_HOOK__;
//# sourceMappingURL=global-hook.js.map

/***/ }),

/***/ 3789:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unHighlight = exports.highlight = void 0;
const shared_utils_1 = __webpack_require__(1942);
const queue_1 = __webpack_require__(5428);
let overlay;
let overlayContent;
function createOverlay() {
    if (overlay || !shared_utils_1.isBrowser)
        return;
    overlay = document.createElement('div');
    overlay.style.backgroundColor = 'rgba(65, 184, 131, 0.35)';
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '99999999999999';
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.borderRadius = '3px';
    overlayContent = document.createElement('div');
    overlayContent.style.backgroundColor = 'rgba(65, 184, 131, 0.9)';
    overlayContent.style.fontFamily = 'monospace';
    overlayContent.style.fontSize = '11px';
    overlayContent.style.padding = '2px 3px';
    overlayContent.style.borderRadius = '3px';
    overlayContent.style.color = 'white';
    overlay.appendChild(overlayContent);
}
// Use a job queue to preserve highlight/unhighlight calls order
// This prevents "sticky" highlights that are not removed because highlight is async
const jobQueue = new queue_1.JobQueue();
async function highlight(instance, ctx) {
    await jobQueue.queue(async () => {
        if (!instance)
            return;
        const bounds = await ctx.api.getComponentBounds(instance);
        if (bounds) {
            const name = (await ctx.api.getComponentName(instance)) || 'Anonymous';
            createOverlay();
            const pre = document.createElement('span');
            pre.style.opacity = '0.6';
            pre.innerText = '<';
            const text = document.createTextNode(name);
            const post = document.createElement('span');
            post.style.opacity = '0.6';
            post.innerText = '>';
            showOverlay(bounds, [pre, text, post]);
        }
    });
}
exports.highlight = highlight;
async function unHighlight() {
    await jobQueue.queue(async () => {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    });
}
exports.unHighlight = unHighlight;
function showOverlay({ width = 0, height = 0, top = 0, left = 0 }, children = []) {
    if (!shared_utils_1.isBrowser || !children.length)
        return;
    overlay.style.width = ~~width + 'px';
    overlay.style.height = ~~height + 'px';
    overlay.style.top = ~~top + 'px';
    overlay.style.left = ~~left + 'px';
    overlayContent.innerHTML = '';
    children.forEach(child => overlayContent.appendChild(child));
    document.body.appendChild(overlay);
}
//# sourceMappingURL=highlighter.js.map

/***/ }),

/***/ 5859:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initBackend = void 0;
const app_backend_api_1 = __webpack_require__(860);
const shared_utils_1 = __webpack_require__(1942);
const global_hook_1 = __webpack_require__(3426);
const subscriptions_1 = __webpack_require__(1678);
const highlighter_1 = __webpack_require__(3789);
const timeline_1 = __webpack_require__(3300);
const component_pick_1 = __importDefault(__webpack_require__(1697));
const component_1 = __webpack_require__(9818);
const plugin_1 = __webpack_require__(9377);
const app_1 = __webpack_require__(8508);
const inspector_1 = __webpack_require__(3510);
const timeline_screenshot_1 = __webpack_require__(2865);
let ctx;
let connected = false;
async function initBackend(bridge) {
    connected = false;
    ctx = app_backend_api_1.createBackendContext({
        bridge,
        hook: global_hook_1.hook
    });
    await shared_utils_1.initSharedData({
        bridge,
        persist: false
    });
    if (global_hook_1.hook.Vue) {
        connect();
        app_1._legacy_getAndRegisterApps(global_hook_1.hook.Vue, ctx);
    }
    else {
        global_hook_1.hook.once(shared_utils_1.HookEvents.INIT, (Vue) => {
            app_1._legacy_getAndRegisterApps(Vue, ctx);
        });
    }
    global_hook_1.hook.on(shared_utils_1.HookEvents.APP_ADD, async (app) => {
        await app_1.registerApp(app, ctx);
        // Will init connect
        global_hook_1.hook.emit(shared_utils_1.HookEvents.INIT);
    });
    // In case we close and open devtools again
    if (global_hook_1.hook.apps.length) {
        global_hook_1.hook.apps.forEach(app => {
            app_1.registerApp(app, ctx);
            connect();
        });
    }
}
exports.initBackend = initBackend;
async function connect() {
    if (connected) {
        return;
    }
    connected = true;
    await app_1.waitForAppsRegistration();
    ctx.currentTab = shared_utils_1.BuiltinTabs.COMPONENTS;
    // Subscriptions
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_SUBSCRIBE, ({ type, payload }) => {
        subscriptions_1.subscribe(type, payload);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_UNSUBSCRIBE, ({ type, payload }) => {
        subscriptions_1.unsubscribe(type, payload);
    });
    // Tabs
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TAB_SWITCH, async (tab) => {
        ctx.currentTab = tab;
        await highlighter_1.unHighlight();
    });
    // Apps
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_LIST, () => {
        app_1.sendApps(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_SELECT, async (id) => {
        if (id == null)
            return;
        const record = ctx.appRecords.find(r => r.id === id);
        if (!record) {
            console.error(`App with id ${id} not found`);
        }
        else {
            await app_1.selectApp(record, ctx);
        }
    });
    // Components
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_TREE, ({ instanceId, filter }) => {
        ctx.currentAppRecord.componentFilter = filter;
        component_1.sendComponentTreeData(instanceId, filter, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, (instanceId) => {
        component_1.sendSelectedComponentData(instanceId, ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UPDATED, (app, uid) => {
        const id = app ? component_1.getComponentId(app, uid, ctx) : ctx.currentInspectedComponentId;
        if (id && subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
            component_1.sendSelectedComponentData(id, ctx);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_ADDED, (app, uid, parentUid, component) => {
        const id = component_1.getComponentId(app, uid, ctx);
        if (component) {
            if (component.__VUE_DEVTOOLS_UID__ == null) {
                component.__VUE_DEVTOOLS_UID__ = id;
            }
            if (!ctx.currentAppRecord.instanceMap.has(id)) {
                ctx.currentAppRecord.instanceMap.set(id, component);
            }
        }
        const parentId = component_1.getComponentId(app, parentUid, ctx);
        if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
            requestAnimationFrame(() => {
                component_1.sendComponentTreeData(parentId, ctx.currentAppRecord.componentFilter, ctx);
            });
        }
        if (ctx.currentInspectedComponentId === id) {
            component_1.sendSelectedComponentData(id, ctx);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_REMOVED, (app, uid, parentUid) => {
        const parentId = component_1.getComponentId(app, parentUid, ctx);
        if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, sub => sub.payload.instanceId === parentId)) {
            requestAnimationFrame(() => {
                component_1.sendComponentTreeData(parentId, ctx.currentAppRecord.componentFilter, ctx);
            });
        }
        const id = component_1.getComponentId(app, uid, ctx);
        if (subscriptions_1.isSubscribed(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, sub => sub.payload.instanceId === id)) {
            component_1.sendEmptyComponentData(id, ctx);
        }
        ctx.currentAppRecord.instanceMap.delete(id);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_EDIT_STATE, ({ instanceId, dotPath, value, newKey, remove }) => {
        component_1.editComponentState(instanceId, dotPath, { value, newKey, remove }, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_INSPECT_DOM, async ({ instanceId }) => {
        const instance = component_1.getComponentInstance(instanceId, ctx);
        if (instance) {
            const [el] = await ctx.api.getComponentRootElements(instance);
            if (el) {
                // @ts-ignore
                window.__VUE_DEVTOOLS_INSPECT_TARGET__ = el;
                ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, null);
            }
        }
    });
    // Highlighter
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, instanceId => {
        highlighter_1.highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT, () => {
        highlighter_1.unHighlight();
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_HIGHLIGHT, instanceId => {
        highlighter_1.highlight(ctx.currentAppRecord.instanceMap.get(instanceId), ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UNHIGHLIGHT, () => {
        highlighter_1.unHighlight();
    });
    // Component picker
    const componentPicker = new component_pick_1.default(ctx);
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_PICK, () => {
        componentPicker.startSelecting();
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_PICK_CANCELED, () => {
        componentPicker.stopSelecting();
    });
    // Timeline
    timeline_1.setupTimeline(ctx);
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, () => {
        timeline_1.sendTimelineLayers(ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, (options, plugin) => {
        ctx.timelineLayers.push({
            ...options,
            app: plugin.descriptor.app,
            plugin
        });
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {});
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, (options, plugin) => {
        timeline_1.addTimelineEvent(options, plugin.descriptor.app, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, ({ screenshot }) => {
        timeline_screenshot_1.showScreenshot(screenshot, ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_CLEAR, () => {
        timeline_1.clearTimeline(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, async ({ id }) => {
        await timeline_1.sendTimelineEventData(id, ctx);
    });
    // Custom inspectors
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_LIST, () => {
        inspector_1.sendCustomInspectors(ctx);
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, ({ inspectorId, appId, treeFilter }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            inspector.treeFilter = treeFilter;
            inspector_1.sendInspectorTree(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, ({ inspectorId, appId, nodeId }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            inspector.selectedNodeId = nodeId;
            inspector_1.sendInspectorState(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, (options, plugin) => {
        ctx.customInspectors.push({
            ...options,
            app: plugin.descriptor.app,
            plugin,
            treeFilter: '',
            selectedNodeId: null
        });
        ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_ADD, {});
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, (inspectorId, plugin) => {
        const inspector = inspector_1.getInspector(inspectorId, plugin.descriptor.app, ctx);
        if (inspector) {
            inspector_1.sendInspectorTree(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, (inspectorId, plugin) => {
        const inspector = inspector_1.getInspector(inspectorId, plugin.descriptor.app, ctx);
        if (inspector) {
            inspector_1.sendInspectorState(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, async ({ inspectorId, appId, nodeId, path, payload }) => {
        const inspector = inspector_1.getInspectorWithAppId(inspectorId, appId, ctx);
        if (inspector) {
            await inspector_1.editInspectorState(inspector, nodeId, path, payload, ctx);
            inspector.selectedNodeId = nodeId;
            await inspector_1.sendInspectorState(inspector, ctx);
        }
        else {
            console.error(`Inspector ${inspectorId} not found`);
        }
    });
    // Plugins
    plugin_1.addPreviouslyRegisteredPlugins(ctx);
    plugin_1.addQueuedPlugins(ctx);
    ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, () => {
        plugin_1.sendPluginList(ctx);
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.SETUP_DEVTOOLS_PLUGIN, (pluginDescriptor, setupFn) => {
        plugin_1.addPlugin(pluginDescriptor, setupFn, ctx);
    });
    // Legacy flush
    global_hook_1.hook.off('flush');
    global_hook_1.hook.on('flush', () => {
        var _a;
        if ((_a = ctx.currentAppRecord) === null || _a === void 0 ? void 0 : _a.backend.availableFeatures.includes(app_backend_api_1.BuiltinBackendFeature.FLUSH)) {
            component_1.sendComponentTreeData('_root', ctx.currentAppRecord.componentFilter, ctx);
            if (ctx.currentInspectedComponentId) {
                component_1.sendSelectedComponentData(ctx.currentInspectedComponentId, ctx);
            }
        }
    });
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 3510:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sendCustomInspectors = exports.editInspectorState = exports.sendInspectorState = exports.sendInspectorTree = exports.getInspectorWithAppId = exports.getInspector = void 0;
const shared_utils_1 = __webpack_require__(1942);
const app_1 = __webpack_require__(8508);
function getInspector(inspectorId, app, ctx) {
    return ctx.customInspectors.find(i => i.id === inspectorId && i.app === app);
}
exports.getInspector = getInspector;
function getInspectorWithAppId(inspectorId, appId, ctx) {
    return ctx.customInspectors.find(i => i.id === inspectorId && app_1.getAppRecordId(i.app) === appId);
}
exports.getInspectorWithAppId = getInspectorWithAppId;
async function sendInspectorTree(inspector, ctx) {
    const rootNodes = await ctx.api.getInspectorTree(inspector.id, inspector.app, inspector.treeFilter);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_TREE, {
        appId: app_1.getAppRecordId(inspector.app),
        inspectorId: inspector.id,
        rootNodes
    });
}
exports.sendInspectorTree = sendInspectorTree;
async function sendInspectorState(inspector, ctx) {
    const state = inspector.selectedNodeId ? await ctx.api.getInspectorState(inspector.id, inspector.app, inspector.selectedNodeId) : null;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_STATE, {
        appId: app_1.getAppRecordId(inspector.app),
        inspectorId: inspector.id,
        state: shared_utils_1.stringify(state)
    });
}
exports.sendInspectorState = sendInspectorState;
async function editInspectorState(inspector, nodeId, dotPath, state, ctx) {
    await ctx.api.editInspectorState(inspector.id, inspector.app, nodeId, dotPath, {
        ...state,
        value: state.value != null ? shared_utils_1.parse(state.value, true) : state.value
    });
}
exports.editInspectorState = editInspectorState;
async function sendCustomInspectors(ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, {
        inspectors: ctx.customInspectors.map(i => ({
            id: i.id,
            appId: app_1.getAppRecordId(i.app),
            pluginId: i.plugin.descriptor.id,
            label: i.label,
            icon: i.icon,
            treeFilterPlaceholder: i.treeFilterPlaceholder,
            stateFilterPlaceholder: i.stateFilterPlaceholder,
            noSelectionText: i.noSelectionText
        }))
    });
}
exports.sendCustomInspectors = sendCustomInspectors;
//# sourceMappingURL=inspector.js.map

/***/ }),

/***/ 3005:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.scan = void 0;
const shared_utils_1 = __webpack_require__(1942);
const rootInstances = [];
let rootUID = 0;
/**
 * Scan the page for root level Vue instances.
 */
function scan() {
    rootInstances.length = 0;
    let inFragment = false;
    let currentFragment = null;
    // eslint-disable-next-line no-inner-declarations
    function processInstance(instance) {
        if (instance) {
            if (rootInstances.indexOf(instance.$root) === -1) {
                instance = instance.$root;
            }
            if (instance._isFragment) {
                inFragment = true;
                currentFragment = instance;
            }
            // respect Vue.config.devtools option
            let baseVue = instance.constructor;
            while (baseVue.super) {
                baseVue = baseVue.super;
            }
            if (baseVue.config && baseVue.config.devtools) {
                // give a unique id to root instance so we can
                // 'namespace' its children
                if (typeof instance.__VUE_DEVTOOLS_ROOT_UID__ === 'undefined') {
                    instance.__VUE_DEVTOOLS_ROOT_UID__ = ++rootUID;
                }
                rootInstances.push(instance);
            }
            return true;
        }
    }
    if (shared_utils_1.isBrowser) {
        walk(document, function (node) {
            if (inFragment) {
                if (node === currentFragment._fragmentEnd) {
                    inFragment = false;
                    currentFragment = null;
                }
                return true;
            }
            const instance = node.__vue__;
            return processInstance(instance);
        });
    }
    else {
        if (Array.isArray(shared_utils_1.target.__VUE_ROOT_INSTANCES__)) {
            shared_utils_1.target.__VUE_ROOT_INSTANCES__.map(processInstance);
        }
    }
    return rootInstances;
}
exports.scan = scan;
/**
 * DOM walk helper
 *
 * @param {NodeList} nodes
 * @param {Function} fn
 */
function walk(node, fn) {
    if (node.childNodes) {
        for (let i = 0, l = node.childNodes.length; i < l; i++) {
            const child = node.childNodes[i];
            const stop = fn(child);
            if (!stop) {
                walk(child, fn);
            }
        }
    }
    // also walk shadow DOM
    if (node.shadowRoot) {
        walk(node.shadowRoot, fn);
    }
}
//# sourceMappingURL=scan.js.map

/***/ }),

/***/ 9377:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.serializePlugin = exports.sendPluginList = exports.addPreviouslyRegisteredPlugins = exports.addQueuedPlugins = exports.addPlugin = void 0;
const app_backend_api_1 = __webpack_require__(860);
const shared_utils_1 = __webpack_require__(1942);
const app_1 = __webpack_require__(8508);
function addPlugin(pluginDescriptor, setupFn, ctx) {
    const plugin = {
        descriptor: pluginDescriptor,
        setupFn,
        error: null
    };
    ctx.currentPlugin = plugin;
    try {
        const api = new app_backend_api_1.DevtoolsPluginApiInstance(plugin, ctx);
        setupFn(api);
    }
    catch (e) {
        plugin.error = e;
        console.error(e);
    }
    ctx.currentPlugin = null;
    ctx.plugins.push(plugin);
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, {
        plugin: serializePlugin(plugin)
    });
    const targetList = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ || [];
    targetList.push({
        pluginDescriptor,
        setupFn
    });
}
exports.addPlugin = addPlugin;
async function addQueuedPlugins(ctx) {
    if (shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__)) {
        for (const k in shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__) {
            const plugin = shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__[k];
            addPlugin(plugin.pluginDescriptor, plugin.setupFn, ctx);
        }
        shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ = null;
    }
}
exports.addQueuedPlugins = addQueuedPlugins;
async function addPreviouslyRegisteredPlugins(ctx) {
    if (shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__)) {
        for (const k in shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__) {
            const plugin = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__[k];
            addPlugin(plugin.pluginDescriptor, plugin.setupFn, ctx);
        }
    }
}
exports.addPreviouslyRegisteredPlugins = addPreviouslyRegisteredPlugins;
function sendPluginList(ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, {
        plugins: ctx.plugins.map(p => serializePlugin(p))
    });
}
exports.sendPluginList = sendPluginList;
function serializePlugin(plugin) {
    return {
        id: plugin.descriptor.id,
        label: plugin.descriptor.label,
        appId: app_1.getAppRecordId(plugin.descriptor.app),
        packageName: plugin.descriptor.packageName,
        homepage: plugin.descriptor.homepage,
        logo: plugin.descriptor.logo,
        componentStateTypes: plugin.descriptor.componentStateTypes
    };
}
exports.serializePlugin = serializePlugin;
//# sourceMappingURL=plugin.js.map

/***/ }),

/***/ 8940:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.builtinLayers = void 0;
exports.builtinLayers = [
    {
        id: 'mouse',
        label: 'Mouse',
        color: 0xA451AF,
        screenshotOverlayRender(event, { events }) {
            const samePositionEvent = events.find(e => e !== event && e.renderMeta.textEl && e.data.x === event.data.x && e.data.y === event.data.y);
            if (samePositionEvent) {
                const text = document.createElement('div');
                text.innerText = event.data.type;
                samePositionEvent.renderMeta.textEl.appendChild(text);
                return false;
            }
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.left = `${event.data.x - 4}px`;
            div.style.top = `${event.data.y - 4}px`;
            div.style.width = '8px';
            div.style.height = '8px';
            div.style.borderRadius = '100%';
            div.style.backgroundColor = 'rgba(164, 81, 175, 0.5)';
            const text = document.createElement('div');
            text.innerText = event.data.type;
            text.style.color = '#541e5b';
            text.style.fontFamily = 'monospace';
            text.style.fontSize = '9px';
            text.style.position = 'absolute';
            text.style.left = '10px';
            text.style.top = '10px';
            text.style.padding = '1px';
            text.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            text.style.borderRadius = '3px';
            div.appendChild(text);
            event.renderMeta.textEl = text;
            return div;
        }
    },
    {
        id: 'keyboard',
        label: 'Keyboard',
        color: 0x8151AF
    },
    {
        id: 'component-event',
        label: 'Component events',
        color: 0x41B883,
        screenshotOverlayRender: (event, { events }) => {
            if (events.some(e => e !== event && e.layerId === event.layerId && e.renderMeta.drawn && (e.meta.componentId === event.meta.componentId || (e.meta.bounds.left === event.meta.bounds.left &&
                e.meta.bounds.top === event.meta.bounds.top &&
                e.meta.bounds.width === event.meta.bounds.width &&
                e.meta.bounds.height === event.meta.bounds.height)))) {
                return false;
            }
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.left = `${event.meta.bounds.left - 4}px`;
            div.style.top = `${event.meta.bounds.top - 4}px`;
            div.style.width = `${event.meta.bounds.width}px`;
            div.style.height = `${event.meta.bounds.height}px`;
            div.style.borderRadius = '8px';
            div.style.borderStyle = 'solid';
            div.style.borderWidth = '4px';
            div.style.borderColor = 'rgba(65, 184, 131, 0.5)';
            div.style.textAlign = 'center';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.style.overflow = 'hidden';
            const text = document.createElement('div');
            text.style.color = '#267753';
            text.style.fontFamily = 'monospace';
            text.style.fontSize = '9px';
            text.style.padding = '1px';
            text.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            text.style.borderRadius = '3px';
            text.innerText = event.data.event;
            div.appendChild(text);
            event.renderMeta.drawn = true;
            return div;
        }
    }
];
//# sourceMappingURL=timeline-builtins.js.map

/***/ }),

/***/ 2865:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showScreenshot = void 0;
const queue_1 = __webpack_require__(5428);
const timeline_builtins_1 = __webpack_require__(8940);
let overlay;
let image;
let container;
const jobQueue = new queue_1.JobQueue();
async function showScreenshot(screenshot, ctx) {
    await jobQueue.queue(async () => {
        if (screenshot) {
            if (!container) {
                createElements();
            }
            image.src = screenshot.image;
            clearContent();
            const events = screenshot.events.map(id => ctx.currentAppRecord.timelineEventMap.get(id)).filter(Boolean).map(eventData => ({
                layer: timeline_builtins_1.builtinLayers.concat(ctx.timelineLayers).find(layer => layer.id === eventData.layerId),
                event: {
                    ...eventData.event,
                    layerId: eventData.layerId,
                    renderMeta: {}
                }
            }));
            const renderContext = {
                screenshot,
                events: events.map(({ event }) => event),
                index: 0
            };
            for (let i = 0; i < events.length; i++) {
                const { layer, event } = events[i];
                if (layer.screenshotOverlayRender) {
                    renderContext.index = i;
                    try {
                        const result = await layer.screenshotOverlayRender(event, renderContext);
                        if (result !== false) {
                            if (typeof result === 'string') {
                                container.innerHTML += result;
                            }
                            else {
                                container.appendChild(result);
                            }
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            showElement();
        }
        else {
            hideElement();
        }
    });
}
exports.showScreenshot = showScreenshot;
function createElements() {
    overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '9999999999999';
    overlay.style.pointerEvents = 'none';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.overflow = 'hidden';
    const imageBox = document.createElement('div');
    imageBox.style.position = 'relative';
    overlay.appendChild(imageBox);
    image = document.createElement('img');
    imageBox.appendChild(image);
    container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    imageBox.appendChild(container);
    const style = document.createElement('style');
    style.innerHTML = '.__vuedevtools_no-scroll { overflow: hidden; }';
    document.head.appendChild(style);
}
function showElement() {
    if (!overlay.parentNode) {
        document.body.appendChild(overlay);
        document.body.classList.add('__vuedevtools_no-scroll');
    }
}
function hideElement() {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
        document.body.classList.remove('__vuedevtools_no-scroll');
        clearContent();
    }
}
function clearContent() {
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
}
//# sourceMappingURL=timeline-screenshot.js.map

/***/ }),

/***/ 3300:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sendTimelineEventData = exports.clearTimeline = exports.addTimelineEvent = exports.sendTimelineLayers = exports.setupTimeline = void 0;
const shared_utils_1 = __webpack_require__(1942);
const global_hook_1 = __webpack_require__(3426);
const app_1 = __webpack_require__(8508);
function setupTimeline(ctx) {
    setupBuiltinLayers(ctx);
}
exports.setupTimeline = setupTimeline;
function setupBuiltinLayers(ctx) {
    ;
    ['mousedown', 'mouseup', 'click', 'dblclick'].forEach(eventType => {
        // @ts-ignore
        window.addEventListener(eventType, (event) => {
            addTimelineEvent({
                layerId: 'mouse',
                event: {
                    time: Date.now(),
                    data: {
                        type: eventType,
                        x: event.clientX,
                        y: event.clientY
                    },
                    title: eventType
                }
            }, null, ctx);
        }, {
            capture: true,
            passive: true
        });
    });
    ['keyup', 'keydown', 'keypress'].forEach(eventType => {
        // @ts-ignore
        window.addEventListener(eventType, (event) => {
            addTimelineEvent({
                layerId: 'keyboard',
                event: {
                    time: Date.now(),
                    data: {
                        type: eventType,
                        key: event.key,
                        ctrlKey: event.ctrlKey,
                        shiftKey: event.shiftKey,
                        altKey: event.altKey,
                        metaKey: event.metaKey
                    },
                    title: event.key
                }
            }, null, ctx);
        }, {
            capture: true,
            passive: true
        });
    });
    global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_EMIT, async (app, instance, event, params) => {
        const appRecord = app_1.getAppRecord(app, ctx);
        const componentId = `${appRecord.id}:${instance.uid}`;
        const componentDisplay = (await ctx.api.getComponentName(instance)) || '<i>Unknown Component</i>';
        addTimelineEvent({
            layerId: 'component-event',
            event: {
                time: Date.now(),
                data: {
                    component: {
                        _custom: {
                            type: 'component-definition',
                            display: componentDisplay
                        }
                    },
                    event,
                    params
                },
                title: event,
                subtitle: `by ${componentDisplay}`,
                meta: {
                    componentId,
                    bounds: await ctx.api.getComponentBounds(instance)
                }
            }
        }, app, ctx);
    });
}
function sendTimelineLayers(ctx) {
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_LIST, {
        layers: ctx.timelineLayers.map(layer => {
            var _a;
            return ({
                id: layer.id,
                label: layer.label,
                color: layer.color,
                appId: (_a = app_1.getAppRecord(layer.app, ctx)) === null || _a === void 0 ? void 0 : _a.id,
                pluginId: layer.plugin.descriptor.id
            });
        })
    });
}
exports.sendTimelineLayers = sendTimelineLayers;
let nextTimelineEventId = 0;
function addTimelineEvent(options, app, ctx) {
    const appId = app && app_1.getAppRecordId(app);
    const isAllApps = options.all || !app || appId == null;
    const id = nextTimelineEventId++;
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
        appId: isAllApps ? 'all' : appId,
        layerId: options.layerId,
        event: {
            id,
            time: options.event.time,
            logType: options.event.logType,
            groupId: options.event.groupId,
            title: options.event.title,
            subtitle: options.event.subtitle
        }
    });
    const eventData = {
        id,
        ...options
    };
    if (!isAllApps && app) {
        const appRecord = app_1.getAppRecord(app, ctx);
        appRecord && registerTimelineEvent(eventData, appRecord, ctx);
    }
    else {
        ctx.appRecords.forEach(appRecord => registerTimelineEvent(eventData, appRecord, ctx));
    }
}
exports.addTimelineEvent = addTimelineEvent;
function registerTimelineEvent(options, appRecord, ctx) {
    appRecord.timelineEventMap.set(options.id, options);
}
function clearTimeline(ctx) {
    ctx.appRecords.forEach(appRecord => {
        appRecord.timelineEventMap.clear();
    });
}
exports.clearTimeline = clearTimeline;
async function sendTimelineEventData(id, ctx) {
    let data = null;
    const eventData = ctx.currentAppRecord.timelineEventMap.get(id);
    if (eventData) {
        data = await ctx.api.inspectTimelineEvent(eventData, ctx.currentAppRecord.options.app);
        data = shared_utils_1.stringify(data);
    }
    else {
        console.warn(`Event ${id} not found`);
    }
    ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT_DATA, {
        eventId: id,
        data
    });
}
exports.sendTimelineEventData = sendTimelineEventData;
//# sourceMappingURL=timeline.js.map

/***/ }),

/***/ 5428:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JobQueue = void 0;
class JobQueue {
    constructor() {
        this.jobs = [];
    }
    queue(job) {
        return new Promise(resolve => {
            const onDone = () => {
                this.currentJob = null;
                const nextJob = this.jobs.shift();
                if (nextJob) {
                    nextJob();
                }
                resolve();
            };
            const run = () => {
                this.currentJob = job;
                return job().then(onDone);
            };
            if (this.currentJob) {
                this.jobs.push(() => run());
            }
            else {
                run();
            }
        });
    }
}
exports.JobQueue = JobQueue;
//# sourceMappingURL=queue.js.map

/***/ }),

/***/ 1678:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isSubscribed = exports.unsubscribe = exports.subscribe = void 0;
const activeSubs = new Map();
function getSubs(type) {
    let subs = activeSubs.get(type);
    if (!subs) {
        subs = [];
        activeSubs.set(type, subs);
    }
    return subs;
}
function subscribe(type, payload) {
    const rawPayload = JSON.stringify(payload);
    getSubs(type).push({
        payload,
        rawPayload
    });
}
exports.subscribe = subscribe;
function unsubscribe(type, payload) {
    const rawPayload = JSON.stringify(payload);
    const subs = getSubs(type);
    const index = subs.findIndex(sub => sub.rawPayload === rawPayload);
    if (index !== -1) {
        subs.splice(index, 1);
    }
}
exports.unsubscribe = unsubscribe;
function isSubscribed(type, predicate = () => true) {
    return getSubs(type).some(predicate);
}
exports.isSubscribed = isSubscribed;
//# sourceMappingURL=subscriptions.js.map

/***/ }),

/***/ 4274:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.backend = void 0;
const app_backend_api_1 = __webpack_require__(860);
exports.backend = {
    frameworkVersion: 1,
    availableFeatures: [
        app_backend_api_1.BuiltinBackendFeature.COMPONENTS
    ],
    setup(api) {
        // @TODO
    }
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 7043:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.editState = exports.findInstanceOrVnode = exports.getInstanceName = exports.reduceStateList = exports.getCustomInstanceDetails = exports.getInstanceDetails = void 0;
const shared_utils_1 = __webpack_require__(1942);
const shared_data_1 = __importDefault(__webpack_require__(796));
const tree_1 = __webpack_require__(9606);
/**
 * Get the detailed information of an inspected instance.
 */
function getInstanceDetails(instance) {
    var _a, _b;
    if (instance.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
        const vnode = findInstanceOrVnode(instance.__VUE_DEVTOOLS_UID__);
        if (!vnode)
            return null;
        const fakeInstance = {
            $options: vnode.fnOptions,
            ...((_a = vnode.devtoolsMeta) === null || _a === void 0 ? void 0 : _a.renderContext.props)
        };
        if (!fakeInstance.$options.props && ((_b = vnode.devtoolsMeta) === null || _b === void 0 ? void 0 : _b.renderContext.props)) {
            fakeInstance.$options.props = Object.keys(vnode.devtoolsMeta.renderContext.props).reduce((obj, key) => {
                obj[key] = {};
                return obj;
            }, {});
        }
        const data = {
            id: instance.__VUE_DEVTOOLS_UID__,
            name: shared_utils_1.getComponentName(vnode.fnOptions),
            file: instance.type ? instance.type.__file : vnode.fnOptions.__file || null,
            state: getFunctionalInstanceState(fakeInstance),
            functional: true
        };
        return data;
    }
    const data = {
        id: instance.__VUE_DEVTOOLS_UID__,
        name: getInstanceName(instance),
        state: getInstanceState(instance),
        file: null
    };
    let i;
    if ((i = instance.$vnode) && (i = i.componentOptions) && (i = i.Ctor) && (i = i.options)) {
        data.file = i.__file || null;
    }
    return data;
}
exports.getInstanceDetails = getInstanceDetails;
function getInstanceState(instance) {
    return processProps(instance).concat(processState(instance), processRefs(instance), processComputed(instance), processInjected(instance), processRouteContext(instance), processVuexGetters(instance), processFirebaseBindings(instance), processObservables(instance), processAttrs(instance));
}
function getFunctionalInstanceState(instance) {
    return processProps(instance);
}
function getCustomInstanceDetails(instance) {
    const state = getInstanceState(instance);
    return {
        _custom: {
            type: 'component',
            id: instance.__VUE_DEVTOOLS_UID__,
            display: getInstanceName(instance),
            tooltip: 'Component instance',
            value: reduceStateList(state),
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomInstanceDetails = getCustomInstanceDetails;
function reduceStateList(list) {
    if (!list.length) {
        return undefined;
    }
    return list.reduce((map, item) => {
        const key = item.type || 'data';
        const obj = map[key] = map[key] || {};
        obj[item.key] = item.value;
        return map;
    }, {});
}
exports.reduceStateList = reduceStateList;
/**
 * Get the appropriate display name for an instance.
 */
function getInstanceName(instance) {
    const name = shared_utils_1.getComponentName(instance.$options || instance.fnOptions || {});
    if (name)
        return name;
    return instance.$root === instance
        ? 'Root'
        : 'Anonymous Component';
}
exports.getInstanceName = getInstanceName;
/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 */
function processProps(instance) {
    const props = instance.$options.props;
    const propsData = [];
    for (let key in props) {
        const prop = props[key];
        key = shared_utils_1.camelize(key);
        propsData.push({
            type: 'props',
            key,
            value: instance[key],
            meta: prop ? {
                type: prop.type ? getPropType(prop.type) : 'any',
                required: !!prop.required
            } : {
                type: 'invalid'
            },
            editable: shared_data_1.default.editableProps
        });
    }
    return propsData;
}
function processAttrs(instance) {
    return Object.entries(instance.$attrs || {}).map(([key, value]) => {
        return {
            type: '$attrs',
            key,
            value
        };
    });
}
const fnTypeRE = /^(?:function|class) (\w+)/;
/**
 * Convert prop type constructor to string.
 */
function getPropType(type) {
    const match = type.toString().match(fnTypeRE);
    return typeof type === 'function'
        ? (match && match[1]) || 'any'
        : 'any';
}
/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 */
function processState(instance) {
    const props = instance.$options.props;
    const getters = instance.$options.vuex &&
        instance.$options.vuex.getters;
    return Object.keys(instance._data)
        .filter(key => (!(props && key in props) &&
        !(getters && key in getters)))
        .map(key => ({
        key,
        type: 'data',
        value: instance._data[key],
        editable: true
    }));
}
/**
 * Process refs
 */
function processRefs(instance) {
    return Object.keys(instance.$refs)
        .filter(key => instance.$refs[key])
        .map(key => shared_utils_1.getCustomRefDetails(instance, key, instance.$refs[key]));
}
/**
 * Process the computed properties of an instance.
 */
function processComputed(instance) {
    const computed = [];
    const defs = instance.$options.computed || {};
    // use for...in here because if 'computed' is not defined
    // on component, computed properties will be placed in prototype
    // and Object.keys does not include
    // properties from object's prototype
    for (const key in defs) {
        const def = defs[key];
        const type = typeof def === 'function' && def.vuex
            ? 'vuex bindings'
            : 'computed';
        // use try ... catch here because some computed properties may
        // throw error during its evaluation
        let computedProp = null;
        try {
            computedProp = {
                type,
                key,
                value: instance[key]
            };
        }
        catch (e) {
            computedProp = {
                type,
                key,
                value: '(error during evaluation)'
            };
        }
        computed.push(computedProp);
    }
    return computed;
}
/**
 * Process Vuex getters.
 */
function processInjected(instance) {
    const injected = instance.$options.inject;
    if (injected) {
        return Object.keys(injected).map(key => {
            return {
                key,
                type: 'injected',
                value: instance[key]
            };
        });
    }
    else {
        return [];
    }
}
/**
 * Process possible vue-router $route context
 */
function processRouteContext(instance) {
    try {
        const route = instance.$route;
        if (route) {
            const { path, query, params } = route;
            const value = { path, query, params };
            if (route.fullPath)
                value.fullPath = route.fullPath;
            if (route.hash)
                value.hash = route.hash;
            if (route.name)
                value.name = route.name;
            if (route.meta)
                value.meta = route.meta;
            return [{
                    key: '$route',
                    type: 'route',
                    value: {
                        _custom: {
                            type: 'router',
                            abstract: true,
                            value
                        }
                    }
                }];
        }
    }
    catch (e) {
        // Invalid $router
    }
    return [];
}
/**
 * Process Vuex getters.
 */
function processVuexGetters(instance) {
    const getters = instance.$options.vuex &&
        instance.$options.vuex.getters;
    if (getters) {
        return Object.keys(getters).map(key => {
            return {
                type: 'vuex getters',
                key,
                value: instance[key]
            };
        });
    }
    else {
        return [];
    }
}
/**
 * Process Firebase bindings.
 */
function processFirebaseBindings(instance) {
    const refs = instance.$firebaseRefs;
    if (refs) {
        return Object.keys(refs).map(key => {
            return {
                type: 'firebase bindings',
                key,
                value: instance[key]
            };
        });
    }
    else {
        return [];
    }
}
/**
 * Process vue-rx observable bindings.
 */
function processObservables(instance) {
    const obs = instance.$observables;
    if (obs) {
        return Object.keys(obs).map(key => {
            return {
                type: 'observables',
                key,
                value: instance[key]
            };
        });
    }
    else {
        return [];
    }
}
function findInstanceOrVnode(id) {
    if (/:functional:/.test(id)) {
        const [refId] = id.split(':functional:');
        const map = tree_1.functionalVnodeMap.get(refId);
        return map && map[id];
    }
    return tree_1.instanceMap.get(id);
}
exports.findInstanceOrVnode = findInstanceOrVnode;
function editState({ componentInstance, path, state }) {
    const data = shared_utils_1.has(componentInstance._props, path, !!state.newKey)
        ? componentInstance._props
        : componentInstance._data;
    shared_utils_1.set(data, path, state.value, (obj, field, value) => {
        if (state.remove || state.newKey)
            componentInstance.$delete(obj, field);
        if (!state.remove)
            componentInstance.$set(obj, state.newKey || field, value);
    });
}
exports.editState = editState;
//# sourceMappingURL=data.js.map

/***/ }),

/***/ 5030:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findRelatedComponent = exports.getInstanceOrVnodeRect = void 0;
const shared_utils_1 = __webpack_require__(1942);
function createRect() {
    const rect = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        get width() { return rect.right - rect.left; },
        get height() { return rect.bottom - rect.top; }
    };
    return rect;
}
function mergeRects(a, b) {
    if (!a.top || b.top < a.top) {
        a.top = b.top;
    }
    if (!a.bottom || b.bottom > a.bottom) {
        a.bottom = b.bottom;
    }
    if (!a.left || b.left < a.left) {
        a.left = b.left;
    }
    if (!a.right || b.right > a.right) {
        a.right = b.right;
    }
}
/**
 * Get the client rect for an instance.
 */
function getInstanceOrVnodeRect(instance) {
    const el = instance.subTree ? instance.subTree.el : instance.$el || instance.elm;
    if (!shared_utils_1.isBrowser) {
        // TODO: Find position from instance or a vnode (for functional components).
        return;
    }
    if (!shared_utils_1.inDoc(el)) {
        return;
    }
    if (instance._isFragment) {
        return getLegacyFragmentRect(instance);
    }
    else if (el.nodeType === 1) {
        return el.getBoundingClientRect();
    }
}
exports.getInstanceOrVnodeRect = getInstanceOrVnodeRect;
/**
 * Highlight a fragment instance.
 * Loop over its node range and determine its bounding box.
 */
function getLegacyFragmentRect({ _fragmentStart, _fragmentEnd }) {
    const rect = createRect();
    util().mapNodeRange(_fragmentStart, _fragmentEnd, function (node) {
        let childRect;
        if (node.nodeType === 1 || node.getBoundingClientRect) {
            childRect = node.getBoundingClientRect();
        }
        else if (node.nodeType === 3 && node.data.trim()) {
            childRect = getTextRect(node);
        }
        if (childRect) {
            mergeRects(rect, childRect);
        }
    });
    return rect;
}
let range;
/**
 * Get the bounding rect for a text node using a Range.
 */
function getTextRect(node) {
    if (!shared_utils_1.isBrowser)
        return;
    if (!range)
        range = document.createRange();
    range.selectNode(node);
    return range.getBoundingClientRect();
}
/**
 * Get Vue's util
 */
function util() {
    return shared_utils_1.target.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue.util;
}
function findRelatedComponent(el) {
    while (!el.__vue__ && el.parentElement) {
        el = el.parentElement;
    }
    return el.__vue__;
}
exports.findRelatedComponent = findRelatedComponent;
//# sourceMappingURL=el.js.map

/***/ }),

/***/ 9606:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getComponentParents = exports.walkTree = exports.functionalVnodeMap = exports.instanceMap = void 0;
const shared_utils_1 = __webpack_require__(1942);
const el_1 = __webpack_require__(5030);
const util_1 = __webpack_require__(1247);
let appRecord;
const consoleBoundInstances = Array(5);
let filter = '';
const functionalIds = new Map();
// Dedupe instances
// Some instances may be both on a component and on a child abstract/functional component
const captureIds = new Map();
function walkTree(instance, pFilter, ctx) {
    initCtx(ctx);
    filter = pFilter;
    functionalIds.clear();
    captureIds.clear();
    const result = findQualifiedChildren(instance);
    if (Array.isArray(result)) {
        return result;
    }
    return [result];
}
exports.walkTree = walkTree;
function getComponentParents(instance, ctx) {
    initCtx(ctx);
    const captureIds = new Map();
    const captureId = vm => {
        const id = util_1.getUniqueId(vm);
        if (captureIds.has(id))
            return;
        captureIds.set(id, undefined);
        mark(vm);
    };
    const parents = [];
    captureId(instance);
    let parent = instance;
    while ((parent = parent.$parent)) {
        captureId(parent);
        parents.push(parent);
    }
    return parents;
}
exports.getComponentParents = getComponentParents;
function initCtx(ctx) {
    appRecord = ctx.currentAppRecord;
    if (!appRecord.meta.instanceMap) {
        appRecord.meta.instanceMap = new Map();
    }
    exports.instanceMap = appRecord.meta.instanceMap;
    if (!appRecord.meta.functionalVnodeMap) {
        appRecord.meta.functionalVnodeMap = new Map();
    }
    exports.functionalVnodeMap = appRecord.meta.functionalVnodeMap;
}
/**
 * Iterate through an array of instances and flatten it into
 * an array of qualified instances. This is a depth-first
 * traversal - e.g. if an instance is not matched, we will
 * recursively go deeper until a qualified child is found.
 */
function findQualifiedChildrenFromList(instances) {
    instances = instances
        .filter(child => !util_1.isBeingDestroyed(child));
    return !filter
        ? instances.map(capture)
        : Array.prototype.concat.apply([], instances.map(findQualifiedChildren));
}
/**
 * Find qualified children from a single instance.
 * If the instance itself is qualified, just return itself.
 * This is ok because [].concat works in both cases.
 */
function findQualifiedChildren(instance) {
    if (isQualified(instance)) {
        return capture(instance);
    }
    else {
        return findQualifiedChildrenFromList(instance.$children).concat(instance._vnode && instance._vnode.children
            // Find functional components in recursively in non-functional vnodes.
            ? flatten(instance._vnode.children.filter(child => !child.componentInstance).map(captureChild))
                // Filter qualified children.
                .filter(instance => isQualified(instance))
            : []);
    }
}
/**
 * Get children from a component instance.
 */
function getInternalInstanceChildren(instance) {
    if (instance.$children) {
        return instance.$children;
    }
    if (Array.isArray(instance.subTree.children)) {
        return instance.subTree.children.filter(vnode => !!vnode.component).map(vnode => vnode.component);
    }
    return [];
}
/**
 * Check if an instance is qualified.
 */
function isQualified(instance) {
    const name = shared_utils_1.classify(instance.name || util_1.getInstanceName(instance)).toLowerCase();
    return name.indexOf(filter) > -1;
}
function flatten(items) {
    return items.reduce((acc, item) => {
        if (item instanceof Array)
            acc.push(...flatten(item));
        else if (item)
            acc.push(item);
        return acc;
    }, []);
}
function captureChild(child) {
    if (child.fnContext && !child.componentInstance) {
        return capture(child);
    }
    else if (child.componentInstance) {
        if (!util_1.isBeingDestroyed(child.componentInstance))
            return capture(child.componentInstance);
    }
    else if (child.children) {
        return flatten(child.children.map(captureChild));
    }
}
/**
 * Capture the meta information of an instance. (recursive)
 */
function capture(instance, index, list) {
    if (instance.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
        instance = instance.vnode;
    }
    if (instance.$options && instance.$options.abstract && instance._vnode && instance._vnode.componentInstance) {
        instance = instance._vnode.componentInstance;
    }
    // Functional component.
    if (instance.fnContext && !instance.componentInstance) {
        const contextUid = instance.fnContext.__VUE_DEVTOOLS_UID__;
        let id = functionalIds.get(contextUid);
        if (id == null) {
            id = 0;
        }
        else {
            id++;
        }
        functionalIds.set(contextUid, id);
        const functionalId = contextUid + ':functional:' + id;
        markFunctional(functionalId, instance);
        const children = (instance.children ? instance.children.map(child => child.fnContext
            ? captureChild(child)
            : child.componentInstance
                ? capture(child.componentInstance)
                : undefined)
            // router-view has both fnContext and componentInstance on vnode.
            : instance.componentInstance ? [capture(instance.componentInstance)] : []).filter(Boolean);
        return {
            uid: functionalId,
            id: functionalId,
            tags: [
                {
                    label: 'functional',
                    textColor: 0x555555,
                    backgroundColor: 0xeeeeee
                }
            ],
            name: util_1.getInstanceName(instance),
            renderKey: util_1.getRenderKey(instance.key),
            children,
            hasChildren: !!children.length,
            inactive: false,
            isFragment: false // TODO: Check what is it for.
        };
    }
    // instance._uid is not reliable in devtools as there
    // may be 2 roots with same _uid which causes unexpected
    // behaviour
    instance.__VUE_DEVTOOLS_UID__ = util_1.getUniqueId(instance);
    // Dedupe
    if (captureIds.has(instance.__VUE_DEVTOOLS_UID__)) {
        return;
    }
    else {
        captureIds.set(instance.__VUE_DEVTOOLS_UID__, undefined);
    }
    mark(instance);
    const name = util_1.getInstanceName(instance);
    const children = getInternalInstanceChildren(instance)
        .filter(child => !util_1.isBeingDestroyed(child))
        .map(capture)
        .filter(Boolean);
    const ret = {
        uid: instance._uid,
        id: instance.__VUE_DEVTOOLS_UID__,
        name,
        renderKey: util_1.getRenderKey(instance.$vnode ? instance.$vnode.key : null),
        inactive: !!instance._inactive,
        isFragment: !!instance._isFragment,
        children,
        hasChildren: !!children.length,
        tags: [],
        meta: {}
    };
    if (instance._vnode && instance._vnode.children) {
        ret.children = ret.children.concat(flatten(instance._vnode.children.map(captureChild))
            .filter(Boolean));
        ret.hasChildren = !!ret.children.length;
    }
    // record screen position to ensure correct ordering
    if ((!list || list.length > 1) && !instance._inactive) {
        const rect = el_1.getInstanceOrVnodeRect(instance);
        ret.positionTop = rect ? rect.top : Infinity;
    }
    else {
        ret.positionTop = Infinity;
    }
    // check if instance is available in console
    const consoleId = consoleBoundInstances.indexOf(instance.__VUE_DEVTOOLS_UID__);
    ret.consoleId = consoleId > -1 ? '$vm' + consoleId : null;
    // check router view
    const isRouterView2 = instance.$vnode && instance.$vnode.data.routerView;
    if (instance._routerView || isRouterView2) {
        ret.isRouterView = true;
        if (!instance._inactive && instance.$route) {
            const matched = instance.$route.matched;
            const depth = isRouterView2
                ? instance.$vnode.data.routerViewDepth
                : instance._routerView.depth;
            ret.meta.matchedRouteSegment =
                matched &&
                    matched[depth] &&
                    (isRouterView2 ? matched[depth].path : matched[depth].handler.path);
        }
        ret.tags.push({
            label: `router-view${ret.meta.matchedRouteSegment ? `: ${ret.meta.matchedRouteSegment}` : ''}`,
            textColor: 0x000000,
            backgroundColor: 0xff8344
        });
    }
    return ret;
}
/**
 * Mark an instance as captured and store it in the instance map.
 *
 * @param {Vue} instance
 */
function mark(instance) {
    const refId = instance.__VUE_DEVTOOLS_UID__;
    if (!exports.instanceMap.has(refId)) {
        exports.instanceMap.set(refId, instance);
        appRecord.instanceMap.set(refId, instance);
        instance.$on('hook:beforeDestroy', function () {
            exports.instanceMap.delete(refId);
        });
    }
}
function markFunctional(id, vnode) {
    const refId = vnode.fnContext.__VUE_DEVTOOLS_UID__;
    if (!exports.functionalVnodeMap.has(refId)) {
        exports.functionalVnodeMap.set(refId, {});
        vnode.fnContext.$on('hook:beforeDestroy', function () {
            exports.functionalVnodeMap.delete(refId);
        });
    }
    exports.functionalVnodeMap.get(refId)[id] = vnode;
    appRecord.instanceMap.set(id, {
        __VUE_DEVTOOLS_UID__: id,
        __VUE_DEVTOOLS_FUNCTIONAL_LEGACY__: true,
        vnode
    });
}
//# sourceMappingURL=tree.js.map

/***/ }),

/***/ 1247:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getUniqueId = exports.getRenderKey = exports.getInstanceName = exports.isBeingDestroyed = void 0;
const shared_utils_1 = __webpack_require__(1942);
function isBeingDestroyed(instance) {
    return instance._isBeingDestroyed;
}
exports.isBeingDestroyed = isBeingDestroyed;
/**
 * Get the appropriate display name for an instance.
 */
function getInstanceName(instance) {
    const name = shared_utils_1.getComponentName(instance.$options || instance.fnOptions || {});
    if (name)
        return name;
    return instance.$root === instance
        ? 'Root'
        : 'Anonymous Component';
}
exports.getInstanceName = getInstanceName;
function getRenderKey(value) {
    if (value == null)
        return;
    const type = typeof value;
    if (type === 'number') {
        return value.toString();
    }
    else if (type === 'string') {
        return `'${value}'`;
    }
    else if (Array.isArray(value)) {
        return 'Array';
    }
    else {
        return 'Object';
    }
}
exports.getRenderKey = getRenderKey;
/**
 * Returns a devtools unique id for instance.
 */
function getUniqueId(instance) {
    if (instance.__VUE_DEVTOOLS_UID__ != null)
        return instance.__VUE_DEVTOOLS_UID__;
    const rootVueId = instance.$root.__VUE_DEVTOOLS_ROOT_UID__;
    return `${rootVueId}:${instance._uid}`;
}
exports.getUniqueId = getUniqueId;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 5586:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.wrapVueForEvents = void 0;
const shared_utils_1 = __webpack_require__(1942);
const internalRE = /^(?:pre-)?hook:/;
function wrap(app, Vue, method, ctx) {
    const original = Vue.prototype[method];
    if (original) {
        Vue.prototype[method] = function (...args) {
            const res = original.apply(this, args);
            logEvent(this, method, args[0], args.slice(1));
            return res;
        };
    }
    function logEvent(vm, type, eventName, payload) {
        // The string check is important for compat with 1.x where the first
        // argument may be an object instead of a string.
        // this also ensures the event is only logged for direct $emit (source)
        // instead of by $dispatch/$broadcast
        if (typeof eventName === 'string' && !internalRE.test(eventName)) {
            const instance = vm._self || vm;
            ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_EMIT, app, instance, eventName, payload);
        }
    }
}
function wrapVueForEvents(app, Vue, ctx) {
    ;
    ['$emit', '$broadcast', '$dispatch'].forEach(method => {
        wrap(app, Vue, method, ctx);
    });
}
exports.wrapVueForEvents = wrapVueForEvents;
//# sourceMappingURL=events.js.map

/***/ }),

/***/ 7167:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.backend = void 0;
const app_backend_api_1 = __webpack_require__(860);
const shared_utils_1 = __webpack_require__(1942);
const data_1 = __webpack_require__(7043);
const el_1 = __webpack_require__(5030);
const tree_1 = __webpack_require__(9606);
const util_1 = __webpack_require__(1247);
const events_1 = __webpack_require__(5586);
const plugin_1 = __webpack_require__(6132);
exports.backend = {
    frameworkVersion: 2,
    availableFeatures: [
        app_backend_api_1.BuiltinBackendFeature.COMPONENTS,
        app_backend_api_1.BuiltinBackendFeature.FLUSH
    ],
    setup(api) {
        api.on.getAppRecordName(payload => {
            if (payload.app.name) {
                payload.name = payload.app.name;
            }
        });
        api.on.getAppRootInstance(payload => {
            payload.root = payload.app;
        });
        api.on.walkComponentTree((payload, ctx) => {
            payload.componentTreeData = tree_1.walkTree(payload.componentInstance, payload.filter, ctx);
        });
        api.on.walkComponentParents((payload, ctx) => {
            payload.parentInstances = tree_1.getComponentParents(payload.componentInstance, ctx);
        });
        api.on.inspectComponent(payload => {
            injectToUtils();
            payload.instanceData = data_1.getInstanceDetails(payload.componentInstance);
        });
        api.on.getComponentBounds(payload => {
            payload.bounds = el_1.getInstanceOrVnodeRect(payload.componentInstance);
        });
        api.on.getComponentName(payload => {
            const instance = payload.componentInstance;
            payload.name = instance.fnContext ? shared_utils_1.getComponentName(instance.fnOptions) : util_1.getInstanceName(instance);
        });
        api.on.getElementComponent(payload => {
            payload.componentInstance = el_1.findRelatedComponent(payload.element);
        });
        api.on.editComponentState(payload => {
            data_1.editState(payload);
        });
        api.on.getComponentRootElements(payload => {
            payload.rootElements = [payload.componentInstance.$el];
        });
        api.on.getComponentDevtoolsOptions(payload => {
            payload.options = payload.componentInstance.$options.devtools;
        });
        api.on.getComponentInstances(() => {
            console.warn('on.getComponentInstances is not implemented for Vue 2');
        });
    },
    setupApp(api, appRecord) {
        injectToUtils();
        const { Vue } = appRecord.options.meta;
        const app = appRecord.options.app;
        events_1.wrapVueForEvents(app, Vue, api.ctx);
        plugin_1.setupPlugin(api, app);
    }
};
function injectToUtils() {
    shared_utils_1.backendInjections.getCustomInstanceDetails = data_1.getCustomInstanceDetails;
    shared_utils_1.backendInjections.instanceMap = tree_1.instanceMap;
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 6132:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupPlugin = void 0;
const devtools_api_1 = __webpack_require__(2296);
const shared_utils_1 = __webpack_require__(1942);
let actionId = 0;
function setupPlugin(api, app) {
    const ROUTER_INSPECTOR_ID = 'vue2-router-inspector';
    const ROUTER_CHANGES_LAYER_ID = 'vue2-router-changes';
    const VUEX_INSPECTOR_ID = 'vue2-vuex-inspector';
    const VUEX_MUTATIONS_ID = 'vue2-vuex-mutations';
    const VUEX_ACTIONS_ID = 'vue2-vuex-actions';
    devtools_api_1.setupDevtoolsPlugin({
        app,
        id: 'org.vuejs.vue2-internal',
        label: 'Vue 2',
        homepage: 'https://vuejs.org/',
        logo: 'https://vuejs.org/images/icons/favicon-96x96.png'
    }, api => {
        // Vue Router
        if (app.$router) {
            const router = app.$router;
            // Inspector
            api.addInspector({
                id: ROUTER_INSPECTOR_ID,
                label: 'Routes',
                icon: 'book',
                treeFilterPlaceholder: 'Search routes'
            });
            api.on.getInspectorTree(payload => {
                if (payload.app === app && payload.inspectorId === ROUTER_INSPECTOR_ID) {
                    payload.rootNodes = router.options.routes.map(route => formatRouteNode(router, route, '', payload.filter)).filter(Boolean);
                }
            });
            api.on.getInspectorState(payload => {
                if (payload.app === app && payload.inspectorId === ROUTER_INSPECTOR_ID) {
                    const route = router.matcher.getRoutes().find(r => getPathId(r) === payload.nodeId);
                    if (route) {
                        payload.state = {
                            options: formatRouteData(route)
                        };
                    }
                }
            });
            // Timeline
            api.addTimelineLayer({
                id: ROUTER_CHANGES_LAYER_ID,
                label: 'Router Navigations',
                color: 0x40a8c4
            });
            router.afterEach((to, from) => {
                api.addTimelineEvent({
                    layerId: ROUTER_CHANGES_LAYER_ID,
                    event: {
                        time: Date.now(),
                        title: to.path,
                        data: {
                            from,
                            to
                        }
                    }
                });
                api.sendInspectorTree(ROUTER_INSPECTOR_ID);
            });
        }
        // Vuex
        if (app.$store) {
            const store = app.$store;
            api.addInspector({
                id: VUEX_INSPECTOR_ID,
                label: 'Vuex',
                icon: 'storage',
                treeFilterPlaceholder: 'Filter stores...'
            });
            api.on.getInspectorTree((payload) => {
                if (payload.app === app && payload.inspectorId === VUEX_INSPECTOR_ID) {
                    if (payload.filter) {
                        const nodes = [];
                        flattenStoreForInspectorTree(nodes, store._modules.root, payload.filter, '');
                        payload.rootNodes = nodes;
                    }
                    else {
                        payload.rootNodes = [
                            formatStoreForInspectorTree(store._modules.root, '')
                        ];
                    }
                }
            });
            api.on.getInspectorState((payload) => {
                if (payload.app === app && payload.inspectorId === VUEX_INSPECTOR_ID) {
                    const modulePath = payload.nodeId;
                    const module = getStoreModule(store._modules, modulePath);
                    // Access the getters prop to init getters cache (which is lazy)
                    // eslint-disable-next-line no-unused-expressions
                    module.context.getters;
                    payload.state = formatStoreForInspectorState(module, store._makeLocalGettersCache, modulePath);
                }
            });
            api.addTimelineLayer({
                id: VUEX_MUTATIONS_ID,
                label: 'Vuex Mutations',
                color: LIME_500
            });
            api.addTimelineLayer({
                id: VUEX_ACTIONS_ID,
                label: 'Vuex Actions',
                color: LIME_500
            });
            store.subscribe((mutation, state) => {
                api.sendInspectorState(VUEX_INSPECTOR_ID);
                const data = {};
                if (mutation.payload) {
                    data.payload = mutation.payload;
                }
                data.state = state;
                api.addTimelineEvent({
                    layerId: VUEX_MUTATIONS_ID,
                    event: {
                        time: Date.now(),
                        title: mutation.type,
                        data
                    }
                });
            }, { prepend: true });
            store.subscribeAction({
                before: (action, state) => {
                    const data = {};
                    if (action.payload) {
                        data.payload = action.payload;
                    }
                    action._id = actionId++;
                    action._time = Date.now();
                    data.state = state;
                    api.addTimelineEvent({
                        layerId: VUEX_ACTIONS_ID,
                        event: {
                            time: action._time,
                            title: action.type,
                            groupId: action._id,
                            subtitle: 'start',
                            data
                        }
                    });
                },
                after: (action, state) => {
                    const data = {};
                    const duration = Date.now() - action._time;
                    data.duration = {
                        _custom: {
                            type: 'duration',
                            display: `${duration}ms`,
                            tooltip: 'Action duration',
                            value: duration
                        }
                    };
                    if (action.payload) {
                        data.payload = action.payload;
                    }
                    data.state = state;
                    api.addTimelineEvent({
                        layerId: VUEX_ACTIONS_ID,
                        event: {
                            time: Date.now(),
                            title: action.type,
                            groupId: action._id,
                            subtitle: 'end',
                            data
                        }
                    });
                }
            }, { prepend: true });
        }
    });
}
exports.setupPlugin = setupPlugin;
/**
 * Extracted from tailwind palette
 */
const BLUE_600 = 0x2563eb;
const LIME_500 = 0x84cc16;
const CYAN_400 = 0x22d3ee;
const ORANGE_400 = 0xfb923c;
const WHITE = 0xffffff;
const DARK = 0x666666;
function formatRouteNode(router, route, parentPath, filter) {
    var _a, _b;
    const node = {
        id: parentPath + route.path,
        label: route.path,
        children: (_a = route.children) === null || _a === void 0 ? void 0 : _a.map(child => formatRouteNode(router, child, route.path, filter)).filter(Boolean),
        tags: []
    };
    if (filter && !node.id.includes(filter) && !((_b = node.children) === null || _b === void 0 ? void 0 : _b.length))
        return null;
    if (route.name != null) {
        node.tags.push({
            label: String(route.name),
            textColor: 0,
            backgroundColor: CYAN_400
        });
    }
    if (route.alias != null) {
        node.tags.push({
            label: 'alias',
            textColor: 0,
            backgroundColor: ORANGE_400
        });
    }
    const currentPath = router.currentRoute.matched.reduce((p, m) => p + m.path, '');
    if (node.id === currentPath) {
        node.tags.push({
            label: 'active',
            textColor: WHITE,
            backgroundColor: BLUE_600
        });
    }
    if (route.redirect) {
        node.tags.push({
            label: 'redirect: ' +
                (typeof route.redirect === 'string' ? route.redirect : 'Object'),
            textColor: WHITE,
            backgroundColor: DARK
        });
    }
    return node;
}
function formatRouteData(route) {
    const data = [];
    data.push({ key: 'path', value: route.path });
    if (route.redirect) {
        data.push({ key: 'redirect', value: route.redirect });
    }
    if (route.alias) {
        data.push({ key: 'alias', value: route.alias });
    }
    if (route.props) {
        data.push({ key: 'props', value: route.props });
    }
    if (route.name && route.name != null) {
        data.push({ key: 'name', value: route.name });
    }
    if (route.component) {
        const component = {};
        // if (route.component.__file) {
        //   component.file = route.component.__file
        // }
        if (route.component.template) {
            component.template = route.component.template;
        }
        if (route.component.props) {
            component.props = route.component.props;
        }
        if (!shared_utils_1.isEmptyObject(component)) {
            data.push({ key: 'component', value: component });
        }
    }
    return data;
}
function getPathId(routeMatcher) {
    let path = routeMatcher.path;
    if (routeMatcher.parent) {
        path = getPathId(routeMatcher.parent) + path;
    }
    return path;
}
const TAG_NAMESPACED = {
    label: 'namespaced',
    textColor: WHITE,
    backgroundColor: DARK
};
function formatStoreForInspectorTree(module, path) {
    return {
        id: path || 'root',
        // all modules end with a `/`, we want the last segment only
        // cart/ -> cart
        // nested/cart/ -> cart
        label: extractNameFromPath(path),
        tags: module.namespaced ? [TAG_NAMESPACED] : [],
        children: Object.keys(module._children).map((moduleName) => formatStoreForInspectorTree(module._children[moduleName], path + moduleName + '/'))
    };
}
function flattenStoreForInspectorTree(result, module, filter, path) {
    if (path.includes(filter)) {
        result.push({
            id: path || 'root',
            label: path.endsWith('/') ? path.slice(0, path.length - 1) : path || 'Root',
            tags: module.namespaced ? [TAG_NAMESPACED] : []
        });
    }
    Object.keys(module._children).forEach(moduleName => {
        flattenStoreForInspectorTree(result, module._children[moduleName], filter, path + moduleName + '/');
    });
}
function extractNameFromPath(path) {
    return path && path !== 'root' ? path.split('/').slice(-2, -1)[0] : 'Root';
}
function formatStoreForInspectorState(module, getters, path) {
    getters = path === 'root' ? getters : getters[path];
    const gettersKeys = Object.keys(getters);
    const storeState = {
        state: Object.keys(module.state).map((key) => ({
            key,
            editable: true,
            value: module.state[key]
        }))
    };
    if (gettersKeys.length) {
        storeState.getters = gettersKeys.map((key) => ({
            key: key.endsWith('/') ? extractNameFromPath(key) : key,
            editable: false,
            value: getters[key]
        }));
    }
    return storeState;
}
function getStoreModule(moduleMap, path) {
    const names = path.split('/').filter((n) => n);
    return names.reduce((module, moduleName, i) => {
        const child = module[moduleName];
        if (!child) {
            throw new Error(`Missing module "${moduleName}" for path "${path}".`);
        }
        return i === names.length - 1 ? child : child._children;
    }, path === 'root' ? moduleMap : moduleMap.root._children);
}
//# sourceMappingURL=plugin.js.map

/***/ }),

/***/ 5467:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCustomInstanceDetails = exports.editState = exports.getInstanceDetails = void 0;
const util_1 = __webpack_require__(1122);
const shared_utils_1 = __webpack_require__(1942);
const shared_data_1 = __importDefault(__webpack_require__(796));
/**
 * Get the detailed information of an inspected instance.
 */
async function getInstanceDetails(instance, ctx) {
    var _a;
    return {
        id: util_1.getUniqueComponentId(instance, ctx),
        name: util_1.getInstanceName(instance),
        file: (_a = instance.type) === null || _a === void 0 ? void 0 : _a.__file,
        state: await getInstanceState(instance)
    };
}
exports.getInstanceDetails = getInstanceDetails;
async function getInstanceState(instance) {
    return processProps(instance).concat(processState(instance), processSetupState(instance), processComputed(instance), processAttrs(instance), processProvide(instance), processInject(instance), processRefs(instance));
}
/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processProps(instance) {
    const propsData = [];
    const propDefinitions = instance.type.props;
    for (let key in instance.props) {
        const propDefinition = propDefinitions ? propDefinitions[key] : null;
        key = shared_utils_1.camelize(key);
        propsData.push({
            type: 'props',
            key,
            value: instance.props[key],
            meta: propDefinition ? {
                type: propDefinition.type ? getPropType(propDefinition.type) : 'any',
                required: !!propDefinition.required,
                ...propDefinition.default != null ? {
                    default: propDefinition.default.toString()
                } : {}
            } : {
                type: 'invalid'
            },
            editable: shared_data_1.default.editableProps
        });
    }
    return propsData;
}
const fnTypeRE = /^(?:function|class) (\w+)/;
/**
 * Convert prop type constructor to string.
 */
function getPropType(type) {
    const match = type.toString().match(fnTypeRE);
    return typeof type === 'function'
        ? (match && match[1]) || 'any'
        : 'any';
}
/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processState(instance) {
    const type = instance.type;
    const props = type.props;
    const getters = type.vuex &&
        type.vuex.getters;
    const computedDefs = type.computed;
    const data = {
        ...instance.data,
        ...instance.renderContext
    };
    return Object.keys(data)
        .filter(key => (!(props && key in props) &&
        !(getters && key in getters) &&
        !(computedDefs && key in computedDefs)))
        .map(key => ({
        key,
        type: 'data',
        value: data[key],
        editable: true
    }));
}
function processSetupState(instance) {
    const raw = instance.devtoolsRawSetupState || {};
    return Object.keys(instance.setupState)
        .map(key => ({
        key,
        type: 'setup',
        value: instance.setupState[key],
        ...getSetupStateExtra(raw[key])
    }));
}
function getSetupStateExtra(raw) {
    if (!raw)
        return {};
    const info = getSetupStateInfo(raw);
    const objectType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null;
    return {
        ...objectType ? { objectType } : {},
        ...raw.effect ? { raw: raw.effect.raw.toString() } : {},
        editable: (info.ref || info.computed || info.reactive) && !info.readonly
    };
}
function isRef(raw) {
    return !!raw.__v_isRef;
}
function isComputed(raw) {
    return isRef(raw) && !!raw.effect;
}
function isReactive(raw) {
    return !!raw.__v_isReactive;
}
function isReadOnly(raw) {
    return !!raw.__v_isReadonly;
}
function getSetupStateInfo(raw) {
    return {
        ref: isRef(raw),
        computed: isComputed(raw),
        reactive: isReactive(raw),
        readonly: isReadOnly(raw)
    };
}
/**
 * Process the computed properties of an instance.
 *
 * @param {Vue} instance
 * @return {Array}
 */
function processComputed(instance) {
    const type = instance.type;
    const computed = [];
    const defs = type.computed || {};
    // use for...in here because if 'computed' is not defined
    // on component, computed properties will be placed in prototype
    // and Object.keys does not include
    // properties from object's prototype
    for (const key in defs) {
        const def = defs[key];
        const type = typeof def === 'function' && def.vuex
            ? 'vuex bindings'
            : 'computed';
        // use try ... catch here because some computed properties may
        // throw error during its evaluation
        let computedProp = null;
        try {
            computedProp = {
                type,
                key,
                value: instance.proxy[key],
                editable: typeof def.set === 'function'
            };
        }
        catch (e) {
            computedProp = {
                type,
                key,
                value: '(error during evaluation)'
            };
        }
        computed.push(computedProp);
    }
    return computed;
}
function processAttrs(instance) {
    return Object.keys(instance.attrs)
        .map(key => ({
        type: 'attrs',
        key,
        value: instance.attrs[key]
    }));
}
function processProvide(instance) {
    return Object.keys(instance.provides)
        .map(key => ({
        type: 'provided',
        key,
        value: instance.provides[key]
    }));
}
function processInject(instance) {
    if (!instance.type || !instance.type.inject)
        return [];
    let keys = [];
    if (Array.isArray(instance.type.inject)) {
        keys = instance.type.inject.map(key => ({
            key,
            originalKey: key
        }));
    }
    else {
        keys = Object.keys(instance.type.inject).map(key => {
            const value = instance.type.inject[key];
            let originalKey;
            if (typeof value === 'string') {
                originalKey = value;
            }
            else {
                originalKey = value.from;
            }
            return {
                key,
                originalKey
            };
        });
    }
    return keys.map(({ key, originalKey }) => ({
        type: 'injected',
        key: originalKey && key !== originalKey ? `${originalKey} ➞ ${key}` : key,
        value: instance.ctx[key]
    }));
}
function processRefs(instance) {
    return Object.keys(instance.refs)
        .map(key => ({
        type: 'refs',
        key,
        value: instance.refs[key]
    }));
}
function editState({ componentInstance, path, state }, ctx) {
    let target;
    const targetPath = path.slice();
    if (Object.keys(componentInstance.props).includes(path[0])) {
        // Props
        target = componentInstance.props;
    }
    else if (Object.keys(componentInstance.devtoolsRawSetupState).includes(path[0])) {
        // Setup
        target = componentInstance.devtoolsRawSetupState;
        const currentValue = shared_utils_1.get(componentInstance.devtoolsRawSetupState, path);
        if (currentValue != null) {
            const info = getSetupStateInfo(currentValue);
            if (info.readonly)
                return;
            if (info.ref) {
                targetPath.splice(1, 0, 'value');
            }
        }
    }
    else {
        target = componentInstance.proxy;
    }
    if (target && targetPath) {
        shared_utils_1.set(target, targetPath, 'value' in state ? state.value : undefined, (obj, field, value) => {
            if (state.remove || state.newKey) {
                if (Array.isArray(obj)) {
                    obj.splice(field, 1);
                }
                else {
                    delete obj[field];
                }
            }
            if (!state.remove) {
                obj[state.newKey || field] = value;
            }
        });
    }
}
exports.editState = editState;
function reduceStateList(list) {
    if (!list.length) {
        return undefined;
    }
    return list.reduce((map, item) => {
        const key = item.type || 'data';
        const obj = map[key] = map[key] || {};
        obj[item.key] = item.value;
        return map;
    }, {});
}
function getCustomInstanceDetails(instance) {
    const state = getInstanceState(instance);
    return {
        _custom: {
            type: 'component',
            id: instance.__VUE_DEVTOOLS_UID__,
            display: util_1.getInstanceName(instance),
            tooltip: 'Component instance',
            value: reduceStateList(state),
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomInstanceDetails = getCustomInstanceDetails;
//# sourceMappingURL=data.js.map

/***/ }),

/***/ 4644:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getInstanceOrVnodeRect = exports.getRootElementsFromComponentInstance = exports.getComponentInstanceFromElement = void 0;
const shared_utils_1 = __webpack_require__(1942);
const util_1 = __webpack_require__(1122);
function getComponentInstanceFromElement(element) {
    return element.__vueParentComponent;
}
exports.getComponentInstanceFromElement = getComponentInstanceFromElement;
function getRootElementsFromComponentInstance(instance) {
    if (util_1.isFragment(instance)) {
        return getFragmentRootElements(instance.subTree);
    }
    return [instance.subTree.el];
}
exports.getRootElementsFromComponentInstance = getRootElementsFromComponentInstance;
function getFragmentRootElements(vnode) {
    if (!vnode.children)
        return [];
    const list = [];
    for (let i = 0, l = vnode.children.length; i < l; i++) {
        const childVnode = vnode.children[i];
        if (childVnode.component) {
            list.push(...getRootElementsFromComponentInstance(childVnode.component));
        }
        else if (childVnode.el) {
            list.push(childVnode.el);
        }
    }
    return list;
}
/**
 * Get the client rect for an instance.
 *
 * @param {Vue|Vnode} instance
 * @return {Object}
 */
function getInstanceOrVnodeRect(instance) {
    const el = instance.subTree.el;
    if (!shared_utils_1.isBrowser) {
        // @TODO: Find position from instance or a vnode (for functional components).
        return;
    }
    if (!shared_utils_1.inDoc(el)) {
        return;
    }
    if (util_1.isFragment(instance)) {
        return getFragmentRect(instance.subTree);
    }
    else if (el.nodeType === 1) {
        return el.getBoundingClientRect();
    }
}
exports.getInstanceOrVnodeRect = getInstanceOrVnodeRect;
function createRect() {
    const rect = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        get width() { return rect.right - rect.left; },
        get height() { return rect.bottom - rect.top; }
    };
    return rect;
}
function mergeRects(a, b) {
    if (!a.top || b.top < a.top) {
        a.top = b.top;
    }
    if (!a.bottom || b.bottom > a.bottom) {
        a.bottom = b.bottom;
    }
    if (!a.left || b.left < a.left) {
        a.left = b.left;
    }
    if (!a.right || b.right > a.right) {
        a.right = b.right;
    }
}
let range;
/**
 * Get the bounding rect for a text node using a Range.
 *
 * @param {Text} node
 * @return {Rect}
 */
function getTextRect(node) {
    if (!shared_utils_1.isBrowser)
        return;
    if (!range)
        range = document.createRange();
    range.selectNode(node);
    return range.getBoundingClientRect();
}
function getFragmentRect(vnode) {
    const rect = createRect();
    if (!vnode.children)
        return rect;
    for (let i = 0, l = vnode.children.length; i < l; i++) {
        const childVnode = vnode.children[i];
        let childRect;
        if (childVnode.component) {
            childRect = getInstanceOrVnodeRect(childVnode.component);
        }
        else if (childVnode.el) {
            const el = childVnode.el;
            if (el.nodeType === 1 || el.getBoundingClientRect) {
                childRect = el.getBoundingClientRect();
            }
            else if (el.nodeType === 3 && el.data.trim()) {
                childRect = getTextRect(el);
            }
        }
        if (childRect) {
            mergeRects(rect, childRect);
        }
    }
    return rect;
}
//# sourceMappingURL=el.js.map

/***/ }),

/***/ 2259:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ComponentFilter = void 0;
const shared_utils_1 = __webpack_require__(1942);
const util_1 = __webpack_require__(1122);
class ComponentFilter {
    constructor(filter) {
        this.filter = filter || '';
    }
    /**
     * Check if an instance is qualified.
     *
     * @param {Vue|Vnode} instance
     * @return {Boolean}
     */
    isQualified(instance) {
        const name = shared_utils_1.classify(instance.name || util_1.getInstanceName(instance)).toLowerCase();
        return name.indexOf(this.filter) > -1;
    }
}
exports.ComponentFilter = ComponentFilter;
//# sourceMappingURL=filter.js.map

/***/ }),

/***/ 8333:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ComponentWalker = void 0;
const util_1 = __webpack_require__(1122);
const filter_1 = __webpack_require__(2259);
const el_1 = __webpack_require__(4644);
class ComponentWalker {
    constructor(maxDepth, filter, ctx) {
        this.ctx = ctx;
        this.maxDepth = maxDepth;
        this.componentFilter = new filter_1.ComponentFilter(filter);
    }
    getComponentTree(instance) {
        this.captureIds = new Map();
        return this.findQualifiedChildren(instance, 0);
    }
    getComponentParents(instance) {
        this.captureIds = new Map();
        const parents = [];
        this.captureId(instance);
        let parent = instance;
        while ((parent = parent.parent)) {
            this.captureId(parent);
            parents.push(parent);
        }
        return parents;
    }
    /**
     * Find qualified children from a single instance.
     * If the instance itself is qualified, just return itself.
     * This is ok because [].concat works in both cases.
     *
     * @param {Vue|Vnode} instance
     * @return {Vue|Array}
     */
    async findQualifiedChildren(instance, depth) {
        var _a;
        if (this.componentFilter.isQualified(instance) && !((_a = instance.type.devtools) === null || _a === void 0 ? void 0 : _a.hide)) {
            return [await this.capture(instance, null, depth)];
        }
        else if (instance.subTree) {
            // TODO functional components
            return this.findQualifiedChildrenFromList(this.getInternalInstanceChildren(instance.subTree), depth);
        }
        else {
            return [];
        }
    }
    /**
     * Iterate through an array of instances and flatten it into
     * an array of qualified instances. This is a depth-first
     * traversal - e.g. if an instance is not matched, we will
     * recursively go deeper until a qualified child is found.
     *
     * @param {Array} instances
     * @return {Array}
     */
    async findQualifiedChildrenFromList(instances, depth) {
        instances = instances
            .filter(child => { var _a; return !util_1.isBeingDestroyed(child) && !((_a = child.type.devtools) === null || _a === void 0 ? void 0 : _a.hide); });
        if (!this.componentFilter.filter) {
            return Promise.all(instances.map((child, index, list) => this.capture(child, list, depth)));
        }
        else {
            return Array.prototype.concat.apply([], await Promise.all(instances.map(i => this.findQualifiedChildren(i, depth))));
        }
    }
    /**
     * Get children from a component instance.
     */
    getInternalInstanceChildren(subTree) {
        const list = [];
        if (subTree.component) {
            list.push(subTree.component);
        }
        if (subTree.suspense) {
            list.push(...this.getInternalInstanceChildren(subTree.suspense.activeBranch));
        }
        if (Array.isArray(subTree.children)) {
            subTree.children.forEach(childSubTree => {
                if (childSubTree.component) {
                    list.push(childSubTree.component);
                }
                else {
                    list.push(...this.getInternalInstanceChildren(childSubTree));
                }
            });
        }
        return list.filter(child => { var _a; return !util_1.isBeingDestroyed(child) && !((_a = child.type.devtools) === null || _a === void 0 ? void 0 : _a.hide); });
    }
    captureId(instance) {
        // instance.uid is not reliable in devtools as there
        // may be 2 roots with same uid which causes unexpected
        // behaviour
        const id = instance.__VUE_DEVTOOLS_UID__ != null ? instance.__VUE_DEVTOOLS_UID__ : util_1.getUniqueComponentId(instance, this.ctx);
        instance.__VUE_DEVTOOLS_UID__ = id;
        // Dedupe
        if (this.captureIds.has(id)) {
            return;
        }
        else {
            this.captureIds.set(id, undefined);
        }
        this.mark(instance);
        return id;
    }
    /**
     * Capture the meta information of an instance. (recursive)
     *
     * @param {Vue} instance
     * @return {Object}
     */
    async capture(instance, list, depth) {
        const id = this.captureId(instance);
        const name = util_1.getInstanceName(instance);
        const children = this.getInternalInstanceChildren(instance.subTree)
            .filter(child => !util_1.isBeingDestroyed(child));
        const treeNode = {
            uid: instance.uid,
            id,
            name,
            renderKey: util_1.getRenderKey(instance.vnode ? instance.vnode.key : null),
            inactive: !!instance.isDeactivated,
            hasChildren: !!children.length,
            children: [],
            isFragment: util_1.isFragment(instance),
            tags: []
        };
        // capture children
        if (depth < this.maxDepth) {
            treeNode.children = await Promise.all(children
                .map((child, index, list) => this.capture(child, list, depth + 1))
                .filter(Boolean));
        }
        // keep-alive
        if (instance.type.__isKeepAlive && instance.__v_cache) {
            const cachedComponents = Array.from(instance.__v_cache.values()).map((vnode) => vnode.component).filter(Boolean);
            for (const k in cachedComponents) {
                const child = cachedComponents[k];
                if (!children.includes(child)) {
                    const node = await this.capture(child, null, depth + 1);
                    if (node) {
                        node.inactive = true;
                        treeNode.children.push(node);
                    }
                }
            }
        }
        // record screen position to ensure correct ordering
        if ((!list || list.length > 1) && !instance._inactive) {
            const rect = el_1.getInstanceOrVnodeRect(instance);
            treeNode.positionTop = rect ? rect.positionTop : Infinity;
        }
        if (instance.suspense) {
            treeNode.tags.push({
                label: 'suspense',
                backgroundColor: 0xc5c4fc,
                textColor: 0xffffff
            });
        }
        return this.ctx.api.visitComponentTree(instance, treeNode, this.componentFilter.filter);
    }
    /**
     * Mark an instance as captured and store it in the instance map.
     *
     * @param {Vue} instance
     */
    mark(instance) {
        const instanceMap = this.ctx.currentAppRecord.instanceMap;
        if (!instanceMap.has(instance.__VUE_DEVTOOLS_UID__)) {
            instanceMap.set(instance.__VUE_DEVTOOLS_UID__, instance);
        }
    }
}
exports.ComponentWalker = ComponentWalker;
//# sourceMappingURL=tree.js.map

/***/ }),

/***/ 1122:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getComponentInstances = exports.getRenderKey = exports.getUniqueComponentId = exports.getInstanceName = exports.isFragment = exports.getAppRecord = exports.isBeingDestroyed = void 0;
const shared_utils_1 = __webpack_require__(1942);
const util_1 = __webpack_require__(7756);
function isBeingDestroyed(instance) {
    return instance._isBeingDestroyed || instance.isUnmounted;
}
exports.isBeingDestroyed = isBeingDestroyed;
function getAppRecord(instance) {
    if (instance.root) {
        return instance.appContext.app.__VUE_DEVTOOLS_APP_RECORD__;
    }
}
exports.getAppRecord = getAppRecord;
function isFragment(instance) {
    const appRecord = getAppRecord(instance);
    if (appRecord) {
        return appRecord.options.types.Fragment === instance.subTree.type;
    }
}
exports.isFragment = isFragment;
/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {String}
 */
function getInstanceName(instance) {
    const name = getComponentTypeName(instance.type || {});
    if (name)
        return name;
    return instance.root === instance
        ? 'Root'
        : 'Anonymous Component';
}
exports.getInstanceName = getInstanceName;
function getComponentTypeName(options) {
    const name = options.name || options._componentTag;
    if (name) {
        return name;
    }
    const file = options.__file; // injected by vue-loader
    if (file) {
        return shared_utils_1.classify(util_1.basename(file, '.vue'));
    }
}
/**
 * Returns a devtools unique id for instance.
 * @param {Vue} instance
 */
function getUniqueComponentId(instance, ctx) {
    const instanceId = instance === ctx.currentAppRecord.rootInstance ? 'root' : instance.uid;
    return `${ctx.currentAppRecord.id}:${instanceId}`;
}
exports.getUniqueComponentId = getUniqueComponentId;
function getRenderKey(value) {
    if (value == null)
        return;
    const type = typeof value;
    if (type === 'number') {
        return value;
    }
    else if (type === 'string') {
        return `'${value}'`;
    }
    else if (Array.isArray(value)) {
        return 'Array';
    }
    else {
        return 'Object';
    }
}
exports.getRenderKey = getRenderKey;
function getComponentInstances(app) {
    const appRecord = app.__VUE_DEVTOOLS_APP_RECORD__;
    const appId = appRecord.id.toString();
    return [...appRecord.instanceMap]
        .filter(([key]) => key.split(':')[0] === appId)
        .map(([, instance]) => instance); // eslint-disable-line comma-spacing
}
exports.getComponentInstances = getComponentInstances;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 2925:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.backend = void 0;
const app_backend_api_1 = __webpack_require__(860);
const tree_1 = __webpack_require__(8333);
const data_1 = __webpack_require__(5467);
const util_1 = __webpack_require__(1122);
const el_1 = __webpack_require__(4644);
const shared_utils_1 = __webpack_require__(1942);
exports.backend = {
    frameworkVersion: 3,
    availableFeatures: [
        app_backend_api_1.BuiltinBackendFeature.COMPONENTS
    ],
    setup(api) {
        api.on.getAppRecordName(payload => {
            if (payload.app._component) {
                payload.name = payload.app._component.name;
            }
        });
        api.on.getAppRootInstance(payload => {
            var _a, _b, _c, _d;
            if ((_b = (_a = payload.app._container) === null || _a === void 0 ? void 0 : _a._vnode) === null || _b === void 0 ? void 0 : _b.component) {
                payload.root = (_d = (_c = payload.app._container) === null || _c === void 0 ? void 0 : _c._vnode) === null || _d === void 0 ? void 0 : _d.component;
            }
        });
        api.on.walkComponentTree(async (payload, ctx) => {
            const walker = new tree_1.ComponentWalker(payload.maxDepth, payload.filter, ctx);
            payload.componentTreeData = await walker.getComponentTree(payload.componentInstance);
        });
        api.on.walkComponentParents((payload, ctx) => {
            const walker = new tree_1.ComponentWalker(0, null, ctx);
            payload.parentInstances = walker.getComponentParents(payload.componentInstance);
        });
        api.on.inspectComponent(async (payload, ctx) => {
            shared_utils_1.backendInjections.getCustomInstanceDetails = data_1.getCustomInstanceDetails;
            shared_utils_1.backendInjections.instanceMap = ctx.currentAppRecord.instanceMap;
            payload.instanceData = await data_1.getInstanceDetails(payload.componentInstance, ctx);
        });
        api.on.getComponentName(async (payload) => {
            payload.name = await util_1.getInstanceName(payload.componentInstance);
        });
        api.on.getComponentBounds(async (payload) => {
            payload.bounds = await el_1.getInstanceOrVnodeRect(payload.componentInstance);
        });
        api.on.getElementComponent(payload => {
            payload.componentInstance = el_1.getComponentInstanceFromElement(payload.element);
        });
        api.on.getComponentInstances(payload => {
            payload.componentInstances = util_1.getComponentInstances(payload.app);
        });
        api.on.getComponentRootElements(payload => {
            payload.rootElements = el_1.getRootElementsFromComponentInstance(payload.componentInstance);
        });
        api.on.editComponentState((payload, ctx) => {
            data_1.editState(payload, ctx);
        });
        api.on.getComponentDevtoolsOptions(payload => {
            payload.options = payload.componentInstance.type.devtools;
        });
        api.on.transformCall(payload => {
            if (payload.callName === shared_utils_1.HookEvents.COMPONENT_UPDATED) {
                const component = payload.inArgs[0];
                payload.outArgs = [
                    component.appContext.app,
                    component.uid,
                    component.parent ? component.parent.uid : undefined
                ];
            }
        });
        // @TODO
    }
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 7756:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.basename = exports.flatten = void 0;
const path_1 = __importDefault(__webpack_require__(1023));
function flatten(items) {
    return items.reduce((acc, item) => {
        if (item instanceof Array)
            acc.push(...flatten(item));
        else if (item)
            acc.push(item);
        return acc;
    }, []);
}
exports.flatten = flatten;
// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
function basename(filename, ext) {
    return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'), ext);
}
exports.basename = basename;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 7396:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCatchedGetters = exports.getCustomStoreDetails = exports.getCustomRouterDetails = exports.getCustomInstanceDetails = exports.getInstanceMap = exports.backendInjections = void 0;
exports.backendInjections = {
    instanceMap: new Map(),
    getCustomInstanceDetails: (() => ({}))
};
function getInstanceMap() {
    return exports.backendInjections.instanceMap;
}
exports.getInstanceMap = getInstanceMap;
function getCustomInstanceDetails(instance) {
    return exports.backendInjections.getCustomInstanceDetails(instance);
}
exports.getCustomInstanceDetails = getCustomInstanceDetails;
function getCustomRouterDetails(router) {
    return {
        _custom: {
            type: 'router',
            display: 'VueRouter',
            value: {
                options: router.options,
                currentRoute: router.currentRoute
            },
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomRouterDetails = getCustomRouterDetails;
function getCustomStoreDetails(store) {
    return {
        _custom: {
            type: 'store',
            display: 'Store',
            value: {
                state: store.state,
                getters: getCatchedGetters(store)
            },
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomStoreDetails = getCustomStoreDetails;
function getCatchedGetters(store) {
    const getters = {};
    const origGetters = store.getters || {};
    const keys = Object.keys(origGetters);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        Object.defineProperty(getters, key, {
            enumerable: true,
            get: () => {
                try {
                    return origGetters[key];
                }
                catch (e) {
                    return e;
                }
            }
        });
    }
    return getters;
}
exports.getCatchedGetters = getCatchedGetters;
//# sourceMappingURL=backend.js.map

/***/ }),

/***/ 4803:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Bridge = void 0;
const events_1 = __webpack_require__(2699);
const BATCH_DURATION = 100;
class Bridge extends events_1.EventEmitter {
    constructor(wall) {
        super();
        this.setMaxListeners(Infinity);
        this.wall = wall;
        wall.listen(messages => {
            if (Array.isArray(messages)) {
                messages.forEach(message => this._emit(message));
            }
            else {
                this._emit(messages);
            }
        });
        this._batchingQueue = [];
        this._sendingQueue = [];
        this._receivingQueue = [];
        this._sending = false;
        this._time = null;
    }
    send(event, payload) {
        if (Array.isArray(payload)) {
            const lastIndex = payload.length - 1;
            payload.forEach((chunk, index) => {
                this._send({
                    event,
                    _chunk: chunk,
                    last: index === lastIndex
                });
            });
            this._flush();
        }
        else if (this._time === null) {
            this._send([{ event, payload }]);
            this._time = Date.now();
        }
        else {
            this._batchingQueue.push({
                event,
                payload
            });
            const now = Date.now();
            if (now - this._time > BATCH_DURATION) {
                this._flush();
            }
            else {
                this._timer = setTimeout(() => this._flush(), BATCH_DURATION);
            }
        }
    }
    /**
     * Log a message to the devtools background page.
     */
    log(message) {
        this.send('log', message);
    }
    _flush() {
        if (this._batchingQueue.length)
            this._send(this._batchingQueue);
        clearTimeout(this._timer);
        this._batchingQueue = [];
        this._time = null;
    }
    // @TODO types
    _emit(message) {
        if (typeof message === 'string') {
            this.emit(message);
        }
        else if (message._chunk) {
            this._receivingQueue.push(message._chunk);
            if (message.last) {
                this.emit(message.event, this._receivingQueue);
                this._receivingQueue = [];
            }
        }
        else if (message.event) {
            this.emit(message.event, message.payload);
        }
    }
    // @TODO types
    _send(messages) {
        this._sendingQueue.push(messages);
        this._nextSend();
    }
    _nextSend() {
        if (!this._sendingQueue.length || this._sending)
            return;
        this._sending = true;
        const messages = this._sendingQueue.shift();
        try {
            this.wall.send(messages);
        }
        catch (err) {
            if (err.message === 'Message length exceeded maximum allowed length.') {
                this._sendingQueue.splice(0, 0, messages.map(message => [message]));
            }
        }
        this._sending = false;
        requestAnimationFrame(() => this._nextSend());
    }
}
exports.Bridge = Bridge;
//# sourceMappingURL=bridge.js.map

/***/ }),

/***/ 8490:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HookEvents = exports.BridgeSubscriptions = exports.BridgeEvents = exports.BuiltinTabs = void 0;
var BuiltinTabs;
(function (BuiltinTabs) {
    BuiltinTabs["COMPONENTS"] = "components";
    BuiltinTabs["TIMELINE"] = "timeline";
    BuiltinTabs["PLUGINS"] = "plugins";
    BuiltinTabs["SETTINGS"] = "settings";
})(BuiltinTabs = exports.BuiltinTabs || (exports.BuiltinTabs = {}));
var BridgeEvents;
(function (BridgeEvents) {
    // Misc
    BridgeEvents["TO_BACK_SUBSCRIBE"] = "b:subscribe";
    BridgeEvents["TO_BACK_UNSUBSCRIBE"] = "b:unsubscribe";
    /** Backend is ready */
    BridgeEvents["TO_FRONT_READY"] = "f:ready";
    /** Displays the "detected Vue" console log */
    BridgeEvents["TO_BACK_LOG_DETECTED_VUE"] = "b:log-detected-vue";
    /** Force refresh */
    BridgeEvents["TO_BACK_REFRESH"] = "b:refresh";
    /** Tab was switched */
    BridgeEvents["TO_BACK_TAB_SWITCH"] = "b:tab:switch";
    // Apps
    /** App was registered */
    BridgeEvents["TO_FRONT_APP_ADD"] = "f:app:add";
    /** Get app list */
    BridgeEvents["TO_BACK_APP_LIST"] = "b:app:list";
    BridgeEvents["TO_FRONT_APP_LIST"] = "f:app:list";
    BridgeEvents["TO_FRONT_APP_REMOVE"] = "f:app:remove";
    BridgeEvents["TO_BACK_APP_SELECT"] = "b:app:select";
    BridgeEvents["TO_FRONT_APP_SELECTED"] = "f:app:selected";
    // Components
    BridgeEvents["TO_BACK_COMPONENT_TREE"] = "b:component:tree";
    BridgeEvents["TO_FRONT_COMPONENT_TREE"] = "f:component:tree";
    BridgeEvents["TO_BACK_COMPONENT_SELECTED_DATA"] = "b:component:selected-data";
    BridgeEvents["TO_FRONT_COMPONENT_SELECTED_DATA"] = "f:component:selected-data";
    BridgeEvents["TO_BACK_COMPONENT_EXPAND"] = "b:component:expand";
    BridgeEvents["TO_FRONT_COMPONENT_EXPAND"] = "f:component:expand";
    BridgeEvents["TO_BACK_COMPONENT_SCROLL_TO"] = "b:component:scroll-to";
    BridgeEvents["TO_BACK_COMPONENT_FILTER"] = "b:component:filter";
    BridgeEvents["TO_BACK_COMPONENT_MOUSE_OVER"] = "b:component:mouse-over";
    BridgeEvents["TO_BACK_COMPONENT_MOUSE_OUT"] = "b:component:mouse-out";
    BridgeEvents["TO_BACK_COMPONENT_CONTEXT_MENU_TARGET"] = "b:component:context-menu-target";
    BridgeEvents["TO_BACK_COMPONENT_EDIT_STATE"] = "b:component:edit-state";
    BridgeEvents["TO_BACK_COMPONENT_PICK"] = "b:component:pick";
    BridgeEvents["TO_FRONT_COMPONENT_PICK"] = "f:component:pick";
    BridgeEvents["TO_BACK_COMPONENT_PICK_CANCELED"] = "b:component:pick-canceled";
    BridgeEvents["TO_FRONT_COMPONENT_PICK_CANCELED"] = "f:component:pick-canceled";
    BridgeEvents["TO_BACK_COMPONENT_INSPECT_DOM"] = "b:component:inspect-dom";
    BridgeEvents["TO_FRONT_COMPONENT_INSPECT_DOM"] = "f:component:inspect-dom";
    // Timeline
    BridgeEvents["TO_FRONT_TIMELINE_EVENT"] = "f:timeline:event";
    BridgeEvents["TO_BACK_TIMELINE_LAYER_LIST"] = "b:timeline:layer-list";
    BridgeEvents["TO_FRONT_TIMELINE_LAYER_LIST"] = "f:timeline:layer-list";
    BridgeEvents["TO_FRONT_TIMELINE_LAYER_ADD"] = "f:timeline:layer-add";
    BridgeEvents["TO_BACK_TIMELINE_SHOW_SCREENSHOT"] = "b:timeline:show-screenshot";
    BridgeEvents["TO_BACK_TIMELINE_CLEAR"] = "b:timeline:clear";
    BridgeEvents["TO_BACK_TIMELINE_EVENT_DATA"] = "b:timeline:event-data";
    BridgeEvents["TO_FRONT_TIMELINE_EVENT_DATA"] = "f:timeline:event-data";
    // Plugins
    BridgeEvents["TO_BACK_DEVTOOLS_PLUGIN_LIST"] = "b:devtools-plugin:list";
    BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_LIST"] = "f:devtools-plugin:list";
    BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_ADD"] = "f:devtools-plugin:add";
    // Custom inspectors
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_LIST"] = "b:custom-inspector:list";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_LIST"] = "f:custom-inspector:list";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_ADD"] = "f:custom-inspector:add";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_TREE"] = "b:custom-inspector:tree";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_TREE"] = "f:custom-inspector:tree";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_STATE"] = "b:custom-inspector:state";
    BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_STATE"] = "f:custom-inspector:state";
    BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE"] = "b:custom-inspector:edit-state";
})(BridgeEvents = exports.BridgeEvents || (exports.BridgeEvents = {}));
var BridgeSubscriptions;
(function (BridgeSubscriptions) {
    BridgeSubscriptions["SELECTED_COMPONENT_DATA"] = "component:selected-data";
    BridgeSubscriptions["COMPONENT_TREE"] = "component:tree";
})(BridgeSubscriptions = exports.BridgeSubscriptions || (exports.BridgeSubscriptions = {}));
var HookEvents;
(function (HookEvents) {
    HookEvents["INIT"] = "init";
    HookEvents["APP_INIT"] = "app:init";
    HookEvents["APP_ADD"] = "app:add";
    HookEvents["APP_UNMOUNT"] = "app:unmount";
    HookEvents["COMPONENT_UPDATED"] = "component:updated";
    HookEvents["COMPONENT_ADDED"] = "component:added";
    HookEvents["COMPONENT_REMOVED"] = "component:removed";
    HookEvents["COMPONENT_EMIT"] = "component:emit";
    HookEvents["COMPONENT_HIGHLIGHT"] = "component:highlight";
    HookEvents["COMPONENT_UNHIGHLIGHT"] = "component:unhighlight";
    HookEvents["SETUP_DEVTOOLS_PLUGIN"] = "devtools-plugin:setup";
    HookEvents["TIMELINE_LAYER_ADDED"] = "timeline:layer-added";
    HookEvents["TIMELINE_EVENT_ADDED"] = "timeline:event-added";
    HookEvents["CUSTOM_INSPECTOR_ADD"] = "custom-inspector:add";
    HookEvents["CUSTOM_INSPECTOR_SEND_TREE"] = "custom-inspector:send-tree";
    HookEvents["CUSTOM_INSPECTOR_SEND_STATE"] = "custom-inspector:send-state";
    /**
     * @deprecated
     */
    HookEvents["FLUSH"] = "flush";
})(HookEvents = exports.HookEvents || (exports.HookEvents = {}));
//# sourceMappingURL=consts.js.map

/***/ }),

/***/ 8585:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initEnv = exports.keys = exports.isLinux = exports.isMac = exports.isWindows = exports.isFirefox = exports.isChrome = exports.target = exports.isBrowser = void 0;
exports.isBrowser = typeof navigator !== 'undefined';
exports.target = exports.isBrowser
    ? window
    : typeof __webpack_require__.g !== 'undefined'
        ? __webpack_require__.g
        : {};
exports.isChrome = typeof exports.target.chrome !== 'undefined' && !!exports.target.chrome.devtools;
exports.isFirefox = exports.isBrowser && navigator.userAgent.indexOf('Firefox') > -1;
exports.isWindows = exports.isBrowser && navigator.platform.indexOf('Win') === 0;
exports.isMac = exports.isBrowser && navigator.platform === 'MacIntel';
exports.isLinux = exports.isBrowser && navigator.platform.indexOf('Linux') === 0;
exports.keys = {
    ctrl: exports.isMac ? '&#8984;' : 'Ctrl',
    shift: 'Shift',
    alt: exports.isMac ? '&#8997;' : 'Alt',
    del: 'Del',
    enter: 'Enter',
    esc: 'Esc'
};
function initEnv(Vue) {
    if (Vue.prototype.hasOwnProperty('$isChrome'))
        return;
    Object.defineProperties(Vue.prototype, {
        $isChrome: { get: () => exports.isChrome },
        $isFirefox: { get: () => exports.isFirefox },
        $isWindows: { get: () => exports.isWindows },
        $isMac: { get: () => exports.isMac },
        $isLinux: { get: () => exports.isLinux },
        $keys: { get: () => exports.keys }
    });
    if (exports.isWindows)
        document.body.classList.add('platform-windows');
    if (exports.isMac)
        document.body.classList.add('platform-mac');
    if (exports.isLinux)
        document.body.classList.add('platform-linux');
}
exports.initEnv = initEnv;
//# sourceMappingURL=env.js.map

/***/ }),

/***/ 1942:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(7396), exports);
__exportStar(__webpack_require__(4803), exports);
__exportStar(__webpack_require__(8490), exports);
__exportStar(__webpack_require__(8585), exports);
__exportStar(__webpack_require__(8541), exports);
__exportStar(__webpack_require__(796), exports);
__exportStar(__webpack_require__(2985), exports);
__exportStar(__webpack_require__(6611), exports);
__exportStar(__webpack_require__(192), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 8541:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setPluginPermission = exports.hasPluginPermission = exports.PluginPermission = void 0;
const shared_data_1 = __importDefault(__webpack_require__(796));
var PluginPermission;
(function (PluginPermission) {
    PluginPermission["ENABLED"] = "enabled";
    PluginPermission["COMPONENTS"] = "components";
    PluginPermission["CUSTOM_INSPECTOR"] = "custom-inspector";
    PluginPermission["TIMELINE"] = "timeline";
})(PluginPermission = exports.PluginPermission || (exports.PluginPermission = {}));
function hasPluginPermission(pluginId, permission) {
    const result = shared_data_1.default.pluginPermissions[`${pluginId}:${permission}`];
    if (result == null)
        return true;
    return !!result;
}
exports.hasPluginPermission = hasPluginPermission;
function setPluginPermission(pluginId, permission, active) {
    shared_data_1.default.pluginPermissions = {
        ...shared_data_1.default.pluginPermissions,
        [`${pluginId}:${permission}`]: active
    };
}
exports.setPluginPermission = setPluginPermission;
//# sourceMappingURL=plugin-permissions.js.map

/***/ }),

/***/ 796:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.watchSharedData = exports.destroySharedData = exports.onSharedDataInit = exports.initSharedData = void 0;
const storage_1 = __webpack_require__(2985);
const env_1 = __webpack_require__(8585);
// Initial state
const internalSharedData = {
    openInEditorHost: '/',
    componentNameStyle: 'class',
    theme: 'auto',
    displayDensity: 'low',
    timeFormat: 'default',
    recordVuex: true,
    cacheVuexSnapshotsEvery: 50,
    cacheVuexSnapshotsLimit: 10,
    snapshotLoading: false,
    recordPerf: false,
    editableProps: false,
    logDetected: true,
    vuexNewBackend: false,
    vuexAutoload: false,
    vuexGroupGettersByModule: true,
    showMenuScrollTip: true,
    timelineTimeGrid: true,
    timelineScreenshots: true,
    menuStepScrolling: env_1.isMac,
    pluginPermissions: {}
};
const persisted = [
    'componentNameStyle',
    'theme',
    'displayDensity',
    'recordVuex',
    'editableProps',
    'logDetected',
    'vuexNewBackend',
    'vuexAutoload',
    'vuexGroupGettersByModule',
    'timeFormat',
    'showMenuScrollTip',
    'timelineTimeGrid',
    'timelineScreenshots',
    'menuStepScrolling',
    'pluginPermissions'
];
const storageVersion = '6.0.0-alpha.1';
// ---- INTERNALS ---- //
let bridge;
// List of fields to persist to storage (disabled if 'false')
// This should be unique to each shared data client to prevent conflicts
let persist = false;
let data;
let initRetryInterval;
let initRetryCount = 0;
const initCbs = [];
function initSharedData(params) {
    return new Promise((resolve) => {
        // Mandatory params
        bridge = params.bridge;
        persist = !!params.persist;
        if (persist) {
            if (false)
                {}
            // Load persisted fields
            persisted.forEach(key => {
                const value = storage_1.getStorage(`vue-devtools-${storageVersion}:shared-data:${key}`);
                if (value !== null) {
                    internalSharedData[key] = value;
                }
            });
            bridge.on('shared-data:load', () => {
                // Send all fields
                Object.keys(internalSharedData).forEach(key => {
                    sendValue(key, internalSharedData[key]);
                });
                bridge.send('shared-data:load-complete');
            });
            bridge.on('shared-data:init-complete', () => {
                if (false)
                    {}
                clearInterval(initRetryInterval);
                resolve();
            });
            bridge.send('shared-data:master-init-waiting');
            // In case backend init is executed after frontend
            bridge.on('shared-data:slave-init-waiting', () => {
                bridge.send('shared-data:master-init-waiting');
            });
            initRetryCount = 0;
            initRetryInterval = setInterval(() => {
                if (false)
                    {}
                bridge.send('shared-data:master-init-waiting');
                initRetryCount++;
                if (initRetryCount > 30) {
                    clearInterval(initRetryInterval);
                    console.error('[shared data] Master init failed');
                }
            }, 2000);
        }
        else {
            if (false)
                {}
            bridge.on('shared-data:master-init-waiting', () => {
                if (false)
                    {}
                // Load all persisted shared data
                bridge.send('shared-data:load');
                bridge.once('shared-data:load-complete', () => {
                    if (false)
                        {}
                    bridge.send('shared-data:init-complete');
                    resolve();
                });
            });
            bridge.send('shared-data:slave-init-waiting');
        }
        data = {
            ...internalSharedData
        };
        if (params.Vue) {
            data = params.Vue.observable(data);
        }
        // Update value from other shared data clients
        bridge.on('shared-data:set', ({ key, value }) => {
            setValue(key, value);
        });
        initCbs.forEach(cb => cb());
    });
}
exports.initSharedData = initSharedData;
function onSharedDataInit(cb) {
    initCbs.push(cb);
    return () => {
        const index = initCbs.indexOf(cb);
        if (index !== -1)
            initCbs.splice(index, 1);
    };
}
exports.onSharedDataInit = onSharedDataInit;
function destroySharedData() {
    bridge.removeAllListeners('shared-data:set');
    watchers = {};
}
exports.destroySharedData = destroySharedData;
let watchers = {};
function setValue(key, value) {
    // Storage
    if (persist && persisted.includes(key)) {
        storage_1.setStorage(`vue-devtools-${storageVersion}:shared-data:${key}`, value);
    }
    const oldValue = data[key];
    data[key] = value;
    const handlers = watchers[key];
    if (handlers) {
        handlers.forEach(h => h(value, oldValue));
    }
    // Validate Proxy set trap
    return true;
}
function sendValue(key, value) {
    bridge && bridge.send('shared-data:set', {
        key,
        value
    });
}
function watchSharedData(prop, handler) {
    const list = watchers[prop] || (watchers[prop] = []);
    list.push(handler);
    return () => {
        const index = list.indexOf(handler);
        if (index !== -1)
            list.splice(index, 1);
    };
}
exports.watchSharedData = watchSharedData;
const proxy = {};
Object.keys(internalSharedData).forEach(key => {
    Object.defineProperty(proxy, key, {
        configurable: false,
        get: () => data[key],
        set: (value) => {
            sendValue(key, value);
            setValue(key, value);
        }
    });
});
exports.default = proxy;
//# sourceMappingURL=shared-data.js.map

/***/ }),

/***/ 2985:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.clearStorage = exports.removeStorage = exports.setStorage = exports.getStorage = exports.initStorage = void 0;
const env_1 = __webpack_require__(8585);
// If we can, we use the browser extension API to store data
// it's async though, so we synchronize changes from an intermediate
// storageData object
const useStorage = typeof env_1.target.chrome !== 'undefined' && typeof env_1.target.chrome.storage !== 'undefined';
let storageData = null;
function initStorage() {
    return new Promise((resolve) => {
        if (useStorage) {
            env_1.target.chrome.storage.local.get(null, result => {
                storageData = result;
                resolve();
            });
        }
        else {
            storageData = {};
            resolve();
        }
    });
}
exports.initStorage = initStorage;
function getStorage(key, defaultValue = null) {
    checkStorage();
    if (useStorage) {
        return getDefaultValue(storageData[key], defaultValue);
    }
    else {
        try {
            return getDefaultValue(JSON.parse(localStorage.getItem(key)), defaultValue);
        }
        catch (e) { }
    }
}
exports.getStorage = getStorage;
function setStorage(key, val) {
    checkStorage();
    if (useStorage) {
        storageData[key] = val;
        env_1.target.chrome.storage.local.set({ [key]: val });
    }
    else {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        }
        catch (e) { }
    }
}
exports.setStorage = setStorage;
function removeStorage(key) {
    checkStorage();
    if (useStorage) {
        delete storageData[key];
        env_1.target.chrome.storage.local.remove([key]);
    }
    else {
        try {
            localStorage.removeItem(key);
        }
        catch (e) { }
    }
}
exports.removeStorage = removeStorage;
function clearStorage() {
    checkStorage();
    if (useStorage) {
        storageData = {};
        env_1.target.chrome.storage.local.clear();
    }
    else {
        try {
            localStorage.clear();
        }
        catch (e) { }
    }
}
exports.clearStorage = clearStorage;
function checkStorage() {
    if (!storageData) {
        throw new Error('Storage wasn\'t initialized with \'init()\'');
    }
}
function getDefaultValue(value, defaultValue) {
    if (value == null) {
        return defaultValue;
    }
    return value;
}
//# sourceMappingURL=storage.js.map

/***/ }),

/***/ 6611:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringifyStrictCircularAutoChunks = exports.parseCircularAutoChunks = exports.stringifyCircularAutoChunks = void 0;
const MAX_SERIALIZED_SIZE = 512 * 1024; // 1MB
function encode(data, replacer, list, seen) {
    let stored, key, value, i, l;
    const seenIndex = seen.get(data);
    if (seenIndex != null) {
        return seenIndex;
    }
    const index = list.length;
    const proto = Object.prototype.toString.call(data);
    if (proto === '[object Object]') {
        stored = {};
        seen.set(data, index);
        list.push(stored);
        const keys = Object.keys(data);
        for (i = 0, l = keys.length; i < l; i++) {
            key = keys[i];
            value = data[key];
            if (replacer)
                value = replacer.call(data, key, value);
            stored[key] = encode(value, replacer, list, seen);
        }
    }
    else if (proto === '[object Array]') {
        stored = [];
        seen.set(data, index);
        list.push(stored);
        for (i = 0, l = data.length; i < l; i++) {
            value = data[i];
            if (replacer)
                value = replacer.call(data, i, value);
            stored[i] = encode(value, replacer, list, seen);
        }
    }
    else {
        list.push(data);
    }
    return index;
}
function decode(list, reviver) {
    let i = list.length;
    let j, k, data, key, value, proto;
    while (i--) {
        data = list[i];
        proto = Object.prototype.toString.call(data);
        if (proto === '[object Object]') {
            const keys = Object.keys(data);
            for (j = 0, k = keys.length; j < k; j++) {
                key = keys[j];
                value = list[data[key]];
                if (reviver)
                    value = reviver.call(data, key, value);
                data[key] = value;
            }
        }
        else if (proto === '[object Array]') {
            for (j = 0, k = data.length; j < k; j++) {
                value = list[data[j]];
                if (reviver)
                    value = reviver.call(data, j, value);
                data[j] = value;
            }
        }
    }
}
function stringifyCircularAutoChunks(data, replacer = null, space = null) {
    let result;
    try {
        result = arguments.length === 1
            ? JSON.stringify(data)
            // @ts-ignore
            : JSON.stringify(data, replacer, space);
    }
    catch (e) {
        result = stringifyStrictCircularAutoChunks(data, replacer, space);
    }
    if (result.length > MAX_SERIALIZED_SIZE) {
        const chunkCount = Math.ceil(result.length / MAX_SERIALIZED_SIZE);
        const chunks = [];
        for (let i = 0; i < chunkCount; i++) {
            chunks.push(result.slice(i * MAX_SERIALIZED_SIZE, (i + 1) * MAX_SERIALIZED_SIZE));
        }
        return chunks;
    }
    return result;
}
exports.stringifyCircularAutoChunks = stringifyCircularAutoChunks;
function parseCircularAutoChunks(data, reviver = null) {
    if (Array.isArray(data)) {
        data = data.join('');
    }
    const hasCircular = /^\s/.test(data);
    if (!hasCircular) {
        return arguments.length === 1
            ? JSON.parse(data)
            // @ts-ignore
            : JSON.parse(data, reviver);
    }
    else {
        const list = JSON.parse(data);
        decode(list, reviver);
        return list[0];
    }
}
exports.parseCircularAutoChunks = parseCircularAutoChunks;
function stringifyStrictCircularAutoChunks(data, replacer = null, space = null) {
    const list = [];
    encode(data, replacer, list, new Map());
    return space
        ? ' ' + JSON.stringify(list, null, space)
        : ' ' + JSON.stringify(list);
}
exports.stringifyStrictCircularAutoChunks = stringifyStrictCircularAutoChunks;
//# sourceMappingURL=transfer.js.map

/***/ }),

/***/ 192:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isEmptyObject = exports.copyToClipboard = exports.escape = exports.openInEditor = exports.focusInput = exports.scrollIntoView = exports.has = exports.get = exports.set = exports.sortByKey = exports.searchDeepInObject = exports.isPlainObject = exports.parse = exports.getCustomRefDetails = exports.getCustomFunctionDetails = exports.getCustomComponentDefinitionDetails = exports.getComponentName = exports.reviveSet = exports.getCustomSetDetails = exports.reviveMap = exports.getCustomMapDetails = exports.stringify = exports.specialTokenToString = exports.MAX_ARRAY_SIZE = exports.MAX_STRING_SIZE = exports.SPECIAL_TOKENS = exports.NAN = exports.NEGATIVE_INFINITY = exports.INFINITY = exports.UNDEFINED = exports.inDoc = exports.getComponentDisplayName = exports.kebabize = exports.camelize = exports.classify = void 0;
const path_1 = __importDefault(__webpack_require__(1023));
const transfer_1 = __webpack_require__(6611);
const backend_1 = __webpack_require__(7396);
const shared_data_1 = __importDefault(__webpack_require__(796));
const env_1 = __webpack_require__(8585);
function cached(fn) {
    const cache = Object.create(null);
    return function cachedFn(str) {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    };
}
const classifyRE = /(?:^|[-_/])(\w)/g;
exports.classify = cached((str) => {
    return str && str.replace(classifyRE, toUpper);
});
const camelizeRE = /-(\w)/g;
exports.camelize = cached((str) => {
    return str.replace(camelizeRE, toUpper);
});
const kebabizeRE = /([a-z0-9])([A-Z])/g;
exports.kebabize = cached((str) => {
    return str && str
        .replace(kebabizeRE, (_, lowerCaseCharacter, upperCaseLetter) => {
        return `${lowerCaseCharacter}-${upperCaseLetter}`;
    })
        .toLowerCase();
});
function toUpper(_, c) {
    return c ? c.toUpperCase() : '';
}
function getComponentDisplayName(originalName, style = 'class') {
    switch (style) {
        case 'class':
            return exports.classify(originalName);
        case 'kebab':
            return exports.kebabize(originalName);
        case 'original':
        default:
            return originalName;
    }
}
exports.getComponentDisplayName = getComponentDisplayName;
function inDoc(node) {
    if (!node)
        return false;
    const doc = node.ownerDocument.documentElement;
    const parent = node.parentNode;
    return doc === node ||
        doc === parent ||
        !!(parent && parent.nodeType === 1 && (doc.contains(parent)));
}
exports.inDoc = inDoc;
/**
 * Stringify/parse data using CircularJSON.
 */
exports.UNDEFINED = '__vue_devtool_undefined__';
exports.INFINITY = '__vue_devtool_infinity__';
exports.NEGATIVE_INFINITY = '__vue_devtool_negative_infinity__';
exports.NAN = '__vue_devtool_nan__';
exports.SPECIAL_TOKENS = {
    true: true,
    false: false,
    undefined: exports.UNDEFINED,
    null: null,
    '-Infinity': exports.NEGATIVE_INFINITY,
    Infinity: exports.INFINITY,
    NaN: exports.NAN
};
exports.MAX_STRING_SIZE = 10000;
exports.MAX_ARRAY_SIZE = 5000;
function specialTokenToString(value) {
    if (value === null) {
        return 'null';
    }
    else if (value === exports.UNDEFINED) {
        return 'undefined';
    }
    else if (value === exports.NAN) {
        return 'NaN';
    }
    else if (value === exports.INFINITY) {
        return 'Infinity';
    }
    else if (value === exports.NEGATIVE_INFINITY) {
        return '-Infinity';
    }
    return false;
}
exports.specialTokenToString = specialTokenToString;
/**
 * Needed to prevent stack overflow
 * while replacing complex objects
 * like components because we create
 * new objects with the CustomValue API
 * (.i.e `{ _custom: { ... } }`)
 */
class EncodeCache {
    constructor() {
        this.map = new Map();
    }
    /**
     * Returns a result unique to each input data
     * @param {*} data Input data
     * @param {*} factory Function used to create the unique result
     */
    cache(data, factory) {
        const cached = this.map.get(data);
        if (cached) {
            return cached;
        }
        else {
            const result = factory(data);
            this.map.set(data, result);
            return result;
        }
    }
    clear() {
        this.map.clear();
    }
}
const encodeCache = new EncodeCache();
function stringify(data) {
    // Create a fresh cache for each serialization
    encodeCache.clear();
    return transfer_1.stringifyCircularAutoChunks(data, replacer);
}
exports.stringify = stringify;
function replacer(key) {
    // @ts-ignore
    const val = this[key];
    const type = typeof val;
    if (Array.isArray(val)) {
        const l = val.length;
        if (l > exports.MAX_ARRAY_SIZE) {
            return {
                _isArray: true,
                length: l,
                items: val.slice(0, exports.MAX_ARRAY_SIZE)
            };
        }
        return val;
    }
    else if (typeof val === 'string') {
        if (val.length > exports.MAX_STRING_SIZE) {
            return val.substr(0, exports.MAX_STRING_SIZE) + `... (${(val.length)} total length)`;
        }
        else {
            return val;
        }
    }
    else if (type === 'undefined') {
        return exports.UNDEFINED;
    }
    else if (val === Infinity) {
        return exports.INFINITY;
    }
    else if (val === -Infinity) {
        return exports.NEGATIVE_INFINITY;
    }
    else if (type === 'function') {
        return getCustomFunctionDetails(val);
    }
    else if (type === 'symbol') {
        return `[native Symbol ${Symbol.prototype.toString.call(val)}]`;
    }
    else if (val !== null && type === 'object') {
        const proto = Object.prototype.toString.call(val);
        if (proto === '[object Map]') {
            return encodeCache.cache(val, () => getCustomMapDetails(val));
        }
        else if (proto === '[object Set]') {
            return encodeCache.cache(val, () => getCustomSetDetails(val));
        }
        else if (proto === '[object RegExp]') {
            // special handling of native type
            return `[native RegExp ${RegExp.prototype.toString.call(val)}]`;
        }
        else if (proto === '[object Date]') {
            return `[native Date ${Date.prototype.toString.call(val)}]`;
        }
        else if (proto === '[object Error]') {
            return `[native Error ${val.message}]`;
        }
        else if (val.state && val._vm) {
            return encodeCache.cache(val, () => backend_1.getCustomStoreDetails(val));
        }
        else if (val.constructor && val.constructor.name === 'VueRouter') {
            return encodeCache.cache(val, () => backend_1.getCustomRouterDetails(val));
        }
        else if (val._isVue) {
            return encodeCache.cache(val, () => backend_1.getCustomInstanceDetails(val));
        }
        else if (typeof val.render === 'function') {
            return encodeCache.cache(val, () => getCustomComponentDefinitionDetails(val));
        }
        else if (val.constructor && val.constructor.name === 'VNode') {
            return `[native VNode <${val.tag}>]`;
        }
    }
    else if (Number.isNaN(val)) {
        return exports.NAN;
    }
    return sanitize(val);
}
function getCustomMapDetails(val) {
    const list = [];
    val.forEach((value, key) => list.push({
        key,
        value
    }));
    return {
        _custom: {
            type: 'map',
            display: 'Map',
            value: list,
            readOnly: true,
            fields: {
                abstract: true
            }
        }
    };
}
exports.getCustomMapDetails = getCustomMapDetails;
function reviveMap(val) {
    const result = new Map();
    const list = val._custom.value;
    for (let i = 0; i < list.length; i++) {
        const { key, value } = list[i];
        result.set(key, reviver(null, value));
    }
    return result;
}
exports.reviveMap = reviveMap;
function getCustomSetDetails(val) {
    const list = Array.from(val);
    return {
        _custom: {
            type: 'set',
            display: `Set[${list.length}]`,
            value: list,
            readOnly: true
        }
    };
}
exports.getCustomSetDetails = getCustomSetDetails;
function reviveSet(val) {
    const result = new Set();
    const list = val._custom.value;
    for (let i = 0; i < list.length; i++) {
        const value = list[i];
        result.add(reviver(null, value));
    }
    return result;
}
exports.reviveSet = reviveSet;
// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
function basename(filename, ext) {
    return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'), ext);
}
function getComponentName(options) {
    const name = options.name || options._componentTag;
    if (name) {
        return name;
    }
    const file = options.__file; // injected by vue-loader
    if (file) {
        return exports.classify(basename(file, '.vue'));
    }
}
exports.getComponentName = getComponentName;
function getCustomComponentDefinitionDetails(def) {
    let display = getComponentName(def);
    if (display) {
        if (def.name && def.__file) {
            display += ` <span>(${def.__file})</span>`;
        }
    }
    else {
        display = '<i>Unknown Component</i>';
    }
    return {
        _custom: {
            type: 'component-definition',
            display,
            tooltip: 'Component definition',
            ...def.__file ? {
                file: def.__file
            } : {}
        }
    };
}
exports.getCustomComponentDefinitionDetails = getCustomComponentDefinitionDetails;
function getCustomFunctionDetails(func) {
    let string = '';
    let matches = null;
    try {
        string = Function.prototype.toString.call(func);
        matches = String.prototype.match.call(string, /\([\s\S]*?\)/);
    }
    catch (e) {
        // Func is probably a Proxy, which can break Function.prototype.toString()
    }
    // Trim any excess whitespace from the argument string
    const match = matches && matches[0];
    const args = typeof match === 'string'
        ? `(${match.substr(1, match.length - 2).split(',').map(a => a.trim()).join(', ')})` : '(?)';
    const name = typeof func.name === 'string' ? func.name : '';
    return {
        _custom: {
            type: 'function',
            display: `<span>ƒ</span> ${escape(name)}${args}`
        }
    };
}
exports.getCustomFunctionDetails = getCustomFunctionDetails;
function getCustomRefDetails(instance, key, ref) {
    let value;
    if (Array.isArray(ref)) {
        value = ref.map((r) => getCustomRefDetails(instance, key, r)).map(data => data.value);
    }
    else {
        let name;
        if (ref._isVue) {
            name = getComponentName(ref.$options);
        }
        else {
            name = ref.tagName.toLowerCase();
        }
        value = {
            _custom: {
                display: `&lt;${name}` +
                    (ref.id ? ` <span class="attr-title">id</span>="${ref.id}"` : '') +
                    (ref.className ? ` <span class="attr-title">class</span>="${ref.className}"` : '') + '&gt;',
                uid: instance.__VUE_DEVTOOLS_UID__,
                type: 'reference'
            }
        };
    }
    return {
        type: '$refs',
        key: key,
        value,
        editable: false
    };
}
exports.getCustomRefDetails = getCustomRefDetails;
function parse(data, revive) {
    return revive
        ? transfer_1.parseCircularAutoChunks(data, reviver)
        : transfer_1.parseCircularAutoChunks(data);
}
exports.parse = parse;
const specialTypeRE = /^\[native (\w+) (.*)\]$/;
const symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/;
function reviver(key, val) {
    if (val === exports.UNDEFINED) {
        return undefined;
    }
    else if (val === exports.INFINITY) {
        return Infinity;
    }
    else if (val === exports.NEGATIVE_INFINITY) {
        return -Infinity;
    }
    else if (val === exports.NAN) {
        return NaN;
    }
    else if (val && val._custom) {
        if (val._custom.type === 'component') {
            return backend_1.getInstanceMap().get(val._custom.id);
        }
        else if (val._custom.type === 'map') {
            return reviveMap(val);
        }
        else if (val._custom.type === 'set') {
            return reviveSet(val);
        }
    }
    else if (symbolRE.test(val)) {
        const [, string] = symbolRE.exec(val);
        return Symbol.for(string);
    }
    else if (specialTypeRE.test(val)) {
        const [, type, string] = specialTypeRE.exec(val);
        return new window[type](string);
    }
    else {
        return val;
    }
}
/**
 * Sanitize data to be posted to the other side.
 * Since the message posted is sent with structured clone,
 * we need to filter out any types that might cause an error.
 *
 * @param {*} data
 * @return {*}
 */
function sanitize(data) {
    if (!isPrimitive(data) &&
        !Array.isArray(data) &&
        !isPlainObject(data)) {
        // handle types that will probably cause issues in
        // the structured clone
        return Object.prototype.toString.call(data);
    }
    else {
        return data;
    }
}
function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}
exports.isPlainObject = isPlainObject;
function isPrimitive(data) {
    if (data == null) {
        return true;
    }
    const type = typeof data;
    return (type === 'string' ||
        type === 'number' ||
        type === 'boolean');
}
/**
 * Searches a key or value in the object, with a maximum deepness
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
function searchDeepInObject(obj, searchTerm) {
    const seen = new Map();
    const result = internalSearchObject(obj, searchTerm.toLowerCase(), seen, 0);
    seen.clear();
    return result;
}
exports.searchDeepInObject = searchDeepInObject;
const SEARCH_MAX_DEPTH = 10;
/**
 * Executes a search on each field of the provided object
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchObject(obj, searchTerm, seen, depth) {
    if (depth > SEARCH_MAX_DEPTH) {
        return false;
    }
    let match = false;
    const keys = Object.keys(obj);
    let key, value;
    for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        value = obj[key];
        match = internalSearchCheck(searchTerm, key, value, seen, depth + 1);
        if (match) {
            break;
        }
    }
    return match;
}
/**
 * Executes a search on each value of the provided array
 * @param {*} array Search target
 * @param {string} searchTerm Search string
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchArray(array, searchTerm, seen, depth) {
    if (depth > SEARCH_MAX_DEPTH) {
        return false;
    }
    let match = false;
    let value;
    for (let i = 0; i < array.length; i++) {
        value = array[i];
        match = internalSearchCheck(searchTerm, null, value, seen, depth + 1);
        if (match) {
            break;
        }
    }
    return match;
}
/**
 * Checks if the provided field matches the search terms
 * @param {string} searchTerm Search string
 * @param {string} key Field key (null if from array)
 * @param {*} value Field value
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchCheck(searchTerm, key, value, seen, depth) {
    let match = false;
    let result;
    if (key === '_custom') {
        key = value.display;
        value = value.value;
    }
    (result = specialTokenToString(value)) && (value = result);
    if (key && compare(key, searchTerm)) {
        match = true;
        seen.set(value, true);
    }
    else if (seen.has(value)) {
        match = seen.get(value);
    }
    else if (Array.isArray(value)) {
        seen.set(value, null);
        match = internalSearchArray(value, searchTerm, seen, depth);
        seen.set(value, match);
    }
    else if (isPlainObject(value)) {
        seen.set(value, null);
        match = internalSearchObject(value, searchTerm, seen, depth);
        seen.set(value, match);
    }
    else if (compare(value, searchTerm)) {
        match = true;
        seen.set(value, true);
    }
    return match;
}
/**
 * Compares two values
 * @param {*} value Mixed type value that will be cast to string
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
function compare(value, searchTerm) {
    return ('' + value).toLowerCase().indexOf(searchTerm) !== -1;
}
function sortByKey(state) {
    return state && state.slice().sort((a, b) => {
        if (a.key < b.key)
            return -1;
        if (a.key > b.key)
            return 1;
        return 0;
    });
}
exports.sortByKey = sortByKey;
function set(object, path, value, cb = null) {
    const sections = Array.isArray(path) ? path : path.split('.');
    while (sections.length > 1) {
        object = object[sections.shift()];
    }
    const field = sections[0];
    if (cb) {
        cb(object, field, value);
    }
    else {
        object[field] = value;
    }
}
exports.set = set;
function get(object, path) {
    const sections = Array.isArray(path) ? path : path.split('.');
    for (let i = 0; i < sections.length; i++) {
        object = object[sections[i]];
        if (!object) {
            return undefined;
        }
    }
    return object;
}
exports.get = get;
function has(object, path, parent = false) {
    if (typeof object === 'undefined') {
        return false;
    }
    const sections = Array.isArray(path) ? path.slice() : path.split('.');
    const size = !parent ? 1 : 2;
    while (object && sections.length > size) {
        object = object[sections.shift()];
    }
    return object != null && Object.prototype.hasOwnProperty.call(object, sections[0]);
}
exports.has = has;
function scrollIntoView(scrollParent, el, center = true) {
    const parentTop = scrollParent.scrollTop;
    const parentHeight = scrollParent.offsetHeight;
    const elBounds = el.getBoundingClientRect();
    const parentBounds = scrollParent.getBoundingClientRect();
    const top = elBounds.top - parentBounds.top + scrollParent.scrollTop;
    const height = el.offsetHeight;
    if (center) {
        scrollParent.scrollTop = top + (height - parentHeight) / 2;
    }
    else if (top < parentTop) {
        scrollParent.scrollTop = top;
    }
    else if (top + height > parentTop + parentHeight) {
        scrollParent.scrollTop = top - parentHeight + height;
    }
}
exports.scrollIntoView = scrollIntoView;
function focusInput(el) {
    el.focus();
    el.setSelectionRange(0, el.value.length);
}
exports.focusInput = focusInput;
function openInEditor(file) {
    // Console display
    const fileName = file.replace(/\\/g, '\\\\');
    const src = `fetch('${shared_data_1.default.openInEditorHost}__open-in-editor?file=${encodeURI(file)}').then(response => {
    if (response.ok) {
      console.log('File ${fileName} opened in editor')
    } else {
      const msg = 'Opening component ${fileName} failed'
      const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
      if (target.__VUE_DEVTOOLS_TOAST__) {
        target.__VUE_DEVTOOLS_TOAST__(msg, 'error')
      } else {
        console.log('%c' + msg, 'color:red')
      }
      console.log('Check the setup of your project, see https://github.com/vuejs/vue-devtools/blob/master/docs/open-in-editor.md')
    }
  })`;
    if (env_1.isChrome) {
        env_1.target.chrome.devtools.inspectedWindow.eval(src);
    }
    else {
        // eslint-disable-next-line no-eval
        eval(src);
    }
}
exports.openInEditor = openInEditor;
const ESC = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;'
};
function escape(s) {
    return s.replace(/[<>"&]/g, escapeChar);
}
exports.escape = escape;
function escapeChar(a) {
    return ESC[a] || a;
}
function copyToClipboard(state) {
    if (typeof document === 'undefined')
        return;
    const dummyTextArea = document.createElement('textarea');
    dummyTextArea.textContent = stringify(state);
    document.body.appendChild(dummyTextArea);
    dummyTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(dummyTextArea);
}
exports.copyToClipboard = copyToClipboard;
function isEmptyObject(obj) {
    return obj === exports.UNDEFINED || !obj || Object.keys(obj).length === 0;
}
exports.isEmptyObject = isEmptyObject;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 1496:
/***/ (() => {



/***/ }),

/***/ 3990:
/***/ (() => {



/***/ }),

/***/ 9572:
/***/ (() => {



/***/ }),

/***/ 5847:
/***/ (() => {



/***/ }),

/***/ 1136:
/***/ (() => {



/***/ }),

/***/ 4265:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1496);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_api__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _api__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _api__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3990);
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_app__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _app__WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _app__WEBPACK_IMPORTED_MODULE_1__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9572);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_component__WEBPACK_IMPORTED_MODULE_2__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _component__WEBPACK_IMPORTED_MODULE_2__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _component__WEBPACK_IMPORTED_MODULE_2__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5847);
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_context__WEBPACK_IMPORTED_MODULE_3__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _context__WEBPACK_IMPORTED_MODULE_3__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _context__WEBPACK_IMPORTED_MODULE_3__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1136);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_hooks__WEBPACK_IMPORTED_MODULE_4__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _hooks__WEBPACK_IMPORTED_MODULE_4__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _hooks__WEBPACK_IMPORTED_MODULE_4__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1236);
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_util__WEBPACK_IMPORTED_MODULE_5__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _util__WEBPACK_IMPORTED_MODULE_5__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _util__WEBPACK_IMPORTED_MODULE_5__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);








/***/ }),

/***/ 1236:
/***/ (() => {



/***/ }),

/***/ 7216:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "q": () => (/* binding */ HOOK_SETUP)
/* harmony export */ });
const HOOK_SETUP = 'devtools-plugin:setup';


/***/ }),

/***/ 49:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "y": () => (/* binding */ getDevtoolsGlobalHook),
/* harmony export */   "U": () => (/* binding */ getTarget)
/* harmony export */ });
function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
}
function getTarget() {
    // @ts-ignore
    return typeof navigator !== 'undefined'
        ? window
        : typeof __webpack_require__.g !== 'undefined'
            ? __webpack_require__.g
            : {};
}


/***/ }),

/***/ 2296:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setupDevtoolsPlugin": () => (/* binding */ setupDevtoolsPlugin)
/* harmony export */ });
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49);
/* harmony import */ var _const__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7216);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4265);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _api__WEBPACK_IMPORTED_MODULE_0__) if(["default","setupDevtoolsPlugin"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _api__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);



function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const hook = (0,_env__WEBPACK_IMPORTED_MODULE_1__/* .getDevtoolsGlobalHook */ .y)();
    if (hook) {
        hook.emit(_const__WEBPACK_IMPORTED_MODULE_2__/* .HOOK_SETUP */ .q, pluginDescriptor, setupFn);
    }
    else {
        const target = (0,_env__WEBPACK_IMPORTED_MODULE_1__/* .getTarget */ .U)();
        const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
        list.push({
            pluginDescriptor,
            setupFn
        });
    }
}


/***/ }),

/***/ 2699:
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ 1023:
/***/ ((module) => {

"use strict";
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/* harmony import */ var _back__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5859);
/* harmony import */ var _back__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_back__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_bridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4803);
// this is injected to the app page when the panel is activated.




window.addEventListener('message', handshake)

function sendListening () {
  window.postMessage({
    source: 'vue-devtools-backend-injection',
    payload: 'listening'
  }, '*')
}
sendListening()

function handshake (e) {
  if (e.data.source === 'vue-devtools-proxy' && e.data.payload === 'init') {
    window.removeEventListener('message', handshake)

    var listeners = []
    var bridge = new _utils_bridge__WEBPACK_IMPORTED_MODULE_1__.Bridge({
      listen (fn) {
        var listener = evt => {
          if (evt.data.source === 'vue-devtools-proxy' && evt.data.payload) {
            fn(evt.data.payload)
          }
        }
        window.addEventListener('message', listener)
        listeners.push(listener)
      },
      send (data) {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.log('[chrome] backend -> devtools', data)
        // }
        window.postMessage({
          source: 'vue-devtools-backend',
          payload: data
        }, '*')
      }
    })

    bridge.on('shutdown', () => {
      listeners.forEach(l => {
        window.removeEventListener('message', l)
      })
      listeners = []
    })

    ;(0,_back__WEBPACK_IMPORTED_MODULE_0__.initBackend)(bridge)
  } else {
    sendListening()
  }
}

})();

/******/ })()
;