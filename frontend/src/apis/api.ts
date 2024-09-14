import axios, { AxiosResponse } from "axios";
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URI;
import { u256ToBlobId } from "../helpers/decodeBlob";

export const getMetaData = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/getAllContentMetadata`,
    );
    const data = response.data;
    console.log("Metadata response from api and response.data", data);
    return response.data;
  } catch (e) {
    console.log("Error fetching data", e);
    return null;
  }
};
export const getIncentivizedPoints = async (address: string) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/getIncentivizationData/${address}`,
    );
    const data = response.data;
    console.log("incentives", data);
    return response.data;
  } catch (e) {
    console.log("Error fetching data", e);
    return null;
  }
};
export const getOwnersList = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/getAllOwners`);
    const data = response.data;
    console.log("list of owners", data);
    return response.data;
  } catch (e) {
    console.log("Error fetching data", e);
    return null;
  }
};

// export const getMetaData = async () => {
//   fetch(`${BACKEND_URL}/api/getAllContentMetadata`)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response  not ok " + response.statusText);
//       }
//       return response.json();
//     })
//     .then((data) => {
//       console.log(data);
//     })
//     .catch((error) => {
//       console.error("problem with fetch operation:", error);
//     });
// };
export const getBlobContentProfile = async (blob_id: string) => {
  try {
    const decoded = u256ToBlobId(blob_id);
    const response: AxiosResponse = await axios.get(
      `${BACKEND_URL}/api/getBlobContent/${decoded}`,
      {
        responseType: "blob",
      },
    );
    return response;
  } catch (e) {
    console.log("Error fetching profile data", e);
    return null;
  }
};
export const getContentByOwner = async (owner_id: string) => {
  try {
    const response: AxiosResponse = await axios.get(
      `${BACKEND_URL}/api/getContentByOwner/${owner_id}`,
    );
    console.log("content by owner", response);
    return response.data;
  } catch (e) {
    console.log("Error fetching profile data", e);
    return null;
  }
};
