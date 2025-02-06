import Docker from "dockerode";

class DockerService {
  private static instance: DockerService;
  private docker: Docker;

  private constructor() {
    //this.docker = new Docker({ socketPath: "//./pipe/docker_engine" });
    this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
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