import yaml from "js-yaml";

export class YAMLGenerator {
  static generate(workflow: any) {
    return yaml.dump(workflow);
  }
}
