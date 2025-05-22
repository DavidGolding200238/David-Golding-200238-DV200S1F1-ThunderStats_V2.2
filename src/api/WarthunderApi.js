import axios from "axios";

// This sets up the base URL for all API requests and a limit on how many vehicles to fetch per request
const BASE_URL = "https://www.wtvehiclesapi.sgambe.serv00.net/api/vehicles";
const LIMIT = 200;

// This variable is used to store vehicles in memory so we don't keep fetching the same data over and over
let vehiclesCache = null;

// This function gets all vehicles from the API using pages and stores them in the cache
export const fetchAllVehiclesPaginated = async () => {
  // If we already have the data saved, return it instead of calling the API again
  if (vehiclesCache) {
    return vehiclesCache;
  }

  // Set up an array to hold all the vehicle data we get back from the API
  let allVehicles = [];
  let page = 0;
  const batchSize = 5;
  let hasMoreData = true;

  // Loop while there's still more data to get from the API
  while (hasMoreData) {
    const batchPromises = [];

    // This part prepares multiple requests (a batch) at once to get more data faster
    for (let i = 0; i < batchSize; i++) {
      batchPromises.push(
        axios.get(BASE_URL, {
          params: { limit: LIMIT, page: page + i },
          headers: { Accept: "application/json" }
        })
      );
    }

    let responses;
    try {
      // All requests in the batch are sent and waited on together
      responses = await Promise.all(batchPromises);
    } catch (error) {
      // If one of the requests failed, print an error and stop trying
      console.error("Error fetching a batch:", error);
      break;
    }

    let batchHadEmpty = false;

    // Go through each response in the batch
    responses.forEach((response) => {
      const data = response.data;

      // If the response has no data, we mark that the batch is done
      if (!Array.isArray(data) || data.length === 0) {
        batchHadEmpty = true;
      } else {
        // If there is data, add it to the total list of vehicles
        allVehicles = allVehicles.concat(data);
      }
    });

    // If any of the batch responses had no data, we stop fetching more pages
    if (batchHadEmpty) {
      hasMoreData = false;
    }

    // Move to the next set of pages
    page += batchSize;
  }

  // Store the full list in the cache and return it
  vehiclesCache = allVehicles;
  return vehiclesCache;
};

// This function fetches data for a single vehicle using its identifier, and can also fetch a specific version
export const fetchVehicleDetails = async (identifier, version = null) => {
  try {
    // Build the correct URL depending on if a version is asked for or not
    const url = version 
      ? `${BASE_URL}/${identifier}/${version}` 
      : `${BASE_URL}/${identifier}`;
    
    // Send the request and return the data
    const response = await axios.get(url, {
      headers: { Accept: "application/json" }
    });
    return response.data;
  } catch (error) {
    // If there's a problem, print out an error message and return nothing
    console.error(`Error fetching details for ${identifier} (version: ${version || "live"}):`, error);
    return null;
  }
};
