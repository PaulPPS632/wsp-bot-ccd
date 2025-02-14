"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dockerode_1 = __importDefault(require("dockerode"));
class DockerService {
    constructor() {
        var _a;
        const socketPath = (_a = process.env.SOCKET_PATH_DOCKER) !== null && _a !== void 0 ? _a : '/var/run/docker.sock';
        this.docker = new dockerode_1.default({ socketPath });
        //this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
    }
    static getInstance() {
        if (!DockerService.instance) {
            DockerService.instance = new DockerService();
        }
        return DockerService.instance;
    }
    getDocker() {
        return this.docker;
    }
}
exports.default = DockerService;
