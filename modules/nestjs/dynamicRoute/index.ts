import path from "node:path";
import callsite from "callsite";

export class DynamicRoute {
  private static rootDir: string;
  private static routes: string[] = [];

  setRootDir(rootDir: string) {
    DynamicRoute.rootDir = rootDir;
  }

  create(customPath?: string) {
    if (!DynamicRoute.rootDir?.length) {
      throw new Error("Root directory not set");
    }

    const requester = callsite()[1].getFileName();
    const dirname = path.dirname(requester).replace(/\\/g, "/");
    const route =
      customPath || dirname.substring(DynamicRoute.rootDir.length + 1) || "/";

    DynamicRoute.routes.push(route);

    return route;
  }

  getRoutes() {
    return DynamicRoute.routes;
  }
}

export const dynamicRoute = new DynamicRoute();
