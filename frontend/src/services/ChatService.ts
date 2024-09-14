import axios from "axios";

const API_URL = import.meta.env.VITE_APP_AI_SERVICE_ENDPOINT as string;

export interface QueryResponse {
  response: string;
  references: Array<{
    content: string;
    metadata: {
      description: string;
      file_type: string;
      tag: string;
      title: string;
      [key: string]: any;
      owner: string;
    };
  }>;
}

export const queryAI = async (query: string): Promise<QueryResponse> => {
  try {
    const response = await axios.post(`${API_URL}/query`, { query });
    return response.data.data;
  } catch (error) {
    console.error("Error querying AI:", error);
    throw error;
  }
};
