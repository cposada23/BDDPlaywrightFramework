export interface EnvironmentConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

export class TestFixtures {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'test';
    console.log("Environment: ", this.environment);
  }

}
