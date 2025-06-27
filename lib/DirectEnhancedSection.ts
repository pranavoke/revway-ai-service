// Request types
export interface DirectEnhancedSectionsRequest {
  ad: string;
  productUrl: string;
  content: string;
}

// Response types
export interface DirectEnhancedSectionsResponse {
  success: true;
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DirectEnhancedSectionsError {
  success?: false;
  error: string;
}

export type DirectEnhancedSectionsApiResponse =
  | DirectEnhancedSectionsResponse
  | DirectEnhancedSectionsError;
  