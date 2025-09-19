export interface TestUser {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SearchData {
  searchTerm: string;
  expectedResults: number;
  category?: string;
}

export interface EnvironmentConfig {
  baseURL: string;
  apiURL: string;
  timeout: number;
  retries: number;
}

export class TestFixtures {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'test';
  }

  /**
   * Get test users for different scenarios
   */
  getTestUsers(): Record<string, TestUser> {
    return {
      validUser: {
        username: 'testuser123',
        email: 'testuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      },
      adminUser: {
        username: 'admin123',
        email: 'admin@example.com',
        password: 'AdminPass123!',
        firstName: 'Admin',
        lastName: 'User'
      },
      invalidUser: {
        username: 'invalid',
        email: 'invalid@email',
        password: 'weak',
        firstName: '',
        lastName: ''
      }
    };
  }

  /**
   * Get search test data
   */
  getSearchData(): Record<string, SearchData> {
    return {
      validSearch: {
        searchTerm: 'playwright',
        expectedResults: 10,
        category: 'technology'
      },
      emptySearch: {
        searchTerm: '',
        expectedResults: 0
      },
      specialCharSearch: {
        searchTerm: '@#$%^&*()',
        expectedResults: 0
      },
      longSearch: {
        searchTerm: 'a'.repeat(1000),
        expectedResults: 0
      }
    };
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig(): EnvironmentConfig {
    const configs: Record<string, EnvironmentConfig> = {
      development: {
        baseURL: 'http://localhost:3000',
        apiURL: 'http://localhost:3001/api',
        timeout: 30000,
        retries: 1
      },
      staging: {
        baseURL: 'https://staging.example.com',
        apiURL: 'https://api-staging.example.com',
        timeout: 45000,
        retries: 2
      },
      production: {
        baseURL: 'https://example.com',
        apiURL: 'https://api.example.com',
        timeout: 60000,
        retries: 3
      },
      test: {
        baseURL: 'https://example.com',
        apiURL: 'https://jsonplaceholder.typicode.com',
        timeout: 30000,
        retries: 2
      }
    };

    return configs[this.environment] || configs.test;
  }

  /**
   * Get random test data
   */
  getRandomData() {
    const timestamp = Date.now();
    return {
      randomEmail: `test${timestamp}@example.com`,
      randomUsername: `user${timestamp}`,
      randomString: Math.random().toString(36).substring(7),
      randomNumber: Math.floor(Math.random() * 1000),
      currentTimestamp: timestamp
    };
  }

  /**
   * Get URL endpoints for testing
   */
  getEndpoints() {
    const config = this.getEnvironmentConfig();
    return {
      home: config.baseURL,
      search: `${config.baseURL}/search`,
      login: `${config.baseURL}/login`,
      signup: `${config.baseURL}/signup`,
      profile: `${config.baseURL}/profile`,
      api: {
        users: `${config.apiURL}/users`,
        posts: `${config.apiURL}/posts`,
        comments: `${config.apiURL}/comments`
      }
    };
  }

  /**
   * Get CSS selectors for common elements
   */
  getCommonSelectors() {
    return {
      buttons: {
        submit: '[type="submit"], [data-testid="submit-button"]',
        cancel: '[data-testid="cancel-button"]',
        save: '[data-testid="save-button"]',
        delete: '[data-testid="delete-button"]'
      },
      inputs: {
        email: '[type="email"], [data-testid="email-input"]',
        password: '[type="password"], [data-testid="password-input"]',
        search: '[data-testid="search-input"], [name="search"]'
      },
      navigation: {
        menu: '[data-testid="nav-menu"]',
        logo: '[data-testid="logo"]',
        userMenu: '[data-testid="user-menu"]'
      },
      common: {
        loading: '[data-testid="loading"], .loading, .spinner',
        error: '[data-testid="error"], .error-message',
        success: '[data-testid="success"], .success-message'
      }
    };
  }
}
