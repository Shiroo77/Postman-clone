import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import prettyBytes from "pretty-bytes";
import setupEditors from "./setupEditor";

// Add in those key-value pairs
const form = document.querySelector("[data-form]");
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector(
  "[data-request-headers]"
);
const keyValueTemplate = document.querySelector("[data-key-value-template]");

const responseHeadersContainer = document.querySelector(
  "[data-response-headers]"
);

// For query params
document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair());
  });

// For request header
document
  .querySelector("[data-add-request-header-btn]")
  .addEventListener("click", () => {
    requestHeadersContainer.append(createKeyValuePair());
  });

queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

axios.interceptors.request.use((request) => {
  request.customData = request.customData || {};

  // Every time we make an request, set start time = current time
  request.customData.startTime = new Date().getTime();
  return request;
});

// When we have successful response we want to call a function
// When we error we want to call different funcion
axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

// Update End time
function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time =
    // response.config property contains the configuration that was used to make the request.
    new Date().getTime() - response.config.customData.startTime;
  return response;
}

// Function to create key-value pair
function createKeyValuePair() {
  // Clone the content of the template
  const element = keyValueTemplate.content.cloneNode(true);

  // Query select the element to get the remove button
  element.querySelector("[data-remove-btn]").addEventListener("click", (e) => {
    // Find the closest parent with the attribute [data-key-value-pair] and remove it
    e.target.closest("[data-key-value-pair]").remove();
  });

  // Return the cloned and modified element
  return element;
}

// Event listener for form
const { requestEditor, updateResponseEditor } = setupEditors();
form.addEventListener("submit", (e) => {
  e.preventDefault();

  let data; 

  try {
    // Take JSON from the document & convert it into an object 
    // Other wise take null 
    data = JSON.parse(requestEditor.state.doc.toString() || null)
    
  } catch (error) {
    // Can't figure out what your JSON data was 
    alert("JSON DATA IS BAD")
    return; 
    
  }

  // dynamically constructs an HTTP request using information obtained from HTML input fields.
  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    params: keyValuePairsToObjects(queryParamsContainer),
    headers: keyValuePairsToObjects(requestHeadersContainer),

    // Sending the JSON data to axios 
    data,
  })
    .catch((er) => er)

    .then((response) => {
      document
        .querySelector("[data-response-section]")
        .classList.remove("d-none");

      updateResponseDetails(response);
      updateResponseEditor(response.data);
      updateResponseHeaders(response.headers);
      console.log(response);
    });
});

// Update Response Details
function updateResponseDetails(response) {
  document.querySelector("[data-status]").textContent = response.status;
  document.querySelector("[data-time]").textContent = response.customData.time;
  document.querySelector("[data-size]").textContent = prettyBytes(
    JSON.stringify(response.data).length +
      JSON.stringify(response.headers).length
  );
}

// Update Response Headers
function updateResponseHeaders(headers) {
  responseHeadersContainer.innerHTML = "";
  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    responseHeadersContainer.append(keyElement);

    const valueElement = document.createElement("div");
    valueElement.textContent = value;
    responseHeadersContainer.append(valueElement);
  });
}

// Convert Key-Value pairs to objects
function keyValuePairsToObjects(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");
  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;

    if (key === "") return data;
    return { ...data, [key]: value };
  }, {});
}
