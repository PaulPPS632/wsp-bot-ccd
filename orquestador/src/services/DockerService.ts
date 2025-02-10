import Docker from "dockerode";

class DockerService {
  private static instance: DockerService;
  private docker: Docker;

  private constructor() {
    const socketPath = process.env.SOCKET_PATH_DOCKER ?? '/var/run/docker.sock' ;
    this.docker = new Docker({ socketPath });
    //this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
  }

  static getInstance(): DockerService {
    if (!DockerService.instance) {
      DockerService.instance = new DockerService();
    }
    return DockerService.instance;
  }

  getDocker(): Docker {
    return this.docker;
  }
}

export default DockerService;